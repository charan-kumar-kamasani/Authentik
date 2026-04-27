import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import API_BASE_URL from "../../config/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Invalid credentials");
        return;
      }

      /* ================= ADMIN AUTH ONLY ================= */

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminRole", data.role);
      localStorage.setItem("adminEmail", data.email);

      localStorage.setItem(
        "adminInfo",
        JSON.stringify({
          _id: data._id,
          email: data.email,
          role: data.role,
        }),
      );

      /* ================= ROLE BASED REDIRECT ================= */

      if (["company", "authorizer", "creator"].includes(data.role)) {
        navigate("/orders", { replace: true });
      } else {
        navigate("/admin/analytics", { replace: true });
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full bg-transparent grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Premium brand panel */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-[#0f4c81] to-[#2a9df4] text-white p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-inner">
                <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Authentiks</h1>
              </div>
            </div>

            <div className="mt-23 text-sm leading-relaxed opacity-95">
              <h2 className="text-sm font-extrabold mb-2">Turn Authentication into Business Intelligence</h2>
              <p className="text-sm">Protect your brand, eliminate counterfeits and convert every product scan into measurable growth and customer engagement.</p>
            </div>
          </div>

          <div className="mt-6 text-xs opacity-80">
            Need help? <a href="mailto:support@authentiks.in" className="underline">support@authentiks.in</a>
          </div>
        </div>

        {/* Right: Form card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Enterprise Panel</h2>
            <p className="text-sm text-slate-500">Sign in to manage your organization's account</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-3 text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-300 shadow-sm text-base"
                placeholder="admin@yourdomain.com"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 pr-12 text-slate-900 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-300 shadow-sm text-base"
                  placeholder="••••••••"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4 text-indigo-600" />
                Remember me
              </label>
              <button type="button" className="text-sm text-indigo-600 hover:underline">Forgot?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white shadow-md flex items-center justify-center gap-3 ${loading ? 'bg-gradient-to-r from-indigo-300 to-indigo-400 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600'}`}
            >
              {loading ? <><Loader2 className="animate-spin" size={16} /> Signing in…</> : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
