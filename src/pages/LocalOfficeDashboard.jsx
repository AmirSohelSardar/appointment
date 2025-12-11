import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function LocalOfficeDashboard() {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState([]);
  const [verified, setVerified] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // -----------------------------
  // Load Candidates
  // -----------------------------
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const res = await api.get("/candidates/local/office");
      const list = res.data;

      setPending(list.filter(c => c.status === "created" || c.status === "sent_to_local"));
      setVerified(list.filter(c =>
        c.status === "verified_by_local" ||
        c.status === "sent_to_treasury" ||
        c.status === "paid"
      ));
    } catch (err) {
      alert("Failed to load candidates.");
      console.log(err);
    }
  };

  // -----------------------------
  // Selecting a Candidate
  // -----------------------------
  const selectCandidate = (cand) => {
    setSelected({ ...cand });
    setIsEditing(false);
  };

  // -----------------------------
  // Save Edited Bank + Salary
  // -----------------------------
  const saveChanges = async () => {
    try {
      await api.put(`/candidates/verify/${selected._id}`, {
        bank: selected.bank,
        salaryScale: selected.salaryScale,
      });

      alert("Verified successfully!");
      loadCandidates();
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update.");
    }
  };

  // -----------------------------
  // Send to Treasury
  // -----------------------------
  const sendToTreasury = async () => {
    if (!window.confirm("Are you sure you want to send this candidate to Treasury?")) return;

    try {
      await api.put(`/candidates/sendtotreasury/${selected._id}`);
      alert("Sent to Treasury");
      loadCandidates();
      setSelected(null);
    } catch (err) {
      alert("Failed to send");
    }
  };

  // -----------------------------
  // UI Rendering
  // -----------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 md:p-8">
      
      {/* HEADER */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Local Office Portal
            </h1>
            <div className="flex items-center gap-2 text-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-lg font-semibold">{user?.office}</span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">Pending Review</p>
              <p className="text-4xl font-bold text-white">{pending.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Verified & Processed</p>
              <p className="text-4xl font-bold text-white">{verified.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* THREE COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ------------------- PENDING ------------------- */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
            <div className="bg-amber-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Pending Candidates</h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {pending.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-white/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-white/60">No pending candidates</p>
              </div>
            )}

            {pending.map((c) => (
              <div
                key={c._id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
                onClick={() => selectCandidate(c)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-white text-lg mb-1">{c.name}</p>
                    <p className="text-sm text-blue-300 font-mono">{c.applicationId}</p>
                  </div>
                  <svg className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------- VERIFIED ------------------- */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Verified & Processed</h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {verified.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-white/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-white/60">No verified candidates yet</p>
              </div>
            )}

            {verified.map((c) => (
              <div
                key={c._id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
                onClick={() => selectCandidate(c)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-white text-lg mb-1">{c.name}</p>
                    <p className="text-sm text-blue-300 font-mono mb-2">{c.applicationId}</p>
                    <span className="inline-block bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30">
                      {c.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ------------------- DETAILS PANEL ------------------- */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 h-fit">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
            <div className="bg-blue-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Candidate Details</h2>
          </div>

          {!selected && (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-white/60 text-lg">Select a candidate to view details</p>
            </div>
          )}

          {selected && (
            <div className="space-y-5">
              {/* PERSONAL INFO */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Full Name</p>
                    <p className="text-white font-semibold">{selected.name}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Application ID</p>
                    <p className="text-blue-300 font-mono text-sm">{selected.applicationId}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Job Post</p>
                    <p className="text-white font-semibold">{selected.jobPost}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">Phone</p>
                    <p className="text-white font-semibold">{selected.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/60 text-sm mb-1">Address</p>
                    <p className="text-white">{selected.address}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/60 text-sm mb-1">Qualification</p>
                    <p className="text-white">{selected.qualification}</p>
                  </div>
                </div>
              </div>

              {/* BANK & SALARY */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h3 className="text-lg font-bold text-white">Banking & Salary Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">Account Number</label>
                    <input
                      className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isEditing}
                      value={selected.bank?.accountNumber || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          bank: { ...selected.bank, accountNumber: e.target.value },
                        })
                      }
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">IFSC Code</label>
                    <input
                      className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isEditing}
                      value={selected.bank?.ifsc || ""}
                      onChange={(e) =>
                        setSelected({
                          ...selected,
                          bank: { ...selected.bank, ifsc: e.target.value },
                        })
                      }
                      placeholder="Enter IFSC code"
                    />
                  </div>

                  <div>
                    <label className="text-white/80 text-sm font-medium block mb-2">Salary Scale (₹)</label>
                    <input
                      type="number"
                      className="w-full bg-white/10 border border-white/20 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isEditing}
                      value={selected.salaryScale}
                      onChange={(e) =>
                        setSelected({ ...selected, salaryScale: e.target.value })
                      }
                      placeholder="Enter salary amount"
                    />
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="mt-6 space-y-3">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Information
                      </button>

                      <button
                        onClick={saveChanges}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verify Candidate
                      </button>

                      <button
                        onClick={sendToTreasury}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send to Treasury
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={saveChanges}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save
                      </button>

                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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