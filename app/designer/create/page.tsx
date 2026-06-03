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

interface Standard { id: string; main_title: string; sub_title: string; }
interface Material { id: string; name: string; quality_grade: string; }

export default function DesignerCreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<{ id: string; quantity: string; unit: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

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
      supabase.from("standards").select("id, main_title, sub_title"),
      supabase.from("materials").select("id, name, quality_grade"),
    ]).then(([s, m]) => {
      setStandards(s.data || []);
      setMaterials(m.data || []);
    });
  }, [user]);

  const toggleStandard = (id: string) => {
    setSelectedStandards(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterials(prev =>
      prev.find(m => m.id === id)
        ? prev.filter(m => m.id !== id)
        : [...prev, { id, quantity: "1", unit: "طن" }]
    );
  };

  const updateMaterial = (id: string, field: string, value: string) => {
    setSelectedMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { data: project } = await supabase
        .from("projects")
        .insert({ ...formData, designer_id: user.id, status: "planning" })
        .select()
        .single();

      if (project) {
        if (selectedStandards.length > 0) {
          await supabase.from("project_standards").insert(
            selectedStandards.map(std_id => ({ project_id: project.id, standard_id: std_id }))
          );
        }
        if (selectedMaterials.length > 0) {
          await supabase.from("project_materials").insert(
            selectedMaterials.map(m => ({
              project_id: project.id,
              material_id: m.id,
              quantity: parseFloat(m.quantity) || 1,
              unit: m.unit,
            }))
          );
        }
        setSaved(true);
        setTimeout(() => router.push("/projects"), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-navy-pattern">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} title="إنشاء مشروع" />
        <main className="flex-1 p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white">إنشاء مشروع جديد</h2>
            <p className="text-gray-500 text-sm">حدد المعايير والمواد المطلوبة للمشروع</p>
          </div>

          {saved && (
            <div className="badge-success rounded-xl p-4 text-center font-semibold animate-fade-in">
              ✅ تم إنشاء المشروع بنجاح! جارٍ التحويل...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-alamani-gold mb-4">تفاصيل المشروع</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">اسم المشروع *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: مجمع سكني - حي النرجس"
                    required
                    className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">وصف المشروع *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف تفصيلي للمشروع والأعمال المطلوبة..."
                    required
                    rows={3}
                    className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Standards Selection */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-alamani-gold mb-1">معايير الجودة المطلوبة</h3>
                <p className="text-gray-500 text-xs mb-4">اختر المعايير التي تنطبق على هذا المشروع</p>
                {standards.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-4">لا توجد معايير مسجلة</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {standards.map(s => (
                      <label key={s.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedStandards.includes(s.id) ? "bg-alamani-gold/10 border border-alamani-gold/30" : "border border-white/5 hover:border-white/20"}`}>
                        <input
                          type="checkbox"
                          checked={selectedStandards.includes(s.id)}
                          onChange={() => toggleStandard(s.id)}
                          className="accent-alamani-gold"
                        />
                        <div>
                          <div className="text-white text-sm font-medium">{s.main_title}</div>
                          <div className="text-gray-500 text-xs">{s.sub_title}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <div className="mt-3 text-xs text-alamani-gold/60">
                  تم اختيار {selectedStandards.length} معيار
                </div>
              </div>

              {/* Materials Selection */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-alamani-gold mb-1">المواد المطلوبة</h3>
                <p className="text-gray-500 text-xs mb-4">اختر المواد وحدد الكميات المطلوبة</p>
                {materials.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-4">لا توجد مواد مسجلة</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {materials.map(m => {
                      const selected = selectedMaterials.find(sm => sm.id === m.id);
                      return (
                        <div key={m.id} className={`p-3 rounded-lg transition-all ${selected ? "bg-alamani-gold/10 border border-alamani-gold/30" : "border border-white/5"}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => toggleMaterial(m.id)}
                              className="accent-alamani-gold"
                            />
                            <span className="text-white text-sm font-medium">{m.name}</span>
                            <span className="badge-info text-xs px-2 py-0.5 rounded-full">{m.quality_grade}</span>
                          </div>
                          {selected && (
                            <div className="flex gap-2 pr-6">
                              <input
                                value={selected.quantity}
                                onChange={(e) => updateMaterial(m.id, "quantity", e.target.value)}
                                placeholder="الكمية"
                                type="number"
                                min="0"
                                className="w-24 bg-alamani-navy border border-alamani-gold/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-alamani-gold"
                              />
                              <input
                                value={selected.unit}
                                onChange={(e) => updateMaterial(m.id, "unit", e.target.value)}
                                placeholder="الوحدة"
                                className="flex-1 bg-alamani-navy border border-alamani-gold/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-alamani-gold"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-3 text-xs text-alamani-gold/60">
                  تم اختيار {selectedMaterials.length} مادة
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => router.push("/projects")} className="btn-navy px-6 py-3 rounded-xl">
                إلغاء
              </button>
              <button type="submit" disabled={saving} className="btn-gold px-8 py-3 rounded-xl font-bold disabled:opacity-50">
                {saving ? "جارٍ الحفظ..." : "إنشاء المشروع"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
