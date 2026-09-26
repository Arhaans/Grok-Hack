import { MERCHANT } from "@/lib/catalog"
import { json, originOf } from "@/lib/http"

// GET /.well-known/ucp → the store's agent discovery profile (UCP-style, simplified).
// This is the "install": the merchant points agent discovery at Prism, and every agent that
// looks the store up is routed through Prism's catalog, negotiation and checkout endpoints.
// Humans keep using the normal storefront.
export async function GET(req: Request) {
  const o = originOf(req)
  return json({
    merchant: { id: MERCHANT.id, name: MERCHANT.name, domain: MERCHANT.domain },
    served_by: "prism",
    identity: {
      web_bot_auth: true,
      handshake: `${o}/api/agent/handshake`,
    },
    services: {
      catalog: { search: `${o}/api/agent/catalog`, policy: `${o}/api/agent/policy` },
      negotiation: `${o}/api/agent/negotiate`,
      offer_verification: `${o}/api/agent/verify-offer`,
      checkout: { checkout_sessions: `${o}/api/ucp/checkout-sessions`, payment: ["stripe_shared_payment_token"] },
    },
  })
}
