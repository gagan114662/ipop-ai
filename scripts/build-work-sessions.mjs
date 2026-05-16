#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

const headers = { "Accept": "application/json", "User-Agent": "ipop-conductor-runner/1.1" };
const maxSessions = Number(process.env.IPOP_REQUIREMENT_LIMIT || 30);

async function getJson(url, extraHeaders = {}) {
  const response = await fetch(url, { headers: { ...headers, ...extraHeaders } });
  if (!response.ok) throw new Error(response.status + " " + response.statusText + " " + url);
  return response.json();
}

function clean(value, max = 420) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function slug(value) {
  return clean(value, 90).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "requirement";
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function payoutSignal(text) {
  const raw = String(text || "");
  const lower = raw.toLowerCase();
  const amounts = [...raw.matchAll(/(?:[$£€]|cad\s*|usd\s*)([0-9][0-9,]*(?:\.[0-9]{1,2})?)/gi)]
    .map((match) => Number(match[1].replace(/,/g, "")))
    .filter((amount) => Number.isFinite(amount));
  const labelSignals = [
    lower.includes("bounty"),
    lower.includes("paid"),
    lower.includes("external"),
    lower.includes("help wanted"),
    lower.includes("upwork"),
    lower.includes("contract"),
    lower.includes("freelance"),
    lower.includes("remote"),
  ].filter(Boolean).length;
  const amount = amounts.length ? Math.max(...amounts) : null;
  const confidence = amount ? "explicit_payout" : labelSignals >= 2 ? "paid_signal" : labelSignals === 1 ? "weak_signal" : "unknown";
  return {
    amount,
    labelSignals,
    confidence,
    summary: amount ? "$" + amount.toLocaleString("en-US") : confidence.replace(/_/g, " "),
  };
}

function proof(text) {
  const lower = text.toLowerCase();
  if (lower.includes("stripe") || lower.includes("checkout") || lower.includes("payment")) return "Reproduce the payment surface locally, isolate the failing integration, and produce a patch-ready verification checklist.";
  if (lower.includes("automation") || lower.includes("workflow") || lower.includes("n8n")) return "Map the automation, list credentials needed after approval, and produce a runnable proof checklist.";
  if (lower.includes("wordpress") || lower.includes("website")) return "Audit the page or flow, capture evidence, and produce the smallest patch plan.";
  if (lower.includes("bug") || lower.includes("regression")) return "Distill the repro, acceptance checks, suspected code surface, and validation plan into a local proof artifact.";
  return "Turn the posted requirement into acceptance checks, risk notes, and a local proof artifact.";
}

function scoreSession(session) {
  const signal = session.pay_signal || payoutSignal([session.title, session.requirement, session.source, session.labels?.join(" ")].join(" "));
  const isRemoteSalary = session.source.includes("RemoteOK");
  const statusScore = signal.confidence === "explicit_payout" ? 100000 : signal.confidence === "paid_signal" ? 50000 : signal.confidence === "weak_signal" ? 10000 : 0;
  const amountScore = isRemoteSalary ? Math.min(signal.amount || 0, 1000) : (signal.amount || 0);
  const sourceScore = session.source.includes("Expensify") ? 5000 : session.source.includes("bounty") ? 2500 : session.source.includes("RemoteOK") ? 1000 : 0;
  const deliveryScore = session.source.includes("Expensify") || session.source.toLowerCase().includes("bounty") ? 75000 : 0;
  return deliveryScore + statusScore + amountScore + sourceScore;
}

function githubItemToSession(item, source, index) {
  const title = clean(item.title, 180);
  const requirement = clean(item.body, 600) || title;
  const labels = (item.labels || []).map((label) => typeof label === "string" ? label : label.name).filter(Boolean);
  const signal = payoutSignal([title, requirement, labels.join(" "), item.html_url].join(" "));
  return {
    id: "github-" + item.repository_url.split("/").slice(-2).join("-") + "-" + item.number + "-" + slug(title),
    name: "github-" + (index + 1),
    title,
    status: "ready_for_worker",
    kind: "paid_posted_requirement",
    source,
    source_url: item.html_url,
    contact_route: "Use the public issue, repository contribution route, or official bounty route only.",
    labels,
    requirement,
    estimated_budget: signal.amount ? "$" + signal.amount.toLocaleString("en-US") : "unknown",
    pay_signal: signal,
    proof_milestone: proof(title + " " + requirement),
    events: [
      { actor: "Scout", text: "Imported public posted requirement from " + item.html_url },
      { actor: "Pay filter", text: signal.confidence + (signal.amount ? " amount=$" + signal.amount : "") + (labels.length ? " labels=" + labels.join(", ") : "") },
      { actor: "Planner", text: proof(title + " " + requirement) },
      { actor: "Runner", text: "Launch a Codex worker to create a proof artifact before any external application or contact." }
    ]
  };
}

async function githubSearch(query, source) {
  const url = "https://api.github.com/search/issues?q=" + encodeURIComponent(query) + "&sort=updated&order=desc&per_page=30";
  const data = await getJson(url);
  return (data.items || [])
    .filter((item) => !item.pull_request)
    .map((item, index) => githubItemToSession(item, source, index));
}

async function githubPaidSessions() {
  const queries = [
    { source: "Expensify public external bounty issue", query: 'repo:Expensify/App is:issue is:open label:"Help Wanted" label:External' },
    { source: "GitHub public bounty issue", query: 'is:issue is:open label:bounty' },
    { source: "GitHub public paid help-wanted issue", query: 'is:issue is:open "bounty" "help wanted"' },
    { source: "GitHub public contract issue", query: 'is:issue is:open "contract" "help wanted"' }
  ];
  const settled = await Promise.allSettled(queries.map((entry) => githubSearch(entry.query, entry.source)));
  return settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);
}

