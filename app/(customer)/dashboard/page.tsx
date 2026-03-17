'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Play, Cpu, Zap, Shield, ChevronRight, Loader2, Sparkles, X, Terminal } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

// --- COMPONENT: VENDING MACHINE CARD ---
const VendingMachineCard = ({ product, userTier, onSelect }) => {
  const isLocked = product.is_premium && userTier === 'free';
  const iconMap = {
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
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          {iconMap[product.icon_type] || iconMap.cpu}
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-slate-600' : 'bg-emerald-500 animate-pulse'}`} />
          {isLocked ? 'Locked' : 'Ready'}
        </div>
      </div>
      <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        {product.name}
        {isLocked && <Lock className="w-4 h-4 text-slate-500" />}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2 mb-6">{product.description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${product.is_premium ? 'border-purple-500/30 text-purple-400' : 'border-slate-700 text-slate-500'}`}>
          {product.is_premium ? 'PREMIUM' : 'BASIC'}
        </span>
        {!isLocked && <div className="text-purple-400 text-sm font-bold flex items-center group-hover:translate-x-1 transition-transform">Start <ChevronRight className="w-4 h-4" /></div>}
      </div>
    </div>
  );
};

// --- COMPONENT: ACTION MODAL ---
const ActionModal = ({ product, onClose }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graphId: product.id, inputs: { prompt: input } }),
      });
      const data = await res.json();
      setOutput(data.output || JSON.stringify(data, null, 2));
    } catch (err) {
      setOutput('ERROR: Fabrieksonderbreking. Controleer verbinding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/20 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Terminal className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="font-bold text-white tracking-tight">{product.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Muntinworp (Input)</label>
            <textarea 
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 outline-none focus:border-purple-500/40 transition-all resize-none font-mono text-sm"
              placeholder="Wat wil je dat deze machine voor je doet?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          {output && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <label className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-2 block">Dispenser (Resultaat)</label>
              <div className="w-full bg-slate-950/50 border border-purple-500/20 rounded-xl p-4 text-slate-300 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                {output}
              </div>
            </div>
          )}
          <button 
            disabled={loading || !input}
            onClick={handleExecute}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 text-white font-black rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Play className="w-4 h-4 fill-current" /> ACTIVEER MACHINE</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => {
    async function init() {
      const { data: { user: aUser } } = await supabase.auth.getUser();
      if (!aUser) return window.location.href = '/auth';
      const [p, c] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('customers').select('subscription_tier').eq('id', aUser.id).single()
      ]);
      setProducts(p.data || []);
      setUser({ ...aUser, tier: c.data?.subscription_tier || 'free' });
      setLoading(false);
    }
    init();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-purple-500 animate-pulse uppercase tracking-[0.3em]">System Initializing...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-16 border-b border-slate-900 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic">VENDING<span className="text-purple-500">HALL</span></h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Factory Unit: {user?.id.slice(0,8)}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-4">
          <div className="px-4"><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Plan</p><p className="text-xs font-bold text-white uppercase">{user?.tier}</p></div>
          {user?.tier === 'free' && <button onClick={() => window.location.href='/pricing'} className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black px-4 py-2.5 rounded-xl transition-all">UPGRADE</button>}
        </div>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => <VendingMachineCard key={p.id} product={p} userTier={user?.tier} onSelect={setSelected} />)}
      </div>
      {selected && <ActionModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
