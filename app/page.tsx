"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const roles = [
  { key: "admin", label: "مدير النظام", icon: "⚙️", desc: "إدارة المعايير والمواد والمستخدمين" },
  { key: "designer", label: "المصمم", icon: "✏️", desc: "إنشاء خطط المشاريع بالمعايير والمواد" },
  { key: "engineer", label: "المهندس التنفيذي", icon: "🏗️", desc: "تنفيذ الأعمال وفق خطة المصمم" },
  { key: "inspector", label: "مفتش الجودة", icon: "🔍", desc: "فحص الموقع والتحقق من المتطلبات" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (dbError || !data) {
        setError("البريد الإلكتروني غير مسجل في النظام");
        setLoading(false);
        return;
      }

      // Store user in localStorage for demo purposes
      if (typeof window !== "undefined") {
        localStorage.setItem("alamani_user", JSON.stringify(data));
      }

      router.push("/dashboard");
    } catch {
      setError("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setLoading(true);
    setError("");
    const demoEmails: Record<string, string> = {
      admin: "admin@alamani.sa",
      designer: "designer@alamani.sa",
      engineer: "engineer@alamani.sa",
      inspector: "inspector@alamani.sa",
    };

    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("email", demoEmails[role])
        .single();

      if (data) {
        if (typeof window !== "undefined") {
          localStorage.setItem("alamani_user", JSON.stringify(data));
        }
        router.push("/dashboard");
      } else {
        // Create demo user if not exists
        const demoNames: Record<string, string> = {
          admin: "أحمد العامر",
          designer: "سارة المهندس",
          engineer: "محمد التنفيذي",
          inspector: "فاطمة المفتش",
        };
        const { data: newUser } = await supabase
          .from("users")
          .insert({ email: demoEmails[role], name: demoNames[role], role })
          .select()
          .single();
        if (newUser) {
          if (typeof window !== "undefined") {
            localStorage.setItem("alamani_user", JSON.stringify(newUser));
          }
          router.push("/dashboard");
        }
      }
    } catch {
      setError("حدث خطأ في تسجيل الدخول التجريبي");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-pattern flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-alamani-gold opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-alamani-gold opacity-5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-alamani-gold opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-alamani-gold opacity-3" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-12">
        {/* Header / Branding */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-2 border-alamani-gold shadow-gold mb-6 bg-alamani-navy-light">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-5xl font-black text-gold-gradient mb-2">شركة الاماني</h1>
          <div className="gold-line w-64 mx-auto" />
          <p className="text-gray-400 text-lg mt-3 font-medium">نظام إدارة الجودة المتكامل</p>
          <p className="text-gray-500 text-sm mt-1">للبناء والتشييد والمقاولات</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Login Form */}
          <div className="glass-card p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-alamani-gold mb-6 flex items-center gap-3">
              <span>تسجيل الدخول</span>
            </h2>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  className="w-full bg-alamani-navy-mid border border-alamani-gold/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-alamani-gold focus:ring-1 focus:ring-alamani-gold/50 transition-all"
                  required
                />
              </div>

              {error && (
                <div className="badge-error rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3 px-6 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "جارٍ التحقق..." : "دخول"}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-alamani-navy-light px-4 text-gray-500">أو اختر دوراً تجريبياً</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Role Selection */}
          <div className="space-y-3 animate-slide-up">
            <h3 className="text-gray-400 text-sm font-medium mb-4">الأدوار المتاحة في النظام</h3>
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => handleDemoLogin(role.key)}
                disabled={loading}
                className={`w-full text-right p-4 rounded-xl border transition-all duration-300 group disabled:opacity-50 ${
                  selectedRole === role.key
                    ? "border-alamani-gold bg-alamani-gold/10"
                    : "border-white/10 bg-alamani-navy-light hover:border-alamani-gold/40 hover:bg-alamani-gold/5"
                }`}
                onMouseEnter={() => setSelectedRole(role.key)}
                onMouseLeave={() => setSelectedRole(null)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-alamani-navy flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white group-hover:text-alamani-gold transition-colors">
                      {role.label}
                    </div>
                    <div className="text-gray-500 text-sm mt-0.5">{role.desc}</div>
                  </div>
                  <div className="text-alamani-gold/40 group-hover:text-alamani-gold transition-colors text-xl">
                    ←
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-10">
          © 2024 شركة الاماني للمقاولات. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
}
