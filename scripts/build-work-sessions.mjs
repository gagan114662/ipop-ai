#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

const now = new Date().toISOString();
const headers = {
  "Accept": "application/json",
  "User-Agent": "ipop-ai-work-session-builder/1.0",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

function cleanText(value, max = 260) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function slug(value) {
  return cleanText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function proofFor(text) {
  const lower = text.toLowerCase();
  if (lower.includes("stripe") || lower.includes("checkout") || lower.includes("payment")) {
    return "Reproduce payment flow, inspect webhook/checkout failure, produce a replayable fix plan and verification log.";
  }
  if (lower.includes("n8n") || lower.includes("automation") || lower.includes("workflow") || lower.includes("zapier")) {
    return "Build a small workflow map, identify required credentials, and deliver a runnable automation proof checklist.";
  }
  if (lower.includes("wordpress") || lower.includes("shopify") || lower.includes("website")) {
    return "Audit the broken page or workflow, capture before/after evidence, and produce the smallest patch plan.";
  }
  if (lower.includes("data") || lower.includes("sheet") || lower.includes("scrap")) {
    return "Create a sample cleaned dataset/schema and validation report using only allowed public or client-provided data.";
  }
  return "Summarize requirement, define acceptance checks, produce a small proof artifact before quoting full delivery.";
}

function stripeRoute(text) {
  const lower = text.toLowerCase();
  if (lower.includes("stripe") || lower.includes("checkout") || lower.includes("payment")) {
    return "https://buy.stripe.com/4gM00k1kX2Yf1Dl4gE1kA01";
  }
  if (lower.includes("automation") || lower.includes("workflow") || lower.includes("n8n") || lower.includes("zapier")) {
    return "https://buy.stripe.com/7sYaEYbZB7ev95NcNa1kA02";
  }
  if (lower.includes("wordpress") || lower.includes("website")) {
    return "https://buy.stripe.com/8x2dRa4x98izgyf4gE1kA03";
  }
  return "https://buy.stripe.com/eVq9AUfbN0Q72HpaF21kA07";
}

async function githubRequirementSessions(limit = 8) {
  const query = [
    "is:issue",
    "is:open",
    'label:"help wanted"',
    "(automation OR workflow OR stripe OR wordpress OR api OR bug)",
    "created:>2026-03-01",
  ].join(" ");
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=${limit}`;
  const data = await getJson(url);
  return (data.items || []).map((item, index) => {
    const title = cleanText(item.title, 160);
    const body = cleanText(item.body, 260);
    const text = `${title} ${body}`;
    return {
      id: `github-${item.number}-${slug(item.repository_url?.split("/").slice(-2).join("-") || title)}`,
      name: `github-${index + 1}`,
      title,
      status: "ready_for_worker",
      kind: "public_requirement_session",
      source: "GitHub public issue",
      source_url: item.html_url,
      contact_route: "Comment on the public issue or follow the repository's contribution instructions.",
      requirement: body || title,
      estimated_budget: "unknown",
      proof_milestone: proofFor(text),
      stripe_url: stripeRoute(text),
      events: [
        { actor: "Scout", text: `Imported real public requirement from GitHub: ${item.html_url}` },
        { actor: "Planner", text: proofFor(text) },
        { actor: "Closer", text: "Use the $19 trial for discovery/proof unless the requirement maps cleanly to a fixed package." }
      ],
    };
  });
}

async function remoteOkRequirementSessions(limit = 8) {
  const data = await getJson("https://remoteok.com/api");
  return data
    .filter((job) => job && job.position && job.url)
    .filter((job) => {
      const text = `${job.position} ${(job.tags || []).join(" ")} ${job.description || ""}`.toLowerCase();
      return /automation|stripe|workflow|wordpress|shopify|api|ai|agent|data|backend|frontend/.test(text);
    })
    .slice(0, limit)
    .map((job, index) => {
      const title = cleanText(job.position, 160);
      const description = cleanText(job.description, 280);
      const text = `${title} ${description} ${(job.tags || []).join(" ")}`;
      const salary = job.salary_min || job.salary_max
        ? `${job.salary_min ? money.format(job.salary_min) : "?"}-${job.salary_max ? money.format(job.salary_max) : "?"}`
        : "unknown";
      return {
        id: `remoteok-${job.id || index}-${slug(title)}`,
        name: `remoteok-${index + 1}`,
        title,
        status: "ready_for_worker",
        kind: "public_job_session",
        source: "RemoteOK public job",
        source_url: job.url,
        contact_route: "Use the job listing's official apply/contact route.",
        requirement: description || title,
        estimated_budget: salary,
        proof_milestone: proofFor(text),
        stripe_url: stripeRoute(text),
        events: [
          { actor: "Scout", text: `Imported real public job from RemoteOK: ${job.url}` },
          { actor: "Planner", text: proofFor(text) },
          { actor: "Closer", text: "Do not do custom delivery before payment; sell a proof sprint or fixed package first." }
        ],
      };
    });
}

async function hackerNewsRequirementSessions(limit = 8) {
  const url = "https://hn.algolia.com/api/v1/search_by_date?tags=job&query=automation%20OR%20workflow%20OR%20stripe%20OR%20wordpress%20OR%20AI";
  const data = await getJson(url);
  return (data.hits || []).slice(0, limit).map((hit, index) => {
    const title = cleanText(hit.title || hit.story_title || "Hacker News job", 160);
    const text = cleanText(hit.story_text || hit.comment_text || title, 280);
    const sourceUrl = hit.url || (hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : "https://news.ycombinator.com/jobs");
    return {
      id: `hn-${hit.objectID || index}-${slug(title)}`,
      name: `hn-${index + 1}`,
      title,
      status: "ready_for_worker",
      kind: "public_job_session",
      source: "Hacker News public job",
      source_url: sourceUrl,
      contact_route: "Use the public listing URL or official apply route only.",
      requirement: text || title,
      estimated_budget: "unknown",
      proof_milestone: proofFor(`${title} ${text}`),
      stripe_url: stripeRoute(`${title} ${text}`),
      events: [
        { actor: "Scout", text: `Imported real public job from Hacker News/Algolia: ${sourceUrl}` },
        { actor: "Planner", text: proofFor(`${title} ${text}`) },
        { actor: "Closer", text: "Offer a paid diagnostic/proof sprint instead of unpaid speculative work." }
      ],
    };
  });
}

const batches = await Promise.allSettled([
  githubRequirementSessions(10),
  remoteOkRequirementSessions(10),
  hackerNewsRequirementSessions(10),
]);

const errors = batches
  .filter((result) => result.status === "rejected")
  .map((result) => result.reason.message);

const sessions = batches
  .filter((result) => result.status === "fulfilled")
  .flatMap((result) => result.value)
  .filter((session, index, all) => all.findIndex((candidate) => candidate.source_url === session.source_url) === index)
  .slice(0, 24);

if (sessions.length === 0) {
  throw new Error(`No public requirements found. Source errors: ${errors.join("; ")}`);
}

const feed = {
  generated_at: now,
  source: "Public web requirements: GitHub issues, RemoteOK jobs, and Hacker News job listings",
  sessions,
  jobs: sessions.map((session) => ({
    id: `job-${session.id}`,
    title: session.title,
    status: session.status,
    owner: session.id,
    source_url: session.source_url,
  })),
  proofs: sessions.slice(0, 8).map((session) => ({
    id: `proof-${session.id}`,
    title: session.title,
    status: "not_started",
    evidence: session.proof_milestone,
    source_url: session.source_url,
  })),
  source_errors: errors,
};

await writeFile(new URL("../sessions.json", import.meta.url), JSON.stringify(feed, null, 2) + "\n");
console.log(`wrote ${sessions.length} real requirement sessions to sessions.json`);
if (errors.length > 0) {
  console.log(`source errors: ${errors.join(" | ")}`);
}
