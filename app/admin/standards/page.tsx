"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AIChat from "@/components/AIChat";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "designer" | "engineer" | "inspector";
}

interface Standard {
  id: string;
  main_title: string;
  sub_title: string;
  details: string;
  created_at: string;
}

export default function StandardsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAI, setShowAI] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    main_title: "",
    sub_title: "",
    details: "",
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

  const fetchStandards = async () => {
    const { data } = await supabase.from("standards").select("*").order("created_at", { ascending: false });
    setStandards(data || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchStandards(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (editingId) {
        await supabase.from("standards").update(formData).eq("id", editingId);
      } else {
        await supabase.from("standards").insert({ ...formData, created_by: user.id });
      }
      setFormData({ main_title: "", sub_title: "", details: "" });
      setShowForm(false);
      setEditingId(null);
      fetchStandards();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: Standard) => {
    setFormData({ main_title: s.main_title, sub_title: s.sub_title, details: s.details });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المعيار؟")) return;
    await supabase.from("standards").delete().eq("id", id);
    fetchStandards();
  };

  const handleAIExtract = (data: { main_title: string; sub_title: string; details: string }) => {
    setFormData(data);
    setShowForm(true);
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-navy-pattern">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <Header user={user} title="معايير الجودة" />
        <main className="flex-1 p-6">
          <div className="flex gap-6 h-full">
            {/* Standards List & Form */}
            <div className="flex-1 space-y-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">معايير الجودة</h2>
                  <p className="text-gray-500 text-sm mt-0.5">إدارة معايير جودة الأعمال الإنشائية</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAI(!showAI)}
                    className="btn-navy px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <span>🤖</span>
                    <span>{showAI ? "إخفاء" : "إظهار"} المساعد</span>
                  </button>
                  <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ main_title: "", sub_title: "", details: "" }); }}
                    className="btn-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <span>+</span>
                    <span>إضافة معيار</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              {showForm && (
                <div className="glass-card p-6 animate-slide-up">
                  <h3 className="text-lg font-bold text-alamani-gold mb-4">
                    {editingId ? "تعديل المعيار" : "إضافة معيار جديد"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">العنوان الرئيسي *</label>
                        <input
                          value={formData.main_title}
                          onChange={(e) => setFormData({ ...formData, main_title: e.target.value })}
                          placeholder="مثال: معيار الخرسانة"
                          required
                          className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">العنوان الفرعي *</label>
                        <input
                          value={formData.sub_title}
                          onChange={(e) => setFormData({ ...formData, sub_title: e.target.value })}
                          placeholder="مثال: الخرسانة الإنشائية"
                          required
                          className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">التفاصيل والمتطلبات *</label>
                      <textarea
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        placeholder="أدخل تفاصيل المعيار والمتطلبات الفنية..."
                        required
                        rows={5}
                        className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold resize-none"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button type="button" onClick={() => setShowForm(false)} className="btn-navy px-4 py-2 rounded-lg text-sm">
                        إلغاء
                      </button>
                      <button type="submit" disabled={saving} className="btn-gold px-6 py-2 rounded-lg text-sm disabled:opacity-50">
                        {saving ? "جارٍ الحفظ..." : editingId ? "تحديث" : "حفظ المعيار"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Standards Table */}
              <div className="glass-card overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center text-gray-500">
                    <div className="shimmer h-8 rounded mb-3" />
                    <div className="shimmer h-8 rounded mb-3" />
                    <div className="shimmer h-8 rounded" />
                  </div>
                ) : standards.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-gray-500 font-medium">لا توجد معايير مسجلة بعد</p>
                    <p className="text-gray-600 text-sm mt-1">استخدم المساعد الذكي لإنشاء معايير الجودة</p>
                  </div>
                ) : (
                  <table className="alamani-table">
                    <thead>
                      <tr>
                        <th>العنوان الرئيسي</th>
                        <th>العنوان الفرعي</th>
                        <th>التفاصيل</th>
                        <th>تاريخ الإنشاء</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standards.map((s) => (
                        <tr key={s.id}>
                          <td className="font-semibold text-white">{s.main_title}</td>
                          <td className="text-alamani-gold">{s.sub_title}</td>
                          <td className="max-w-xs">
                            <div className="truncate text-gray-400 text-sm">{s.details}</div>
                          </td>
                          <td className="text-gray-500 text-sm">
                            {new Date(s.created_at).toLocaleDateString("ar-SA")}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button onClick={() => handleEdit(s)} className="btn-navy px-3 py-1 rounded text-xs">
                                تعديل
                              </button>
                              <button onClick={() => handleDelete(s.id)} className="bg-red-500/10 text-red-400 border border-red-400/20 px-3 py-1 rounded text-xs hover:bg-red-500/20 transition-colors">
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* AI Chat Panel */}
            {showAI && (
              <div className="w-96 glass-card flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
                <div className="p-4 border-b border-alamani-gold/10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-alamani-gold/15 border border-alamani-gold/30 flex items-center justify-center text-xl">
                    🤖
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">مساعد الذكاء الاصطناعي</div>
                    <div className="text-xs text-green-400">متصل</div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <AIChat
                    context="أنت تساعد في إنشاء معايير الجودة لشركة الاماني. عند اقتراح معيار، قدمه بشكل منظم مع: العنوان الرئيسي، العنوان الفرعي، والتفاصيل الكاملة."
                    placeholder="اسألني عن معايير الجودة..."
                    onStandardExtracted={handleAIExtract}
                  />
                </div>
                {standards.length > 0 && (
                  <div className="p-3 border-t border-alamani-gold/10 bg-alamani-gold/5">
                    <p className="text-xs text-gray-500 text-center">
                      💡 يمكنني مساعدتك في إنشاء معايير جديدة بشكل تلقائي
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
