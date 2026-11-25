import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ScanSearch,
  MapPin,
  TrendingUp,
  Mic,
  ArrowRight,
  Compass,
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
  Activity,
  LogOut,
  FileCheck2,
  Layers,
  Sparkles,
} from 'lucide-react';
import MapView from '../components/MapView';
import HeroScene3D from '../components/HeroScene3D';
import TiltCard3D from '../components/TiltCard3D';
import { detectionService, roadService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FEATURE_CARDS = [
  {
    title: 'AI Road Damage Detection',
    desc: 'Automated YOLOv8 & OpenCV scanning for potholes, alligator cracks, and surface wear from images and dashcam video.',
    icon: ScanSearch,
    to: '/detections',
    accent: 'text-[#00d4ff]',
  },
  {
    title: 'Live GPS Mapping',
    desc: 'Interactive Geoapify & OpenStreetMap telemetry pinning real-time browser GPS and AI-detected road hazards.',
    icon: MapPin,
    to: '/map',
    accent: 'text-[#1d63ff]',
  },
  {
    title: 'Road Health Passport',
    desc: 'Digital 0–100 structural health scorecards for every highway and arterial corridor with historical scan logs.',
    icon: FileCheck2,
    to: '/roads',
    accent: 'text-emerald-400',
  },
  {
    title: 'Predictive Maintenance',
    desc: 'Degradation velocity modeling with monsoon impact factors to forecast critical road failures before they happen.',
    icon: TrendingUp,
    to: '/prediction',
    accent: 'text-violet-400',
  },
  {
    title: 'Smart Repair Priority',
    desc: 'Multi-factor civil ranking engine weighting traffic density, schools, hospitals, and flood-prone zones.',
    icon: Layers,
    to: '/priority',
    accent: 'text-amber-400',
  },
  {
    title: 'Citizen Reporting',
    desc: 'Multilingual voice & GPS reporting in Kannada, Hindi, English, Telugu, and Tamil with live tracking.',
    icon: Mic,
    to: '/citizen-report',
    accent: 'text-rose-400',
  },
];

export default function LandingPage() {
  const { role, login, switchRole, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [detections, setDetections] = useState([]);
  const [roads, setRoads] = useState([]);
  const [liveUserGps, setLiveUserGps] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  const loginSectionRef = useRef(null);
  const mapSectionRef = useRef(null);
  const featuresSectionRef = useRef(null);

  useEffect(() => {
    Promise.all([
      detectionService.listDetections({ limit: 30 }),
      roadService.listRoads(),
    ])
      .then(([dets, rds]) => {
        setDetections(dets);
        setRoads(rds);
      })
      .catch((err) => {
        console.warn('Telemetry feed notice:', err);
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
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setLoginError(detail.map((d) => d.msg || JSON.stringify(d)).join(', '));
      } else if (typeof detail === 'string') {
        setLoginError(detail);
      } else {
        setLoginError(err.message || 'Invalid email or password.');
      }
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleQuickRoleLogin = (roleName) => {
    switchRole(roleName);
    navigate('/dashboard');
  };

  const scrollToLogin = () => loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToMap = () => mapSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToFeatures = () => featuresSectionRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 selection:bg-[#00d4ff]/30 relative overflow-hidden">
      {/* Subtle Background Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-[#1d63ff]/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] bg-[#00d4ff]/10 rounded-full blur-[150px]" />
      </div>

      {/* Modern Floating Glass Navigation Bar */}
      <div className="sticky top-3 z-50 px-4 sm:px-8 lg:px-12">
        <nav className="max-w-7xl mx-auto rounded-2xl glass-3d border border-[#00d4ff]/20 px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1d63ff] to-[#00d4ff] flex items-center justify-center shadow-glow-cyan">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white flex items-center gap-1">
                ROADGUARD <span className="text-[#00d4ff]">AI</span>
              </span>
              <span className="block text-[9px] font-mono text-slate-400 tracking-wider">
                3D INFRASTRUCTURE INTELLIGENCE
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#00d4ff] transition-colors">
              Home
            </button>
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
            <Link to="/dashboard" className="hover:text-[#00d4ff] transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 transition-all"
                >
                  <span>Dashboard ({role})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800/70 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={scrollToLogin}
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={scrollToLogin}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 transition-all"
                >
                  <span>Launch Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* HERO SECTION — 3D EXPERIENCE */}
      <header className="relative z-10 pt-10 pb-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Side */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-3d border border-[#00d4ff]/35 text-[11px] font-mono text-[#00d4ff] shadow-glow-cyan">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>NEXT-GEN ROAD SAFETY INTELLIGENCE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-white">
              <span className="block">DETECT TODAY.</span>
              <span className="block bg-gradient-to-r from-[#00d4ff] via-[#1d63ff] to-violet-400 bg-clip-text text-transparent">
                PREDICT TOMORROW.
              </span>
              <span className="block text-slate-100">PROTECT EVERY JOURNEY.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              An AI-powered 3D road infrastructure intelligence platform built for Indian roads. Detect potholes and cracks from video & imagery, map live GPS hazards, and prioritize repairs with predictive analytics.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToFeatures}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white font-bold text-sm shadow-glow-cyan hover:scale-[1.03] transition-all flex items-center gap-2"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/dashboard"
                className="px-7 py-3.5 rounded-xl glass-3d border border-[#00d4ff]/30 hover:border-[#00d4ff]/70 text-slate-100 font-bold text-sm transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#00d4ff]" />
                <span>Launch Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Right Side — Interactive 3D Road & AI Scanner Scene */}
          <div className="lg:col-span-6">
            <HeroScene3D />
          </div>
        </div>
      </header>

      {/* 3D FLOATING FEATURE CARDS */}
      <section ref={featuresSectionRef} className="relative z-10 py-14 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-wider">
            PLATFORM CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Six Intelligent Modules in One Command Center
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.to} className="block group">
                <TiltCard3D className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#0d1830] border border-[#00d4ff]/25 flex items-center justify-center mb-4 group-hover:shadow-glow-cyan transition-all">
                      <Icon className={`w-5 h-5 ${card.accent}`} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#17284b]/70 flex items-center justify-between text-xs font-semibold text-[#00d4ff]">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </TiltCard3D>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CONNECTED INTERACTIVE GPS HAZARD MAP SECTION */}
      <section ref={mapSectionRef} className="relative z-10 py-14 px-6 lg:px-12 bg-[#070b14]/80 border-y border-[#17284b]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-wider block mb-1">
                GEOSPATIAL HAZARD TELEMETRY
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Live Connected Road Damage Map
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Real-time Geoapify & OpenStreetMap canvas plotting AI-detected road damage from uploaded videos & images alongside your live GPS.
              </p>
            </div>

            <Link
              to="/map"
              className="px-4 py-2 rounded-xl glass-3d border border-[#00d4ff]/30 text-xs font-semibold text-[#00d4ff] flex items-center gap-1.5"
            >
              <span>Fullscreen Map & Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative">
            <MapView
              items={detections}
              roads={roads}
              height="460px"
              onGpsLocated={(gps) => setLiveUserGps(gps)}
            />
          </div>

          <div className="p-4 rounded-xl glass-3d flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00d4ff] animate-pulse" />
              <span className="text-slate-300 font-medium">
                {liveUserGps
                  ? `Live GPS Acquired: ${liveUserGps.lat.toFixed(5)}, ${liveUserGps.lng.toFixed(5)} (Accuracy ±${liveUserGps.accuracy}m)`
                  : "Click 'Enable Live GPS' on the map above to center on your real-time coordinates."}
              </span>
            </div>

            <Link
              to="/detections"
              className="px-3.5 py-1.5 rounded-lg bg-[#1d63ff]/20 text-[#00d4ff] border border-[#1d63ff]/40 font-bold hover:bg-[#1d63ff]/30 transition-all flex items-center gap-1.5"
            >
              <ScanSearch className="w-3.5 h-3.5" />
              <span>Run AI Video/Image Scan</span>
            </Link>
          </div>
        </div>
      </section>

      {/* DEDICATED SIGN IN & QUICK ACCESS SECTION */}
      <section ref={loginSectionRef} className="relative z-10 py-16 px-6 lg:px-12 max-w-7xl mx-auto">
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
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00d4ff]" />
              <span>Instant 1-Click Role Sign In</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleQuickRoleLogin('Administrator')}
                className="p-4 rounded-xl glass-3d text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#00d4ff] group-hover:underline">Administrator</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">SUPER USER</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Super Administrator</p>
                <p className="text-[11px] text-slate-400">System diagnostics, priority weights, user management</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin('Government Authority')}
                className="p-4 rounded-xl glass-3d text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 group-hover:underline">Government Authority</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">PWD / BBMP</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Executive Engineer (PWD)</p>
                <p className="text-[11px] text-slate-400">Budget estimation, contractor assignment, triage review</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin('Inspector')}
                className="p-4 rounded-xl glass-3d text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 group-hover:underline">Road Inspector</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">FIELD CHIEF</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Ramesh Kumar (Chief Inspector)</p>
                <p className="text-[11px] text-slate-400">Field surveys, CV comparison sign-off, repair verification</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleLogin('Citizen')}
                className="p-4 rounded-xl glass-3d text-left transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400 group-hover:underline">Citizen Reporter</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">PUBLIC</span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Ananya Sharma (Resident)</p>
                <p className="text-[11px] text-slate-400">Multilingual voice complaints, real-time ID tracking</p>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl glass-3d shadow-2xl">
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

      <footer className="relative z-10 py-8 px-6 border-t border-[#17284b] text-center text-xs text-slate-500 font-mono">
        <p>ROADGUARD AI • Intelligent Road Damage Detection, Prediction and Maintenance Platform</p>
        <p className="mt-1 text-[11px] text-slate-600">Built for National Innovation Hackathon 2026 • Designed for Indian Road Infrastructure</p>
      </footer>
    </div>
  );
}
