'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) setMessage(error.message);
    else setMessage(type === 'login' ? 'Inloggen...' : 'Check je e-mail!');
    setLoading(false);
    if (!error && type === 'login') window.location.href = '/dashboard';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-900">
        <h2 className="text-2xl font-bold mb-6 text-center">Welkom terug</h2>
        <input 
          type="email" placeholder="Email" 
          className="w-full p-3 mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Wachtwoord" 
          className="w-full p-3 mb-6 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-4">
          <button 
            onClick={() => handleAuth('login')} disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            Log in
          </button>
          <button 
            onClick={() => handleAuth('signup')} disabled={loading}
            className="flex-1 border border-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            Sign up
          </button>
        </div>
        {message && <p className="mt-4 text-center text-sm font-medium text-slate-600">{message}</p>}
      </div>
    </div>
  );
}
