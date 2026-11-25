import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, Send, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { complaintService } from '../services/api';

const SUPPORTED_LANGUAGES = [
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', label: 'ಕನ್ನಡ' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)', label: 'हिन्दी' },
  { code: 'en-IN', name: 'English (Indian)', label: 'English' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)', label: 'తెలుగు' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)', label: 'தமிழ்' }
];

export default function VoiceReporterModal({ onClose, onSuccess }) {
  const [selectedLang, setSelectedLang] = useState('kn-IN');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [roadName, setRoadName] = useState('PB Road (Near Bapuji College)');
  const [damageType, setDamageType] = useState('Severe Pothole Cluster');
  const [citizenName, setCitizenName] = useState('Public Citizen Reporter');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

    recognition.onresult = (event) => {
      let fullText = '';
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript + ' ';
      }
      setTranscript(fullText.trim());
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLang]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = selectedLang;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleQuickDemoPrompt = (lang) => {
    const samplePrompts = {
      'kn-IN': 'ದಾವಣಗೆರೆ ಪಿಬಿ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ, ವಾಹನ ಸವಾರರಿಗೆ ತೀವ್ರ ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಕೂಡಲೇ ದುರಸ್ತಿ ಮಾಡಿ.',
      'hi-IN': 'दावणगेरे बस स्टैंड के पास सड़क पर बहुत गहरे गड्ढे हैं जिससे दुर्घटना का खतरा है। तत्काल मरम्मत करें।',
      'en-IN': 'Dangerous series of deep potholes on PB Road arterial causing severe motorcycle skidding risk near junction.',
      'te-IN': 'దావణగెరె మెయిన్ రోడ్డులో పెద్ద గుంతలు పడ్డాయి. వెంటనే మరమ్మతు చేయవలసిందిగా కోరుతున్నాము.',
      'ta-IN': 'சாலையில் பெரிய பள்ளங்கள் ஏற்பட்டுள்ளன, உடனடியாக சீரமைக்க நடவடிக்கை எடுக்கவும்.'
    };
    setTranscript(samplePrompts[lang] || samplePrompts['en-IN']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('citizen_name', citizenName);
      formData.append('road_name', roadName);
      formData.append('damage_type', damageType);
      formData.append('description', transcript);
      formData.append('language_used', SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name || selectedLang);
      formData.append('lat', '14.4644');
      formData.append('lng', '75.9218');

      const res = await complaintService.submitComplaint(formData);
      setSubmittedId(res.id);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      alert('Failed to submit complaint: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a1226] border border-[#1d63ff]/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-[#17284b] flex items-center justify-between bg-[#080f1d]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d63ff] to-[#00d4ff] flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Multilingual Voice Reporting</h3>
              <p className="text-xs text-slate-400">Speak in your mother tongue to log road hazards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Complaint Submitted Successfully!</h4>
            <p className="text-sm text-slate-300">
              Assigned Tracking ID: <span className="font-mono font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-1 rounded">{submittedId}</span>
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your voice report was transcribed, geo-tagged, and queued into the Smart Repair Priority triage stream.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#1d63ff] hover:bg-[#1d63ff]/80 text-white font-medium text-sm transition-all"
            >
              Close & View Tracking
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Language Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00d4ff]" />
                Select Indian Regional Language
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLang(lang.code);
                      handleQuickDemoPrompt(lang.code);
                    }}
                    className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      selectedLang === lang.code
                        ? 'bg-[#1d63ff]/20 text-[#00d4ff] border-[#00d4ff] shadow-glow-cyan'
                        : 'bg-[#0d1830] text-slate-400 border-[#17284b] hover:text-white'
                    }`}
                  >
                    <span className="block font-bold">{lang.label}</span>
                    <span className="text-[10px] opacity-75">{lang.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Recording Control */}
            <div className="p-4 rounded-xl bg-[#080f1d] border border-[#17284b] text-center space-y-3">
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_25px_rgba(225,29,72,0.6)]'
                      : 'bg-gradient-to-tr from-[#1d63ff] to-[#00d4ff] text-white hover:scale-105 shadow-glow-cyan'
                  }`}
                >
                  {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  {isRecording ? 'Listening... Speak clearly now' : 'Click microphone to record your voice'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {speechSupported
                    ? 'Browser speech recognition active with automatic punctuation.'
                    : 'Web Speech not supported in current browser; you can edit/type transcript below.'}
                </p>
              </div>

              {/* Quick sample prompt insert button */}
              <button
                type="button"
                onClick={() => handleQuickDemoPrompt(selectedLang)}
                className="inline-flex items-center gap-1.5 text-xs text-[#00d4ff] hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fill Sample Voice Transcript in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.name.split(' ')[0]}
              </button>
            </div>

            {/* Editable Transcript Field */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Review & Edit Speech Transcript (User Verification)
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                required
                placeholder="Spoken words will appear here. You can refine or edit before submission..."
                className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00d4ff]"
              />
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Road Location Name</label>
                <input
                  type="text"
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Damage Classification</label>
                <select
                  value={damageType}
                  onChange={(e) => setDamageType(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d4ff]"
                >
                  <option value="Severe Pothole Cluster">Severe Pothole Cluster</option>
                  <option value="Alligator Cracks">Alligator Cracks</option>
                  <option value="Longitudinal Rutting">Longitudinal Rutting</option>
                  <option value="Waterlogged Section">Waterlogged Section</option>
                  <option value="Edge Ravelling">Edge Ravelling</option>
                </select>
              </div>
            </div>

            {/* Offline disclaimer notice */}
            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-[#0d1830]/60 p-2 rounded-lg border border-[#17284b]/60">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Note: Indian regional language speech-to-text requires online browser speech capability.</span>
            </p>

            {/* Submit Action */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !transcript.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Registering Report...' : 'Confirm & Submit Complaint'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
