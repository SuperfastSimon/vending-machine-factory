'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Lock, Play, Cpu, History, Zap, Shield, ChevronRight, Loader2 } from 'lucide-react';

export default function CustomerDashboard() {
  const [products, setProducts] = useState([]);
  const [userTier, setUserTier] = useState('free');
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [prodRes, custRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('customers').select('subscription_tier').eq('id', user.id).single()
      ]);

      setProducts(prodRes.data || []);
      setUserTier(custRes.data?.subscription_tier || 'free');
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-purple-500 font-mono animate-pulse">FACTORY LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400">Vending Hall</h1>
          <p className="text-slate-500 text-sm">Selecteer een machine om een AI-proces te starten.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase">Plan:</span>
          <span className={`text-sm font-bold ${userTier === 'premium' ? 'text-purple-400' : 'text-slate-300'}`}>
            {userTier.toUpperCase()} VENDER
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div 
            key={product.id}
            onClick={() => setSelectedMachine(product)}
            className={`group relative p-6 rounded-2xl border transition-all cursor-pointer 
              ${product.is_premium && userTier === 'free' 
                ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                : 'bg-slate-900 border-slate-800 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]'}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 group-hover:border-purple-500/50 transition-colors">
                <Cpu className="w-6 h-6 text-purple-400" />
              </div>
              {product.is_premium && userTier === 'free' && <Lock className="w-5 h-5 text-slate-500" />}
            </div>
            <h3 className="text-xl font-bold mb-2">{product.name}</h3>
            <p className="text-slate-400 text-sm mb-6">{product.description}</p>
            <div className="flex items-center text-purple-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
              Activate Machine <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
