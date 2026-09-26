import type { BuyingPacket, ComparisonMatrix, Product } from "./types"
import { MERCHANT, POLICIES } from "./catalog"
import { signOffer } from "./sign"
import { watermark } from "./watermark"
import { store } from "./events"

function served(sessionId: string, p: Product) {
  const text = watermark(p.description, sessionId)
  store().sessions.get(sessionId)?.servedDescriptions.set(p.sku, text)
  return text
}

export function buildPacket(products: Product[], sessionId: string): BuyingPacket {
  return {
    format: "packet",
    merchant: MERCHANT.name,
    items: products.map((p) => ({
      sku: p.sku,
      name: p.name,
      variant: p.variant,
      price: p.price,
      inStock: p.stock > 0,
      stock: p.stock,
      delivery: `${p.deliveryDays} working day${p.deliveryDays === 1 ? "" : "s"}`,
      returns: `${p.returnsDays}-day free returns`,
      warranty: `${p.returnsDays}-day skin guarantee`,
      description: served(sessionId, p),
      offer: signOffer(p.sku, p.price),
    })),
    checkout: {
      cartEndpoint: "/api/agent/cart",
      checkoutEndpoint: "/api/agent/checkout",
      domain: MERCHANT.checkoutDomain,
    },
  }
}

export function buildMatrix(products: Product[], sessionId: string): ComparisonMatrix {
  const specKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs)))]
  const src = `${MERCHANT.name} catalog`
  return {
    format: "matrix",
    merchant: MERCHANT.name,
    columns: products.map((p) => ({ sku: p.sku, name: p.name, variant: p.variant })),
    rows: [
      { attribute: "Price", values: products.map((p) => `$${p.price}`), source: src },
      { attribute: "Availability", values: products.map((p) => (p.stock > 0 ? `${p.stock} in stock` : "Out of stock")), source: "Live inventory" },
      { attribute: "Delivery", values: products.map((p) => `${p.deliveryDays} days`), source: "Fulfilment SLA" },
      { attribute: "Returns", values: products.map((p) => `${p.returnsDays} days, free`), source: "Returns policy" },
      { attribute: "Guarantee", values: products.map((p) => `${p.returnsDays}-day skin guarantee`), source: "Returns policy" },
      ...specKeys.map((k) => ({
        attribute: k[0].toUpperCase() + k.slice(1),
        values: products.map((p) => p.specs[k] ?? "—"),
        source: "Manufacturer spec sheet",
      })),
      { attribute: "Description", values: products.map((p) => served(sessionId, p)), source: src },
    ],
  }
}

// Raw catalog view (what a harvester gets when it doesn't ask for a format).
export function buildFull(products: Product[], sessionId: string) {
  return {
    format: "full" as const,
    merchant: MERCHANT.name,
    policies: POLICIES,
    products: products.map((p) => ({ ...p, description: served(sessionId, p), offer: signOffer(p.sku, p.price) })),
  }
}
