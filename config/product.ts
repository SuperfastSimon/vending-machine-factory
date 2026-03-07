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
  agent: {
    libraryId: "6387fd67-6aea-4090-9cca-fed50f747cdc",
    graphId: "cd0870a3-0a0f-425e-91cf-041b84548ef7",
    inputSchema: {
      prompt: {
        type: "textarea" as const,
        label: "Describe your business idea",
        placeholder: "e.g. An AI tool that helps freelancers automatically manage their invoices and follow up on late payments...",
      },
    },
    outputDisplay: "text" as const,
  },
  affiliate: {
    enabled: true,
    commissionPercent: 20,
    cookieDays: 30,
  },
};
