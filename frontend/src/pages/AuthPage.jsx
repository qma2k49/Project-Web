import React, { useState } from "react";
import { useNavigate } from "react-router";
import { loginUser, registerUser } from "../api";
import { User, Lock, Mail, ShieldAlert, LogIn, UserPlus } from "lucide-react";
import { message } from "antd";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "USER"
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      message.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        // Handle Login
        const data = await loginUser(formData.username, formData.password);
        message.success("Đăng nhập thành công!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      } else {
        // Handle Register
        const data = await registerUser(formData.username, formData.password, formData.role);
        message.success("Đăng ký tài khoản thành công!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07130f] relative flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px]" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-[#0e221b]/80 backdrop-blur-xl border border-emerald-900/30 rounded-3xl p-8 shadow-2xl relative z-10">

        {/* Brand Logo / Icon */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-wider">⚽</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Football Zone</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">Cập nhật các giải đấu bóng đá trên hành tinh</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#07130f]/60 p-1.5 rounded-2xl border border-emerald-950/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${isLogin
              ? "bg-emerald-500 text-[#07130f] shadow-md shadow-emerald-500/10 font-extrabold"
              : "text-slate-400 hover:text-slate-200"
              }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${!isLogin
              ? "bg-emerald-500 text-[#07130f] shadow-md shadow-emerald-500/10 font-extrabold"
              : "text-slate-400 hover:text-slate-200"
              }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Tên đăng nhập hoặc Email</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên đăng nhập..."
                className="w-full pl-10 pr-4 py-3 bg-[#07130f]/80 border border-emerald-900/30 rounded-xl text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-4 py-3 bg-[#07130f]/80 border border-emerald-900/30 rounded-xl text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Confirm Password Field (Only for Register) */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu..."
                    className="w-full pl-10 pr-4 py-3 bg-[#07130f]/80 border border-emerald-900/30 rounded-xl text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-500/50 text-[#07130f] font-black text-sm rounded-xl tracking-wider uppercase transition-all duration-300 shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập ngay" : "Đăng ký tài khoản"}
          </button>
        </form>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-xs text-slate-400 hover:text-emerald-400 hover:underline font-semibold transition-colors cursor-pointer"
          >
            Quay lại trang chủ cộng đồng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
