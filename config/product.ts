export const productConfig = {
  name: "Vending Machine Factory",
  slug: "vending-machine-factory",
  tagline: "Build your AI-powered micro-SaaS products effortlessly.",
  description: "A powerful template for creating AI-driven micro-SaaS applications quickly and efficiently.",
  theme: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
  },
  pricing: {
    currency: "EUR",
    plans: [
      { id: "free", name: "Free", price: 0, credits: 5, features: ["Basic access"] },
      { id: "pro", name: "Pro", price: 19, credits: 100, features: ["Priority", "API access"] },
      { id: "business", name: "Business", price: 49, credits: 500, features: ["Everything", "White-label"] },
    ],
  },
  agentId: "", // AutoGPT agent library ID — filled per product
  apiEndpoint: "", // AutoGPT External API endpoint
  affiliate: {
    enabled: true,
    commissionPercent: 20,
    cookieDays: 30,
  },
}
