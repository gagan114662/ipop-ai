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
