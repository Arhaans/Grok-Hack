// Prism trust badge for human shoppers (optional): <script src="/prism.js" defer>.
// Agents never run page JavaScript; they reach Prism through the store's /.well-known/ucp discovery profile.
;(function () {
  if (new URLSearchParams(location.search).has("clone")) return // copycats don't get Prism
  var el = document.createElement("a")
  el.href = "/#demo"
  el.target = "_top"
  el.setAttribute("aria-label", "Protected by Prism")
  el.style.cssText =
    "position:fixed;left:16px;bottom:16px;z-index:9999;display:flex;align-items:center;gap:8px;padding:8px 12px;" +
    "border-radius:999px;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);" +
    "border:1px solid rgba(0,0,0,.08);box-shadow:0 4px 18px rgba(0,0,0,.08);font:500 11px/1 system-ui,sans-serif;" +
    "letter-spacing:.06em;color:rgba(0,0,0,.65);text-decoration:none"
  el.innerHTML =
    '<span style="width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px #10b981"></span>' +
    '<span>PRISM · AGENT-READY</span><span data-count style="color:rgba(0,0,0,.4)"></span>'
  document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(el) })
  function poll() {
    fetch("/api/prism/events?since=999999999", { cache: "no-store" })
      .then(function (r) { return r.json() })
      .then(function (s) {
        var n = (s.identities || []).length
        el.querySelector("[data-count]").textContent = n ? "· " + n + " agent" + (n === 1 ? "" : "s") + " identified" : ""
      })
      .catch(function () {})
  }
  poll()
  setInterval(poll, 2000)
})()
