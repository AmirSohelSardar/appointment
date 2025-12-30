import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import indiaLogo from "../assets/india_logo.png";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [appId, setAppId] = useState("");
  const [dob, setDob] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { loginStaff, loginCandidate } = useAuth();
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let u;

      // CANDIDATE LOGIN
      if (role === "candidate") {
        u = await loginCandidate(appId, dob);
        nav("/candidate");
        return;
      }

      // STAFF LOGIN
      u = await loginStaff(email, password);

      if (u.role === "head") nav("/head");
      else if (u.role === "local") nav("/local");
      else if (u.role === "treasury") nav("/treasury");
      else nav("/candidate");

    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Role configurations
  const roles = [
    {
      id: "head",
      name: "Head Office",
      icon: "🏛️",
      color: "from-blue-600 to-blue-700",
      hoverColor: "hover:from-blue-700 hover:to-blue-800",
      description: "Central Administration"
    },
    {
      id: "local",
      name: "Local Office",
      icon: "🏢",
      color: "from-green-600 to-green-700",
      hoverColor: "hover:from-green-700 hover:to-green-800",
      description: "Institution Management"
    },
    {
      id: "treasury",
      name: "Treasury Office",
      icon: "💰",
      color: "from-orange-600 to-orange-700",
      hoverColor: "hover:from-orange-700 hover:to-orange-800",
      description: "Payment Processing"
    },
    {
      id: "candidate",
      name: "Candidate",
      icon: "👤",
      color: "from-purple-600 to-purple-700",
      hoverColor: "hover:from-purple-700 hover:to-purple-800",
      description: "Employee Portal"
    }
  ];

  const currentRoleData = roles.find(r => r.id === role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">

    {/* ========== HEADER ========== */}
<header className="bg-white shadow-lg border-b-4 border-blue-600">
  <div className="max-w-7xl mx-auto px-6 py-8">

    <div className="flex flex-col md:flex-row items-center justify-between gap-4">

      {/* Logo Section */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-white to-green-400
                        rounded-full flex items-center justify-center shadow-lg border-4 border-blue-600">
          <img
            src={indiaLogo}
            alt="India Emblem"
            className="w-16 h-16 object-contain"
          />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
            Government of West Bengal
          </h1>
          <p className="text-sm md:text-base text-gray-600 font-semibold mt-1">
            Department of Higher Education
          </p>
          <p className="text-xs text-blue-600 font-medium mt-1">
            E-Appointment Management System
          </p>
        </div>
      </div>

      {/* Demo Login Details Download Button */}
      
        <a href="/login-credentials.pdf"
        download="Demo_Login_Details.pdf"
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 
                   hover:to-emerald-700 text-white px-6 py-3 rounded-full shadow-lg 
                   transition-all duration-300 transform hover:scale-105 cursor-pointer"
      >
        <p className="text-sm font-bold">📥 Demo Login Details</p>
      </a>

    </div>

  </div>
</header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        
        {/* ========== ROLE SELECTION ========== */}
        {!role && (
          <div className="w-full max-w-6xl">
            
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <div className="inline-block bg-white px-8 py-4 rounded-2xl shadow-lg mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                  Welcome to E-Appointment Portal
                </h2>
                <p className="text-gray-600 text-lg">
                  Please select your role to continue
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">✓ Secure</span>
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">✓ Fast</span>
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">✓ Digital</span>
                <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">✓ Verified</span>
              </div>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-105 hover:-translate-y-2`}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative p-8 flex flex-col items-center">
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {r.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-white transition-colors mb-2">
                      {r.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors text-center">
                      {r.description}
                    </p>

                    {/* Arrow Icon */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>

                  {/* Bottom Accent */}
                  <div className={`h-2 bg-gradient-to-r ${r.color}`}></div>
                </button>
              ))}
            </div>

            {/* Info Box */}
            <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
              <p className="text-blue-800 font-semibold mb-2">
                ℹ️ Need Help?
              </p>
              <p className="text-sm text-blue-700">
                If you're a new candidate, please contact your institution's local office for registration.
                For technical support, reach out to the IT helpdesk.
              </p>
            </div>
          </div>
        )}

        {/* ========== LOGIN FORM ========== */}
        {role && currentRoleData && (
          <div className="w-full max-w-md">
            
            {/* Back Button */}
            <button
              onClick={() => {
                setRole("");
                setEmail("");
                setPassword("");
                setAppId("");
                setDob("");
              }}
              className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Role Selection
            </button>

            {/* Login Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              
              {/* Card Header */}
              <div className={`bg-gradient-to-r ${currentRoleData.color} p-8 text-center`}>
                <div className="text-6xl mb-3">{currentRoleData.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {currentRoleData.name}
                </h2>
                <p className="text-white/90 text-sm">
                  {currentRoleData.description}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  
                  {/* ===== CANDIDATE FIELDS ===== */}
                  {role === "candidate" && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          📋 Application ID
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition bg-gray-50 font-mono"
                          placeholder="Enter your Application ID"
                          value={appId}
                          onChange={(e) => setAppId(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          📅 Date of Birth
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition bg-gray-50"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* ===== STAFF FIELDS ===== */}
                  {role !== "candidate" && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          📧 Email Address
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          🔒 Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPass ? "text" : "password"}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition bg-gray-50 pr-12"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                          >
                            {showPass ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${currentRoleData.color} ${currentRoleData.hoverColor} text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                {/* Security Badge */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <div className="text-2xl">🔐</div>
                  <div className="text-xs text-green-800">
                    <p className="font-semibold">Secure Login</p>
                    <p>Your credentials are encrypted and protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Having trouble logging in?</p>
              <button className="text-blue-600 hover:text-blue-700 font-semibold mt-1">
                Contact Support →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold">© 2025 Government of West Bengal</p>
              <p className="text-xs text-gray-400 mt-1">Department of Higher Education</p>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition">Help Center</a>
            </div>
            
            <div className="text-xs text-gray-400">
              <p>Developed with ❤️ by <span className="text-white font-semibold">Amir Sohel</span></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}