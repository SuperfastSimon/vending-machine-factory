'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Settings, Plus, Trash2, Edit3, BarChart3, Users, 
  Activity, DollarSign, Save, X, Cpu, Zap, Shield, Sparkles 
} from 'lucide-react';

export default function OwnerDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ users: 0, runs: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State voor nieuwe machine
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    is_premium: false,
    icon_type: 'cpu',
    config_json: { agent_id: '', version: '1.0' }
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadOwnerData() {
      const [prodRes, userCount, logCount] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('usage_logs').select('id', { count: 'exact', head: true })
      ]);

      setProducts(prodRes.data || []);
      setStats({
        users: userCount.count || 0,
        runs: logCount.count || 0,
        revenue: (userCount.count || 0) * 29 // Fictieve berekening voor de vibe
      });
      setLoading(false);
    }
    loadOwnerData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select();

    if (!error) {
      setProducts([data[0], ...products]);
      setIsAdding(false);
      setNewProduct({ name: '', description: '', is_premium: false, icon_type: 'cpu', config_json: { agent_id: '', version: '1.0' } });
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Machine demonteren? Dit kan niet ongedaan worden gemaakt.')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-emerald-500 animate-pulse tracking-[0.2em]">INITIALIZING CONTROL ROOM...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Top Stats Bar */}
        <header className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Factory <span className="text-emerald-500">Control</span></h1>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1">Beheer je AI-vloot en fabrieksprestaties</p>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Plus className="w-5 h-5" /> NIEUWE MACHINE
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl"><DollarSign className="text-emerald-500" /></div>
                <div><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Geschatte Omzet</p><p className="text-2xl font-black">${stats.revenue}</p></div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl"><Users className="text-blue-500" /></div>
                <div><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Actieve Klanten</p><p className="text-2xl font-black">{stats.users}</p></div>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl"><Activity className="text-purple-500" /></div>
                <div><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Totaal Machine Runs</p><p className="text-2xl font-black">{stats.runs}</p></div>
              </div>
            </div>
          </div>
        </header>

        {/* Machine Management Table */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Machine</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Config</th>
                <th className="px-8 py-4 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{product.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${product.is_premium ? 'border-purple-500/30 text-purple-400' : 'border-slate-700 text-slate-500'}`}>
                      {product.is_premium ? 'PREMIUM' : 'BASIC'}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono text-[10px] text-slate-500">
                    ID: {product.id.slice(0,8)}...
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Machine Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <form onSubmit={handleAddProduct} className="w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="font-bold text-white uppercase tracking-widest flex items-center gap-2"><Settings className="w-4 h-4 text-emerald-500" /> Machine Assemblage</h2>
              <button type="button" onClick={() => setIsAdding(false)}><X className="text-slate-500 hover:text-white" /></button>
            </div>
            <div className="p-8 space-y-4">
              <input 
                placeholder="Naam van de Automaat"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none focus:border-emerald-500/50"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
              <textarea 
                placeholder="Beschrijving voor de klant"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none focus:border-emerald-500/50 h-24"
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                required
              />
              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase">Premium Alleen?</span>
                <input 
                  type="checkbox" 
                  checked={newProduct.is_premium}
                  onChange={e => setNewProduct({...newProduct, is_premium: e.target.checked})}
                  className="w-5 h-5 accent-emerald-500"
                />
              </div>
              <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-900/20">
                MACHINE TOEVOEGEN AAN VENDING HALL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
