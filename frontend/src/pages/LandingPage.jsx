import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ScanSearch, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Mic, 
  CheckCircle, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Database,
  Car,
  Compass,
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
  Activity,
  LogOut
} from 'lucide-react';
import MapView from '../components/MapView';
import { detectionService, roadService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, role, login, switchRole, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [detections, setDetections] = useState([]);
  const [roads, setRoads] = useState([]);
  const [liveUserGps, setLiveUserGps] = useState(null);

  // Login form state on landing page
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  const loginSectionRef = useRef(null);
  const mapSectionRef = useRef(null);

  useEffect(() => {
    // Load live telemetry data for landing page map
    Promise.all([
      detectionService.listDetections({ limit: 30 }),
      roadService.listRoads()
    ]).then(([dets, rds]) => {
      setDetections(dets);
      setRoads(rds);
    }).catch(err => {
      console.warn("Telemetry feed notice:", err);
    });
  }, []);

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setSubmittingLogin(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleQuickRoleLogin = (roleName, demoEmail, demoPass) => {
    switchRole(roleName);
    navigate('/dashboard');
  };

  const scrollToLogin = () => {
    loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMap = () => {
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#060b13] text-slate-100 selection:bg-[#00d4ff]/30">
      {/* Top Navbar */}
      <nav className="border-b border-[#17284b] bg-[#080f1d]/90 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1d63ff] to-[#00d4ff] flex items-center justify-center shadow-glow-cyan">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white flex items-center gap-1.5">
              ROADGUARD <span className="text-[#00d4ff]">AI</span>
            </span>
            <span className="block text-[9px] font-mono text-slate-400 tracking-wider">CIVIL INFRASTRUCTURE INTELLIGENCE</span>
          </div>
        </div>

        {/* Navigation items */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button onClick={scrollToMap} className="hover:text-[#00d4ff] transition-colors flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Live GPS Map</span>
          </button>
          <Link to="/detections" className="hover:text-[#00d4ff] transition-colors flex items-center gap-1.5">
            <ScanSearch className="w-3.5 h-3.5 text-[#1d63ff]" />
            <span>AI Detection</span>
          </Link>
          <Link to="/priority" className="hover:text-[#00d4ff] transition-colors">
            Priority Matrix
          </Link>
          <Link to="/citizen-report" className="hover:text-[#00d4ff] transition-colors">
            Citizen Voice
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 transition-all"
              >
                <span>Dashboard ({role})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={scrollToLogin}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={scrollToLogin}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-20 px-6 lg:px-12 max-w-6xl mx-auto text-center overflow-hidden">
        {/* Glowing backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#1d63ff]/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[200px] bg-[#00d4ff]/15 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1830] border border-[#00d4ff]/30 text-xs font-mono text-[#00d4ff] mb-6 shadow-glow-cyan">
          <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-ping"></span>
          <span>Next-Gen Indian Road Safety & Municipal Maintenance Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Detect Today. Predict Tomorrow. <br />
          <span className="bg-gradient-to-r from-[#00d4ff] via-[#1d63ff] to-cyan-300 bg-clip-text text-transparent">
            Protect Every Journey.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AI-powered road defect detection, geospatial GPS mapping, and municipal maintenance monitoring 
          for Indian road networks. Powered by YOLO computer vision, OpenStreetMap telemetry, 
          and multi-factor civil priority ranking.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={scrollToLogin}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white font-bold text-sm shadow-glow-cyan hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>Sign In & Access Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={scrollToMap}
            className="px-8 py-3.5 rounded-xl bg-[#0d1830] border border-[#17284b] hover:border-[#00d4ff]/40 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#00d4ff]" />
            <span>Enable Live GPS Map</span>
          </button>
        </div>
      </header>

      {/* CONNECTED INTERACTIVE GPS HAZARD MAP SECTION */}
      <section ref={mapSectionRef} className="py-14 px-6 lg:px-12 bg-[#080f1d] border-y border-[#17284b]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-wider block mb-1">
                GEOSPATIAL HAZARD TELEMETRY
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Live Connected Road Damage Map
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Real-time Geoapify & OpenStreetMap canvas plotting cataloged potholes, alligator cracking, and waterlogging across Bengaluru & Karnataka corridors. Enable GPS below to locate your current position.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/map"
                className="px-4 py-2 rounded-xl bg-[#0d1830] hover:bg-[#112247] border border-[#17284b] text-xs font-semibold text-[#00d4ff] flex items-center gap-1.5"
              >
                <span>Fullscreen Map & Telemetry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Connected Leaflet Map Container */}
          <div className="relative">
            <MapView
              items={detections}
              roads={roads}
              height="460px"
              onGpsLocated={(gps) => setLiveUserGps(gps)}
            />
          </div>

          {/* GPS Telemetry Bar */}
          <div className="p-4 rounded-xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00d4ff] animate-pulse" />
              <span className="text-slate-300 font-medium">
                {liveUserGps 
                  ? `Live GPS Acquired: ${liveUserGps.lat.toFixed(5)}, ${liveUserGps.lng.toFixed(5)} (Accuracy ±${liveUserGps.accuracy}m)` 
                  : "Click 'Enable Live GPS' on the map above to center on your real-time coordinates."}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/citizen-report"
                className="px-3.5 py-1.5 rounded-lg bg-[#1d63ff]/20 text-[#00d4ff] border border-[#1d63ff]/40 font-bold hover:bg-[#1d63ff]/30 transition-all flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Report Defect at this Location</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DEDICATED SIGN IN & QUICK ACCESS SECTION */}
      <section ref={loginSectionRef} className="py-16 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-wider block mb-1">
            AUTHORIZED SYSTEM ACCESS
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Sign In to RoadGuard AI</h2>
          <p className="text-xs text-slate-400 mt-2">
            Select your role for 1-click evaluation access, or authenticate with your registered credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 1-Click Role Login Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00d4ff]" />
              <span>Instant 1-Click Role Sign In (For Evaluators & Judges)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Administrator */}
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('Administrator', 'admin@roadguard.ai', 'Admin@1234')}
                className="p-4 rounded-xl bg-[#0a1226] border border-[#17284b] hover:border-[#00d4ff] text-left transition-all hover:scale-[1.02] shadow-glass group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#00d4ff] group-hover:underline">Administrator</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">SUPER USER</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Super Administrator</p>
                <p className="text-[11px] text-slate-400">System diagnostics, priority weights, user management</p>
                <span className="text-[10px] text-[#00d4ff] mt-2 block font-mono">Click to Sign In &rarr;</span>
              </button>

              {/* Government Authority */}
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('Government Authority', 'authority@pwd.gov.in', 'Gov@1234')}
                className="p-4 rounded-xl bg-[#0a1226] border border-[#17284b] hover:border-[#00d4ff] text-left transition-all hover:scale-[1.02] shadow-glass group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 group-hover:underline">Government Authority</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">PWD / DCC</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Executive Engineer (PWD)</p>
                <p className="text-[11px] text-slate-400">Budget estimation, contractor assignment, triage review</p>
                <span className="text-[10px] text-amber-400 mt-2 block font-mono">Click to Sign In &rarr;</span>
              </button>

              {/* Inspector */}
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('Inspector', 'inspector@roadguard.ai', 'Inspector@1234')}
                className="p-4 rounded-xl bg-[#0a1226] border border-[#17284b] hover:border-[#00d4ff] text-left transition-all hover:scale-[1.02] shadow-glass group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 group-hover:underline">Road Inspector</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">FIELD CHIEF</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Ramesh Kumar (Chief Inspector)</p>
                <p className="text-[11px] text-slate-400">Field surveys, CV comparison sign-off, repair verification</p>
                <span className="text-[10px] text-emerald-400 mt-2 block font-mono">Click to Sign In &rarr;</span>
              </button>

              {/* Citizen */}
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('Citizen', 'citizen@gmail.com', 'Citizen@1234')}
                className="p-4 rounded-xl bg-[#0a1226] border border-[#17284b] hover:border-[#00d4ff] text-left transition-all hover:scale-[1.02] shadow-glass group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400 group-hover:underline">Citizen Reporter</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">PUBLIC</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Ananya Sharma (Resident)</p>
                <p className="text-[11px] text-slate-400">Multilingual voice complaints, real-time ID tracking</p>
                <span className="text-[10px] text-purple-400 mt-2 block font-mono">Click to Sign In &rarr;</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080f1d] border border-[#17284b] text-[11px] text-slate-400">
              💡 <strong>Tip for Hackathon Evaluators:</strong> Clicking any of the 4 cards above automatically issues a valid JWT token, switches role permissions, and navigates straight into the executive platform.
            </div>
          </div>

          {/* Right Column: Direct Sign In Credentials Form (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0a1226] border border-[#17284b] shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Standard Credential Login</h3>
            <p className="text-xs text-slate-400 mb-5">Sign in with email and secure hashed password</p>

            {loginError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleInlineLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@roadguard.ai"
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingLogin}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <span>{submittingLogin ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#17284b] text-center text-xs text-slate-400">
              Need a new account?{' '}
              <Link to="/register" className="text-[#00d4ff] font-semibold hover:underline">
                Register Here
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#17284b] text-center text-xs text-slate-500 font-mono">
        <p>ROADGUARD AI • Intelligent Road Damage Detection, Prediction and Maintenance Platform</p>
        <p className="mt-1 text-[11px] text-slate-600">Built for National Innovation Hackathon 2026 • Designed for Indian Road Infrastructure</p>
      </footer>
    </div>
  );
}
