(() => {
  const downloadURL = "https://github.com/gagan114662/ipop-ai/releases/latest/download/ipop-ai-beta.dmg";
  const form = document.querySelector(".download-form");
  const input = document.querySelector("#email");
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

  const startDownload = (email = "") => {
    if (email) {
      localStorage.setItem("ipop_beta_email", email);
    }
    document.documentElement.dataset.intent = "download";
    track("download_dmg", { hasEmail: Boolean(email) });
    window.location.href = downloadURL;
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

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = input?.value?.trim() || "";
    const button = form.querySelector("button");
    if (button) {
      button.textContent = "Downloading...";
      button.disabled = true;
    }
    startDownload(email);
    window.setTimeout(() => {
      if (button) {
        button.textContent = "Download DMG";
        button.disabled = false;
      }
    }, 1800);
  });

  downloadLinks.forEach((link) => {
    link.setAttribute("href", downloadURL);
    link.addEventListener("click", () => {
      track("download_link_click", {
        hasEmail: Boolean(input?.value?.trim()),
      });
    });
  });
})();
