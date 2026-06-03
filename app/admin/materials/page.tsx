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

interface Material {
  id: string;
  name: string;
  specifications: string;
  manufacturer: string;
  quality_grade: string;
  standard_id: string | null;
  created_at: string;
}

interface Standard {
  id: string;
  main_title: string;
  sub_title: string;
}

const gradeOptions = ["A+", "A", "B+", "B", "C", "ممتاز", "جيد جداً", "جيد", "مقبول"];

export default function MaterialsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    specifications: "",
    manufacturer: "",
    quality_grade: "A",
    standard_id: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("alamani_user");
      if (!stored) { router.push("/"); return; }
      const u = JSON.parse(stored);
      if (u.role !== "admin") { router.push("/dashboard"); return; }
      setUser(u);
    }
  }, [router]);

  const fetchData = async () => {
    const [matRes, stdRes] = await Promise.all([
      supabase.from("materials").select("*").order("created_at", { ascending: false }),
      supabase.from("standards").select("id, main_title, sub_title").order("main_title"),
    ]);
    setMaterials(matRes.data || []);
    setStandards(stdRes.data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        standard_id: formData.standard_id || null,
      };
      if (editingId) {
        await supabase.from("materials").update(payload).eq("id", editingId);
      } else {
        await supabase.from("materials").insert(payload);
      }
      setFormData({ name: "", specifications: "", manufacturer: "", quality_grade: "A", standard_id: "" });
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (m: Material) => {
    setFormData({
      name: m.name,
      specifications: m.specifications,
      manufacturer: m.manufacturer,
      quality_grade: m.quality_grade,
      standard_id: m.standard_id || "",
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المادة؟")) return;
    await supabase.from("materials").delete().eq("id", id);
    fetchData();
  };

  const filtered = materials.filter(
    (m) =>
      m.name.includes(searchTerm) ||
      m.manufacturer.includes(searchTerm) ||
      m.quality_grade.includes(searchTerm)
  );

  const gradeColor: Record<string, string> = {
    "A+": "badge-success",
    A: "badge-success",
    "B+": "badge-info",
    B: "badge-info",
    C: "badge-warning",
    ممتاز: "badge-success",
    "جيد جداً": "badge-success",
    جيد: "badge-info",
    مقبول: "badge-warning",
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-navy-pattern">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} title="المواد والخامات" />
        <main className="flex-1 p-6 space-y-5">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-white">المواد والخامات</h2>
              <p className="text-gray-500 text-sm mt-0.5">إدارة مواد البناء والخامات الإنشائية</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث في المواد..."
                  className="bg-alamani-navy-mid border border-alamani-gold/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-alamani-gold w-48"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">🔍</span>
              </div>
              <button
                onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", specifications: "", manufacturer: "", quality_grade: "A", standard_id: "" }); }}
                className="btn-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <span>+</span>
                <span>إضافة مادة</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "إجمالي المواد", value: materials.length, icon: "🧱" },
              { label: "المواد الممتازة", value: materials.filter(m => ["A+", "ممتاز"].includes(m.quality_grade)).length, icon: "⭐" },
              { label: "الموردون", value: Array.from(new Set(materials.map(m => m.manufacturer))).length, icon: "🏭" },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-4 flex items-center gap-4">
                <span className="text-3xl">{stat.icon}</span>
                <div>
                  <div className="text-2xl font-black text-alamani-gold">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          {showForm && (
            <div className="glass-card p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-alamani-gold mb-4">
                {editingId ? "تعديل المادة" : "إضافة مادة جديدة"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">اسم المادة *</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: حديد تسليح"
                      required
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">الشركة المصنعة *</label>
                    <input
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="مثال: حديد الراجحي"
                      required
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">درجة الجودة *</label>
                    <select
                      value={formData.quality_grade}
                      onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value })}
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-alamani-gold"
                    >
                      {gradeOptions.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">المعيار المرتبط</label>
                    <select
                      value={formData.standard_id}
                      onChange={(e) => setFormData({ ...formData, standard_id: e.target.value })}
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-alamani-gold"
                    >
                      <option value="">-- لا يوجد --</option>
                      {standards.map(s => (
                        <option key={s.id} value={s.id}>{s.main_title} - {s.sub_title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">المواصفات الفنية *</label>
                  <textarea
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    placeholder="أدخل المواصفات الفنية التفصيلية للمادة..."
                    required
                    rows={4}
                    className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-navy px-4 py-2 rounded-lg text-sm">
                    إلغاء
                  </button>
                  <button type="submit" disabled={saving} className="btn-gold px-6 py-2 rounded-lg text-sm disabled:opacity-50">
                    {saving ? "جارٍ الحفظ..." : editingId ? "تحديث" : "حفظ المادة"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Materials Table */}
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">
                {[1,2,3].map(i => <div key={i} className="shimmer h-10 rounded" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">🧱</div>
                <p className="text-gray-500 font-medium">
                  {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مواد مسجلة بعد"}
                </p>
              </div>
            ) : (
              <table className="alamani-table">
                <thead>
                  <tr>
                    <th>اسم المادة</th>
                    <th>الشركة المصنعة</th>
                    <th>درجة الجودة</th>
                    <th>المواصفات</th>
                    <th>المعيار المرتبط</th>
                    <th>تاريخ الإضافة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const relatedStd = standards.find(s => s.id === m.standard_id);
                    return (
                      <tr key={m.id}>
                        <td className="font-semibold text-white">{m.name}</td>
                        <td className="text-gray-300">{m.manufacturer}</td>
                        <td>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${gradeColor[m.quality_grade] || "badge-info"}`}>
                            {m.quality_grade}
                          </span>
                        </td>
                        <td className="max-w-xs">
                          <div className="truncate text-gray-400 text-sm">{m.specifications}</div>
                        </td>
                        <td className="text-alamani-gold text-sm">
                          {relatedStd ? `${relatedStd.main_title}` : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="text-gray-500 text-sm">
                          {new Date(m.created_at).toLocaleDateString("ar-SA")}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(m)} className="btn-navy px-3 py-1 rounded text-xs">تعديل</button>
                            <button onClick={() => handleDelete(m.id)} className="bg-red-500/10 text-red-400 border border-red-400/20 px-3 py-1 rounded text-xs hover:bg-red-500/20 transition-colors">حذف</button>
                          </div>
                        </td>
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
