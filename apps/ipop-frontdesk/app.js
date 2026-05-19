const config = window.IPOP_CONFIG || {}

const offers = [
  {
    id: "lead-cleanup",
    title: "Lead Cleanup Sprint",
    price: "$750",
    description: "Deduplicate, enrich, and segment a buyer queue with proof-ready handoff.",
    paymentLink: config.STRIPE_PAYMENT_LINK_LEAD_CLEANUP,
  },
  {
    id: "proof-pack",
    title: "Proof Pack Build",
    price: "$1,500",
    description: "Package a technical deliverable, screenshots, loom-ready notes, and buyer ask.",
    paymentLink: config.STRIPE_PAYMENT_LINK_PROOF_PACK,
  },
  {
    id: "managed-crm",
    title: "Managed CRM Ops",
    price: "$2,500/mo",
    description: "Operate the buyer queue, proof follow-ups, and payment state as a managed system.",
    paymentLink: config.STRIPE_PAYMENT_LINK_MANAGED_CRM,
  },
]

let selectedOffer = null

const offersNode = document.querySelector("#offers")
const selectionNode = document.querySelector("#selection")
const checkoutButton = document.querySelector("#checkout-button")
const backendStatus = document.querySelector("#backend-status")
const backendDot = document.querySelector("#backend-dot")

function renderOffers() {
  offersNode.innerHTML = offers
    .map((offer) => [
      '<article class="offer">',
      "<strong>" + offer.title + "</strong>",
      "<p>" + offer.description + "</p>",
      '<div class="price">' + offer.price + "</div>",
      '<button type="button" data-offer="' + offer.id + '">Select</button>',
      "</article>",
    ].join(""))
    .join("")

  offersNode.querySelectorAll("button[data-offer]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedOffer = offers.find((offer) => offer.id === button.dataset.offer)
      renderSelection()
    })
  })
}

function renderSelection() {
  if (!selectedOffer) {
    selectionNode.className = "selection-empty"
    selectionNode.textContent = "Select an offer."
    checkoutButton.disabled = true
    return
  }

  selectionNode.className = "selection-card"
  selectionNode.innerHTML = [
    "<strong>" + selectedOffer.title + "</strong>",
    "<p>" + selectedOffer.description + "</p>",
    '<div class="price">' + selectedOffer.price + "</div>",
  ].join("")
  checkoutButton.disabled = !selectedOffer.paymentLink
}

checkoutButton.addEventListener("click", () => {
  if (selectedOffer?.paymentLink) {
    window.location.href = selectedOffer.paymentLink
  }
})

async function checkBackend() {
  const backendUrl = config.TWENTY_BACKEND_URL

  if (!backendUrl) {
    backendDot.classList.add("warn")
    backendStatus.textContent = "Twenty URL missing"
    return
  }

  try {
    const response = await fetch(backendUrl.replace(/\/$/, "") + "/healthz", { mode: "cors" })
    if (!response.ok) {
      throw new Error("HTTP " + response.status)
    }
    backendDot.classList.add("ok")
    backendStatus.textContent = "Twenty reachable"
  } catch (_error) {
    backendDot.classList.add("warn")
    backendStatus.textContent = "Twenty not ready"
  }
}

renderOffers()
renderSelection()
checkBackend()
