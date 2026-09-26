import type { Product } from "./types"
// Single source of truth: the Prism Skincare storefront's own product data (stores/prism-skincare).
import { PRODUCTS as STORE } from "@/stores/prism-skincare/src/data/products"

export const MERCHANT = {
  id: "prism-skincare",
  name: "Prism Skincare",
  domain: "prismskincare.com",
  checkoutDomain: "checkout.prismskincare.com",
}

// SKUs the demo agents and playbook refer to.
export const DEMO = {
  heroFamily: "barrier-repair-serum",
  hero: "barrier-repair-serum-50ml", // $68
  heroSmall: "barrier-repair-serum-30ml", // $48
  bundleAddOn: "velvet-cleansing-balm", // Llama's bundle
  gift: "botanical-sample-trio", // Claude's free gift
}

type StoreProduct = {
  id: string
  name: string
  subtitle: string
  price: number
  sizes: { size: string; price: number }[]
  category: string
  purpose: string
  image: string
  description: string
  rating: number
  reviewCount: number
  keyIngredients?: { name: string }[]
  suitableSkin?: string[]
  clinicalTrial?: Record<string, string>
}

// The storefront has no inventory or delivery data, so the demo adds some (the 30ml is low stock and slower).
const OPS: Record<string, { stock: number; deliveryDays: number }> = {
  "barrier-repair-serum-30ml": { stock: 3, deliveryDays: 4 },
  "barrier-repair-serum-50ml": { stock: 14, deliveryDays: 2 },
}

function sizeKey(size: string) {
  return size.split("/")[0].trim().toLowerCase().replace(/\s+/g, "")
}

export const CATALOG: Product[] = [
  ...(STORE as StoreProduct[]).flatMap((v) =>
    v.sizes.map((s) => {
      const sku = v.sizes.length > 1 ? `${v.id}-${sizeKey(s.size)}` : v.id
      const ops = OPS[sku] ?? { stock: 20, deliveryDays: 2 }
      return {
        sku,
        name: v.name,
        variant: s.size,
        family: v.id,
        price: s.price,
        stock: ops.stock,
        deliveryDays: ops.deliveryDays,
        returnsDays: 30,
        warrantyMonths: 0,
        description: v.description,
        specs: {
          category: v.category,
          purpose: v.purpose,
          rating: `${v.rating}★ (${v.reviewCount} reviews)`,
          ...(v.keyIngredients ? { ingredients: v.keyIngredients.map((k) => k.name).join(", ") } : {}),
          ...(v.suitableSkin ? { skin: v.suitableSkin.join(", ") } : {}),
          ...(v.clinicalTrial ?? {}),
        },
        image: v.image,
      }
    }),
  ),
  {
    sku: DEMO.gift,
    name: "Botanical Sample Trio",
    variant: "3 × 5ml",
    family: "samples",
    price: 18,
    stock: 200,
    deliveryDays: 2,
    returnsDays: 30,
    warrantyMonths: 0,
    description: "Travel-size cleansing balm, toner and cream to try the Prism Skincare ritual at home.",
    specs: { category: "Samples" },
    image: "/images/skincare_set.png",
  },
]

export function getProduct(sku: string) {
  return CATALOG.find((p) => p.sku === sku)
}

export const POLICIES = {
  returns: "30-Day Skin Guarantee: if a formula doesn't suit your skin, get a free replacement or a 100% refund within 30 days.",
  shipping: "Complimentary express shipping on orders over $75, otherwise $6.95. Three botanical samples included with every order.",
  ingredients: "Every formula is dermatologist-formulated, fragrance-free and non-comedogenic; full INCI lists are published per product.",
} as const

export type PolicyTopic = keyof typeof POLICIES
