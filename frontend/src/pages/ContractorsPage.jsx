import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  Building, 
  Phone, 
  Mail, 
  Award, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  X
} from 'lucide-react';
import { contractorService, repairService } from '../services/api';

export default function ContractorsPage() {
  const [contractors, setContractors] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // New contractor form
  const [companyName, setCompanyName] = useState('');
  const [leadEngineer, setLeadEngineer] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ctr, rep] = await Promise.all([
        contractorService.list(),
        repairService.listRepairs()
      ]);
      setContractors(ctr);
      setRepairs(rep);
    } catch (err) {
      console.error('Error loading contractors:', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await contractorService.create({
        company_name: companyName,
        lead_engineer: leadEngineer,
        contact_email: email,
        phone,
        license_number: license
      });
      setModalOpen(false);
      setCompanyName('');
      setLeadEngineer('');
      setEmail('');
      setPhone('');
      setLicense('');
      loadData();
    } catch (err) {
      alert('Failed to register contractor: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#0a1226] border border-[#17284b] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HardHat className="w-5 h-5 text-[#00d4ff]" />
            <span>Contractor Accountability & Civil Performance Registry</span>
          </h2>
          <p className="text-xs text-slate-400">
            Monitor licensed construction agencies, active repair deadlines, quality compliance, and repeat defect occurrences.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white text-xs font-bold shadow-glow-cyan hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>Register Agency</span>
        </button>
      </div>

      {/* Contractor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {contractors.map((c) => (
          <div 
            key={c.id} 
            className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] hover:border-[#1d63ff]/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded">
                  {c.id}
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                  <Award className="w-4 h-4" />
                  <span>{c.rating || 4.5} / 5.0</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight mt-2">{c.company_name}</h3>
              <p className="text-xs text-slate-400">Chief Engineer: {c.lead_engineer}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">Lic: {c.license_number}</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-[#17284b]">
              <div className="p-2 rounded-xl bg-[#080f1d] border border-[#17284b]/60">
                <span className="text-[10px] text-slate-400 block">Active</span>
                <span className="font-bold text-white">{c.active_assignments ?? 1}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080f1d] border border-[#17284b]/60">
                <span className="text-[10px] text-slate-400 block">Completed</span>
                <span className="font-bold text-emerald-400">{c.completed_repairs ?? 0}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#080f1d] border border-[#17284b]/60">
                <span className="text-[10px] text-slate-400 block">On-Time</span>
                <span className="font-bold text-[#00d4ff]">{c.on_time_completion_rate || 90}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#17284b]/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-[11px]">{c.phone}</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                (c.repeat_damage_count || 0) > 2 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {c.repeat_damage_count || 0} Repeat Reports
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Work Orders Table */}
      <div className="p-5 rounded-2xl bg-[#0a1226] border border-[#17284b] space-y-4">
        <h3 className="text-sm font-bold text-white">Active Municipal Repair Work Orders</h3>

        <div className="rounded-xl overflow-hidden border border-[#17284b] bg-[#080f1d] text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#0d1830] text-slate-400 text-[11px] font-mono uppercase">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Road Corridor</th>
                <th className="p-3">Contractor Agency</th>
                <th className="p-3">Target Deadline</th>
                <th className="p-3">Estimated Budget</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17284b] text-slate-300">
              {repairs.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 font-mono font-bold text-[#00d4ff]">{r.id}</td>
                  <td className="p-3 font-semibold text-white">{r.road_name}</td>
                  <td className="p-3">{r.contractor_name || 'Shree Renuka Infra'}</td>
                  <td className="p-3 font-mono text-slate-300">{r.deadline_date || '2026-11-30'}</td>
                  <td className="p-3 font-mono text-white">₹{r.estimated_cost?.toLocaleString('en-IN') || '42,500'}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      r.status === 'Completed & Verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1226] border border-[#17284b] rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#17284b]">
              <h3 className="text-sm font-bold text-white">Register Civil Agency</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Company / Agency Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Lead Project Engineer</label>
                <input
                  type="text"
                  required
                  value={leadEngineer}
                  onChange={(e) => setLeadEngineer(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">PWD / Municipal License Number</label>
                <input
                  type="text"
                  required
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full bg-[#0d1830] border border-[#17284b] rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#17284b]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1d63ff] to-[#00d4ff] text-white font-bold"
                >
                  Register Agency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
