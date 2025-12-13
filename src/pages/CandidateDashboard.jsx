import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import IndiaLogo from "../assets/india_logo.png";
import SignatureImg from "../assets/signature.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CandidateDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [payslips, setPayslips] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (!user || !user.applicationId) {
          setLoading(false);
          return;
        }
        // PUBLIC ROUTE - NO AUTH NEEDED
        const res = await axios.get(`${API_URL}/public/candidate/${encodeURIComponent(user.applicationId)}`);
        setCandidate(res.data.candidate);
        setPayslips(res.data.payslips || []);
      } catch (err) {
        console.error("Candidate fetch error ->", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // ============================================================
  // EXACT SAME APPOINTMENT LETTER AS HEAD OFFICE
  // ============================================================
  const downloadAppointmentLetter = async () => {
    if (!candidate) return;
    
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 40;

      // QR (base64)
      const qrData = JSON.stringify({
        applicationId: candidate.applicationId,
        name: candidate.name,
        jobPost: candidate.jobPost,
        institution: candidate.assignedInstitution,
        salary: candidate.salaryScale,
      });
      const qrImage = await QRCode.toDataURL(qrData);

      // Outer border
      doc.setLineWidth(1);
      doc.setDrawColor(20, 40, 90);
      doc.rect(margin, margin, pageW - margin * 2, pageH - margin * 2);

      // Header area
      // Logo left
      try {
        doc.addImage(IndiaLogo, "PNG", margin + 8, margin + 10, 60, 60);
      } catch (e) {
        console.warn("Logo load failed:", e);
      }

      // Heading center
      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.text("GOVERNMENT OF WEST BENGAL", pageW / 2, margin + 30, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(13);
      doc.text("Department of Higher Education", pageW / 2, margin + 48, { align: "center" });

      // Title
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text("APPOINTMENT LETTER", pageW / 2, margin + 90, { align: "center" });

      // QR top-right
      doc.addImage(qrImage, "PNG", pageW - margin - 100, margin + 12, 80, 80);

      // Body start
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

      writeLabelVal("Application ID", candidate.applicationId || "");
      writeLabelVal("Name", candidate.name || "");
      writeLabelVal("Date of Birth", candidate.dob ? new Date(candidate.dob).toLocaleDateString() : "");
      writeLabelVal("Job Post", candidate.jobPost || "");
      writeLabelVal("Qualification", candidate.qualification || "");
      writeLabelVal("Salary (Rs)", candidate.salaryScale || "");
      writeLabelVal("Assigned Institution", candidate.assignedInstitution || "");
      writeLabelVal("Email", candidate.email || "");
      writeLabelVal("Phone", candidate.phone || "");
      writeLabelVal("Address", candidate.address || "");

      y += 8;
      // Formal paragraph
      const p1 =
        "You are hereby appointed to the aforementioned post under the Department of Higher Education, Government of West Bengal. This appointment is subject to verification of credentials and completion of all statutory requirements.";
      const p2 =
        "You are directed to report to your assigned institution within 7 working days from the date of receipt of this letter along with original documents for verification.";

      const p1Lines = doc.splitTextToSize(p1, pageW - margin - x - 40);
      doc.text(p1Lines, x, y);
      y += lh * p1Lines.length + 6;
      const p2Lines = doc.splitTextToSize(p2, pageW - margin - x - 40);
      doc.text(p2Lines, x, y);
      y += lh * p2Lines.length + 30;

      // Signature block bottom-right (digital signature image)
      const sigW = 140;
      const sigH = 50;
      const sigX = pageW - margin - sigW - 20;
      const sigY = pageH - margin - sigH - 70;

      try {
        doc.addImage(SignatureImg, "PNG", sigX, sigY, sigW, sigH);
      } catch (e) {
        console.warn("signature addImage failed:", e);
        // fallback text
        doc.setFont("times", "bold");
        doc.text("Head Office Superintendent", sigX, sigY + sigH / 2);
      }

      // Signatory text under signature
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text("Authorized Signatory", sigX, sigY + sigH + 16);
      doc.text("Department of Higher Education", sigX, sigY + sigH + 32);

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        `This is a computer generated appointment letter. For verification, scan the QR code or visit the official portal.`,
        margin + 10,
        pageH - margin - 16
      );

      // save
      const filename = `${candidate.applicationId || "appointment"}_appointment.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("generateProfessionalPDF error:", err);
      alert("Failed to generate PDF: " + (err.message || err));
    }
  };

  // ============================================================
  // PROFESSIONAL GOVERNMENT PAYSLIP
  // ============================================================
  const downloadPayslip = async (slip) => {
    if (!candidate) return;
    
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 40;

      // Border
      doc.setLineWidth(1);
      doc.setDrawColor(20, 40, 90);
      doc.rect(margin, margin, pageW - margin * 2, pageH - margin * 2);

      // Logo
      try {
        doc.addImage(IndiaLogo, "PNG", margin + 8, margin + 10, 50, 50);
      } catch (e) {
        console.warn("Logo failed");
      }

      // Header
      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.text("GOVERNMENT OF WEST BENGAL", pageW / 2, margin + 25, { align: "center" });
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.text("Department of Higher Education", pageW / 2, margin + 40, { align: "center" });

      // Title
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text("SALARY PAYSLIP", pageW / 2, margin + 70, { align: "center" });

      let y = margin + 100;
      const lh = 16;

      // Employee Details Section
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text("Employee Details", margin + 20, y);
      y += 5;
      doc.setLineWidth(0.5);
      doc.line(margin + 20, y, pageW - margin - 20, y);
      y += 15;

      doc.setFont("times", "normal");
      doc.setFontSize(11);

      const writeDetail = (label, value) => {
        doc.setFont("times", "bold");
        doc.text(label + ":", margin + 30, y);
        doc.setFont("times", "normal");
        doc.text(value || "—", margin + 180, y);
        y += lh;
      };

      writeDetail("Name", candidate.name);
      writeDetail("Application ID", candidate.applicationId);
      writeDetail("Institution", candidate.assignedInstitution);
      writeDetail("Job Post", candidate.jobPost || "—");
      writeDetail("Bank Account", candidate.bank?.accountNumber || "—");
      writeDetail("IFSC Code", candidate.bank?.ifsc || "—");

      y += 10;

      // Payment Details Section
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text("Payment Details", margin + 20, y);
      y += 5;
      doc.line(margin + 20, y, pageW - margin - 20, y);
      y += 15;

      doc.setFont("times", "normal");
      doc.setFontSize(11);
      writeDetail("Payment Month", slip.month);
      writeDetail("Payment Date", new Date(slip.paidAt).toLocaleDateString());

      y += 10;

      // Salary Breakdown Table
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text("Salary Breakdown", margin + 20, y);
      y += 5;
      doc.line(margin + 20, y, pageW - margin - 20, y);
      y += 20;

      // Table Header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin + 30, y - 12, pageW - margin * 2 - 60, 20, "F");
      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.text("Description", margin + 40, y);
      doc.text("Amount (₹)", pageW - margin - 120, y);
      y += 15;

      // Table Rows
      doc.setFont("times", "normal");
      const basicSalary = parseInt(slip.amount);
      const hra = Math.round(basicSalary * 0.20); // 20% HRA
      const da = Math.round(basicSalary * 0.10); // 10% DA
      const grossSalary = basicSalary + hra + da;
      const tax = Math.round(grossSalary * 0.05); // 5% Tax
      const pf = Math.round(basicSalary * 0.12); // 12% PF
      const totalDeductions = tax + pf;
      const netSalary = grossSalary - totalDeductions;

      const addRow = (desc, amt, bold = false) => {
        if (bold) doc.setFont("times", "bold");
        else doc.setFont("times", "normal");
        doc.text(desc, margin + 40, y);
        doc.text(amt.toLocaleString(), pageW - margin - 120, y);
        y += lh;
      };

      // Earnings
      doc.setFont("times", "bold");
      doc.text("EARNINGS:", margin + 40, y);
      y += lh;
      addRow("Basic Salary", basicSalary);
      addRow("House Rent Allowance (HRA)", hra);
      addRow("Dearness Allowance (DA)", da);
      y += 5;
      doc.line(margin + 30, y, pageW - margin - 30, y);
      y += 10;
      addRow("Gross Salary", grossSalary, true);

      y += 15;

      // Deductions
      doc.setFont("times", "bold");
      doc.text("DEDUCTIONS:", margin + 40, y);
      y += lh;
      addRow("Income Tax", tax);
      addRow("Provident Fund (PF)", pf);
      y += 5;
      doc.line(margin + 30, y, pageW - margin - 30, y);
      y += 10;
      addRow("Total Deductions", totalDeductions, true);

      y += 20;

      // Net Salary - Highlighted
      doc.setFillColor(220, 250, 220);
      doc.rect(margin + 30, y - 12, pageW - margin * 2 - 60, 25, "F");
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.text("NET SALARY PAID", margin + 40, y);
      doc.text("₹ " + netSalary.toLocaleString(), pageW - margin - 120, y);

      y += 30;

      // Note
      doc.setFont("times", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100);
      const note = "This is a computer-generated payslip. No signature is required. For any queries, contact the Treasury Office.";
      const noteLines = doc.splitTextToSize(note, pageW - margin * 2 - 60);
      doc.text(noteLines, margin + 30, y);

      // Footer
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(
        `Generated on: ${new Date().toLocaleString()} | Government of West Bengal`,
        pageW / 2,
        pageH - margin - 20,
        { align: "center" }
      );

      doc.save(`payslip_${candidate.applicationId}_${slip.month}.pdf`);
    } catch (err) {
      console.error("Payslip generation error:", err);
      alert("Failed to generate payslip: " + (err.message || err));
    }
  };

  const getStatusStep = (status) => {
    const steps = {
      'created': 1,
      'sent_to_local': 2,
      'verified_by_local': 3,
      'sent_to_treasury': 4,
      'paid': 5
    };
    return steps[status] || 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your data...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto mt-20 bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Record Found</h2>
            <p className="text-gray-600 mb-6">
              Please login with a valid Application ID and Date of Birth.
            </p>
            <button
              onClick={logout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(candidate.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* HEADER */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{candidate.name}</h1>
                <p className="text-sm text-gray-600">
                  App ID: <span className="font-mono font-semibold">{candidate.applicationId}</span> • {candidate.assignedInstitution}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* STATUS TIMELINE */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Application Status</h2>
          
          <div className="relative">
            <div className="flex justify-between items-center">
              {['Created', 'Sent to Local', 'Verified', 'Sent to Treasury', 'Paid'].map((label, idx) => {
                const step = idx + 1;
                const isActive = step <= currentStep;
                const isCurrent = step === currentStep;
                
                return (
                  <div key={idx} className="flex flex-col items-center relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition ${
                      isActive 
                        ? isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                          : 'bg-green-500 text-white border-green-500'
                        : 'bg-gray-200 text-gray-500 border-gray-300'
                    }`}>
                      {isActive && !isCurrent ? '✓' : step}
                    </div>
                    <p className={`mt-2 text-xs font-semibold text-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-0">
              <div 
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Current Status:</strong> <span className="capitalize">{candidate.status.replace(/_/g, ' ')}</span>
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PERSONAL DETAILS */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">👤 Personal Details</h3>
              <button
                onClick={downloadAppointmentLetter}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition"
              >
                📄 Download Appointment Letter
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Full Name</p>
                <p className="text-lg font-semibold text-gray-800">{candidate.name}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Application ID</p>
                <p className="text-lg font-mono font-semibold text-gray-800">{candidate.applicationId}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Date of Birth</p>
                <p className="text-lg font-semibold text-gray-800">
                  {candidate.dob ? new Date(candidate.dob).toLocaleDateString() : '—'}
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Job Post</p>
                <p className="text-lg font-semibold text-gray-800">{candidate.jobPost || '—'}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Phone</p>
                <p className="text-lg font-semibold text-gray-800">{candidate.phone || '—'}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Email</p>
                <p className="text-lg font-semibold text-gray-800 break-all">{candidate.email || '—'}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg md:col-span-2">
                <p className="text-xs text-gray-600 mb-1">Address</p>
                <p className="text-lg font-semibold text-gray-800">{candidate.address || '—'}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Qualification</p>
                <p className="text-lg font-semibold text-gray-800">{candidate.qualification || '—'}</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Salary Scale</p>
                <p className="text-2xl font-bold text-green-700">₹ {candidate.salaryScale}</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg md:col-span-2">
                <p className="text-xs text-gray-600 mb-1">Assigned Institution</p>
                <p className="text-lg font-semibold text-gray-800">{candidate.assignedInstitution}</p>
              </div>

              {candidate.bank?.accountNumber && (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Bank Account</p>
                    <p className="text-lg font-mono font-semibold text-gray-800">{candidate.bank.accountNumber}</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">IFSC Code</p>
                    <p className="text-lg font-mono font-semibold text-gray-800">{candidate.bank.ifsc}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* PAYSLIPS */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">💰 Payslips</h3>

            {payslips.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600">No payslips available yet.</p>
              </div>
            )}

            <div className="space-y-4">
              {payslips.map((slip) => (
                <div
                  key={slip._id}
                  className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xl font-bold text-gray-800">{slip.month}</p>
                      <p className="text-sm text-gray-600">Paid on {new Date(slip.paidAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{slip.amount}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => downloadPayslip(slip)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow-md transition"
                  >
                    Download Payslip PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">© 2025 Government E-Appointment System | Department of Higher Education, West Bengal</p>
          <p className="text-xs mt-2">Developed by Amir Sohel & Momitul❤️</p>
        </div>
      </footer>
    </div>
  );
}