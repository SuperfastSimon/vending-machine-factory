'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Play, Cpu, History, Zap, Shield, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

// --- TYPES ---
type Product = {
  id: string;
  name: string;
  description: string;
  is_premium: boolean;
  config_json: any;
  icon_type: 'brain' | 'zap' | 'shield' | 'cpu';
};

type UserProfile = {
  id: string;
  subscription_tier: 'free' | 'premium';
};

// --- COMPONENTS ---

const VendingMachineCard = ({ 
  product, 
  userTier, 
  onSelect 
}: { 
  product: Product; 
  userTier: string; 
  onSelect: (p: Product) => void 
}) => {
  const isLocked = product.is_premium && userTier === 'free';
  
  const icons = {
    brain: <Sparkles className="w-6 h-6 text-purple-400" />,
    zap: <Zap className="w-6 h-6 text-cyan-400" />,
    shield: <Shield className="w-6 h-6 text-emerald-400" />,
    cpu: <Cpu className="w-6 h-6 text-blue-400" />
  };

  return (
    <div 
      onClick={() => !isLocked && onSelect(product)}
      className={`relative group p-6 rounded-2xl border transition-all duration-300 cursor-pointer
        ${isLocked 
          ? 'bg-slate-900/20 border-slate-800 grayscale opacity-75' 
          : 'bg-slate-900/40 border-slate-800 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1'
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${!isLocked && 'group-hover:border-purple-500/50 transition-colors'}`}>
          {icons[product.icon_type] || icons.cpu}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isLocked ? 'bg-slate-600' : 'bg-emerald-500'}`} />
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Online</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
        {product.name}
        {isLocked && <Lock className="w-4 h-4 text-slate-500" />}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-6">
        {product.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${product.is_premium ? 'border-purple-500/30 text-purple-400' : 'border-slate-700 text-slate-500'}`}>
          {product.is_premium ? 'PREMIUM' : 'BASIC'}
        </span>
        {!isLocked ? (
          <div className="flex items-center text-purple-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
            Start <ChevronRight className="w-4 h-4" />
          </div>
        ) : (
          <button className="text-[10px] font-bold text-slate-400 underline underline-offset-4 hover:text-white">
            Upgrade to unlock
          </button>
        )}
      </div>
    </div>
  );
};

const ActionModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        body: JSON.stringify({ graphId: product.id, inputs: { text: input } }),
      });
      const data = await res.json();
      setOutput(data.output || JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput('Error: Fabrieksonderbreking. Probeer het later opnieuw.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Play className="w-5 h-5 text-purple-400 fill-purple-400" />
            </div>
            <div>
              <h2 className="font-bold text-white leading-tight">{product.name}</h2>
              <p className="text-xs text-slate-500 uppercase tracking-tighter">Machine ID: {product.id.slice(0,8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-2xl">&times;</button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Muntinworp (Input)</label>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Voer je data of instructie in..."
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 outline-none focus:border-purple-500/50 transition-colors resize-none"
            />
          </div>

          {output && (
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <label className="text-xs font-bold text-purple-500 uppercase tracking-widest">Dispenser (Output)</label>
              <div className="w-full bg-slate-950 border border-purple-500/20 rounded-xl p-4 text-slate-300 font-mono text-sm whitespace-pre-wrap">
                {output}
              </div>
            </div>
          )}

          <button 
            onClick={handleExecute}
            disabled={loading || !input}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Play className="w-4 h-4 fill-white" /> Activeer Automaat</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

export default function CustomerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return window.location.href = '/auth';

      const [prodRes, custRes] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('customers').select('subscription_tier').eq('id', authUser.id).single()
      ]);

      setProducts(prodRes.data || []);
      setUser({ id: authUser.id, subscription_tier: custRes.data?.subscription_tier || 'free' });
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      <p className="text-slate-500 font-mono text-sm animate-pulse tracking-widest">FABRIEK OPSTARTEN...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
            Vending Hall
          </h1>
          <p className="text-slate-500 text-sm mt-1">Selecteer een machine om een AI-proces te starten.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
          <div className="px-4 py-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Huidig Plan</p>
            <p className={`text-sm font-black uppercase ${user?.subscription_tier === 'premium' ? 'text-purple-400' : 'text-slate-300'}`}>
              {user?.subscription_tier} Vender
            </p>
          </div>
          {user?.subscription_tier === 'free' && (
            <button 
              onClick={() => window.location.href = '/pricing'}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-600/20"
            >
              UPGRADE
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <VendingMachineCard 
              key={product.id} 
              product={product} 
              userTier={user?.subscription_tier || 'free'} 
              onSelect={setSelectedProduct}
            />
          ))}
          
          {/* Empty Slot Placeholder */}
          <div className="border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-12 text-slate-700">
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center mb-4">
              <Play className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">Nieuwe machine binnenkort...</p>
          </div>
        </div>
      </main>

      {selectedProduct && (
        <ActionModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}

      {/* Background Decorative Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full -z-10" />
    </div>
  );
}
