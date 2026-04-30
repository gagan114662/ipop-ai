(() => {
  const form = document.querySelector(".signup");
  const input = document.querySelector("#email");
  const downloadButton = document.querySelector(".download-button");
  const video = document.querySelector(".hero-video video");
  const contactEmail = "hello@ipop.ai";
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

  const buildMailto = (email = "") => {
    const subject = encodeURIComponent("ipop.ai download request");
    const body = encodeURIComponent(
      [
        "Hey ipop.ai team,",
        "",
        "Please send me the latest Mac download.",
        email ? `My email is ${email}.` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
    return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  const markIntent = () => {
    document.documentElement.dataset.intent = "download";
    track("download_intent", {
      hasEmail: Boolean(input?.value?.trim()),
    });
  };

  track("page_view", {
    referrer: document.referrer || "",
  });

  if (video && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          track("video_visible");
          observer.disconnect();
        }
      },
      { threshold: 0.45 }
    );
    observer.observe(video);
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    markIntent();
    const value = input?.value?.trim();
    if (value) {
      form.dataset.state = "saved";
      form.querySelector("button").textContent = "saved";
    }
    track("email_submit", { hasEmail: Boolean(value) });
    window.location.href = buildMailto(value);
  });

  downloadButton?.addEventListener("click", (event) => {
    event.preventDefault();
    markIntent();
    track("download_button_click", {
      hasEmail: Boolean(input?.value?.trim()),
    });
    window.location.href = buildMailto(input?.value?.trim());
  });
})();
