'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { History, Clock, ChevronRight, Search, FileText, ExternalLink, Loader2 } from 'lucide-react';

export default function UsageHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchLogs() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('usage_logs')
        .select(`
          id,
          created_at,
          status,
          input_text,
          output_text,
          products ( name )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.input_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-cyan-500 animate-pulse tracking-[0.2em]">ACCESSING ARCHIVES...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Area */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-slate-900 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <History className="w-6 h-6 text-cyan-400" />
              <h1 className="text-3xl font-black tracking-tight uppercase">Output <span className="text-cyan-500">History</span></h1>
            </div>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Overzicht van alle gegenereerde factory-outputs</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Zoek in logs..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Logs List */}
        <div className="space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="group bg-slate-900/30 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{log.products?.name || 'Onbekende Machine'}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleDateString()}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{log.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => alert(log.output_text)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      View Output <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Preview of input */}
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                  <p className="text-xs text-slate-500 italic line-clamp-1">
                    " {log.input_text} "
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-900 rounded-3xl">
              <p className="text-slate-600 font-mono text-sm tracking-widest uppercase">Geen logs gevonden in de database.</p>
            </div>
          )}
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-cyan-900/5 blur-[150px] -z-10 pointer-events-none" />
    </div>
  );
}
