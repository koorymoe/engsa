"use client";

interface User {
  name: string;
  role: string;
}

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  designer: "المصمم",
  engineer: "المهندس التنفيذي",
  inspector: "مفتش الجودة",
};

export default function Header({ user, title }: { user: User; title: string }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 bg-alamani-navy-dark border-b border-alamani-gold/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <div className="w-px h-5 bg-alamani-gold/20" />
        <span className="text-sm text-gray-500">{dateStr}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-alamani-gold/10 border border-alamani-gold/20 rounded-lg px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-alamani-gold font-medium">متصل</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-white">{user.name}</div>
            <div className="text-xs text-alamani-gold/70">{roleLabels[user.role]}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-alamani-gold/20 border border-alamani-gold/40 flex items-center justify-center text-alamani-gold font-bold">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
