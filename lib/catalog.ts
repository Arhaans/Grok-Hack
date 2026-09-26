import type { Product } from "./types"

export const MERCHANT = {
  id: "halo-audio",
  name: "Halo Audio",
  domain: "haloaudio.store",
  checkoutDomain: "checkout.haloaudio.store",
}

// The hero product has two variants so buying agents have something to compare.
export const CATALOG: Product[] = [
  {
    sku: "HALO-1-SLV",
    name: "Halo One",
    variant: "Liquid Silver",
    family: "halo",
    price: 349,
    stock: 14,
    deliveryDays: 2,
    returnsDays: 30,
    warrantyMonths: 24,
    description:
      "Wireless over-ear headphones machined from a single piece of chrome-finished aluminium, with adaptive noise cancelling and a 40-hour battery.",
    specs: { battery: "40 h", anc: "Adaptive", weight: "268 g", codec: "LDAC, AAC", finish: "Polished chrome" },
    image: "/images/arc.png",
  },
  {
    sku: "HALO-1-GPH",
    name: "Halo One",
    variant: "Graphite",
    family: "halo",
    price: 329,
    stock: 3,
    deliveryDays: 4,
    returnsDays: 30,
    warrantyMonths: 24,
    description:
      "Wireless over-ear headphones in bead-blasted graphite aluminium, with adaptive noise cancelling and a 40-hour battery.",
    specs: { battery: "40 h", anc: "Adaptive", weight: "262 g", codec: "LDAC, AAC", finish: "Matte graphite" },
    image: "/images/arc.png",
  },
  {
    sku: "HALO-BUDS",
    name: "Halo Buds",
    family: "buds",
    price: 179,
    stock: 22,
    deliveryDays: 2,
    returnsDays: 30,
    warrantyMonths: 12,
    description: "True wireless earbuds with a mirrored charging case, spatial audio and 8 hours of playback per charge.",
    specs: { battery: "8 h (+24 h case)", anc: "Yes", weight: "5 g per bud", codec: "AAC" },
    image: "/images/arc.png",
  },
  {
    sku: "HALO-CASE",
    name: "Prism Travel Case",
    family: "accessory",
    price: 49,
    stock: 40,
    deliveryDays: 2,
    returnsDays: 30,
    warrantyMonths: 12,
    description: "A hard-shell travel case with a translucent iridescent finish that fits every Halo One model.",
    specs: { material: "Polycarbonate", fits: "Halo One" },
    image: "/images/arc.png",
  },
  {
    sku: "HALO-STAND",
    name: "Glass Stand",
    family: "accessory",
    price: 89,
    stock: 9,
    deliveryDays: 3,
    returnsDays: 30,
    warrantyMonths: 12,
    description: "A solid optical-glass headphone stand that throws a soft spectrum of light onto your desk.",
    specs: { material: "Optical glass", height: "26 cm" },
    image: "/images/arc.png",
  },
  {
    sku: "HALO-CABLE",
    name: "Braided USB-C Cable",
    family: "accessory",
    price: 25,
    stock: 60,
    deliveryDays: 2,
    returnsDays: 30,
    warrantyMonths: 12,
    description: "A 1.5 m braided USB-C cable with chrome connectors for charging and lossless wired audio.",
    specs: { length: "1.5 m", connectors: "USB-C to USB-C" },
    image: "/images/arc.png",
  },
]

export function getProduct(sku: string) {
  return CATALOG.find((p) => p.sku === sku)
}

export const POLICIES = {
  returns: "Free returns within 30 days of delivery, in original condition. Refunds are issued within 5 working days.",
  shipping: "Free UK delivery on orders over £50, otherwise £4.95. Next-day delivery available for £9.95 on in-stock items.",
  warranty: "Halo One carries a 2-year warranty; buds and accessories carry 1 year. Covers manufacturing defects.",
} as const

export type PolicyTopic = keyof typeof POLICIES
