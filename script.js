(() => {
  const downloadURL = "https://github.com/gagan114662/ipop-ai/releases/latest/download/ipop-ai-beta.dmg";
  const downloadLinks = document.querySelectorAll("[data-download-link]");
  const video = document.querySelector(".video-shell video");
  const analyticsEndpoint = window.IPOP_ANALYTICS_ENDPOINT || "";

  const track = (name, properties = {}) => {
    const payload = {
      name,
      properties,
      path: window.location.pathname,
      ts: new Date().toISOString(),
    };

    window.dispatchEvent(new CustomEvent("ipop:analytics", { detail: payload }));

    if (!analyticsEndpoint) {
      return;
    }

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(analyticsEndpoint, new Blob([body], { type: "application/json" }));
      return;
    }

    fetch(analyticsEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  };

  track("page_view", { referrer: document.referrer || "" });

  if (video && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          track("demo_video_visible");
          observer.disconnect();
        }
      },
      { threshold: 0.45 }
    );
    observer.observe(video);
  }

  downloadLinks.forEach((link) => {
    link.setAttribute("href", downloadURL);
    link.setAttribute("rel", "noopener");
    link.addEventListener("click", () => {
      document.documentElement.dataset.intent = "download";
      track("download_link_click", { target: link.textContent.trim() });
    });
  });
})();
