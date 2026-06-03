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

interface Project {
  id: string;
  name: string;
  description: string;
  designer_id: string;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  created_at: string;
}

const statusLabels: Record<string, { label: string; class: string }> = {
  planning: { label: "تخطيط", class: "badge-info" },
  in_progress: { label: "قيد التنفيذ", class: "badge-warning" },
  completed: { label: "مكتمل", class: "badge-success" },
  on_hold: { label: "موقوف", class: "badge-error" },
};

export default function ProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", status: "planning" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("alamani_user");
      if (!stored) { router.push("/"); return; }
      setUser(JSON.parse(stored));
    }
  }, [router]);

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchProjects(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("projects").insert({
        ...formData,
        designer_id: user.id,
      });
      setFormData({ name: "", description: "", status: "planning" });
      setShowForm(false);
      fetchProjects();
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("projects").update({ status }).eq("id", id);
    fetchProjects();
  };

  if (!user) return null;

  const canCreate = user.role === "admin" || user.role === "designer";

  return (
    <div className="flex min-h-screen bg-navy-pattern">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} title="المشاريع" />
        <main className="flex-1 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">المشاريع الإنشائية</h2>
              <p className="text-gray-500 text-sm mt-0.5">عرض وإدارة جميع مشاريع الشركة</p>
            </div>
            {canCreate && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <span>+</span>
                <span>مشروع جديد</span>
              </button>
            )}
          </div>

          {showForm && canCreate && (
            <div className="glass-card p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-alamani-gold mb-4">إنشاء مشروع جديد</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">اسم المشروع *</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: برج سكني - حي الملقا"
                      required
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-alamani-gold"
                    >
                      {Object.entries(statusLabels).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">وصف المشروع *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="أدخل وصفاً تفصيلياً للمشروع..."
                    required
                    rows={3}
                    className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-navy px-4 py-2 rounded-lg text-sm">إلغاء</button>
                  <button type="submit" disabled={saving} className="btn-gold px-6 py-2 rounded-lg text-sm disabled:opacity-50">
                    {saving ? "جارٍ الحفظ..." : "إنشاء المشروع"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="glass-card p-6 shimmer h-48" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">🏗️</div>
              <p className="text-gray-500 font-medium">لا توجد مشاريع مسجلة بعد</p>
              {canCreate && <p className="text-gray-600 text-sm mt-1">انقر على "مشروع جديد" لإنشاء أول مشروع</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => {
                const st = statusLabels[project.status];
                return (
                  <div
                    key={project.id}
                    className="glass-card p-6 hover:border-alamani-gold/30 transition-all duration-300 hover:shadow-gold group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-alamani-gold/10 border border-alamani-gold/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        🏗️
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.class}`}>
                        {st.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1 line-clamp-1">{project.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">{project.description}</p>
                    <div className="text-gray-600 text-xs mb-4">
                      {new Date(project.created_at).toLocaleDateString("ar-SA")}
                    </div>
                    {(user.role === "admin" || user.role === "designer") && (
                      <div className="border-t border-white/5 pt-3">
                        <label className="text-xs text-gray-500 block mb-1">تغيير الحالة:</label>
                        <select
                          value={project.status}
                          onChange={(e) => handleStatusChange(project.id, e.target.value)}
                          className="w-full bg-alamani-navy border border-white/10 rounded px-2 py-1.5 text-gray-300 text-xs focus:outline-none focus:border-alamani-gold"
                        >
                          {Object.entries(statusLabels).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
