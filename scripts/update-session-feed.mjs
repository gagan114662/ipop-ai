#!/usr/bin/env node

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { promisify } from "node:util";
import { writeFile } from "node:fs/promises";

const now = new Date().toISOString();
const raw = process.env.IPOP_SESSIONS_JSON;
const execFileAsync = promisify(execFile);

const stateDb = process.env.CODEX_STATE_DB || `${homedir()}/.codex/state_5.sqlite`;

const runSqliteJson = async (sql) => {
  const { stdout } = await execFileAsync("sqlite3", ["-json", stateDb, sql], {
    maxBuffer: 1024 * 1024 * 4,
  });
  return stdout.trim() ? JSON.parse(stdout) : [];
};

const isoFromMs = (value) => {
  if (!Number.isFinite(Number(value))) {
    return null;
  }

  return new Date(Number(value)).toISOString();
};

const taskFromMessage = (message) => {
  if (!message) {
    return "Live Codex worker session.";
  }

  return String(message).replace(/\s+/g, " ").trim().slice(0, 220);
};

const feedFromRuntime = async () => {
  if (!existsSync(stateDb)) {
    throw new Error(`Codex state database not found: ${stateDb}`);
  }

  const windowMs = Number(process.env.IPOP_SESSION_WINDOW_MS || 1000 * 60 * 60 * 8);
  const sinceMs = Date.now() - windowMs;
  const parentThreadId = process.env.IPOP_PARENT_THREAD_ID;
  const rootClause = parentThreadId
    ? `where parent_thread_id = '${parentThreadId.replaceAll("'", "''")}'`
    : `where parent_thread_id in (
        select id
        from threads
        where archived = 0
          and coalesce(agent_path, '') = ''
          and updated_at_ms >= ${sinceMs}
        order by updated_at_ms desc
        limit 5
      )`;

  const rows = await runSqliteJson(`
    select
      child.id,
      child.title,
      child.agent_path,
      child.agent_role,
      child.agent_nickname,
      child.cwd,
      child.updated_at_ms,
      child.first_user_message,
      edge.status as edge_status,
      edge.parent_thread_id
    from thread_spawn_edges edge
    join threads child on child.id = edge.child_thread_id
    ${rootClause}
    order by
      case edge.status when 'open' then 0 else 1 end,
      child.updated_at_ms desc
    limit 200;
  `);

  const sessions = rows.map((row) => {
    const status = row.edge_status === "open" ? "running" : row.edge_status || "reported";
    const agentPath = row.agent_path || row.id;
    const title = row.title || row.agent_nickname || agentPath;
    return {
      id: agentPath,
      name: row.agent_nickname || agentPath.split("/").filter(Boolean).pop() || row.id,
      title,
      status,
      kind: row.agent_role || "Codex worker",
      source: row.cwd || "Codex runtime",
      task: taskFromMessage(row.first_user_message),
      updated_at: isoFromMs(row.updated_at_ms),
      parent_thread_id: row.parent_thread_id,
      thread_id: row.id,
      events: [
        {
          actor: "Codex runtime",
          text: `${status} child session reported by ~/.codex/state_5.sqlite.`,
        },
        {
          actor: "Task",
          text: taskFromMessage(row.first_user_message),
        },
      ],
    };
  });

  return {
    generated_at: now,
    source: `Codex state database: ${stateDb}`,
    sessions,
    jobs: sessions.map((session) => ({
      id: `job-${session.thread_id}`,
      title: session.title,
      status: session.status,
      owner: session.id,
      updated_at: session.updated_at,
    })),
    proofs: [
      {
        id: "proof-real-codex-state",
        title: "Session feed generated from Codex runtime state",
        status: "verified",
        evidence: `Read ${sessions.length} child sessions from thread_spawn_edges in ~/.codex/state_5.sqlite.`,
      },
    ],
  };
};

const payload = raw ? JSON.parse(raw) : await feedFromRuntime();
const feed = raw
  ? {
      generated_at: now,
      source: payload.source || "Samantha/Codex runtime",
      sessions: Array.isArray(payload.sessions) ? payload.sessions : [],
      jobs: Array.isArray(payload.jobs) ? payload.jobs : [],
      proofs: Array.isArray(payload.proofs) ? payload.proofs : [],
    }
  : payload;

await writeFile(new URL("../sessions.json", import.meta.url), JSON.stringify(feed, null, 2) + "\n");
console.log(`updated sessions.json with ${feed.sessions.length} sessions, ${feed.jobs.length} jobs, ${feed.proofs.length} proofs`);
