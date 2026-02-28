import { productConfig } from "@/config/product";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <h1 className="text-4xl font-bold text-center">{productConfig.name}</h1>
      <p className="mt-4 text-lg text-center">{productConfig.tagline}</p>
      <p className="mt-2 text-md text-center">{productConfig.description}</p>
    </div>
  );
}
