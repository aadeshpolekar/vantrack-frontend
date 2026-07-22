import React, { useState, useEffect, useCallback } from "react";
import { Bus, Settings, LogOut, Plus, X, RefreshCw, Trash2, ChevronRight, AlertTriangle, CheckCircle2, Clock, School, Users } from "lucide-react";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
`;

const STATUS_META = {
  active:   { label: "ON ROUTE",  color: "#34D399", bg: "rgba(52,211,153,0.12)", icon: CheckCircle2 },
  expiring: { label: "DUE SOON",  color: "#F5A623", bg: "rgba(245,166,35,0.14)", icon: Clock },
  expired:  { label: "LAPSED",    color: "#F87171", bg: "rgba(248,113,113,0.14)", icon: AlertTriangle },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const end = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((end - now) / 86400000);
}

function SplitDigits({ value }) {
  const str = value === null || value === undefined ? "--" : String(value);
  return (
    <div className="flex gap-0.5">
      {str.split("").map((ch, i) => (
        <span
          key={i}
          className="inline-flex items-center justify-center w-6 h-8 rounded-sm text-[15px] font-bold"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: "#0B1220",
            color: "#F5A623",
            border: "1px solid rgba(245,166,35,0.35)",
            textShadow: "0 0 6px rgba(245,166,35,0.5)",
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-wide uppercase mb-1" style={{ color: "#7A879C" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md px-3 py-2 text-sm outline-none transition-colors";
const inputStyle = {
  background: "#0B1220",
  border: "1px solid #263252",
  color: "#E8ECF4",
};

export default function VanTrack() {
  const [apiBase, setApiBase] = useState(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
  );
  const [showSettings, setShowSettings] = useState(false);

  const [token, setToken] = useState(null);
  const [owner, setOwner] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login | signup
  const [authForm, setAuthForm] = useState({ name: "", vanName: "", email: "", password: "", phone: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);

  const [newSchoolName, setNewSchoolName] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: "", schoolId: "", parentName: "", parentPhone: "", route: "",
    cycleMonths: "1", startDate: new Date().toISOString().slice(0, 10), amount: "",
  });
  const [addStudentError, setAddStudentError] = useState("");

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewForm, setRenewForm] = useState({ cycleMonths: "1", startDate: new Date().toISOString().slice(0, 10), amount: "" });
  const [renewError, setRenewError] = useState("");

  const api = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`${apiBase}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });
      let body = null;
      const text = await res.text();
      try { body = text ? JSON.parse(text) : null; } catch { body = text; }
      if (!res.ok) {
        const msg = (body && body.error) || `Request failed (${res.status})`;
        throw new Error(msg);
      }
      return body;
    },
    [apiBase, token]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [schoolRows, studentRows] = await Promise.all([
        api("/api/schools"),
        api("/api/students"),
      ]);
      setSchools(schoolRows || []);
      setStudents(studentRows || []);
    } catch (err) {
      setLoadError(err.message || "Could not reach the backend");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  async function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        const result = await api("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            name: authForm.name, vanName: authForm.vanName,
            email: authForm.email, password: authForm.password, phone: authForm.phone,
          }),
        });
        setToken(result.token);
        setOwner(result.owner);
      } else {
        const result = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: authForm.email, password: authForm.password }),
        });
        setToken(result.token);
        setOwner(result.owner);
      }
    } catch (err) {
      setAuthError(err.message || "Something went wrong");
    } finally {
      setAuthLoading(false);
    }
  }

  function logOut() {
    setToken(null);
    setOwner(null);
    setSchools([]);
    setStudents([]);
    setAuthForm({ name: "", vanName: "", email: "", password: "", phone: "" });
  }

  async function handleAddSchool(e) {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    try {
      await api("/api/schools", { method: "POST", body: JSON.stringify({ name: newSchoolName.trim() }) });
      setNewSchoolName("");
      loadData();
    } catch (err) {
      setLoadError(err.message);
    }
  }

  async function handleAddStudent(e) {
    e.preventDefault();
    setAddStudentError("");
    if (!studentForm.name || !studentForm.schoolId || !studentForm.parentPhone || !studentForm.startDate) {
      setAddStudentError("Fill in name, school, parent phone and start date.");
      return;
    }
    try {
      await api("/api/students", {
        method: "POST",
        body: JSON.stringify({
          name: studentForm.name,
          schoolId: Number(studentForm.schoolId),
          parentName: studentForm.parentName || undefined,
          parentPhone: studentForm.parentPhone,
          route: studentForm.route || undefined,
          cycleMonths: Number(studentForm.cycleMonths),
          startDate: studentForm.startDate,
          amount: studentForm.amount ? Number(studentForm.amount) : undefined,
        }),
      });
      setShowAddStudent(false);
      setStudentForm({
        name: "", schoolId: "", parentName: "", parentPhone: "", route: "",
        cycleMonths: "1", startDate: new Date().toISOString().slice(0, 10), amount: "",
      });
      loadData();
    } catch (err) {
      setAddStudentError(err.message);
    }
  }

  async function handleRenew(e) {
    e.preventDefault();
    setRenewError("");
    try {
      await api(`/api/students/${renewTarget.id}/payments`, {
        method: "POST",
        body: JSON.stringify({
          cycleMonths: Number(renewForm.cycleMonths),
          startDate: renewForm.startDate,
          amount: renewForm.amount ? Number(renewForm.amount) : undefined,
        }),
      });
      setRenewTarget(null);
      loadData();
    } catch (err) {
      setRenewError(err.message);
    }
  }

  async function handleDelete(student) {
    if (!window.confirm(`Remove ${student.name} from the roster?`)) return;
    try {
      await api(`/api/students/${student.id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      setLoadError(err.message);
    }
  }

  const bg = "#0B1220";
  const panel = "#131B2E";
  const border = "#232E4A";

  const pageStyle = {
    minHeight: "100vh",
    background: bg,
    color: "#E8ECF4",
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
  };

  // ---------- AUTH SCREEN ----------
  if (!token) {
    return (
      <div style={pageStyle} className="flex items-center justify-center p-4">
        <style>{FONT_IMPORT}</style>
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: "#F5A623" }}>
              <Bus size={18} color="#0B1220" />
            </div>
            <span className="text-xl font-bold tracking-tight">VanTrack</span>
          </div>

          <div className="rounded-lg p-5" style={{ background: panel, border: `1px solid ${border}` }}>
            <div className="flex mb-4 rounded-md overflow-hidden" style={{ border: `1px solid ${border}` }}>
              <button
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className="flex-1 py-2 text-sm font-medium transition-colors"
                style={{ background: authMode === "login" ? "#1B2440" : "transparent", color: authMode === "login" ? "#F5A623" : "#7A879C" }}
              >
                Log in
              </button>
              <button
                onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                className="flex-1 py-2 text-sm font-medium transition-colors"
                style={{ background: authMode === "signup" ? "#1B2440" : "transparent", color: authMode === "signup" ? "#F5A623" : "#7A879C" }}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-3">
              {authMode === "signup" && (
                <>
                  <Field label="Your name">
                    <input className={inputCls} style={inputStyle} value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
                  </Field>
                  <Field label="Van name">
                    <input className={inputCls} style={inputStyle} value={authForm.vanName}
                      onChange={(e) => setAuthForm({ ...authForm, vanName: e.target.value })} required />
                  </Field>
                </>
              )}
              <Field label="Email">
                <input type="email" className={inputCls} style={inputStyle} value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
              </Field>
              <Field label="Password">
                <input type="password" className={inputCls} style={inputStyle} value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
              </Field>
              {authMode === "signup" && (
                <Field label="Phone (optional)">
                  <input className={inputCls} style={inputStyle} value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} />
                </Field>
              )}

              {authError && (
                <div className="text-sm rounded-md px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}>
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: "#F5A623", color: "#0B1220" }}
              >
                {authLoading ? "Please wait…" : authMode === "signup" ? "Create account" : "Log in"}
                <ChevronRight size={15} />
              </button>
            </form>
          </div>

          <button
            onClick={() => setShowSettings((s) => !s)}
            className="mt-4 mx-auto flex items-center gap-1.5 text-xs"
            style={{ color: "#7A879C" }}
          >
            <Settings size={13} /> API: {apiBase}
          </button>
          {showSettings && (
            <div className="mt-2 rounded-md p-3" style={{ background: panel, border: `1px solid ${border}` }}>
              <Field label="Backend API base URL">
                <input className={inputCls} style={inputStyle} value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)} placeholder="https://your-app.up.railway.app" />
              </Field>
              <p className="text-[11px] mt-2" style={{ color: "#7A879C" }}>
                This is the URL Railway (or your host) gave you when you deployed the backend.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- DASHBOARD ----------
  const counts = students.reduce(
    (acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; },
    { active: 0, expiring: 0, expired: 0 }
  );

  return (
    <div style={pageStyle}>
      <style>{FONT_IMPORT}</style>

      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: bg, borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "#F5A623" }}>
            <Bus size={16} color="#0B1220" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">{owner?.van_name || "VanTrack"}</div>
            <div className="text-[11px] leading-tight" style={{ color: "#7A879C" }}>{owner?.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={loadData} className="p-2 rounded-md" style={{ color: "#7A879C" }} title="Refresh">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowSettings((s) => !s)} className="p-2 rounded-md" style={{ color: "#7A879C" }} title="Settings">
            <Settings size={16} />
          </button>
          <button onClick={logOut} className="p-2 rounded-md" style={{ color: "#7A879C" }} title="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${border}` }}>
          <Field label="Backend API base URL">
            <input className={inputCls} style={inputStyle} value={apiBase}
              onChange={(e) => setApiBase(e.target.value)} />
          </Field>
        </div>
      )}

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Status summary */}
        <div className="grid grid-cols-3 gap-2">
          {["active", "expiring", "expired"].map((key) => {
            const meta = STATUS_META[key];
            const Icon = meta.icon;
            return (
              <div key={key} className="rounded-lg p-3" style={{ background: panel, border: `1px solid ${border}` }}>
                <Icon size={15} color={meta.color} />
                <div className="text-2xl font-bold mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {counts[key] || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: "#7A879C" }}>{meta.label}</div>
              </div>
            );
          })}
        </div>

        {loadError && (
          <div className="text-sm rounded-md px-3 py-2 flex items-center justify-between" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}>
            <span>{loadError}</span>
            <button onClick={loadData} className="underline">retry</button>
          </div>
        )}

        {/* Schools */}
        <div className="rounded-lg p-4" style={{ background: panel, border: `1px solid ${border}` }}>
          <div className="flex items-center gap-2 mb-3">
            <School size={15} color="#7A879C" />
            <span className="text-sm font-semibold">Schools</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {schools.length === 0 && <span className="text-xs" style={{ color: "#7A879C" }}>No schools yet — add one below.</span>}
            {schools.map((s) => (
              <span key={s.id} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#1B2440", border: `1px solid ${border}` }}>
                {s.name}
              </span>
            ))}
          </div>
          <form onSubmit={handleAddSchool} className="flex gap-2">
            <input
              className={inputCls} style={inputStyle}
              placeholder="e.g. St. Xavier's High School"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
            />
            <button type="submit" className="rounded-md px-3 text-sm font-medium shrink-0" style={{ background: "#1B2440", color: "#F5A623", border: `1px solid ${border}` }}>
              Add
            </button>
          </form>
        </div>

        {/* Students */}
        <div className="rounded-lg p-4" style={{ background: panel, border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={15} color="#7A879C" />
              <span className="text-sm font-semibold">Roster</span>
            </div>
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-1 text-xs font-medium rounded-md px-2.5 py-1.5"
              style={{ background: "#F5A623", color: "#0B1220" }}
            >
              <Plus size={13} /> Add student
            </button>
          </div>

          {students.length === 0 && !loading && (
            <div className="text-sm text-center py-8" style={{ color: "#7A879C" }}>
              No students on the roster yet.
            </div>
          )}

          <div className="space-y-2">
            {students.map((s) => {
              const meta = STATUS_META[s.status] || STATUS_META.active;
              const d = daysUntil(s.end_date);
              return (
                <div key={s.id} className="rounded-md p-3 flex items-center justify-between gap-3" style={{ background: "#0F1626", border: `1px solid ${border}` }}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{s.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-[11px] truncate mt-0.5" style={{ color: "#7A879C" }}>
                      {s.school_name} {s.route ? `· ${s.route}` : ""} · {s.parent_phone}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <SplitDigits value={d === null ? "--" : Math.abs(d)} />
                      <div className="text-[9px] uppercase mt-0.5" style={{ color: "#7A879C" }}>
                        {d === null ? "no data" : d < 0 ? "days over" : "days left"}
                      </div>
                    </div>
                    <button
                      onClick={() => { setRenewTarget(s); setRenewForm({ cycleMonths: "1", startDate: new Date().toISOString().slice(0, 10), amount: "" }); }}
                      className="p-2 rounded-md" style={{ background: "#1B2440", color: "#F5A623" }} title="Renew"
                    >
                      <RefreshCw size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="p-2 rounded-md" style={{ background: "#1B2440", color: "#F87171" }} title="Remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Add student modal */}
      {showAddStudent && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-20" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-sm rounded-lg p-4" style={{ background: panel, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Add student</span>
              <button onClick={() => setShowAddStudent(false)}><X size={16} color="#7A879C" /></button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-3">
              <Field label="Student name">
                <input className={inputCls} style={inputStyle} value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} required />
              </Field>
              <Field label="School">
                <select className={inputCls} style={inputStyle} value={studentForm.schoolId}
                  onChange={(e) => setStudentForm({ ...studentForm, schoolId: e.target.value })} required>
                  <option value="">Select school…</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Parent name">
                  <input className={inputCls} style={inputStyle} value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })} />
                </Field>
                <Field label="Parent phone">
                  <input className={inputCls} style={inputStyle} value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })} required />
                </Field>
              </div>
              <Field label="Route (optional)">
                <input className={inputCls} style={inputStyle} value={studentForm.route}
                  onChange={(e) => setStudentForm({ ...studentForm, route: e.target.value })} />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Cycle">
                  <select className={inputCls} style={inputStyle} value={studentForm.cycleMonths}
                    onChange={(e) => setStudentForm({ ...studentForm, cycleMonths: e.target.value })}>
                    <option value="1">1 mo</option>
                    <option value="2">2 mo</option>
                    <option value="3">3 mo</option>
                  </select>
                </Field>
                <Field label="Start date">
                  <input type="date" className={inputCls} style={inputStyle} value={studentForm.startDate}
                    onChange={(e) => setStudentForm({ ...studentForm, startDate: e.target.value })} required />
                </Field>
                <Field label="Amount">
                  <input type="number" className={inputCls} style={inputStyle} value={studentForm.amount}
                    onChange={(e) => setStudentForm({ ...studentForm, amount: e.target.value })} />
                </Field>
              </div>

              {addStudentError && (
                <div className="text-sm rounded-md px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}>
                  {addStudentError}
                </div>
              )}

              <button type="submit" className="w-full rounded-md py-2 text-sm font-semibold" style={{ background: "#F5A623", color: "#0B1220" }}>
                Add to roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Renew payment modal */}
      {renewTarget && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-20" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-sm rounded-lg p-4" style={{ background: panel, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Renew — {renewTarget.name}</span>
              <button onClick={() => setRenewTarget(null)}><X size={16} color="#7A879C" /></button>
            </div>
            <form onSubmit={handleRenew} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Field label="Cycle">
                  <select className={inputCls} style={inputStyle} value={renewForm.cycleMonths}
                    onChange={(e) => setRenewForm({ ...renewForm, cycleMonths: e.target.value })}>
                    <option value="1">1 mo</option>
                    <option value="2">2 mo</option>
                    <option value="3">3 mo</option>
                  </select>
                </Field>
                <Field label="Start date">
                  <input type="date" className={inputCls} style={inputStyle} value={renewForm.startDate}
                    onChange={(e) => setRenewForm({ ...renewForm, startDate: e.target.value })} required />
                </Field>
                <Field label="Amount">
                  <input type="number" className={inputCls} style={inputStyle} value={renewForm.amount}
                    onChange={(e) => setRenewForm({ ...renewForm, amount: e.target.value })} />
                </Field>
              </div>

              {renewError && (
                <div className="text-sm rounded-md px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}>
                  {renewError}
                </div>
              )}

              <button type="submit" className="w-full rounded-md py-2 text-sm font-semibold" style={{ background: "#F5A623", color: "#0B1220" }}>
                Record payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
