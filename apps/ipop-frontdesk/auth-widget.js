;(function () {
  function findConfig() {
    var keys = [
      "ADEPTMEDIA_CONFIG",
      "DAZL_CONFIG",
      "HOGWARTS_CONFIG",
      "ICUM_CONFIG",
      "IPOP_CONFIG",
      "MATHEMATRICKS_CONFIG",
      "TEACHR_CONFIG",
    ]
    for (var index = 0; index < keys.length; index += 1) {
      var cfg = window[keys[index]]
      if (!cfg || typeof cfg !== "object") continue
      for (var key in cfg) {
        if (/BACKEND_URL$/.test(key) && typeof cfg[key] === "string") {
          return { backendUrl: cfg[key].replace(/\/$/, ""), configKey: keys[index] }
        }
      }
    }
    return null
  }

  var found = findConfig()
  if (!found) return

  var sessionKey = "frontdesk_session_" + found.configKey.toLowerCase()
  var root = document.createElement("section")
  root.className = "auth-panel"
  root.setAttribute("aria-labelledby", "auth-title")
  root.innerHTML = [
    '<h2 id="auth-title">Account access</h2>',
    '<div class="auth-grid">',
    '<label>Name <input id="auth-name" autocomplete="name" /></label>',
    '<label>Email <input id="auth-email" type="email" autocomplete="email" required /></label>',
    '<label>Password <input id="auth-password" type="password" autocomplete="current-password" required minlength="12" /></label>',
    "</div>",
    '<div class="auth-actions">',
    '<button id="auth-signup" type="button">Create account</button>',
    '<button id="auth-login" type="button">Log in</button>',
    "</div>",
    '<p id="auth-status" class="auth-status" role="status"></p>',
  ].join("")

  var target = document.querySelector(".checkout, .booking-panel, .inspector")
  if (target) {
    target.appendChild(root)
  } else {
    document.body.appendChild(root)
  }

  var status = root.querySelector("#auth-status")
  var emailInput = root.querySelector("#auth-email")
  var passwordInput = root.querySelector("#auth-password")
  var nameInput = root.querySelector("#auth-name")

  function setStatus(message, isError) {
    status.textContent = message
    status.dataset.state = isError ? "error" : "ok"
  }

  function payload() {
    return {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      name: nameInput.value.trim(),
    }
  }

  function post(path, body) {
    return fetch(found.backendUrl + path, {
      method: "POST",
      mode: "cors",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) throw data
        return data
      })
    })
  }

  root.querySelector("#auth-signup").addEventListener("click", function () {
    setStatus("Creating account...", false)
    post("/auth/signup", payload())
      .then(function (data) {
        if (data.email_delivery && data.email_delivery.sent === false) {
          setStatus("Account created. Email delivery is not configured yet.", true)
        } else {
          setStatus("Account created. Check your email to verify.", false)
        }
      })
      .catch(function (error) {
        setStatus(error.error || "Signup failed.", true)
      })
  })

  root.querySelector("#auth-login").addEventListener("click", function () {
    setStatus("Logging in...", false)
    post("/auth/login", payload())
      .then(function (data) {
        window.localStorage.setItem(sessionKey, data.session_token)
        setStatus("Logged in.", false)
      })
      .catch(function (error) {
        setStatus(error.error || "Login failed.", true)
      })
  })
})()
