export const PRODUCTS = [
  {
    id: "barrier-repair-serum",
    name: "The Botanical Barrier Repair Serum",
    subtitle: "Cellular Lipid Restoration & Redness Calming Serum",
    price: 68,
    sizes: [
      { size: "30ml / 1.0 fl oz", price: 48 },
      { size: "50ml / 1.7 fl oz", price: 68 }
    ],
    rating: 4.9,
    reviewCount: 128,
    category: "Serums",
    tag: "Best Seller",
    badge: "Award Winner",
    purpose: "Intensive lipid restoration, redness reduction, and moisture lock",
    image: "/images/hero_serum.png",
    hoverImage: "/images/skincare_set.png",
    isHero: true,
    description: "An extraordinary lightweight, velvety serum formulated to repair and fortify compromised skin barriers. Packed with 10% Centella Asiatica, 5% Niacinamide, and pure lipid ceramides, this potent botanical elixir instantly calms redness, locks in 72 hours of deep hydration, and shields against environmental stressors.",
    benefits: [
      "Instantly calms irritation, redness, and reactive skin flare-ups",
      "Restores damaged skin barrier function in as little as 14 days",
      "Sustains 72 hours of deep cellular hydration without heaviness",
      "Non-comedogenic, fragrance-free, and suitable for eczema-prone skin"
    ],
    keyIngredients: [
      { name: "Centella Asiatica (10%)", role: "Calms inflammation & accelerates cellular healing" },
      { name: "Niacinamide (5%)", role: "Refines texture & boosts natural ceramide production" },
      { name: "Triple Hyaluronic Complex", role: "Multi-depth hydration from epidermis to dermis" },
      { name: "Ceramide NP & Plant Squalane", role: "Rebuilds natural intercellular lipid matrix" }
    ],
    inciList: "Aqua/Water/Eau, Centella Asiatica Leaf Extract, Niacinamide, Glycerin, Squalane, Propanediol, Sodium Hyaluronate, Hyaluronic Acid, Hydrolyzed Sodium Hyaluronate, Ceramide NP, Phytosphingosine, Camellia Sinensis (Green Tea) Leaf Extract, Allantoin, Panthenol, Xanthan Gum, Ethylhexylglycerin, Phenoxyethanol.",
    howToUse: "Apply 3-4 drops morning and night onto clean, slightly damp skin before heavy moisturizers. Gently press into face, neck, and décolletage until fully absorbed.",
    suitableSkin: ["Sensitive", "Dry", "Combination", "Compromised Barrier"],
    clinicalTrial: {
      hydration: "98% experienced immediate hydration boost",
      barrier: "94% reported visibly reduced redness in 14 days",
      smoothness: "96% noted smoother skin texture after 4 weeks"
    }
  },
  {
    id: "velvet-cleansing-balm",
    name: "Velvet Cleansing Balm",
    subtitle: "Nourishing Botanical Oil Melt Cleanser",
    price: 48,
    sizes: [
      { size: "100ml / 3.4 oz", price: 48 }
    ],
    rating: 4.8,
    reviewCount: 94,
    category: "Cleansers",
    tag: "Award Winner",
    badge: "Clean Beauty",
    purpose: "Effortlessly melts away long-wear makeup, SPF, and urban pollutants",
    image: "/images/cleansing_balm.png",
    hoverImage: "/images/hero_serum.png",
    description: "A luxurious golden balm that transforms into a silky cleansing oil upon contact with skin, then rinses away as a milky emulsion. Infused with Sea Buckthorn and Elderberry oils to nourish skin while deeply purifying pores.",
    benefits: [
      "Dissolves waterproof makeup and water-resistant SPF without tugging",
      "Leaves skin feeling velvety soft, supple, and never stripped",
      "Rich in Omega-7 fatty acids to support natural barrier lipids"
    ],
    keyIngredients: [
      { name: "Sea Buckthorn Oil", role: "Rich in antioxidants and essential Omega fatty acids" },
      { name: "Elderberry Seed Butter", role: "Protects against environmental oxidation" },
      { name: "Chamomile Extract", role: "Calms sensitivity and soothes delicate tissue" }
    ],
    howToUse: "Scoop a nickel-sized amount onto dry hands. Massage onto dry face in circular motions. Add warm water to emulsify into a rich milk, then rinse thoroughly.",
    suitableSkin: ["All Skin Types", "Dry", "Sensitive"]
  },
  {
    id: "ceramide-peptide-cream",
    name: "Ceramide Peptide Infusion Cream",
    subtitle: "Deep Moisture Lock & Skin Cushion Cream",
    price: 72,
    sizes: [
      { size: "50ml / 1.7 oz", price: 72 }
    ],
    rating: 4.8,
    reviewCount: 104,
    category: "Moisturizers",
    tag: "Clinical Grade",
    badge: "Barrier Cushion",
    purpose: "Restores elasticity and creates a protective cushion against moisture loss",
    image: "/images/cream_jar.png",
    hoverImage: "/images/cleansing_balm.png",
    description: "A rich yet weightless moisturizer containing 5 essential ceramides and copper peptides that fortify the lipid matrix, leaving skin velvety, plump, and thoroughly cushioned.",
    benefits: [
      "Protects against harsh climate conditions and indoor air conditioning",
      "Smoothes fine dry lines instantly",
      "Locks in serums and treatment actives for maximum penetration"
    ],
    keyIngredients: [
      { name: "5 Ceramides (EOP, NS, NP, AS, AP)", role: "Reconstructs cellular brick-and-mortar structure" },
      { name: "Copper Tripeptide-1", role: "Promotes elastin synthesis and skin bounce" }
    ],
    howToUse: "Massage a blueberry-sized amount onto face and neck morning and night after serums.",
    suitableSkin: ["Dry", "Normal", "Dehydrated", "Sensitive"]
  },
  {
    id: "bio-retinol-night-oil",
    name: "Bio-Retinol Renewal Night Oil",
    subtitle: "Plant-Based Bakuchiol & Rosehip Overnight Treatment",
    price: 78,
    sizes: [
      { size: "30ml / 1.0 fl oz", price: 78 }
    ],
    rating: 4.9,
    reviewCount: 116,
    category: "Serums",
    tag: "Best Seller",
    badge: "Overnight Renewal",
    purpose: "Refines fine lines, boosts collagen, and restores youthful radiance without irritation",
    image: "/images/night_oil.png",
    hoverImage: "/images/skincare_set.png",
    description: "A potent 100% botanical night treatment featuring 2% Bakuchiol—nature’s gentler alternative to retinol—blended with cold-pressed Rosehip and soothing Blue Tansy oils to smooth texture and boost firm elasticity overnight.",
    benefits: [
      "Targets fine lines, hyperpigmentation, and texture irregularities",
      "Zero peeling, flaking, or photosensitivity associated with traditional retinol",
      "Infuses deep nocturnal nourishment for waking up to pillowy soft radiance"
    ],
    keyIngredients: [
      { name: "Bakuchiol (2%)", role: "Stimulates collagen synthesis and cell turnover" },
      { name: "Cold-Pressed Rosehip Oil", role: "Rich in natural Vitamin A & essential fatty acids" },
      { name: "Blue Tansy Oil", role: "Calms inflammation and gives a peaceful natural scent" }
    ],
    howToUse: "Warm 3-5 drops in palms and gently press into clean face and neck every evening as the final step in your routine.",
    suitableSkin: ["Aging", "Combination", "Normal", "Sensitive"]
  },
  {
    id: "complete-barrier-set",
    name: "The Complete Barrier Restoration Set",
    subtitle: "Curated 4-Step Botanical Skincare System",
    price: 185,
    sizes: [
      { size: "4-Piece Full-Size Set", price: 185 }
    ],
    rating: 5.0,
    reviewCount: 42,
    category: "Sets",
    tag: "Limited Edition",
    badge: "Save $35",
    purpose: "Complete transformation ritual for compromised, dry, or tired skin",
    image: "/images/skincare_set.png",
    hoverImage: "/images/hero_serum.png",
    description: "The ultimate Prism Skincare collection. Contains our Velvet Cleansing Balm (100ml), Hydra-Luminous Milk Toner (150ml), Botanical Barrier Repair Serum (50ml), and Ceramide Peptide Cream (50ml) in an exquisite keepsake box.",
    benefits: [
      "Complete AM & PM ritual engineered for optimal synergistic efficacy",
      "Saves $35 compared to buying individual full-size products",
      "Housed in our recyclable FSC luxury presentation keepsake box"
    ],
    keyIngredients: [
      { name: "Synergistic Bio-Actives", role: "Full spectrum Ceramides, Niacinamide, Bakuchiol & Centella" }
    ],
    howToUse: "Follow the enclosed routine guide card: Cleanse -> Tone -> Repair Serum -> Lock in Moisture Cream.",
    suitableSkin: ["All Skin Types", "Ideal for New Routines"]
  },
  {
    id: "hydra-milk-toner",
    name: "Hydra-Luminous Milk Toner",
    subtitle: "Fermented Essence & Softening Hydration Essence",
    price: 42,
    sizes: [
      { size: "150ml / 5.1 fl oz", price: 42 }
    ],
    rating: 4.9,
    reviewCount: 82,
    category: "Moisturizers",
    tag: "Clean Science",
    badge: "Essence Prep",
    purpose: "Preps skin cells for serum absorption while imparting immediate dewy glow",
    image: "/images/hero_serum.png",
    hoverImage: "/images/cleansing_balm.png",
    description: "A soothing bi-phase milky essence featuring fermented rice water and polyglutamic acid. It rebalances post-cleanse pH and delivers weightless hydration deep into the stratum corneum.",
    benefits: [
      "Increases skin hydration absorption capacity by up to 300%",
      "Softens rough texture and flaky patches instantly",
      "Calms tight post-water skin feel"
    ],
    keyIngredients: [
      { name: "Fermented Rice Filtrate", role: "Rich in amino acids and natural brightening minerals" },
      { name: "Polyglutamic Acid", role: "Holds 4x more moisture than hyaluronic acid" }
    ],
    howToUse: "Pour a few drops into clean palms and pat gently onto clean skin before serums.",
    suitableSkin: ["All Skin Types", "Dehydrated"]
  },
  {
    id: "cloud-foam-cleanser",
    name: "Purifying Cloud Foam Cleanser",
    subtitle: "pH-Balanced Micro-Bubble Clarifying Cleanser",
    price: 38,
    sizes: [
      { size: "150ml / 5.1 fl oz", price: 38 }
    ],
    rating: 4.7,
    reviewCount: 76,
    category: "Cleansers",
    tag: "Daily Essential",
    badge: "Gentle Cleanse",
    purpose: "Gently purifies pores, excess sebum, and impurities while preserving barrier lipids",
    image: "/images/cleansing_balm.png",
    hoverImage: "/images/hero_serum.png",
    description: "A pillow-soft foam cleanser formulated with coconut-derived amino acids and green tea extract. Maintains optimal pH 5.5 balance to leave skin feeling clean, clear, and calm.",
    benefits: [
      "Formulated at optimal pH 5.5 to protect natural acid mantle",
      "Creates micro-bubbles that draw out pore impurities without dryness",
      "Soothes redness with organic Camellia Sinensis leaf extract"
    ],
    keyIngredients: [
      { name: "Amino Acid Surfactants", role: "Ultra-gentle cleansing without stripping lipid layer" },
      { name: "Green Tea Extract", role: "Antioxidant protection and pore clarification" }
    ],
    howToUse: "Pump 1-2 foam clouds onto wet hands, massage gently over face for 60 seconds, and rinse with lukewarm water.",
    suitableSkin: ["Oily", "Combination", "Acne-Prone", "Normal"]
  },
  {
    id: "radiance-eye-cream",
    name: "Botanical Radiance Eye Cream",
    subtitle: "Active Caffeine & Peptide Eye Contour Treatment",
    price: 54,
    sizes: [
      { size: "15ml / 0.5 oz", price: 54 }
    ],
    rating: 4.8,
    reviewCount: 63,
    category: "Moisturizers",
    tag: "Dermatologist Tested",
    badge: "Brightening",
    purpose: "Visibly brightens dark circles, reduces morning puffiness, and smooths crow's feet",
    image: "/images/cream_jar.png",
    hoverImage: "/images/night_oil.png",
    description: "An illuminating eye treatment powered by green coffee bean caffeine and botanical niacinamide. Fast-absorbing cream formula depuffs tired eyes and creates a smooth canvas for makeup.",
    benefits: [
      "Constricts micro-vessels to diminish bluish dark circles",
      "Smooths delicate eye area fine lines and dryness",
      "Ophtalmologist tested and safe for sensitive eyes and contact lens wearers"
    ],
    keyIngredients: [
      { name: "Green Coffee Bean Caffeine", role: "Drains fluid accumulation to reduce puffiness" },
      { name: "Marigold Extract", role: "Soothes delicate under-eye tissue" }
    ],
    howToUse: "Dab a pin-sized dot along orbital bone morning and night using ring finger.",
    suitableSkin: ["All Skin Types", "Sensitive Eyes"]
  }
];
