(() => {
  const DEFAULT_ENDPOINTS = ["/api/sessions", "/sessions.json"];
  const explicitEndpoint = window.IPOP_SESSION_ENDPOINT;
  const endpoints = explicitEndpoint ? [explicitEndpoint] : DEFAULT_ENDPOINTS;

  const state = {
    sessions: [],
    jobs: [],
    proofs: [],
    source: null,
    sourceDetail: null,
    generatedAt: null,
    selectedId: null,
  };

  const $ = (selector) => document.querySelector(selector);
  const sessionList = $("[data-session-list]");
  const runLog = $("[data-run-log]");
  const syncState = $("[data-sync-state]");
  const lastUpdated = $("[data-last-updated]");
  const runtimeState = $("[data-runtime-state]");
  const runtimeTitle = $("[data-runtime-title]");
  const runtimeCopy = $("[data-runtime-copy]");
  const launchWorkers = $("[data-launch-workers]");
  const refreshSessions = $("[data-refresh-sessions]");

  const setText = (selector, value) => {
    const node = $(selector);
    if (node) {
      node.textContent = value;
    }
  };

  const normalizeFeed = (payload, source) => {
    if (Array.isArray(payload)) {
      return { sessions: payload, jobs: [], proofs: [], source };
    }

    return {
      sessions: Array.isArray(payload.sessions) ? payload.sessions : [],
      jobs: Array.isArray(payload.jobs) ? payload.jobs : [],
      proofs: Array.isArray(payload.proofs) ? payload.proofs : [],
      source,
      sourceDetail: payload.source || null,
      generatedAt: payload.generated_at || null,
    };
  };

  const fetchFeed = async () => {
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) {
          continue;
        }
        const payload = await response.json();
        return normalizeFeed(payload, endpoint);
      } catch (error) {
        // Try the next endpoint. The UI reports the final disconnected state.
      }
    }

    return normalizeFeed({}, null);
  };

  const formatTime = (value) => {
    if (!value) {
      return "unknown";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderStats = () => {
    const liveSessions = state.sessions.filter((session) => {
      const status = String(session.status || "").toLowerCase();
      return status === "running" || status === "open";
    });
    setText("[data-stat='sessions']", String(state.sessions.length));
    setText("[data-stat='jobs']", String(state.jobs.length));
    setText("[data-stat='proofs']", String(state.proofs.length));
  };

  const renderRuntime = () => {
    const connected = Boolean(state.source);
    if (syncState) {
      syncState.textContent = connected ? `connected: ${state.source}` : "waiting for live feed";
    }
    if (lastUpdated) {
      lastUpdated.textContent = connected ? `updated ${formatTime(state.generatedAt || new Date().toISOString())}` : "not connected";
    }
    if (runtimeState) {
      runtimeState.textContent = connected ? "connected" : "not connected";
    }
    if (runtimeTitle) {
      const liveCount = state.sessions.filter((session) => {
        const status = String(session.status || "").toLowerCase();
        return status === "running" || status === "open";
      }).length;
      runtimeTitle.textContent = connected
        ? `${state.sessions.length} posted requirement${state.sessions.length === 1 ? "" : "s"}; ${liveCount} Codex worker${liveCount === 1 ? "" : "s"} running`
        : "No live Codex feed yet";
    }
    if (runtimeCopy) {
      runtimeCopy.textContent = connected
        ? `Rendering ${state.sourceDetail || "Samantha's runtime feed"}, not static page copy.`
        : "Publish /sessions.json or set window.IPOP_SESSION_ENDPOINT to Samantha's runtime API. Until then, counts stay at zero.";
    }
  };

  const renderSessions = () => {
    if (!sessionList) {
      return;
    }

    sessionList.textContent = "";

    if (state.sessions.length === 0) {
      const empty = document.createElement("article");
      empty.className = "empty-state";
      empty.innerHTML = "<span>No live sessions yet</span><p>Connect Samantha's runtime feed and actual Codex workers will appear here.</p>";
      sessionList.append(empty);
      return;
    }

    state.sessions.forEach((session, index) => {
      const id = session.id || session.name || `session-${index}`;
      const card = document.createElement("article");
      card.className = `session-card ${state.selectedId === id || (!state.selectedId && index === 0) ? "active" : ""}`;
      card.tabIndex = 0;
      card.dataset.sessionId = id;
      card.innerHTML = `
        <span>${session.status || session.kind || "Codex session"}</span>
        <strong>${session.title || session.name || id}</strong>
        <p>${session.task || session.source || "Live worker reported by Samantha runtime."}</p>
      `;
      card.addEventListener("click", () => {
        state.selectedId = id;
        render();
      });
      sessionList.append(card);
    });
  };

  const selectedSession = () => {
    if (state.sessions.length === 0) {
      return null;
    }

    return state.sessions.find((session, index) => {
      const id = session.id || session.name || `session-${index}`;
      return id === state.selectedId;
    }) || state.sessions[0];
  };

  const renderRunLog = () => {
    if (!runLog) {
      return;
    }

    const session = selectedSession();
    runLog.textContent = "";

    const events = session && Array.isArray(session.events) && session.events.length > 0
      ? session.events
      : [
          {
            actor: "System",
            text: state.source
              ? "Runtime feed is connected. Select a session with events to inspect actual worker activity."
              : "No live runtime feed is connected, so no worker transcript is being displayed.",
          },
          {
            actor: "Contract",
            text: "The page no longer contains static fake work cards or fake hundreds-of-sessions counts.",
          },
          {
            actor: "Wire",
            text: "Feed Samantha sessions through /api/sessions or /sessions.json with sessions, jobs, proofs, and event arrays.",
          },
        ];

    events.forEach((event) => {
      const item = document.createElement("div");
      item.innerHTML = `<span>${event.actor || event.role || "Event"}</span><p>${event.text || event.message || ""}</p>`;
      runLog.append(item);
    });

    setText("[data-active-kind]", session ? (session.kind || session.status || "live session") : "runtime required");
  };

  const renderInspector = () => {
    const session = selectedSession();
    const sourceLink = $("[data-selected-source]");
    const stripeLink = $("[data-selected-stripe]");

    setText("[data-inspector-status]", session ? (session.status || "selected") : "truthful only");
    setText("[data-selected-task]", session
      ? (session.task || session.title || "Task text unavailable.")
      : "Choose a session to inspect the live Codex task.");
    setText("[data-selected-runtime]", session
      ? (session.source || session.id || "Codex runtime feed")
      : "Codex runtime feed only.");
    setText("[data-selected-updated]", session
      ? (session.updated_at || "unknown")
      : "No session selected yet.");

    if (sourceLink) {
      sourceLink.href = session?.source_url || "https://ipop.ai/";
      sourceLink.textContent = session?.source_url || "Runtime session";
    }

    if (stripeLink) {
      stripeLink.href = session?.stripe_url || "https://buy.stripe.com/eVq9AUfbN0Q72HpaF21kA07";
      stripeLink.textContent = session?.stripe_url ? "Open matching Stripe checkout" : "$19 Agent Trial Sprint";
    }
  };

  const render = () => {
    renderStats();
    renderRuntime();
    renderSessions();
    renderRunLog();
    renderInspector();
  };

  const boot = async () => {
    const feed = await fetchFeed();
    state.sessions = feed.sessions;
    state.jobs = feed.jobs;
    state.proofs = feed.proofs;
    state.source = feed.source;
    state.sourceDetail = feed.sourceDetail;
    state.generatedAt = feed.generatedAt;
    render();
  };

  launchWorkers?.addEventListener("click", async () => {
    launchWorkers.disabled = true;
    launchWorkers.textContent = "Launching...";
    try {
      await fetch("/api/launch-all?limit=3", { cache: "no-store" });
      await boot();
    } finally {
      launchWorkers.disabled = false;
      launchWorkers.textContent = "New workspace";
    }
  });

  refreshSessions?.addEventListener("click", boot);

  boot();
  window.setInterval(boot, 15000);
})();
