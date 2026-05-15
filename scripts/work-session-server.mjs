#!/usr/bin/env node

import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const root = resolve(new URL("..", import.meta.url).pathname);
const port = Number(process.env.PORT || 8788);
const maxParallel = Number(process.env.IPOP_MAX_PARALLEL || 6);
const sessionDir = join(root, ".ipop-work-sessions");
const workers = new Map();
const execFileAsync = promisify(execFile);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

function json(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(value, null, 2));
}

function idSafe(value) {
  return String(value || "session").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 120);
}

async function feed() {
  return JSON.parse(await readFile(join(root, "sessions.json"), "utf8"));
}

async function tail(file) {
  try {
    return (await readFile(file, "utf8")).slice(-6000);
  } catch {
    return "";
  }
}

async function apiSessions() {
  const base = await feed();
  const sessions = await Promise.all((base.sessions || []).map(async (session) => {
    const worker = workers.get(session.id);
    if (!worker) return session;
    return {
      ...session,
      status: worker.status,
      worker_pid: worker.pid,
      worker_started_at: worker.startedAt,
      worker_exit_code: worker.exitCode,
      worker_log_tail: await tail(worker.logFile),
      proof_file: worker.proofFile,
      events: [
        ...(session.events || []),
        { actor: "Codex worker", text: worker.status + " pid=" + worker.pid + " log=" + worker.logFile }
      ]
    };
  }));
  const proofs = sessions
    .filter((session) => session.proof_file && existsSync(session.proof_file))
    .map((session) => ({
      id: "artifact-" + session.id,
      title: session.title,
      status: "exists",
      evidence: session.proof_file,
      source_url: session.source_url
    }));
  return {
    ...base,
    source: "iPOP local Conductor runner: real posted requirements plus real codex exec workers",
    generated_at: new Date().toISOString(),
    sessions,
    proofs,
    jobs: sessions.map((s) => ({ id: "job-" + s.id, title: s.title, status: s.status, owner: s.id, source_url: s.source_url, worker_pid: s.worker_pid }))
  };
}

async function buildRequirements() {
  const { stdout, stderr } = await execFileAsync("node", ["scripts/build-work-sessions.mjs"], {
    cwd: root,
    maxBuffer: 1024 * 1024 * 4
  });
  return { stdout, stderr };
}

async function launch(session) {
  const current = workers.get(session.id);
  if (current && current.status === "running") return current;
  const running = [...workers.values()].filter((w) => w.status === "running").length;
  if (running >= maxParallel) throw new Error("max parallel workers reached: " + maxParallel);

  const dir = join(sessionDir, idSafe(session.id));
  await mkdir(dir, { recursive: true });
  const logFile = join(dir, "codex.log");
  const proofFile = join(dir, "proof.md");
  const prompt = [
    "You are a worker inside an iPOP Conductor-style parallel revenue swarm.",
    "Do not contact anyone, submit anything, purchase anything, or scrape private contact details.",
    "Use this real public posted requirement only and create a local proof artifact.",
    "Title: " + (session.title || ""),
    "Source URL: " + (session.source_url || ""),
    "Allowed contact route: " + (session.contact_route || "public listing route only"),
    "Requirement: " + (session.requirement || session.task || ""),
    "Proof milestone: " + (session.proof_milestone || "define acceptance checks"),
    "Write proof output to " + proofFile
  ].join("\n");
  await writeFile(join(dir, "prompt.txt"), prompt);
  await appendFile(logFile, "\n=== launch " + new Date().toISOString() + " ===\n" + prompt + "\n");
  const child = spawn("codex", ["exec", "--cd", dir, "--sandbox", "danger-full-access", "--dangerously-bypass-approvals-and-sandbox", prompt], {
    cwd: dir,
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const worker = { id: session.id, pid: child.pid, status: "running", startedAt: new Date().toISOString(), exitCode: null, logFile, proofFile };
  workers.set(session.id, worker);
  child.stdout.on("data", (chunk) => appendFile(logFile, chunk));
  child.stderr.on("data", (chunk) => appendFile(logFile, chunk));
  child.on("exit", async (code) => {
    worker.status = code === 0 ? "completed" : "failed";
    worker.exitCode = code;
    await appendFile(logFile, "\n=== exit code=" + code + " " + new Date().toISOString() + " ===\n");
  });
  return worker;
}

async function launchAll(limit) {
  const base = await feed();
  const picked = (base.sessions || []).slice(0, limit);
  const launched = [];
  for (const session of picked) launched.push(await launch(session));
  return launched;
}

function serveFile(req, res) {
  const url = new URL(req.url, "http://127.0.0.1:" + port);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = resolve(root, "." + pathname);
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  createReadStream(file).pipe(res);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1:" + port);
    if (url.pathname === "/api/sessions") return json(res, 200, await apiSessions());
    if (url.pathname === "/api/build-requirements") return json(res, 200, await buildRequirements());
    if (url.pathname === "/api/launch-all") return json(res, 200, { launched: await launchAll(Math.min(Number(url.searchParams.get("limit") || 3), maxParallel)) });
    serveFile(req, res);
  } catch (error) {
    json(res, 500, { error: error.message });
  }
}).listen(port, () => {
  console.log("iPOP Conductor runner on http://127.0.0.1:" + port);
});
