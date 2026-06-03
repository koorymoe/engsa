"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "designer" | "engineer" | "inspector";
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const roleNav: Record<string, NavItem[]> = {
  admin: [
    { href: "/dashboard", label: "لوحة التحكم", icon: "📊" },
    { href: "/admin/standards", label: "معايير الجودة", icon: "📋" },
    { href: "/admin/materials", label: "المواد والخامات", icon: "🧱" },
    { href: "/admin/users", label: "إدارة المستخدمين", icon: "👥" },
    { href: "/projects", label: "المشاريع", icon: "🏗️" },
  ],
  designer: [
    { href: "/dashboard", label: "لوحة التحكم", icon: "📊" },
    { href: "/projects", label: "المشاريع", icon: "🏗️" },
    { href: "/designer/create", label: "إنشاء مشروع", icon: "✏️" },
  ],
  engineer: [
    { href: "/dashboard", label: "لوحة التحكم", icon: "📊" },
    { href: "/projects", label: "المشاريع", icon: "🏗️" },
    { href: "/engineer/reports", label: "تقارير التنفيذ", icon: "📝" },
  ],
  inspector: [
    { href: "/dashboard", label: "لوحة التحكم", icon: "📊" },
    { href: "/projects", label: "المشاريع", icon: "🏗️" },
    { href: "/inspector/quality", label: "تقارير الجودة", icon: "✅" },
  ],
};

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  designer: "المصمم",
  engineer: "المهندس التنفيذي",
  inspector: "مفتش الجودة",
};

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const navItems = roleNav[user.role] || [];

  return (
    <aside className="w-72 min-h-screen bg-alamani-navy-dark border-l border-alamani-gold/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-alamani-gold/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-alamani-gold/10 border border-alamani-gold/30 flex items-center justify-center text-2xl">
            🏛️
          </div>
          <div>
            <div className="font-black text-lg text-gold-gradient">الاماني</div>
            <div className="text-xs text-gray-500">نظام إدارة الجودة</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 mx-4 my-4 rounded-xl bg-alamani-gold/5 border border-alamani-gold/15">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-alamani-gold/20 border border-alamani-gold/40 flex items-center justify-center text-alamani-gold font-bold text-lg">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm truncate">{user.name}</div>
            <div className="text-xs text-alamani-gold/70">{roleLabels[user.role]}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="text-xs text-gray-600 font-medium mb-3 px-2">القائمة الرئيسية</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "sidebar-active"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`text-xl ${isActive ? "" : "group-hover:scale-110 transition-transform"}`}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-alamani-gold/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
        >
          <span>🚪</span>
          <span className="font-medium text-sm">تسجيل الخروج</span>
        </Link>
      </div>
    </aside>
  );
}
