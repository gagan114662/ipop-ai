# ipop.ai

Static GitHub Pages console for iPOP/Samantha revenue work.

The primary page is a Conductor-style session console. It must not hardcode
fake worker counts. The browser reads `/api/sessions` first and then falls back
to `/sessions.json`.

## Refresh the live Codex session feed

```sh
node scripts/update-session-feed.mjs
```

By default the script reads real Codex child sessions from:

```text
~/.codex/state_5.sqlite
```

Useful overrides:

- `CODEX_STATE_DB=/path/to/state_5.sqlite` reads another Codex runtime database.
- `IPOP_PARENT_THREAD_ID=<thread-id>` restricts the feed to one parent thread.
- `IPOP_SESSION_WINDOW_MS=<milliseconds>` changes the recent-root lookup window.
- `IPOP_SESSIONS_JSON='{...}'` keeps the older manual JSON override for tests or
  emergency publishing.

## Build real posted-requirement sessions

```sh
node scripts/build-work-sessions.mjs
```

This writes `sessions.json` from public web-posted requirements on GitHub,
RemoteOK, and Hacker News. Each record includes the source URL, requirement,
allowed contact route, proof milestone, and matching Stripe checkout route. This
is the static GitHub Pages version of the Conductor replica; a production runner
should then spawn Codex workers for the selected sessions and republish the feed
with `running` statuses from the Codex runtime.
