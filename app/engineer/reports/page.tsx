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
}

interface Report {
  id: string;
  project_id: string;
  notes: string;
  status: "in_progress" | "completed" | "paused";
  created_at: string;
}

const statusLabels: Record<string, { label: string; class: string }> = {
  in_progress: { label: "قيد التنفيذ", class: "badge-warning" },
  completed: { label: "مكتمل", class: "badge-success" },
  paused: { label: "موقوف", class: "badge-error" },
};

export default function EngineerReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ project_id: "", notes: "", status: "in_progress" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("alamani_user");
      if (!stored) { router.push("/"); return; }
      setUser(JSON.parse(stored));
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("projects").select("id, name"),
      supabase.from("execution_reports").select("*").eq("engineer_id", user.id).order("created_at", { ascending: false }),
    ]).then(([p, r]) => {
      setProjects(p.data || []);
      setReports(r.data || []);
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("execution_reports").insert({ ...formData, engineer_id: user.id });
      setFormData({ project_id: "", notes: "", status: "in_progress" });
      setShowForm(false);
      const { data } = await supabase.from("execution_reports").select("*").eq("engineer_id", user.id).order("created_at", { ascending: false });
      setReports(data || []);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-navy-pattern">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} title="تقارير التنفيذ" />
        <main className="flex-1 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">تقارير التنفيذ</h2>
              <p className="text-gray-500 text-sm">تسجيل ومتابعة أعمال التنفيذ الميداني</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <span>+</span><span>تقرير جديد</span>
            </button>
          </div>

          {showForm && (
            <div className="glass-card p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-alamani-gold mb-4">إضافة تقرير تنفيذ</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">المشروع *</label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      required
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-alamani-gold"
                    >
                      <option value="">-- اختر مشروعاً --</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">حالة التنفيذ</label>
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
                  <label className="block text-gray-400 text-sm mb-1">ملاحظات التنفيذ *</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أدخل تفاصيل الأعمال المنفذة اليوم..."
                    required
                    rows={4}
                    className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-navy px-4 py-2 rounded-lg text-sm">إلغاء</button>
                  <button type="submit" disabled={saving} className="btn-gold px-6 py-2 rounded-lg text-sm disabled:opacity-50">
                    {saving ? "جارٍ الحفظ..." : "حفظ التقرير"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-card overflow-hidden">
            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-500">لا توجد تقارير تنفيذ بعد</p>
              </div>
            ) : (
              <table className="alamani-table">
                <thead>
                  <tr>
                    <th>المشروع</th>
                    <th>الحالة</th>
                    <th>الملاحظات</th>
                    <th>تاريخ التقرير</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => {
                    const project = projects.find(p => p.id === r.project_id);
                    const st = statusLabels[r.status];
                    return (
                      <tr key={r.id}>
                        <td className="font-semibold text-white">{project?.name || "—"}</td>
                        <td>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.class}`}>{st.label}</span>
                        </td>
                        <td className="max-w-xs">
                          <div className="truncate text-gray-400 text-sm">{r.notes}</div>
                        </td>
                        <td className="text-gray-500 text-sm">{new Date(r.created_at).toLocaleDateString("ar-SA")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
