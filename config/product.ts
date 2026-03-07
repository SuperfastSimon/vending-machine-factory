export const productConfig = {
  name: "Vending Machine Factory",
  slug: "vending-machine-factory",
  tagline: "Build your AI-powered micro-SaaS products effortlessly.",
  description:
    "A powerful template for creating AI-driven micro-SaaS applications quickly and efficiently.",
  theme: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
  },

  // -------------------------------------------------------
  // AutoGPT Agent
  // Set libraryId + graphId to the agent you want to run.
  // API base URL is read from AUTOGPT_API_URL env var or
  // falls back to https://backend.agpt.co/external-api
  // -------------------------------------------------------
  agent: {
    libraryId: "", // ← pick from availableAgents below
    graphId: "",   // ← pick from availableAgents below
    inputSchema: {
      prompt: { type: "textarea", label: "Describe your request" },
    },
    outputDisplay: "markdown" as const, // "markdown" | "json" | "html"
  },

  pricing: {
    currency: "EUR",
    plans: [
      { id: "free",     name: "Free",     price: 0,  credits: 5,   features: ["Basic access"] },
      { id: "pro",      name: "Pro",      price: 19, credits: 100, features: ["Priority", "API access"] },
      { id: "business", name: "Business", price: 49, credits: 500, features: ["Everything", "White-label"] },
    ],
  },

  affiliate: {
    enabled: true,
    commissionPercent: 20,
    cookieDays: 30,
  },
};

// -------------------------------------------------------
// Available AutoGPT agents — copy IDs into agent above
// when forking for a specific product.
// -------------------------------------------------------
export const availableAgents = {
  "business-concept-studio": {
    libraryId: "6387fd67-6aea-4090-9cca-fed50f747cdc",
    graphId:   "cd0870a3-0a0f-425e-91cf-041b84548ef7",
  },
  "genesis-boss-agent": {
    libraryId: "d5f31b2a-d683-4748-a0e3-acbb9ffde653",
    graphId:   "63421075-a04d-458d-a845-082a44a8d522",
  },
  "code-writer": {
    libraryId: "a2627a06-0d4a-4d9b-bf61-ab428f05c04f",
    graphId:   "825855d2-1af3-4915-b26d-71bd65ac7c45",
  },
  "code-architect": {
    libraryId: "ecbd1bbb-7992-452d-8901-aeaa7205fa55",
    graphId:   "9d4cedb8-d047-4921-ac79-cf636e761b99",
  },
  "genesis-builder": {
    libraryId: "96c9f3ce-b970-4c50-bf2e-37d089d13422",
    graphId:   "af73c435-ab1d-4fed-beca-e8e5b9b5b95e",
  },
  "genesis-deployment": {
    libraryId: "56b3ad38-fa86-4757-978d-0671d984e513",
    graphId:   "da52be89-4c37-4c38-82ce-bc5018771846",
  },
  "genesis-protocol-maintainer": {
    libraryId: "d4488f6d-b2ec-43c3-b16f-2aaeecc577d6",
    graphId:   "c1fdd73c-644f-4234-94fd-f96f0a74ef6f",
  },
  "business-plan-generator": {
    libraryId: "5c4d8efe-5be4-4921-8b14-b30be5d42e6a",
    graphId:   "241fe3f4-0689-4249-83aa-de1f75706f73",
  },
  "image-classifier": {
    libraryId: "52e2cbca-feab-44ed-8a5c-cc8063842597",
    graphId:   "f24f0acc-f2a9-46b4-b5d4-36af3bf851cd",
  },
  "product-listing-generator": {
    libraryId: "fa4dc0f3-8307-4bb9-bf98-3f675afe37be",
    graphId:   "be06eaa8-a874-4e35-8f16-610e084ab4f4",
  },
  "procodepro": {
    libraryId: "ff17817d-0225-436b-9e81-364ff803d5ad",
    graphId:   "3b98e0e4-ba7e-4db2-b974-fc7f57ef4e71",
  },
  "procodepro-v2": {
    libraryId: "ff45e20c-f872-4cf8-a761-f8cc11a7cf53",
    graphId:   "7fff0519-beba-4a04-88f0-91a8fe768f40",
  },
  "procodepro-mini": {
    libraryId: "dff91533-4f76-434f-af65-743e3390f44f",
    graphId:   "8d9f07ed-be04-4c0f-b097-172371ff9cc9",
  },
  "wrapapppro": {
    libraryId: "aab46efc-6d19-4fcc-b025-3f269e3ebe3f",
    graphId:   "9c2c7c87-f466-41cd-b3ca-a7ecfe538ab0",
  },
  "code-quality-scanner": {
    libraryId: "73207433-983f-44f2-aa70-1d54bc7007b0",
    graphId:   "8063f37a-4887-4cfe-b60a-35298b470566",
  },
  "certificate-generator": {
    libraryId: "e5d3c12a-7996-48d2-9ec8-0c90ec828c0f",
    graphId:   "5cf92dfd-e631-442b-a4e2-91f36f9ef9fa",
  },
} as const;
