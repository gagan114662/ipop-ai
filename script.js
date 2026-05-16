(() => {
  const endpoints = window.IPOP_SESSION_ENDPOINT ? [window.IPOP_SESSION_ENDPOINT] : ["/api/sessions", "/sessions.json"];
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
  const laneLists = {
    done: $("[data-lane-list='done']"),
    review: $("[data-lane-list='review']"),
    progress: $("[data-lane-list='progress']"),
    backlog: $("[data-lane-list='backlog']"),
    canceled: $("[data-lane-list='canceled']"),
  };
  const runLog = $("[data-run-log]");
  const lastUpdated = $("[data-last-updated]");
  const runtimeState = $("[data-runtime-state]");
  const runtimeTitle = $("[data-runtime-title]");
  const runtimeCopy = $("[data-runtime-copy]");
  const launchWorkers = $("[data-launch-workers]");
  const refreshSessions = $("[data-refresh-sessions]");
  const buildRequirements = $("[data-build-requirements]");
  const drawer = $("[data-drawer]");
  const closeDrawer = $("[data-close-drawer]");

  const setText = (selector, value) => {
    const node = $(selector);
    if (node) node.textContent = value;
  };

  const normalizeFeed = (payload, source) => ({
    sessions: Array.isArray(payload.sessions) ? payload.sessions : [],
    jobs: Array.isArray(payload.jobs) ? payload.jobs : [],
    proofs: Array.isArray(payload.proofs) ? payload.proofs : [],
    source,
    sourceDetail: payload.source || null,
    generatedAt: payload.generated_at || null,
  });

  const fetchFeed = async () => {
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) continue;
        return normalizeFeed(await response.json(), endpoint);
      } catch {}
    }
    return normalizeFeed({}, null);
  };

  const isRunning = (session) => ["running", "open"].includes(String(session.status || "").toLowerCase());
  const laneFor = (session) => {
    const status = String(session.status || "").toLowerCase();
    if (status === "completed" || status === "done") return "done";
    if (status.includes("review")) return "review";
    if (status === "running" || status === "open") return "progress";
    if (status === "failed" || status === "canceled" || status === "cancelled") return "canceled";
    return "backlog";
  };

  const formatTime = (value) => {
    const date = new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? "unknown" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const selectedSession = () => {
    if (state.sessions.length === 0) return null;
    return state.sessions.find((session, index) => (session.id || session.name || `session-${index}`) === state.selectedId) || state.sessions[0];
  };

  const renderStats = () => {
    setText("[data-stat='sessions']", String(state.sessions.length));
    setText("[data-stat='running']", String(state.sessions.filter(isRunning).length));
    setText("[data-stat='proofs']", String(state.proofs.length));
  };

  const payLabel = (session) => {
    const signal = session.pay_signal || {};
    if (session.estimated_budget && session.estimated_budget !== "unknown") return session.estimated_budget;
    if (signal.summary && signal.summary !== "unknown") return signal.summary;
    return signal.confidence ? signal.confidence.replace(/_/g, " ") : "pay unverified";
  };

  const renderRuntime = () => {
    const connected = Boolean(state.source);
    const running = state.sessions.filter(isRunning).length;
    if (lastUpdated) lastUpdated.textContent = connected ? `updated ${formatTime(state.generatedAt)}` : "not connected";
    if (runtimeState) runtimeState.textContent = connected ? "connected" : "not connected";
    if (runtimeTitle) {
      runtimeTitle.textContent = connected
        ? `${running} Codex worker${running === 1 ? "" : "s"} running on ${state.sessions.length} requirement${state.sessions.length === 1 ? "" : "s"}`
        : "No runner connected";
    }
    if (runtimeCopy) {
      runtimeCopy.textContent = connected
        ? `Rendering ${state.sourceDetail || state.source}. Worker-only mode: requirements, PIDs, logs, artifacts.`
        : "Run the local work-session server to stream worker PIDs, logs, and artifacts.";
    }
  };

  const renderSessions = () => {
    Object.values(laneLists).forEach((lane) => {
      if (lane) lane.textContent = "";
    });
    const counts = { done: 0, review: 0, progress: 0, backlog: 0, canceled: 0 };

    state.sessions.forEach((session, index) => {
      const id = session.id || session.name || `session-${index}`;
      const laneName = laneFor(session);
      counts[laneName] += 1;
      const lane = laneLists[laneName];
      if (!lane) return;
      const card = document.createElement("article");
      card.className = `task-card ${state.selectedId === id || (!state.selectedId && index === 0) ? "active" : ""}`;
      card.tabIndex = 0;
      card.dataset.sessionId = id;
      card.innerHTML = `
        <span>${session.status || session.kind || "ready"}</span>
        <strong>${session.title || session.name || id}</strong>
        <p>${payLabel(session)} · ${session.source || "posted requirement"}${session.worker_pid ? ` · pid ${session.worker_pid}` : ""}</p>
      `;
      card.addEventListener("click", () => {
        state.selectedId = id;
        drawer?.classList.add("open");
        render();
      });
      lane.append(card);
    });

    Object.entries(counts).forEach(([name, count]) => setText(`[data-lane-count='${name}']`, String(count)));
  };

  const renderRunLog = () => {
    if (!runLog) return;
    const session = selectedSession();
    runLog.textContent = "";
    const events = [
      ...(Array.isArray(session?.events) ? session.events : []),
      ...(session?.worker_log_tail ? [{ actor: "Log tail", text: session.worker_log_tail }] : []),
    ];
    const visibleEvents = events.length > 0 ? events : [
      { actor: "System", text: state.source ? "Select a task or launch a workspace to inspect live worker activity." : "No runner connected." },
    ];
    visibleEvents.forEach((event) => {
      const item = document.createElement("div");
      item.innerHTML = `<span>${event.actor || "Event"}</span><p>${event.text || event.message || ""}</p>`;
      runLog.append(item);
    });
    setText("[data-active-kind]", session ? (session.kind || session.status || "session") : "no selection");
  };

  const renderInspector = () => {
    const session = selectedSession();
    const sourceLink = $("[data-selected-source]");
    setText("[data-inspector-status]", session ? (session.status || "selected") : "idle");
    setText("[data-selected-task]", session ? (session.requirement || session.task || session.title || "Task text unavailable.") : "Choose a task.");
    setText("[data-selected-runtime]", session
      ? (session.worker_pid ? `pid ${session.worker_pid} · ${session.status}` : "ready for workspace launch")
      : "No worker selected.");
    setText("[data-selected-pay]", session ? payLabel(session) : "No pay signal selected.");
    setText("[data-selected-artifact]", session
      ? (session.proof_file || session.proofFile || session.artifact || "No artifact reported yet.")
      : "No artifact yet.");
    setText("[data-selected-updated]", session ? (session.worker_started_at || session.updated_at || "unknown") : "Not connected.");
    if (sourceLink) {
      sourceLink.href = session?.source_url || "https://ipop.ai/";
      sourceLink.textContent = session?.source_url || "No source selected";
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

  const runAction = async (button, label, url) => {
    if (!button) return;
    button.disabled = true;
    button.textContent = label;
    try {
      await fetch(url, { cache: "no-store" });
      await boot();
    } finally {
      button.disabled = false;
    }
  };

  launchWorkers?.addEventListener("click", () => runAction(launchWorkers, "Launching...", "/api/launch-all?limit=6").finally(() => {
    launchWorkers.textContent = "New workspace";
  }));
  buildRequirements?.addEventListener("click", () => runAction(buildRequirements, "Importing...", "/api/build-requirements").finally(() => {
    buildRequirements.textContent = "Import requirements";
  }));
  refreshSessions?.addEventListener("click", boot);
  closeDrawer?.addEventListener("click", () => drawer?.classList.remove("open"));

  boot();
  window.setInterval(boot, 5000);
})();
