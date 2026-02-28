import { productConfig } from "@/config/product";

export default function Pricing() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Pricing Plans</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {productConfig.pricing.plans.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-4 shadow-lg">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-lg">{plan.price} {productConfig.pricing.currency}</p>
            <p className="mt-2">{plan.features.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
