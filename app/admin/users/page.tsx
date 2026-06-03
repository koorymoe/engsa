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
  created_at: string;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "designer" | "engineer" | "inspector";
}

const roleLabels: Record<string, string> = {
  admin: "مدير النظام",
  designer: "المصمم",
  engineer: "المهندس التنفيذي",
  inspector: "مفتش الجودة",
};

const roleColors: Record<string, string> = {
  admin: "badge-error",
  designer: "badge-info",
  engineer: "badge-warning",
  inspector: "badge-success",
};

export default function UsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "designer" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("alamani_user");
      if (!stored) { router.push("/"); return; }
      const u = JSON.parse(stored);
      if (u.role !== "admin") { router.push("/dashboard"); return; }
      setCurrentUser(u);
    }
  }, [router]);

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { if (currentUser) fetchUsers(); }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supabase.from("users").insert(formData);
      setFormData({ name: "", email: "", role: "designer" });
      setShowForm(false);
      fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    await supabase.from("users").delete().eq("id", id);
    fetchUsers();
  };

  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-navy-pattern">
      <Sidebar user={currentUser} />
      <div className="flex-1 flex flex-col">
        <Header user={currentUser} title="إدارة المستخدمين" />
        <main className="flex-1 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">إدارة المستخدمين</h2>
              <p className="text-gray-500 text-sm">إضافة وإدارة مستخدمي النظام</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <span>+</span><span>إضافة مستخدم</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {Object.entries(roleLabels).map(([role, label]) => (
              <div key={role} className="glass-card p-4 text-center">
                <div className="text-2xl font-black text-alamani-gold">
                  {users.filter(u => u.role === role).length}
                </div>
                <div className="text-gray-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="glass-card p-6 animate-slide-up">
              <h3 className="text-lg font-bold text-alamani-gold mb-4">إضافة مستخدم جديد</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">الاسم *</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="الاسم الكامل"
                      required
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@alamani.sa"
                      required
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-alamani-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">الدور *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-alamani-navy border border-alamani-gold/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-alamani-gold"
                    >
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-navy px-4 py-2 rounded-lg text-sm">إلغاء</button>
                  <button type="submit" disabled={saving} className="btn-gold px-6 py-2 rounded-lg text-sm disabled:opacity-50">
                    {saving ? "جارٍ الحفظ..." : "إضافة المستخدم"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-12 rounded" />)}</div>
            ) : (
              <table className="alamani-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>البريد الإلكتروني</th>
                    <th>الدور</th>
                    <th>تاريخ الإضافة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-alamani-gold/20 border border-alamani-gold/30 flex items-center justify-center text-alamani-gold font-bold text-sm">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="text-gray-400">{u.email}</td>
                      <td>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColors[u.role]}`}>
                          {roleLabels[u.role]}
                        </span>
                      </td>
                      <td className="text-gray-500 text-sm">{new Date(u.created_at).toLocaleDateString("ar-SA")}</td>
                      <td>
                        {u.id !== currentUser.id && (
                          <button onClick={() => handleDelete(u.id)} className="bg-red-500/10 text-red-400 border border-red-400/20 px-3 py-1 rounded text-xs hover:bg-red-500/20 transition-colors">
                            حذف
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
