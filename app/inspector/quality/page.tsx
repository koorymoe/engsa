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

interface ChecklistItem {
  id: string;
  title: string;
  status: "pass" | "fail" | "na" | "pending";
  notes: string;
}

const defaultChecklist: ChecklistItem[] = [
  { id: "1", title: "مطابقة مواد البناء للمواصفات المعتمدة", status: "pending", notes: "" },
  { id: "2", title: "سلامة العمال وارتداء معدات الوقاية الشخصية", status: "pending", notes: "" },
  { id: "3", title: "جودة أعمال الخرسانة والصب", status: "pending", notes: "" },
  { id: "4", title: "مطابقة أعمال الحديد والتسليح", status: "pending", notes: "" },
  { id: "5", title: "مطابقة أبعاد الأعمدة والجدران للمخططات", status: "pending", notes: "" },
  { id: "6", title: "جودة التشطيبات والملمس", status: "pending", notes: "" },
  { id: "7", title: "سلامة أعمال العزل المائي والحراري", status: "pending", notes: "" },
  { id: "8", title: "مطابقة الأنظمة الكهربائية والصحية", status: "pending", notes: "" },
];

const statusOptions = [
  { value: "pass", label: "مطابق ✅", class: "badge-success" },
  { value: "fail", label: "غير مطابق ❌", class: "badge-error" },
  { value: "na", label: "لا ينطبق ➖", class: "badge-warning" },
  { value: "pending", label: "لم يُفحص 🔍", class: "badge-info" },
];

export default function QualityPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [overallNotes, setOverallNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("alamani_user");
      if (!stored) { router.push("/"); return; }
      const u = JSON.parse(stored);
      setUser(u);
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    supabase.from("projects").select("id, name").then(({ data }) => setProjects(data || []));
  }, [user]);

  const updateItem = (id: string, field: string, value: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calcOverallStatus = () => {
    const statuses = checklist.map(i => i.status);
    if (statuses.some(s => s === "fail")) return "failed";
    if (statuses.every(s => s === "pass" || s === "na")) return "passed";
    if (statuses.some(s => s === "pending")) return "pending";
    return "needs_revision";
  };

  const passCount = checklist.filter(i => i.status === "pass").length;
  const failCount = checklist.filter(i => i.status === "fail").length;
  const naCount = checklist.filter(i => i.status === "na").length;
  const pendingCount = checklist.filter(i => i.status === "pending").length;

  const handleSubmit = async () => {
    if (!user || !selectedProject) return;
    setSaving(true);
    try {
      await supabase.from("quality_reports").insert({
        project_id: selectedProject,
        inspector_id: user.id,
        checklist,
        overall_status: calcOverallStatus(),
        notes: overallNotes,
      });
      setSaved(true);
      setChecklist(defaultChecklist);
      setOverallNotes("");
      setSelectedProject("");
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const overallStatus = calcOverallStatus();
  const statusColors: Record<string, string> = {
    passed: "text-green-400",
    failed: "text-red-400",
    pending: "text-alamani-gold",
    needs_revision: "text-yellow-400",
  };
  const statusAr: Record<string, string> = {
    passed: "ناجح",
    failed: "غير ناجح",
    pending: "قيد الفحص",
    needs_revision: "يحتاج مراجعة",
  };

  return (
    <div className="flex min-h-screen bg-navy-pattern">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} title="تقارير الجودة" />
        <main className="flex-1 p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white">إنشاء تقرير جودة</h2>
            <p className="text-gray-500 text-sm mt-0.5">فحص الموقع والتحقق من مطابقة معايير الجودة</p>
          </div>

          {saved && (
            <div className="badge-success rounded-xl p-4 text-center font-semibold animate-fade-in">
              ✅ تم حفظ تقرير الجودة بنجاح!
            </div>
          )}

          {/* Project Selection & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 glass-card p-4">
              <label className="block text-gray-400 text-sm mb-2">اختر المشروع *</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-alamani-gold"
              >
                <option value="">-- اختر مشروعاً --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {[
              { label: "مطابق", count: passCount, color: "text-green-400" },
              { label: "غير مطابق", count: failCount, color: "text-red-400" },
              { label: "لم يُفحص", count: pendingCount, color: "text-alamani-gold" },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className={`text-3xl font-black ${stat.color}`}>{stat.count}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Checklist */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-alamani-gold">قائمة الفحص ({checklist.length} عنصر)</h3>
              <div className={`font-bold text-lg ${statusColors[overallStatus]}`}>
                الحالة العامة: {statusAr[overallStatus]}
              </div>
            </div>
            <div className="space-y-3">
              {checklist.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.status === "pass" ? "border-green-500/20 bg-green-500/5" :
                    item.status === "fail" ? "border-red-500/20 bg-red-500/5" :
                    item.status === "na" ? "border-yellow-500/20 bg-yellow-500/5" :
                    "border-white/5 bg-white/2"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-alamani-gold/10 border border-alamani-gold/20 flex items-center justify-center text-alamani-gold text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white mb-3">{item.title}</div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex gap-2 flex-wrap">
                          {statusOptions.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => updateItem(item.id, "status", opt.value)}
                              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
                                item.status === opt.value
                                  ? opt.class + " scale-105"
                                  : "border-white/10 text-gray-500 hover:text-gray-300"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <input
                          value={item.notes}
                          onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                          placeholder="ملاحظات..."
                          className="flex-1 min-w-32 bg-alamani-navy/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-alamani-gold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Submit */}
          <div className="glass-card p-6">
            <label className="block text-gray-400 text-sm mb-2">ملاحظات عامة</label>
            <textarea
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="أدخل ملاحظاتك العامة حول فحص الموقع..."
              rows={3}
              className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold resize-none mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedProject || saving}
                className="btn-gold px-8 py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "جارٍ الحفظ..." : "حفظ تقرير الجودة"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
