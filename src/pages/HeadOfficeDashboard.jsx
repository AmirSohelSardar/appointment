import React, { useState, useEffect } from "react";
import api from "../api/api";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useAuth } from "../context/AuthContext";
import IndiaLogo from "../assets/india_logo.png";
import SignatureImg from "../assets/signature.png";

export default function HeadOfficeDashboard() {
  const institutions = [
    "Jadavpur University",
    "Calcutta University",
    "Kalyani Government Engineering College",
    "Coochbehar Government Engineering College",
    "Jalpaiguri Government Engineering College",
  ];

  const [form, setForm] = useState({
    name: "",
    dob: "",
    jobPost: "",
    email: "",
    phone: "",
    address: "",
    salaryScale: "",
    qualification: "",
    assignedInstitution: "",
  });

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingIds, setSendingIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await api.get("/candidates");
      setCandidates(res.data || []);
    } catch (err) {
      console.error("fetchAll error:", err);
      alert(err.response?.data?.message || "Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  }

  async function createCandidate() {
    if (!form.name || !form.jobPost || !form.assignedInstitution) {
      return alert("Please enter Name, Job Post and Assigned Institution.");
    }

    try {
      const res = await api.post("/candidates", form);
      const created = res.data;
      await generateProfessionalPDF(created);
      alert("✅ Candidate created & Appointment Letter downloaded.");
      setForm({
        name: "",
        dob: "",
        jobPost: "",
        email: "",
        phone: "",
        address: "",
        salaryScale: "",
        qualification: "",
        assignedInstitution: "",
      });
      await fetchAll();
    } catch (err) {
      console.error("createCandidate error:", err);
      alert(err.response?.data?.message || err.message || "Failed to create candidate");
    }
  }

  async function generateProfessionalPDF(cand) {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 40;

      const qrData = JSON.stringify({
        applicationId: cand.applicationId,
        name: cand.name,
        jobPost: cand.jobPost,
        institution: cand.assignedInstitution,
        salary: cand.salaryScale,
      });
      const qrImage = await QRCode.toDataURL(qrData);

      doc.setLineWidth(1);
      doc.setDrawColor(20, 40, 90);
      doc.rect(margin, margin, pageW - margin * 2, pageH - margin * 2);

      try {
        doc.addImage(IndiaLogo, "PNG", margin + 8, margin + 10, 60, 60);
      } catch (e) {
        console.warn("Logo load failed:", e);
      }

      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.text("GOVERNMENT OF WEST BENGAL", pageW / 2, margin + 30, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(13);
      doc.text("Department of Higher Education", pageW / 2, margin + 48, { align: "center" });

      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text("APPOINTMENT LETTER", pageW / 2, margin + 90, { align: "center" });

      doc.addImage(qrImage, "PNG", pageW - margin - 100, margin + 12, 80, 80);

      let x = margin + 28;
      let y = margin + 120;
      const lh = 18;
      doc.setFont("times", "normal");
      doc.setFontSize(12);

      const writeLabelVal = (label, value) => {
        doc.setFont("times", "bold");
        doc.text(`${label}:`, x, y);
        const lw = doc.getTextWidth(`${label}: `);
        doc.setFont("times", "normal");
        const wrap = doc.splitTextToSize(value + "", pageW - margin - x - 40 - lw);
        doc.text(wrap, x + lw + 6, y);
        y += lh * (wrap.length);
      };

      writeLabelVal("Application ID", cand.applicationId || "");
      writeLabelVal("Name", cand.name || "");
      writeLabelVal("Date of Birth", cand.dob ? new Date(cand.dob).toLocaleDateString() : "");
      writeLabelVal("Job Post", cand.jobPost || "");
      writeLabelVal("Qualification", cand.qualification || "");
      writeLabelVal("Salary (Rs)", cand.salaryScale || "");
      writeLabelVal("Assigned Institution", cand.assignedInstitution || "");
      writeLabelVal("Email", cand.email || "");
      writeLabelVal("Phone", cand.phone || "");
      writeLabelVal("Address", cand.address || "");

      y += 8;
      const p1 = "You are hereby appointed to the aforementioned post under the Department of Higher Education, Government of West Bengal. This appointment is subject to verification of credentials and completion of all statutory requirements.";
      const p2 = "You are directed to report to your assigned institution within 7 working days from the date of receipt of this letter along with original documents for verification.";

      const p1Lines = doc.splitTextToSize(p1, pageW - margin - x - 40);
      doc.text(p1Lines, x, y);
      y += lh * p1Lines.length + 6;
      const p2Lines = doc.splitTextToSize(p2, pageW - margin - x - 40);
      doc.text(p2Lines, x, y);
      y += lh * p2Lines.length + 30;

      const sigW = 140;
      const sigH = 50;
      const sigX = pageW - margin - sigW - 20;
      const sigY = pageH - margin - sigH - 70;

      try {
        doc.addImage(SignatureImg, "PNG", sigX, sigY, sigW, sigH);
      } catch (e) {
        console.warn("signature addImage failed:", e);
        doc.setFont("times", "bold");
        doc.text("Head Office Superintendent", sigX, sigY + sigH / 2);
      }

      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text("Authorized Signatory", sigX, sigY + sigH + 16);
      doc.text("Department of Higher Education", sigX, sigY + sigH + 32);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `This is a computer generated appointment letter. For verification, scan the QR code or visit the official portal.`,
        margin + 10,
        pageH - margin - 16
      );

      const filename = `${cand.applicationId || "appointment"}_appointment.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("generateProfessionalPDF error:", err);
      alert("Failed to generate PDF: " + (err.message || err));
    }
  }

  async function sendToAll(id) {
    if (sendingIds.has(id)) return;
    setSendingIds(new Set(sendingIds).add(id));

    try {
      let dispatched = false;
      try {
        await api.put(`/candidates/dispatch/${id}`);
        dispatched = true;
      } catch (e) {
        // fallback
      }

      if (!dispatched) {
        const calls = [
          api.put(`/candidates/sendtocandidate/${id}`),
          api.put(`/candidates/sendtolocal/${id}`),
          api.put(`/candidates/sendtotreasury/${id}`),
        ];

        const results = await Promise.allSettled(calls);
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length === calls.length) {
          throw new Error("All dispatch endpoints failed. Check backend routes.");
        }
      }

      setCandidates((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "sent_to_local" } : c))
      );

      alert("✅ Appointment sent to Candidate, Local Office and Treasury.");
    } catch (err) {
      console.error("sendToAll error:", err);
      alert(err.response?.data?.message || err.message || "Dispatch failed");
      const copy = new Set(sendingIds);
      copy.delete(id);
      setSendingIds(copy);
    }
  }

  async function deleteCandidate(id) {
    if (!window.confirm("⚠️ Permanently delete this candidate? This cannot be undone.")) return;

    try {
      await api.delete(`/candidates/${id}`);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
      alert("🗑️ Candidate deleted permanently.");
    } catch (err) {
      console.error("deleteCandidate error:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete candidate");
    }
  }

  // Filter & Search
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.applicationId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const stats = {
    total: candidates.length,
    created: candidates.filter(c => c.status === "created").length,
    sent: candidates.filter(c => c.status?.includes("sent")).length,
    verified: candidates.filter(c => c.status?.includes("verified")).length,
    paid: candidates.filter(c => c.status === "paid").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      {/* ========== HEADER ========== */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🏛️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Head Office Dashboard</h1>
                <p className="text-blue-100 text-sm">Central Administration • West Bengal</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right mr-3">
                <p className="text-sm font-semibold">{user?.name || "Administrator"}</p>
                <p className="text-xs text-blue-200">Head Office</p>
              </div>
              
              <button
                onClick={fetchAll}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg shadow-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========== STATS CARDS ========== */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📊</span>
              <span className="text-3xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm font-semibold opacity-90">Total Candidates</p>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📝</span>
              <span className="text-3xl font-bold">{stats.created}</span>
            </div>
            <p className="text-sm font-semibold opacity-90">Created</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📤</span>
              <span className="text-3xl font-bold">{stats.sent}</span>
            </div>
            <p className="text-sm font-semibold opacity-90">Dispatched</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">✅</span>
              <span className="text-3xl font-bold">{stats.verified}</span>
            </div>
            <p className="text-sm font-semibold opacity-90">Verified</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">💰</span>
              <span className="text-3xl font-bold">{stats.paid}</span>
            </div>
            <p className="text-sm font-semibold opacity-90">Paid</p>
          </div>
        </div>

        {/* ========== MAIN GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ========== CREATE CANDIDATE FORM ========== */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
                ➕
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Create New Candidate</h3>
                <p className="text-xs text-gray-500">Fill all required fields</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">👤 Full Name *</label>
                <input 
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50" 
                  placeholder="Enter full name" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📅 Date of Birth</label>
                <input 
                  type="date" 
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50" 
                  value={form.dob} 
                  onChange={(e) => setForm({ ...form, dob: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">💼 Job Post *</label>
                <input 
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50" 
                  placeholder="e.g. Assistant Professor" 
                  value={form.jobPost} 
                  onChange={(e) => setForm({ ...form, jobPost: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📧 Email</label>
                <input 
                  type="email"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50" 
                  placeholder="email@example.com" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">📱 Phone</label>
                <input 
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50" 
                  placeholder="10-digit mobile number" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🏠 Address</label>
                <textarea 
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50 resize-none" 
                  rows="3"
                  placeholder="Complete address" 
                  value={form.address} 
                  onChange={(e) => setForm({ ...form, address: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">💵 Salary Scale (₹)</label>
                <input 
                  type="number"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50" 
                  placeholder="Enter salary amount" 
                  value={form.salaryScale} 
                  onChange={(e) => setForm({ ...form, salaryScale: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🎓 Qualification</label>
                <input 
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50" 
                  placeholder="e.g. Ph.D., M.Tech" 
                  value={form.qualification} 
                  onChange={(e) => setForm({ ...form, qualification: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🏛️ Assigned Institution *</label>
                <select 
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50" 
                  value={form.assignedInstitution} 
                  onChange={(e) => setForm({ ...form, assignedInstitution: e.target.value })}
                >
                  <option value="">Select Institution</option>
                  {institutions.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <button 
                onClick={createCandidate} 
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create & Download Appointment
              </button>
            </div>
          </div>

          {/* ========== CANDIDATES LIST ========== */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  📋 Candidates Registry
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {loading ? "Loading..." : `${filteredCandidates.length} of ${candidates.length} candidates`}
                </p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="🔍 Search by name or ID..."
                  className="flex-1 md:w-64 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="created">Created</option>
                  <option value="sent_to_local">Sent</option>
                  <option value="verified_by_local">Verified</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading candidates...</p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600 font-semibold">No candidates found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                      <th className="p-4 text-left text-sm font-bold text-gray-700">App ID</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700">Name</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700">Institution</th>
                      <th className="p-4 text-left text-sm font-bold text-gray-700">Status</th>
                      <th className="p-4 text-center text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCandidates.map((c) => {
                      const isSending = sendingIds.has(c._id);
                      // FIXED: Disable send button if status is NOT "created"
                      const disabledSend = isSending || (c.status && c.status !== "created");
                      
                      return (
                        <tr key={c._id} className="border-b hover:bg-blue-50/50 transition">
                          <td className="p-4">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {c.applicationId}
                            </span>
                          </td>
                          
                          <td className="p-4">
                            <div>
                              <p className="font-semibold text-gray-800">{c.name}</p>
                              <p className="text-xs text-gray-500">{c.jobPost}</p>
                            </div>
                          </td>
                          
                          <td className="p-4">
                            <span className="text-sm text-gray-700">{c.assignedInstitution}</span>
                          </td>
                          
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              c.status === "paid" ? "bg-green-100 text-green-700" : 
                              c.status?.includes("verified") ? "bg-yellow-100 text-yellow-700" : 
                              c.status?.includes("sent") ? "bg-indigo-100 text-indigo-700" : 
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {c.status?.replace(/_/g, ' ') || "new"}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              
                              <button 
                                onClick={() => generateProfessionalPDF(c)} 
                                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition flex items-center gap-1"
                                title="Download PDF"
                              >
                                📄 PDF
                              </button>

                              <button 
                                disabled={disabledSend} 
                                onClick={() => sendToAll(c._id)} 
                                className={`px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-1 ${
                                  disabledSend 
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
                                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                                }`}
                                title={disabledSend ? "Already dispatched" : "Send to all offices"}
                              >
                                {isSending ? "⏳" : disabledSend ? "✓" : "📤"} 
                                {isSending ? "Sending..." : disabledSend ? "Sent" : "Send"}
                              </button>

                              <button 
                                onClick={() => deleteCandidate(c._id)} 
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
                                title="Delete permanently"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ========== QUICK TIPS ========== */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl border-2 border-blue-300">
            <div className="text-4xl mb-3">💡</div>
            <h4 className="font-bold text-blue-900 mb-2">Quick Tip</h4>
            <p className="text-sm text-blue-800">
              Always verify candidate details before dispatching appointments to avoid errors.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl border-2 border-green-300">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-bold text-green-900 mb-2">Reports</h4>
            <p className="text-sm text-green-800">
              Use the search and filter options to generate custom reports for administration.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl border-2 border-purple-300">
            <div className="text-4xl mb-3">🔒</div>
            <h4 className="font-bold text-purple-900 mb-2">Security</h4>
            <p className="text-sm text-purple-800">
              All appointment letters include QR codes for instant verification and authenticity.
            </p>
          </div>
        </div>
      </div>

      {/* ========== FOOTER ========== */}
      <footer className="mt-12 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">© 2025 Government of West Bengal | Department of Higher Education</p>
          <p className="text-xs text-gray-400 mt-2">Head Office Administration Portal • Developed with ❤️ by Sohel</p>
        </div>
      </footer>
    </div>
  );
}