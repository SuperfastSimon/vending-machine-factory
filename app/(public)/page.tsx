import { productConfig } from "@/config/product";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="font-semibold text-gray-900">{productConfig.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/pricing"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Pricing
          </a>
          <a
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Login
          </a>
          <a
            href="/auth/register"
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get started free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Powered by AutoGPT
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight max-w-3xl">
          {productConfig.tagline}
        </h1>

        <p className="mt-5 text-lg text-gray-500 max-w-xl">
          {productConfig.description}
        </p>

        <div className="mt-8 flex items-center gap-3">
          <a
            href="/auth/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200"
          >
            Start for free →
          </a>
          <a
            href="/pricing"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium px-6 py-3"
          >
            See pricing
          </a>
        </div>

        {/* Social proof pill */}
        <p className="mt-6 text-xs text-gray-400">
          Free plan includes 5 credits · No credit card required
        </p>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          {[
            {
              icon: "⚡",
              title: "AI-powered output",
              desc: "Connected to AutoGPT agents that generate real, actionable results in seconds.",
            },
            {
              icon: "💳",
              title: "Credit-based usage",
              desc: "Pay only for what you use. Free plan included, upgrade anytime.",
            },
            {
              icon: "🚀",
              title: "Deploy in minutes",
              desc: "Fork, configure your agent, and go live. No backend complexity.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 border border-gray-100 rounded-xl p-5"
            >
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold text-gray-900 text-sm">{f.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {productConfig.name}
      </footer>
    </div>
  );
}
