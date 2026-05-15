#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

const headers = { "Accept": "application/json", "User-Agent": "ipop-conductor-replica/1.0" };
const stripeTrial = "https://buy.stripe.com/eVq9AUfbN0Q72HpaF21kA07";

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(response.status + " " + response.statusText + " " + url);
  return response.json();
}

function clean(value, max = 320) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function slug(value) {
  return clean(value, 90).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function proof(text) {
  const lower = text.toLowerCase();
  if (lower.includes("stripe") || lower.includes("checkout") || lower.includes("payment")) return "Run a payment-flow reproduction, identify the failing integration surface, and produce a replayable verification checklist.";
  if (lower.includes("automation") || lower.includes("workflow") || lower.includes("n8n")) return "Map the workflow, list credentials needed after payment, and produce a runnable proof checklist.";
  if (lower.includes("wordpress") || lower.includes("website")) return "Audit the broken page or flow, capture evidence, and produce the smallest patch plan.";
  return "Turn the posted requirement into acceptance checks, risk notes, and a paid proof milestone.";
}

async function githubSessions() {
  const query = 'is:issue is:open label:"help wanted" bug';
  const data = await getJson("https://api.github.com/search/issues?q=" + encodeURIComponent(query) + "&sort=updated&order=desc&per_page=30");
  return (data.items || []).map((item, index) => {
    const title = clean(item.title, 180);
    const requirement = clean(item.body, 360) || title;
    return {
      id: "github-" + item.number + "-" + slug(title),
      name: "github-" + (index + 1),
      title,
      status: "ready_for_worker",
      kind: "posted_requirement",
      source: "GitHub public issue",
      source_url: item.html_url,
      contact_route: "Use the public issue or repository contribution route only.",
      requirement,
      estimated_budget: title.match(/\$[0-9][0-9,]*/)?.[0] || "unknown",
      proof_milestone: proof(title + " " + requirement),
      stripe_url: stripeTrial,
      events: [
        { "actor": "Scout", "text": "Imported real posted requirement from " + item.html_url },
        { "actor": "Planner", "text": proof(title + " " + requirement) },
        { "actor": "Runner", "text": "Launch a Codex worker from the local Conductor runner to create the proof artifact." }
      ]
    };
  });
}

async function hnSessions() {
  const data = await getJson("https://hn.algolia.com/api/v1/search_by_date?tags=job&query=automation%20OR%20workflow%20OR%20stripe%20OR%20wordpress%20OR%20AI");
  return (data.hits || []).slice(0, 10).map((hit, index) => {
    const title = clean(hit.title || hit.story_title || "Hacker News job", 180);
    const requirement = clean(hit.story_text || hit.comment_text || title, 360);
    const url = hit.url || ("https://news.ycombinator.com/item?id=" + hit.objectID);
    return {
      id: "hn-" + (hit.objectID || index) + "-" + slug(title),
      name: "hn-" + (index + 1),
      title,
      status: "ready_for_worker",
      kind: "posted_requirement",
      source: "Hacker News public job",
      source_url: url,
      contact_route: "Use the public listing or official apply route only.",
      requirement,
      estimated_budget: "unknown",
      proof_milestone: proof(title + " " + requirement),
      stripe_url: stripeTrial,
      events: [
        { "actor": "Scout", "text": "Imported real posted requirement from " + url },
        { "actor": "Planner", "text": proof(title + " " + requirement) },
        { "actor": "Runner", "text": "Launch a Codex worker from the local Conductor runner to create the proof artifact." }
      ]
    };
  });
}

const settled = await Promise.allSettled([githubSessions(), hnSessions()]);
const errors = settled.filter((r) => r.status === "rejected").map((r) => r.reason.message);
const sessions = settled.filter((r) => r.status === "fulfilled").flatMap((r) => r.value).slice(0, 30);
if (sessions.length === 0) throw new Error("No posted requirements found: " + errors.join(" | "));

const feed = {
  generated_at: new Date().toISOString(),
  source: "Public posted requirements from GitHub issues and Hacker News jobs",
  sessions,
  jobs: sessions.map((s) => ({ id: "job-" + s.id, title: s.title, status: s.status, owner: s.id, source_url: s.source_url })),
  proofs: sessions.slice(0, 10).map((s) => ({ id: "proof-" + s.id, title: s.title, status: "not_started", evidence: s.proof_milestone, source_url: s.source_url }))
};

await writeFile(new URL("../sessions.json", import.meta.url), JSON.stringify(feed, null, 2) + "\n");
console.log("wrote " + sessions.length + " posted-requirement sessions");
