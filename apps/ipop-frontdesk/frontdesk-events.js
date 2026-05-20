;(function () {
  function configValue(predicate) {
    for (var key in window) {
      if (!Object.prototype.hasOwnProperty.call(window, key)) continue
      if (!/_CONFIG$/.test(key)) continue
      var cfg = window[key]
      if (!cfg || typeof cfg !== "object") continue
      for (var cfgKey in cfg) {
        if (predicate(cfgKey, cfg[cfgKey])) return cfg[cfgKey]
      }
    }
    return ""
  }

  var backendUrl = configValue(function (key, value) {
    return /BACKEND_URL$/.test(key) && typeof value === "string" && value.indexOf("http") === 0
  })

  if (!backendUrl) return

  var endpoint = backendUrl.replace(/\/$/, "") + "/event"

  function send(type, data) {
    var payload = JSON.stringify(Object.assign({
      type: type,
      path: window.location.pathname,
      href: window.location.href,
      source: "frontdesk-events",
    }, data || {}))

    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: "application/json" })
        if (navigator.sendBeacon(endpoint, blob)) return
      }
    } catch (_error) {
      // Fall through to fetch.
    }

    try {
      fetch(endpoint, {
        method: "POST",
        mode: "cors",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: payload,
      }).catch(function () {})
    } catch (_error) {
      // Event capture must never break the checkout path.
    }
  }

  window.frontdeskTrack = send

  send("frontdesk.page_view", { title: document.title })

  window.addEventListener("error", function (event) {
    send("frontdesk.error", {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    })
  })

  window.addEventListener("unhandledrejection", function (event) {
    send("frontdesk.unhandled_rejection", {
      message: event.reason && event.reason.message ? event.reason.message : String(event.reason || "unknown"),
    })
  })

  document.addEventListener("click", function (event) {
    var offerButton = event.target.closest("[data-offer]")
    if (offerButton) {
      send("frontdesk.offer_selected", { offer: offerButton.getAttribute("data-offer") })
    }

    var checkoutButton = event.target.closest("#checkout-button")
    if (checkoutButton && !checkoutButton.disabled) {
      var activeOffer = document.querySelector("[data-offer].active")
      send("frontdesk.checkout_started", {
        offer: activeOffer ? activeOffer.getAttribute("data-offer") : null,
      })
    }
  })
})()

