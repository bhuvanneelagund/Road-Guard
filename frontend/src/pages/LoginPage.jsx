import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSelect = (roleName, demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    switchRole(roleName);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#060b13] flex items-center justify-center p-4 selection:bg-[#00d4ff]/30">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1d63ff] to-[#00d4ff] flex items-center justify-center shadow-glow-cyan mx-auto">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">
            ROADGUARD <span className="text-[#00d4ff]">AI</span>
          </h2>
          <p className="text-xs text-slate-400">Civil Infrastructure Intelligence Portal</p>
        </div>

        {/* Card */}
        <div className="p-7 rounded-2xl bg-[#0a1226] border border-[#17284b] shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-1">Sign In to Dashboard</h3>
          <p className="text-xs text-slate-400 mb-6">Enter your authorized administrative or citizen credentials</p>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@roadguard.ai"
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-[#17284b]">
            <p className="text-[11px] font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#00d4ff]" />
              1-Click Demo Profiles (For Evaluators)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoSelect('Administrator', 'admin@roadguard.ai', 'Admin@1234')}
                className="p-2 rounded-lg bg-[#0d1830] border border-[#17284b] hover:border-[#00d4ff]/40 text-slate-300 text-left"
              >
                <span className="font-bold text-[#00d4ff] block">Administrator</span>
                <span className="text-[10px] text-slate-500">Super User Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('Government Authority', 'authority@pwd.gov.in', 'Gov@1234')}
                className="p-2 rounded-lg bg-[#0d1830] border border-[#17284b] hover:border-[#00d4ff]/40 text-slate-300 text-left"
              >
                <span className="font-bold text-amber-400 block">Gov Authority</span>
                <span className="text-[10px] text-slate-500">PWD / DCC Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('Inspector', 'inspector@roadguard.ai', 'Inspector@1234')}
                className="p-2 rounded-lg bg-[#0d1830] border border-[#17284b] hover:border-[#00d4ff]/40 text-slate-300 text-left"
              >
                <span className="font-bold text-emerald-400 block">Inspector</span>
                <span className="text-[10px] text-slate-500">Field Verification</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('Citizen', 'citizen@gmail.com', 'Citizen@1234')}
                className="p-2 rounded-lg bg-[#0d1830] border border-[#17284b] hover:border-[#00d4ff]/40 text-slate-300 text-left"
              >
                <span className="font-bold text-purple-400 block">Citizen</span>
                <span className="text-[10px] text-slate-500">Public Reporting</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          New citizen or department user?{' '}
          <Link to="/register" className="text-[#00d4ff] hover:underline font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
