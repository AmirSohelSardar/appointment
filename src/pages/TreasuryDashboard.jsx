import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function TreasuryDashboard() {
  const { user, logout } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [selected, setSelected] = useState(null);
  const [payMonth, setPayMonth] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCandidates();
    loadPayslips();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await api.get("/candidates");
      const officeKey = user.office?.split(" ")[0].toLowerCase();
      const treasuryMapping = {
        'jadavpur': ['jadavpur'],
        'kolkata': ['calcutta', 'kolkata'],
        'kalyani': ['kalyani'],
        'coochbehar': ['coochbehar'],
        'jalpaiguri': ['jalpaiguri']
      };
      const searchKeys = treasuryMapping[officeKey] || [officeKey];
      const filtered = res.data.filter((c) => {
        const inst = (c.assignedInstitution || "").toLowerCase();
        const officeMatch = searchKeys.some(key => inst.includes(key));
        const statusMatch = ["verified_by_local", "sent_to_treasury", "paid"].includes(c.status);
        return officeMatch && statusMatch;
      });
      setCandidates(filtered);
    } catch (err) {
      console.error("Treasury candidates load error:", err);
      alert("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const loadPayslips = async () => {
    try {
      const res = await api.get("/payslips/treasury/all");
      setPayslips(res.data);
    } catch (err) {
      console.log("Payslip fetch error:", err);
    }
  };

  const makePayment = async () => {
    if (!selected) return alert("Select a candidate first!");
    if (!payMonth || !payAmount) return alert("Enter month & amount!");
    try {
      await api.post("/payslips/pay", {
        candidateId: selected._id,
        month: payMonth,
        amount: payAmount,
      });
      alert("✅ Payment Successful & Payslip Generated!");
      setSelected(null);
      setPayMonth("");
      setPayAmount("");
      loadCandidates();
      loadPayslips();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8">
      
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Treasury Department</h1>
            <div className="flex items-center gap-2 text-purple-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-semibold">{user?.office}</span>
            </div>
          </div>
          <button onClick={logout} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Pending Payments</p>
              <p className="text-4xl font-bold text-white">{candidates.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Completed Payments</p>
              <p className="text-4xl font-bold text-white">{payslips.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Total Amount</p>
              <p className="text-4xl font-bold text-white">₹{payslips.reduce((sum, slip) => sum + (slip.amount || 0), 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-white text-lg font-semibold">Loading candidates...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
            <div className="bg-blue-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Candidates to Process</h2>
              <p className="text-white/60 text-sm">{candidates.length} pending</p>
            </div>
          </div>

          {candidates.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-white/60 text-lg">No candidates available</p>
            </div>
          )}

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {candidates.map((c) => (
              <div key={c._id} className={`backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${selected?._id === c._id ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-400 shadow-lg shadow-purple-500/50" : "bg-white/5 border-white/10 hover:bg-white/10"}`} onClick={() => setSelected(c)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg mb-1">{c.name}</p>
                    <p className="text-sm text-blue-300 font-mono">{c.applicationId}</p>
                  </div>
                  {selected?._id === c._id && (
                    <svg className="w-6 h-6 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-emerald-300 font-semibold">₹{c.salaryScale?.toLocaleString('en-IN')}</span>
                  </div>
                  {c.bank?.accountNumber && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-white/70 text-sm font-mono">{c.bank.accountNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Process Payment</h2>
          </div>

          {!selected && (
            <div className="text-center py-16">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-lg font-medium">Select a candidate to begin</p>
              <p className="text-white/50 text-sm mt-2">Choose from the list on the left</p>
            </div>
          )}

          {selected && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-5 shadow-lg">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-xs mb-1">Selected Candidate</p>
                    <p className="text-xl font-bold text-white">{selected.name}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-white/20">
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Application ID</span>
                    <span className="text-blue-300 font-mono text-sm">{selected.applicationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Institution</span>
                    <span className="text-white text-sm font-medium">{selected.assignedInstitution}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/20">
                    <span className="text-white/60 text-sm">Salary Scale</span>
                    <span className="text-emerald-300 text-lg font-bold">₹{selected.salaryScale?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Status</span>
                    <span className="bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full text-xs font-semibold border border-purple-400/30">{selected.status.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Payment Month
                  </label>
                  <input type="month" className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm" value={payMonth} onChange={(e) => setPayMonth(e.target.value)} />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Payment Amount (₹)
                  </label>
                  <input type="number" className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm" placeholder="Enter payment amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button onClick={makePayment} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 rounded-xl shadow-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pay Now & Generate Payslip
                </button>
                <button onClick={() => { setSelected(null); setPayMonth(""); setPayAmount(""); }} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-all duration-200 border border-white/20">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
            <div className="bg-teal-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Payment History</h2>
              <p className="text-white/60 text-sm">{payslips.length} transactions</p>
            </div>
          </div>

          {payslips.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-white/60 text-lg">No payslips found</p>
            </div>
          )}

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {payslips.map((slip) => (
              <div key={slip._id} className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-xl p-4 shadow-lg hover:scale-[1.02] transition-all duration-200">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg">{slip.candidate?.name || "Unknown Candidate"}</p>
                    <p className="text-sm text-blue-300 font-mono">{slip.candidate?.applicationId}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Month</span>
                    <span className="text-white font-semibold">{slip.month}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Amount</span>
                    <span className="text-emerald-300 text-xl font-bold">₹{slip.amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-white/60 text-xs">Paid at</span>
                    <span className="text-white/80 text-xs">{new Date(slip.paidAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}