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
import FeatureCard3D from '../components/FeatureCard3D';
import { detectionService, roadService, dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FEATURE_CARDS = [
  {
    title: 'AI ROAD DAMAGE DETECTION',
    description: 'Futuristic computer-vision scanning for potholes, alligator cracks, and surface wear.',
    icon: ScanSearch,
    to: '/detections',
  },
  {
    title: 'LIVE GPS MAPPING',
    description: 'Interactive Geoapify & OpenStreetMap telemetry with glowing orange hazard markers.',
    icon: MapPin,
    to: '/map',
  },
  {
    title: 'ROAD HEALTH PASSPORT',
    description: 'Digital structural health scorecards (0–100) for every monitored road corridor.',
    icon: FileCheck2,
    to: '/roads',
  },
  {
    title: 'PREDICTIVE MAINTENANCE',
    description: 'Degradation velocity analytics forecasting critical road failures before they happen.',
    icon: TrendingUp,
    to: '/prediction',
  },
  {
    title: 'SMART REPAIR PRIORITY',
    description: 'Multi-factor civil ranking engine weighting traffic, schools, hospitals, and flood risk.',
    icon: Layers,
    to: '/priority',
  },
  {
    title: 'CITIZEN VOICE REPORTING',
    description: 'Multilingual holographic voice & GPS reporting in 5 Indian languages.',
    icon: Mic,
    to: '/citizen-report',
  },
];

export default function LandingPage() {
  const { role, login, switchRole, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [detections, setDetections] = useState([]);
  const [roads, setRoads] = useState([]);
  const [stats, setStats] = useState(null);
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
      dashboardService.getStats(),
    ])
      .then(([dets, rds, st]) => {
        setDetections(dets);
        setRoads(rds);
        setStats(st);
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
    <div className="min-h-screen bg-[#08090D] text-[#F5F2EF] selection:bg-[#FF572E]/30 relative overflow-hidden">
      {/* Cinematic Orange Ambient Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-[#FF572E]/12 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] bg-[#FFAA55]/10 rounded-full blur-[160px]" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-3 z-50 px-4 sm:px-8 lg:px-12">
        <nav className="max-w-7xl mx-auto rounded-2xl glass-orange px-5 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF572E] to-[#FFAA55] flex items-center justify-center shadow-glow-orange">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-[#F5F2EF] flex items-center gap-1">
                ROADGUARD <span className="text-[#FF572E]">AI</span>
              </span>
              <span className="block text-[9px] font-mono text-[#B8B2B0] tracking-wider">
                INFRASTRUCTURE INTELLIGENCE
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#B8B2B0]">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[#F5F2EF] border-b-2 border-[#FF572E] pb-0.5">
              Home
            </button>
            <button onClick={scrollToMap} className="hover:text-[#FFAA55] transition-colors flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FF713D]" />
              <span>Live GPS Map</span>
            </button>
            <Link to="/detections" className="hover:text-[#FFAA55] transition-colors flex items-center gap-1.5">
              <ScanSearch className="w-3.5 h-3.5 text-[#FF713D]" />
              <span>AI Detection</span>
            </Link>
            <Link to="/priority" className="hover:text-[#FFAA55] transition-colors">
              Priority Matrix
            </Link>
            <Link to="/citizen-report" className="hover:text-[#FFAA55] transition-colors">
              Citizen Voice
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF572E] to-[#FF713D] text-white text-xs font-bold shadow-glow-orange hover:opacity-95 transition-all"
                >
                  <span>Dashboard ({role})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-[#B8B2B0] hover:text-[#FF572E] rounded-xl hover:bg-[#15131A] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={scrollToLogin}
                  className="text-xs font-semibold text-[#B8B2B0] hover:text-[#F5F2EF] px-3 py-2 transition-colors"
                >
                  Login
                </button>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF572E] to-[#FF713D] text-white text-xs font-bold shadow-glow-orange hover:opacity-95 transition-all"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* HERO SECTION — TWO-PART 3D EXPERIENCE */}
      <header className="relative z-10 pt-10 pb-14 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT SIDE */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-orange text-[11px] font-mono text-[#FFAA55] shadow-glow-orange">
              <Sparkles className="w-3.5 h-3.5 text-[#FF572E] animate-pulse" />
              <span>NEXT-GEN ROAD SAFETY INTELLIGENCE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08]">
              <span className="block text-[#F5F2EF]">DETECT TODAY.</span>
              <span className="block text-[#F5F2EF]">PREDICT TOMORROW.</span>
              <span className="block bg-gradient-to-r from-[#FF572E] via-[#FF713D] to-[#FFAA55] bg-clip-text text-transparent">
                PROTECT EVERY JOURNEY.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#B8B2B0] max-w-xl leading-relaxed">
              An intelligent road safety ecosystem powered by computer vision, GPS intelligence and predictive infrastructure analytics.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToFeatures}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#FF572E] to-[#FF713D] text-white font-bold text-sm shadow-glow-orange hover:scale-[1.03] transition-all flex items-center gap-2"
              >
                <span>EXPLORE PLATFORM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/dashboard"
                className="px-7 py-3.5 rounded-xl glass-orange text-[#F5F2EF] font-bold text-sm hover:border-[#FFAA55] transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#FF713D]" />
                <span>LAUNCH DASHBOARD</span>
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE — CENTRAL 3D GLASS SPHERE + FLOATING HOLOGRAPHIC PANELS */}
          <div className="lg:col-span-6">
            <HeroScene3D stats={stats} liveGps={liveUserGps} />
          </div>
        </div>
      </header>

      {/* SIX 3D FEATURE CARDS */}
      <section ref={featuresSectionRef} className="relative z-10 py-14 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-[#FFAA55] uppercase tracking-wider">
            PLATFORM ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F2EF] mt-1">
            Six 3D Intelligence Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_CARDS.map((card) => (
            <FeatureCard3D key={card.title} {...card} />
          ))}
        </div>
      </section>

      {/* CONNECTED LIVE GPS MAP */}
      <section ref={mapSectionRef} className="relative z-10 py-14 px-6 lg:px-12 bg-[#15131A]/75 border-y border-[#FF713D]/25">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#FFAA55] uppercase tracking-wider block mb-1">
                GEOSPATIAL HAZARD TELEMETRY
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F2EF] tracking-tight">
                Live Connected Road Damage Map
              </h2>
              <p className="text-xs text-[#B8B2B0] mt-1 max-w-xl">
                Real-time Geoapify & OpenStreetMap canvas plotting AI-detected road damage from uploaded videos & images alongside your live GPS.
              </p>
            </div>

            <Link
              to="/map"
              className="px-4 py-2 rounded-xl glass-orange text-xs font-semibold text-[#FFAA55] flex items-center gap-1.5"
            >
              <span>Fullscreen Map & Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MapView
            items={detections}
            roads={roads}
            height="460px"
            onGpsLocated={(gps) => setLiveUserGps(gps)}
          />

          <div className="p-4 rounded-xl glass-orange flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF713D] animate-pulse" />
              <span className="text-[#F5F2EF] font-medium">
                {liveUserGps
                  ? `Live GPS Acquired: ${liveUserGps.lat.toFixed(5)}, ${liveUserGps.lng.toFixed(5)} (Accuracy ±${liveUserGps.accuracy}m)`
                  : "Click 'Enable Live GPS' on the map above to center on your real-time coordinates."}
              </span>
            </div>

            <Link
              to="/detections"
              className="px-3.5 py-1.5 rounded-lg bg-[#FF572E]/20 text-[#FFAA55] border border-[#FF713D]/50 font-bold hover:bg-[#FF572E]/30 transition-all flex items-center gap-1.5"
            >
              <ScanSearch className="w-3.5 h-3.5" />
              <span>Run AI Video/Image Scan</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SIGN IN & QUICK ACCESS */}
      <section ref={loginSectionRef} className="relative z-10 py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold text-[#FFAA55] uppercase tracking-wider block mb-1">
            AUTHORIZED SYSTEM ACCESS
          </span>
          <h2 className="text-3xl font-extrabold text-[#F5F2EF] tracking-tight">Sign In to RoadGuard AI</h2>
          <p className="text-xs text-[#B8B2B0] mt-2">
            Select your role for 1-click evaluation access, or authenticate with your registered credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-[#F5F2EF] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#FF713D]" />
              <span>Instant 1-Click Role Sign In</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { role: 'Administrator', tag: 'SUPER USER', name: 'Super Administrator', desc: 'System diagnostics, priority weights, user management' },
                { role: 'Government Authority', tag: 'PWD / BBMP', name: 'Executive Engineer (PWD)', desc: 'Budget estimation, contractor assignment, triage review' },
                { role: 'Inspector', tag: 'FIELD CHIEF', name: 'Ramesh Kumar (Chief Inspector)', desc: 'Field surveys, CV comparison sign-off, repair verification' },
                { role: 'Citizen', tag: 'PUBLIC', name: 'Ananya Sharma (Resident)', desc: 'Multilingual voice complaints, real-time ID tracking' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickRoleLogin(item.role)}
                  className="p-4 rounded-xl glass-orange text-left transition-all hover:scale-[1.02] group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#FFAA55] group-hover:underline">{item.role}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF572E]/20 text-[#FF713D]">{item.tag}</span>
                  </div>
                  <p className="text-xs text-[#F5F2EF] font-semibold">{item.name}</p>
                  <p className="text-[11px] text-[#B8B2B0]">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl glass-orange shadow-2xl">
            <h3 className="text-base font-bold text-[#F5F2EF] mb-1">Standard Credential Login</h3>
            <p className="text-xs text-[#B8B2B0] mb-5">Sign in with email and secure hashed password</p>

            {loginError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleInlineLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#F5F2EF] block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#B8B2B0] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@roadguard.ai"
                    className="w-full bg-[#15131A] border border-[#FF713D]/35 rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F2EF] placeholder-[#B8B2B0]/60 focus:outline-none focus:border-[#FF572E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#F5F2EF] block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#B8B2B0] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#15131A] border border-[#FF713D]/35 rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F2EF] placeholder-[#B8B2B0]/60 focus:outline-none focus:border-[#FF572E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingLogin}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#FF572E] to-[#FF713D] text-white text-xs font-bold shadow-glow-orange hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <span>{submittingLogin ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#FF713D]/25 text-center text-xs text-[#B8B2B0]">
              Need a new account?{' '}
              <Link to="/register" className="text-[#FFAA55] font-semibold hover:underline">
                Register Here
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-8 px-6 border-t border-[#FF713D]/25 text-center text-xs text-[#B8B2B0] font-mono">
        <p>ROADGUARD AI • Intelligent Road Damage Detection, Prediction and Maintenance Platform</p>
        <p className="mt-1 text-[11px] text-[#B8B2B0]/70">Built for National Innovation Hackathon 2026 • Designed for Indian Road Infrastructure</p>
      </footer>
    </div>
  );
}
