import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
        })
      );

      /* ================= ROLE BASED REDIRECT ================= */

      if (["company", "authorizer", "creator"].includes(data.role)) {
        navigate("/orders", { replace: true });
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left panel with brand color */}
        <div className="bg-[#214B80] text-white p-8 flex flex-col justify-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Authentiks</h1>
            <p className="text-sm opacity-90 mt-1">Admin Panel</p>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Manage Brands & Users</h2>
            <p className="text-sm opacity-90 mt-2">Create and manage users, brands and staff access. Secure admin area.</p>
          </div>
          <div className="mt-auto text-xs opacity-80">Need help? Contact support@authentiks.in</div>
        </div>

        {/* Right panel - form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to Admin</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your admin credentials to continue.</p>

          {error && (
            <div className="text-sm text-red-600 mb-4" role="alert">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#214B80]/20"
                placeholder="admin@yourdomain.com"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 pr-11 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#214B80]/20"
                  placeholder="••••••••"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="h-4 w-4 text-[#214B80]" />
                Remember me
              </label>
              <button type="button" className="text-sm text-[#214B80] hover:underline">Forgot?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg text-white ${loading ? 'bg-blue-300' : 'bg-[#214B80] hover:bg-[#193a62]'}`}
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