async function remoteOkSessions() {
  const jobs = await getJson("https://remoteok.com/api", { "Accept": "application/json" });
  return (Array.isArray(jobs) ? jobs : [])
    .filter((job) => job && typeof job === "object" && job.id && job.position)
    .filter((job) => {
      const text = [job.position, job.description, job.tags?.join(" "), job.company].join(" ").toLowerCase();
      return /(automation|ai|agent|workflow|stripe|wordpress|javascript|typescript|python|react|backend|frontend|full.?stack|no.?code)/.test(text);
    })
    .slice(0, 20)
    .map((job, index) => {
      const title = clean([job.position, job.company].filter(Boolean).join(" - "), 180);
      const requirement = clean(job.description || title, 600);
      const signal = payoutSignal([title, requirement, job.salary_min, job.salary_max].join(" "));
      if (!signal.amount && (job.salary_min || job.salary_max)) {
        const amount = Number(job.salary_max || job.salary_min);
        if (Number.isFinite(amount)) {
          signal.amount = amount;
          signal.confidence = "paid_signal";
          signal.summary = "$" + amount.toLocaleString("en-US");
        }
      }
      return {
        id: "remoteok-" + job.id + "-" + slug(title),
        name: "remoteok-" + (index + 1),
        title,
        status: "ready_for_worker",
        kind: "remote_paid_job",
        source: "RemoteOK public remote job",
        source_url: job.url || ("https://remoteok.com/remote-jobs/" + job.id),
        contact_route: "Use the official listing apply route only after explicit approval.",
        labels: Array.isArray(job.tags) ? job.tags : [],
        requirement,
        estimated_budget: signal.amount ? "salary up to $" + signal.amount.toLocaleString("en-US") : "salary/listing unknown",
        pay_signal: signal,
        proof_milestone: "Produce a client-ready capability proof matched to this role without applying or contacting anyone.",
        events: [
          { actor: "Scout", text: "Imported public remote job listing from " + (job.url || "RemoteOK") },
          { actor: "Pay filter", text: signal.confidence + (signal.amount ? " amount=$" + signal.amount : "") },
          { actor: "Runner", text: "Launch a Codex worker for role-fit proof, portfolio artifact, or work sample only." }
        ]
      };
    });
}

const settled = await Promise.allSettled([githubPaidSessions(), remoteOkSessions()]);
const errors = settled.filter((result) => result.status === "rejected").map((result) => result.reason.message);
const sessions = uniqueBy(settled.filter((result) => result.status === "fulfilled").flatMap((result) => result.value), (session) => session.source_url)
  .map((session) => ({ ...session, score: scoreSession(session) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, maxSessions);

if (sessions.length === 0) throw new Error("No paid-signal posted requirements found: " + errors.join(" | "));

const explicit = sessions.filter((session) => session.pay_signal?.confidence === "explicit_payout").length;
const paidSignal = sessions.filter((session) => ["explicit_payout", "paid_signal"].includes(session.pay_signal?.confidence)).length;
const feed = {
  generated_at: new Date().toISOString(),
  source: "Paid-signal public requirements: bounty issues plus remote job listings",
  scout_summary: {
    total: sessions.length,
    explicit_payout: explicit,
    paid_signal: paidSignal,
    note: "Workers create local proof artifacts only. External applications, contact, submissions, purchases, and private scraping require explicit approval."
  },
  sessions,
  jobs: sessions.map((session) => ({
    id: "job-" + session.id,
    title: session.title,
    status: session.status,
    owner: session.id,
    source_url: session.source_url,
    estimated_budget: session.estimated_budget,
    pay_signal: session.pay_signal?.confidence
  })),
  proofs: sessions.slice(0, 10).map((session) => ({
    id: "proof-" + session.id,
    title: session.title,
    status: "not_started",
    evidence: session.proof_milestone,
    source_url: session.source_url
  }))
};

await writeFile(new URL("../sessions.json", import.meta.url), JSON.stringify(feed, null, 2) + "\n");
console.log("wrote " + sessions.length + " paid-signal posted-requirement sessions (" + explicit + " explicit payout, " + paidSignal + " paid-signal)");
