"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "designer" | "engineer" | "inspector";
}

interface Stats {
  standards: number;
  materials: number;
  projects: number;
  reports: number;
}

const roleWelcome: Record<string, { title: string; desc: string; icon: string }> = {
  admin: {
    title: "لوحة تحكم المدير",
    desc: "إدارة شاملة لمعايير الجودة والمواد والمشاريع",
    icon: "⚙️",
  },
  designer: {
    title: "لوحة المصمم",
    desc: "إنشاء وإدارة خطط المشاريع الإنشائية",
    icon: "✏️",
  },
  engineer: {
    title: "لوحة المهندس التنفيذي",
    desc: "متابعة تنفيذ المشاريع وتسجيل التقارير",
    icon: "🏗️",
  },
  inspector: {
    title: "لوحة مفتش الجودة",
    desc: "فحص المشاريع والتحقق من مطابقة المعايير",
    icon: "🔍",
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ standards: 0, materials: 0, projects: 0, reports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("alamani_user");
      if (!stored) {
        router.push("/");
        return;
      }
      setUser(JSON.parse(stored));
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [s, m, p, r] = await Promise.all([
        supabase.from("standards").select("id", { count: "exact", head: true }),
        supabase.from("materials").select("id", { count: "exact", head: true }),
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("quality_reports").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        standards: s.count || 0,
        materials: m.count || 0,
        projects: p.count || 0,
        reports: r.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  if (!user) return null;

  const welcome = roleWelcome[user.role];
  const statCards = [
    { label: "معايير الجودة", value: stats.standards, icon: "📋", color: "text-blue-400" },
    { label: "المواد المسجلة", value: stats.materials, icon: "🧱", color: "text-green-400" },
    { label: "المشاريع", value: stats.projects, icon: "🏗️", color: "text-yellow-400" },
    { label: "تقارير الجودة", value: stats.reports, icon: "✅", color: "text-purple-400" },
  ];

  const quickActions: Record<string, { label: string; href: string; icon: string }[]> = {
    admin: [
      { label: "إضافة معيار جودة", href: "/admin/standards", icon: "📋" },
      { label: "إضافة مادة جديدة", href: "/admin/materials", icon: "🧱" },
      { label: "إنشاء مشروع", href: "/projects", icon: "🏗️" },
    ],
    designer: [
      { label: "إنشاء مشروع جديد", href: "/designer/create", icon: "✏️" },
      { label: "عرض المشاريع", href: "/projects", icon: "🏗️" },
    ],
    engineer: [
      { label: "تقارير التنفيذ", href: "/engineer/reports", icon: "📝" },
      { label: "عرض المشاريع", href: "/projects", icon: "🏗️" },
    ],
    inspector: [
      { label: "إنشاء تقرير جودة", href: "/inspector/quality", icon: "✅" },
      { label: "عرض المشاريع", href: "/projects", icon: "🏗️" },
    ],
  };

  return (
    <div className="flex min-h-screen bg-navy-pattern">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} title="لوحة التحكم" />
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="glass-card gold-border-animate p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-alamani-gold/15 border border-alamani-gold/30 flex items-center justify-center text-4xl flex-shrink-0">
              {welcome.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{welcome.title}</h2>
              <p className="text-gray-400 mt-1">{welcome.desc}</p>
              <p className="text-alamani-gold text-sm mt-2">
                مرحباً، <span className="font-bold">{user.name}</span> 👋
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="glass-card p-5 hover:border-alamani-gold/30 transition-all duration-300 hover:shadow-gold"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{card.icon}</span>
                  <span className={`text-3xl font-black ${card.color}`}>
                    {loading ? "..." : card.value}
                  </span>
                </div>
                <div className="text-gray-400 text-sm font-medium">{card.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-alamani-gold mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(quickActions[user.role] || []).map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-4 rounded-xl bg-alamani-navy-mid border border-white/5 hover:border-alamani-gold/30 hover:bg-alamani-gold/5 transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                  <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                  <span className="mr-auto text-alamani-gold/30 group-hover:text-alamani-gold transition-colors">←</span>
                </a>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-alamani-gold mb-4">معلومات النظام</h3>
              <div className="space-y-3">
                {[
                  { label: "اسم الشركة", value: "شركة الاماني للمقاولات" },
                  { label: "إصدار النظام", value: "1.0.0" },
                  { label: "نوع الحساب", value: user.role === "admin" ? "مدير النظام" : user.role === "designer" ? "مصمم" : user.role === "engineer" ? "مهندس تنفيذي" : "مفتش جودة" },
                  { label: "البريد الإلكتروني", value: user.email },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-gray-500 text-sm">{item.label}</span>
                    <span className="text-gray-200 text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-alamani-gold mb-4">حالة النظام</h3>
              <div className="space-y-4">
                {[
                  { label: "قاعدة البيانات", status: true },
                  { label: "الذكاء الاصطناعي", status: true },
                  { label: "واجهة المستخدم", status: true },
                  { label: "نظام التقارير", status: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.status ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                      <span className={`text-xs font-medium ${item.status ? "text-green-400" : "text-red-400"}`}>
                        {item.status ? "يعمل" : "متوقف"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
