import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Bus, Settings, LogOut, Plus, X, RefreshCw, Trash2, ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2, Clock, School, Users, Globe, Search as SearchIcon } from "lucide-react";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
`;

const LANG_KEY = "vantrack_lang";
const TOKEN_KEY = "vantrack_token";
const OWNER_KEY = "vantrack_owner";
const PAGE_SIZE = 8;

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
];

const TRANSLATIONS = {
  en: {
    tab_login: "Log in", tab_signup: "Sign up",
    field_yourName: "Your name", field_vanName: "Van name", field_email: "Email",
    field_password: "Password", field_phoneOptional: "Phone (optional)",
    btn_createAccount: "Create account", btn_login: "Log in", btn_pleaseWait: "Please wait…",
    link_forgotPassword: "Forgot password?", heading_resetPassword: "Reset your password",
    text_resetInstructions: "Enter your account email and we'll send you a reset link.",
    btn_sendResetLink: "Send reset link", link_backToLogin: "Back to log in",
    heading_setNewPassword: "Set a new password", field_newPassword: "New password",
    btn_updatePassword: "Update password", label_apiBase: "API:",
    field_backendUrl: "Backend API base URL",
    text_backendUrlHelp: "This is the URL Railway (or your host) gave you when you deployed the backend.",
    text_backendUrlMissing: "Backend URL is not set. Enter it below.",
    status_onRoute: "ON ROUTE", status_dueSoon: "DUE SOON", status_lapsed: "LAPSED",
    heading_schools: "Schools", text_noSchools: "No schools yet — add one below.",
    placeholder_schoolName: "e.g. St. Xavier's High School", btn_add: "Add",
    heading_roster: "Roster", btn_addStudent: "Add student",
    text_noStudents: "No students on the roster yet.",
    text_noResults: "No students match your search or filters.",
    days_noData: "no data", days_over: "days over", days_left: "days left",
    title_renew: "Renew", title_remove: "Remove", title_refresh: "Refresh",
    title_settings: "Settings", title_logout: "Log out", title_language: "Language",
    modal_addStudent: "Add student", field_studentName: "Student name", field_school: "School",
    option_selectSchool: "Select school…", field_parentName: "Parent name",
    field_parentPhone: "Parent phone", field_route: "Route (optional)", field_cycle: "Cycle",
    field_startDate: "Start date", field_amount: "Amount", btn_addToRoster: "Add to roster",
    modal_renew: "Renew", btn_recordPayment: "Record payment",
    heading_confirmRemove: "Remove student?",
    confirm_removeStudent: "Remove {name} from the roster? This cannot be undone.",
    btn_cancel: "Cancel", btn_remove: "Remove",
    error_fillRequired: "Fill in name, school, parent phone and start date.",
    error_invalidEmail: "Enter a valid email address.",
    error_invalidPhone: "Phone number must be 10 digits.",
    error_weakPassword: "Password must be at least 8 characters.",
    text_chooseLanguage: "Choose your language", text_chooseLanguageSub: "You can change this anytime.",
    btn_continue: "Continue",
    placeholder_search: "Search by student or school…",
    filter_all: "All", filter_active: "Active", filter_expiring: "Due soon", filter_expired: "Expired",
    sort_name: "Name", sort_school: "School", sort_days: "Days left",
    label_sort: "Sort by",
    pagination_prev: "Prev", pagination_next: "Next",
    pagination_page: "Page {page} of {total}",
  },
  hi: {
    tab_login: "लॉग इन", tab_signup: "साइन अप",
    field_yourName: "आपका नाम", field_vanName: "वैन का नाम", field_email: "ईमेल",
    field_password: "पासवर्ड", field_phoneOptional: "फ़ोन (वैकल्पिक)",
    btn_createAccount: "खाता बनाएं", btn_login: "लॉग इन", btn_pleaseWait: "कृपया प्रतीक्षा करें…",
    link_forgotPassword: "पासवर्ड भूल गए?", heading_resetPassword: "अपना पासवर्ड रीसेट करें",
    text_resetInstructions: "अपना खाता ईमेल दर्ज करें, हम आपको रीसेट लिंक भेजेंगे।",
    btn_sendResetLink: "रीसेट लिंक भेजें", link_backToLogin: "लॉग इन पर वापस जाएं",
    heading_setNewPassword: "नया पासवर्ड सेट करें", field_newPassword: "नया पासवर्ड",
    btn_updatePassword: "पासवर्ड अपडेट करें", label_apiBase: "API:",
    field_backendUrl: "बैकएंड API बेस URL",
    text_backendUrlHelp: "यह वह URL है जो Railway (या आपकी होस्टिंग सेवा) ने बैकएंड डिप्लॉय करने पर दिया था।",
    text_backendUrlMissing: "बैकएंड URL सेट नहीं है। नीचे दर्ज करें।",
    status_onRoute: "रूट पर", status_dueSoon: "जल्द देय", status_lapsed: "समाप्त",
    heading_schools: "स्कूल", text_noSchools: "अभी तक कोई स्कूल नहीं — नीचे एक जोड़ें।",
    placeholder_schoolName: "जैसे सेंट जेवियर हाई स्कूल", btn_add: "जोड़ें",
    heading_roster: "सूची", btn_addStudent: "छात्र जोड़ें",
    text_noStudents: "सूची में अभी तक कोई छात्र नहीं है।",
    text_noResults: "आपकी खोज या फ़िल्टर से कोई छात्र मेल नहीं खाता।",
    days_noData: "डेटा नहीं", days_over: "दिन बीत गए", days_left: "दिन बाकी",
    title_renew: "नवीनीकरण", title_remove: "हटाएं", title_refresh: "रीफ्रेश",
    title_settings: "सेटिंग्स", title_logout: "लॉग आउट", title_language: "भाषा",
    modal_addStudent: "छात्र जोड़ें", field_studentName: "छात्र का नाम", field_school: "स्कूल",
    option_selectSchool: "स्कूल चुनें…", field_parentName: "माता-पिता का नाम",
    field_parentPhone: "माता-पिता का फ़ोन", field_route: "रूट (वैकल्पिक)", field_cycle: "चक्र",
    field_startDate: "प्रारंभ तिथि", field_amount: "राशि", btn_addToRoster: "सूची में जोड़ें",
    modal_renew: "नवीनीकरण", btn_recordPayment: "भुगतान दर्ज करें",
    heading_confirmRemove: "छात्र हटाएं?",
    confirm_removeStudent: "{name} को सूची से हटाएं? यह पूर्ववत नहीं किया जा सकता।",
    btn_cancel: "रद्द करें", btn_remove: "हटाएं",
    error_fillRequired: "नाम, स्कूल, माता-पिता का फ़ोन और प्रारंभ तिथि भरें।",
    error_invalidEmail: "एक वैध ईमेल पता दर्ज करें।",
    error_invalidPhone: "फ़ोन नंबर 10 अंकों का होना चाहिए।",
    error_weakPassword: "पासवर्ड कम से कम 8 अक्षर का होना चाहिए।",
    text_chooseLanguage: "अपनी भाषा चुनें", text_chooseLanguageSub: "आप इसे कभी भी बदल सकते हैं।",
    btn_continue: "जारी रखें",
    placeholder_search: "छात्र या स्कूल खोजें…",
    filter_all: "सभी", filter_active: "सक्रिय", filter_expiring: "जल्द देय", filter_expired: "समाप्त",
    sort_name: "नाम", sort_school: "स्कूल", sort_days: "बचे दिन",
    label_sort: "क्रमबद्ध करें",
    pagination_prev: "पिछला", pagination_next: "अगला",
    pagination_page: "पृष्ठ {page} / {total}",
  },
  mr: {
    tab_login: "लॉग इन", tab_signup: "साइन अप",
    field_yourName: "तुमचे नाव", field_vanName: "व्हॅनचे नाव", field_email: "ईमेल",
    field_password: "पासवर्ड", field_phoneOptional: "फोन (ऐच्छिक)",
    btn_createAccount: "खाते तयार करा", btn_login: "लॉग इन", btn_pleaseWait: "कृपया थांबा…",
    link_forgotPassword: "पासवर्ड विसरलात?", heading_resetPassword: "तुमचा पासवर्ड रीसेट करा",
    text_resetInstructions: "तुमचा खाते ईमेल टाका, आम्ही तुम्हाला रीसेट लिंक पाठवू.",
    btn_sendResetLink: "रीसेट लिंक पाठवा", link_backToLogin: "लॉग इनकडे परत जा",
    heading_setNewPassword: "नवीन पासवर्ड सेट करा", field_newPassword: "नवीन पासवर्ड",
    btn_updatePassword: "पासवर्ड अपडेट करा", label_apiBase: "API:",
    field_backendUrl: "बॅकएंड API बेस URL",
    text_backendUrlHelp: "बॅकएंड डिप्लॉय केल्यावर Railway (किंवा तुमच्या होस्टने) दिलेला हा URL आहे.",
    text_backendUrlMissing: "बॅकएंड URL सेट केलेला नाही. खाली टाका.",
    status_onRoute: "मार्गावर", status_dueSoon: "लवकरच देय", status_lapsed: "संपले",
    heading_schools: "शाळा", text_noSchools: "अजून शाळा नाही — खाली एक जोडा.",
    placeholder_schoolName: "उदा. सेंट झेवियर हायस्कूल", btn_add: "जोडा",
    heading_roster: "यादी", btn_addStudent: "विद्यार्थी जोडा",
    text_noStudents: "यादीत अजून विद्यार्थी नाहीत.",
    text_noResults: "तुमच्या शोध किंवा फिल्टरशी कोणताही विद्यार्थी जुळत नाही.",
    days_noData: "माहिती नाही", days_over: "दिवस उलटले", days_left: "दिवस शिल्लक",
    title_renew: "नूतनीकरण", title_remove: "काढा", title_refresh: "रिफ्रेश",
    title_settings: "सेटिंग्ज", title_logout: "लॉग आउट", title_language: "भाषा",
    modal_addStudent: "विद्यार्थी जोडा", field_studentName: "विद्यार्थ्याचे नाव", field_school: "शाळा",
    option_selectSchool: "शाळा निवडा…", field_parentName: "पालकांचे नाव",
    field_parentPhone: "पालकांचा फोन", field_route: "मार्ग (ऐच्छिक)", field_cycle: "सायकल",
    field_startDate: "सुरुवात तारीख", field_amount: "रक्कम", btn_addToRoster: "यादीत जोडा",
    modal_renew: "नूतनीकरण", btn_recordPayment: "पेमेंट नोंदवा",
    heading_confirmRemove: "विद्यार्थी काढायचा?",
    confirm_removeStudent: "{name} ला यादीतून काढायचे का? हे पूर्ववत करता येणार नाही.",
    btn_cancel: "रद्द करा", btn_remove: "काढा",
    error_fillRequired: "नाव, शाळा, पालकांचा फोन आणि सुरुवात तारीख भरा.",
    error_invalidEmail: "वैध ईमेल पत्ता टाका.",
    error_invalidPhone: "फोन नंबर 10 अंकी असावा.",
    error_weakPassword: "पासवर्ड किमान 8 अक्षरांचा असावा.",
    text_chooseLanguage: "तुमची भाषा निवडा", text_chooseLanguageSub: "तुम्ही ही कधीही बदलू शकता.",
    btn_continue: "पुढे चला",
    placeholder_search: "विद्यार्थी किंवा शाळा शोधा…",
    filter_all: "सर्व", filter_active: "सक्रिय", filter_expiring: "लवकरच देय", filter_expired: "संपले",
    sort_name: "नाव", sort_school: "शाळा", sort_days: "उरलेले दिवस",
    label_sort: "यानुसार क्रमवारी",
    pagination_prev: "मागील", pagination_next: "पुढील",
    pagination_page: "पृष्ठ {page} / {total}",
  },
};

const STATUS_META_KEYS = {
  active:   { key: "status_onRoute",  color: "#34D399", bg: "rgba(52,211,153,0.12)", icon: CheckCircle2 },
  expiring: { key: "status_dueSoon",  color: "#F5A623", bg: "rgba(245,166,35,0.14)", icon: Clock },
  expired:  { key: "status_lapsed",   color: "#F87171", bg: "rgba(248,113,113,0.14)", icon: AlertTriangle },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const end = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((end - now) / 86400000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone) {
  return /^\d{10}$/.test(phone.replace(/\D/g, ""));
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

function Spinner({ size = 14 }) {
  return <RefreshCw size={size} className="animate-spin" />;
}

const inputCls =
  "w-full rounded-md px-3 py-2 text-sm outline-none transition-colors";
const inputStyle = {
  background: "#0B1220",
  border: "1px solid #263252",
  color: "#E8ECF4",
};

export default function VanTrack() {
  const [apiBase, setApiBase] = useState(import.meta.env.VITE_API_BASE_URL || "");
  const [showSettings, setShowSettings] = useState(false);

  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) || "");
  const [showLangPicker, setShowLangPicker] = useState(false);

  function chooseLanguage(code) {
    localStorage.setItem(LANG_KEY, code);
    setLangState(code);
    setShowLangPicker(false);
  }

  function t(key, vars) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    let str = dict[key] || TRANSLATIONS.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach((k) => { str = str.replace(`{${k}}`, vars[k]); });
    }
    return str;
  }

  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [owner, setOwnerState] = useState(() => {
    const saved = localStorage.getItem(OWNER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  function setSession(newToken, newOwner) {
    if (newToken) localStorage.setItem(TOKEN_KEY, newToken); else localStorage.removeItem(TOKEN_KEY);
    if (newOwner) localStorage.setItem(OWNER_KEY, JSON.stringify(newOwner)); else localStorage.removeItem(OWNER_KEY);
    setTokenState(newToken);
    setOwnerState(newOwner);
  }

  const [authMode, setAuthMode] = useState("login"); // login | signup | forgot | reset
  const [authForm, setAuthForm] = useState({ name: "", vanName: "", email: "", password: "", phone: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [resetToken, setResetToken] = useState(
    new URLSearchParams(window.location.search).get("reset_token") || ""
  );
  const [resetPassword, setResetPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => {
    if (resetToken) setAuthMode("reset");
  }, [resetToken]);

  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);

  const [newSchoolName, setNewSchoolName] = useState("");
  const [addSchoolLoading, setAddSchoolLoading] = useState(false);

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: "", schoolId: "", parentName: "", parentPhone: "", route: "",
    cycleMonths: "1", startDate: new Date().toISOString().slice(0, 10), amount: "",
  });
  const [addStudentError, setAddStudentError] = useState("");
  const [addStudentLoading, setAddStudentLoading] = useState(false);

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewForm, setRenewForm] = useState({ cycleMonths: "1", startDate: new Date().toISOString().slice(0, 10), amount: "" });
  const [renewError, setRenewError] = useState("");
  const [renewLoading, setRenewLoading] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);

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

    if (!isValidEmail(authForm.email)) {
      setAuthError(t("error_invalidEmail"));
      return;
    }
    if (authForm.password.length < 8) {
      setAuthError(t("error_weakPassword"));
      return;
    }
    if (authMode === "signup" && authForm.phone && !isValidPhone(authForm.phone)) {
      setAuthError(t("error_invalidPhone"));
      return;
    }

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
        setSession(result.token, result.owner);
      } else {
        const result = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: authForm.email, password: authForm.password }),
        });
        setSession(result.token, result.owner);
      }
    } catch (err) {
      setAuthError(err.message || "Something went wrong");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setAuthError("");
    setForgotMessage("");
    if (!isValidEmail(forgotEmail)) {
      setAuthError(t("error_invalidEmail"));
      return;
    }
    setAuthLoading(true);
    try {
      const result = await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotMessage(result.message || "If that email is registered, a reset link has been sent.");
    } catch (err) {
      setAuthError(err.message || "Something went wrong");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setAuthError("");
    setResetMessage("");
    if (resetPassword.length < 8) {
      setAuthError(t("error_weakPassword"));
      return;
    }
    setAuthLoading(true);
    try {
      const result = await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: resetToken, newPassword: resetPassword }),
      });
      setResetMessage(result.message || "Password updated. You can now log in.");
    } catch (err) {
      setAuthError(err.message || "Something went wrong");
    } finally {
      setAuthLoading(false);
    }
  }

  function logOut() {
    setSession(null, null);
    setSchools([]);
    setStudents([]);
    setAuthForm({ name: "", vanName: "", email: "", password: "", phone: "" });
  }

  async function handleAddSchool(e) {
    e.preventDefault();
    if (!newSchoolName.trim()) return;
    setAddSchoolLoading(true);
    try {
      await api("/api/schools", { method: "POST", body: JSON.stringify({ name: newSchoolName.trim() }) });
      setNewSchoolName("");
      await loadData();
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setAddSchoolLoading(false);
    }
  }

  async function handleAddStudent(e) {
    e.preventDefault();
    setAddStudentError("");
    if (!studentForm.name || !studentForm.schoolId || !studentForm.parentPhone || !studentForm.startDate) {
      setAddStudentError(t("error_fillRequired"));
      return;
    }
    if (!isValidPhone(studentForm.parentPhone)) {
      setAddStudentError(t("error_invalidPhone"));
      return;
    }
    setAddStudentLoading(true);
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
      await loadData();
    } catch (err) {
      setAddStudentError(err.message);
    } finally {
      setAddStudentLoading(false);
    }
  }

  async function handleRenew(e) {
    e.preventDefault();
    setRenewError("");
    setRenewLoading(true);
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
      await loadData();
    } catch (err) {
      setRenewError(err.message);
    } finally {
      setRenewLoading(false);
    }
  }

  async function confirmDelete() {
    const student = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(student.id);
    try {
      await api(`/api/students/${student.id}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setDeletingId(null);
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

  // ---------- Filtering / sorting / pagination ----------
  const visibleStudents = useMemo(() => {
    let list = students.map((s) => ({ ...s, _days: daysUntil(s.end_date) }));

    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) => s.name?.toLowerCase().includes(q) || s.school_name?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "school") return (a.school_name || "").localeCompare(b.school_name || "");
      if (sortBy === "days") {
        const da = a._days === null ? Infinity : a._days;
        const db = b._days === null ? Infinity : b._days;
        return da - db;
      }
      return 0;
    });
    return list;
  }, [students, statusFilter, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(visibleStudents.length / PAGE_SIZE));
  const pagedStudents = visibleStudents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, sortBy]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  function LangPickerOverlay({ onClose }) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-30" style={{ background: "rgba(0,0,0,0.7)" }}>
        <div className="w-full max-w-xs rounded-lg p-5" style={{ background: panel, border: `1px solid ${border}` }}>
          <div className="text-sm font-semibold mb-1">{t("text_chooseLanguage")}</div>
          <p className="text-xs mb-3" style={{ color: "#7A879C" }}>{t("text_chooseLanguageSub")}</p>
          <div className="space-y-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => { chooseLanguage(l.code); if (onClose) onClose(); }}
                className="w-full rounded-md py-2 text-sm font-medium text-left px-3"
                style={{
                  background: lang === l.code ? "#1B2440" : "#0B1220",
                  border: `1px solid ${lang === l.code ? "#F5A623" : border}`,
                  color: lang === l.code ? "#F5A623" : "#E8ECF4",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
          {onClose && (
            <button onClick={onClose} className="w-full text-center text-xs mt-3" style={{ color: "#7A879C" }}>
              {t("btn_continue")}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- FIRST-RUN LANGUAGE PICKER ----------
  if (!lang) {
    return (
      <div style={pageStyle} className="flex items-center justify-center p-4">
        <style>{FONT_IMPORT}</style>
        <LangPickerOverlay />
      </div>
    );
  }

  // ---------- AUTH SCREEN ----------
  if (!token) {
    return (
      <div style={pageStyle} className="flex items-center justify-center p-4">
        <style>{FONT_IMPORT}</style>
        {showLangPicker && <LangPickerOverlay onClose={() => setShowLangPicker(false)} />}
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: "#F5A623" }}>
              <Bus size={18} color="#0B1220" />
            </div>
            <span className="text-xl font-bold tracking-tight">VanTrack</span>
          </div>

          <div className="rounded-lg p-5" style={{ background: panel, border: `1px solid ${border}` }}>
            {(authMode === "login" || authMode === "signup") && (
              <>
                <div className="flex mb-4 rounded-md overflow-hidden" style={{ border: `1px solid ${border}` }}>
                  <button
                    onClick={() => { setAuthMode("login"); setAuthError(""); }}
                    className="flex-1 py-2 text-sm font-medium transition-colors"
                    style={{ background: authMode === "login" ? "#1B2440" : "transparent", color: authMode === "login" ? "#F5A623" : "#7A879C" }}
                  >
                    {t("tab_login")}
                  </button>
                  <button
                    onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                    className="flex-1 py-2 text-sm font-medium transition-colors"
                    style={{ background: authMode === "signup" ? "#1B2440" : "transparent", color: authMode === "signup" ? "#F5A623" : "#7A879C" }}
                  >
                    {t("tab_signup")}
                  </button>
                </div>

                <form onSubmit={handleAuth} className="space-y-3">
                  {authMode === "signup" && (
                    <>
                      <Field label={t("field_yourName")}>
                        <input className={inputCls} style={inputStyle} value={authForm.name}
                          onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
                      </Field>
                      <Field label={t("field_vanName")}>
                        <input className={inputCls} style={inputStyle} value={authForm.vanName}
                          onChange={(e) => setAuthForm({ ...authForm, vanName: e.target.value })} required />
                      </Field>
                    </>
                  )}
                  <Field label={t("field_email")}>
                    <input type="email" className={inputCls} style={inputStyle} value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
                  </Field>
                  <Field label={t("field_password")}>
                    <input type="password" className={inputCls} style={inputStyle} value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required minLength={8} />
                  </Field>
                  {authMode === "signup" && (
                    <Field label={t("field_phoneOptional")}>
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
                    className="w-full rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: "#F5A623", color: "#0B1220" }}
                  >
                    {authLoading ? <Spinner /> : null}
                    {authLoading ? t("btn_pleaseWait") : authMode === "signup" ? t("btn_createAccount") : t("btn_login")}
                    {!authLoading && <ChevronRight size={15} />}
                  </button>

                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setAuthMode("forgot"); setAuthError(""); setForgotMessage(""); }}
                      className="w-full text-center text-xs mt-1"
                      style={{ color: "#7A879C" }}
                    >
                      {t("link_forgotPassword")}
                    </button>
                  )}
                </form>
              </>
            )}

            {authMode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div className="text-sm font-semibold mb-1">{t("heading_resetPassword")}</div>
                <p className="text-xs mb-2" style={{ color: "#7A879C" }}>
                  {t("text_resetInstructions")}
                </p>
                <Field label={t("field_email")}>
                  <input type="email" className={inputCls} style={inputStyle} value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)} required />
                </Field>

                {authError && (
                  <div className="text-sm rounded-md px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}>
                    {authError}
                  </div>
                )}
                {forgotMessage && (
                  <div className="text-sm rounded-md px-3 py-2" style={{ background: "rgba(52,211,153,0.1)", color: "#34D399" }}>
                    {forgotMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "#F5A623", color: "#0B1220" }}
                >
                  {authLoading ? <Spinner /> : null}
                  {authLoading ? t("btn_pleaseWait") : t("btn_sendResetLink")}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setAuthError(""); setForgotMessage(""); }}
                  className="w-full text-center text-xs"
                  style={{ color: "#7A879C" }}
                >
                  {t("link_backToLogin")}
                </button>
              </form>
            )}

            {authMode === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div className="text-sm font-semibold mb-1">{t("heading_setNewPassword")}</div>
                <Field label={t("field_newPassword")}>
                  <input type="password" className={inputCls} style={inputStyle} value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)} required minLength={8} />
                </Field>

                {authError && (
                  <div className="text-sm rounded-md px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}>
                    {authError}
                  </div>
                )}
                {resetMessage && (
                  <div className="text-sm rounded-md px-3 py-2" style={{ background: "rgba(52,211,153,0.1)", color: "#34D399" }}>
                    {resetMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "#F5A623", color: "#0B1220" }}
                >
                  {authLoading ? <Spinner /> : null}
                  {authLoading ? t("btn_pleaseWait") : t("btn_updatePassword")}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setAuthError(""); setResetMessage(""); setResetToken(""); }}
                  className="w-full text-center text-xs"
                  style={{ color: "#7A879C" }}
                >
                  {t("link_backToLogin")}
                </button>
              </form>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#7A879C" }}
            >
              <Settings size={13} /> {t("label_apiBase")} {apiBase || "—"}
            </button>
            <button
              onClick={() => setShowLangPicker(true)}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "#7A879C" }}
              title={t("title_language")}
            >
              <Globe size={13} /> {LANGUAGES.find((l) => l.code === lang)?.label}
            </button>
          </div>
          {(showSettings || !apiBase) && (
            <div className="mt-2 rounded-md p-3" style={{ background: panel, border: `1px solid ${border}` }}>
              <Field label={t("field_backendUrl")}>
                <input className={inputCls} style={inputStyle} value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)} placeholder="https://your-app.up.railway.app" />
              </Field>
              <p className="text-[11px] mt-2" style={{ color: "#7A879C" }}>
                {apiBase ? t("text_backendUrlHelp") : t("text_backendUrlMissing")}
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
      {showLangPicker && <LangPickerOverlay onClose={() => setShowLangPicker(false)} />}

      {confirmTarget && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-30" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-xs rounded-lg p-5" style={{ background: panel, border: `1px solid ${border}` }}>
            <div className="text-sm font-semibold mb-2">{t("heading_confirmRemove")}</div>
            <p className="text-xs mb-4" style={{ color: "#7A879C" }}>
              {t("confirm_removeStudent", { name: confirmTarget.name })}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmTarget(null)} className="flex-1 rounded-md py-2 text-sm font-medium"
                style={{ background: "#1B2440", color: "#E8ECF4", border: `1px solid ${border}` }}>
                {t("btn_cancel")}
              </button>
              <button onClick={confirmDelete} className="flex-1 rounded-md py-2 text-sm font-semibold"
                style={{ background: "#F87171", color: "#0B1220" }}>
                {t("btn_remove")}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <button onClick={loadData} className="p-2 rounded-md" style={{ color: "#7A879C" }} title={t("title_refresh")}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowLangPicker(true)} className="p-2 rounded-md" style={{ color: "#7A879C" }} title={t("title_language")}>
            <Globe size={16} />
          </button>
          <button onClick={() => setShowSettings((s) => !s)} className="p-2 rounded-md" style={{ color: "#7A879C" }} title={t("title_settings")}>
            <Settings size={16} />
          </button>
          <button onClick={logOut} className="p-2 rounded-md" style={{ color: "#7A879C" }} title={t("title_logout")}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${border}` }}>
          <Field label={t("field_backendUrl")}>
            <input className={inputCls} style={inputStyle} value={apiBase}
              onChange={(e) => setApiBase(e.target.value)} />
          </Field>
        </div>
      )}

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Status summary */}
        <div className="grid grid-cols-3 gap-2">
          {["active", "expiring", "expired"].map((key) => {
            const meta = STATUS_META_KEYS[key];
            const Icon = meta.icon;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? "all" : key)}
                className="rounded-lg p-3 text-left"
                style={{ background: panel, border: `1px solid ${statusFilter === key ? "#F5A623" : border}` }}
              >
                <Icon size={15} color={meta.color} />
                <div className="text-2xl font-bold mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {counts[key] || 0}
                </div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: "#7A879C" }}>{t(meta.key)}</div>
              </button>
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
            <span className="text-sm font-semibold">{t("heading_schools")}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {schools.length === 0 && <span className="text-xs" style={{ color: "#7A879C" }}>{t("text_noSchools")}</span>}
            {schools.map((s) => (
              <span key={s.id} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#1B2440", border: `1px solid ${border}` }}>
                {s.name}
              </span>
            ))}
          </div>
          <form onSubmit={handleAddSchool} className="flex gap-2">
            <input
              className={inputCls} style={inputStyle}
              placeholder={t("placeholder_schoolName")}
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
            />
            <button type="submit" disabled={addSchoolLoading} className="rounded-md px-3 text-sm font-medium shrink-0 flex items-center gap-1.5 disabled:opacity-60" style={{ background: "#1B2440", color: "#F5A623", border: `1px solid ${border}` }}>
              {addSchoolLoading ? <Spinner size={13} /> : null}
              {t("btn_add")}
            </button>
          </form>
        </div>

        {/* Students */}
        <div className="rounded-lg p-4" style={{ background: panel, border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={15} color="#7A879C" />
              <span className="text-sm font-semibold">{t("heading_roster")}</span>
            </div>
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-1 text-xs font-medium rounded-md px-2.5 py-1.5"
              style={{ background: "#F5A623", color: "#0B1220" }}
            >
              <Plus size={13} /> {t("btn_addStudent")}
            </button>
          </div>

          {/* Search + sort */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" color="#7A879C" />
              <input
                className={inputCls} style={{ ...inputStyle, paddingLeft: "28px" }}
                placeholder={t("placeholder_search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className={inputCls} style={{ ...inputStyle, width: "auto" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">{t("sort_name")}</option>
              <option value="school">{t("sort_school")}</option>
              <option value="days">{t("sort_days")}</option>
            </select>
          </div>

          {students.length === 0 && !loading && (
            <div className="text-sm text-center py-8" style={{ color: "#7A879C" }}>
              {t("text_noStudents")}
            </div>
          )}

          {students.length > 0 && visibleStudents.length === 0 && (
            <div className="text-sm text-center py-8" style={{ color: "#7A879C" }}>
              {t("text_noResults")}
            </div>
          )}

          <div className="space-y-2">
            {pagedStudents.map((s) => {
              const meta = STATUS_META_KEYS[s.status] || STATUS_META_KEYS.active;
              const d = s._days;
              return (
                <div key={s.id} className="rounded-md p-3 flex items-center justify-between gap-3" style={{ background: "#0F1626", border: `1px solid ${border}` }}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{s.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0" style={{ background: meta.bg, color: meta.color }}>
                        {t(meta.key)}
                      </span>
                    </div>
                    <div className="text-[11px] truncate mt-0.5" style={{ color: "#7A879C" }}>
                      {s.school_name} {s.route ? `· ${s.route}` : ""} · {s.parent_phone}
                    </div>
                    {s.amount ? (
                      <div className="text-[11px] mt-0.5" style={{ color: "#F5A623" }}>
                        ₹{s.amount}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <SplitDigits value={d === null ? "--" : Math.abs(d)} />
                      <div className="text-[9px] uppercase mt-0.5" style={{ color: "#7A879C" }}>
                        {d === null ? t("days_noData") : d < 0 ? t("days_over") : t("days_left")}
                      </div>
                    </div>
                    <button
                      onClick={() => { setRenewTarget(s); setRenewForm({ cycleMonths: "1", startDate: new Date().toISOString().slice(0, 10), amount: "" }); }}
                      className="p-2 rounded-md" style={{ background: "#1B2440", color: "#F5A623" }} title={t("title_renew")}
                    >
                      <RefreshCw size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmTarget(s)}
                      disabled={deletingId === s.id}
                      className="p-2 rounded-md disabled:opacity-60" style={{ background: "#1B2440", color: "#F87171" }} title={t("title_remove")}
                    >
                      {deletingId === s.id ? <Spinner size={13} /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleStudents.length > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md disabled:opacity-40"
                style={{ background: "#1B2440", color: "#E8ECF4", border: `1px solid ${border}` }}
              >
                <ChevronLeft size={13} /> {t("pagination_prev")}
              </button>
              <span className="text-xs" style={{ color: "#7A879C" }}>
                {t("pagination_page", { page, total: totalPages })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md disabled:opacity-40"
                style={{ background: "#1B2440", color: "#E8ECF4", border: `1px solid ${border}` }}
              >
                {t("pagination_next")} <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Add student modal */}
      {showAddStudent && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-20" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-sm rounded-lg p-4" style={{ background: panel, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">{t("modal_addStudent")}</span>
              <button onClick={() => setShowAddStudent(false)}><X size={16} color="#7A879C" /></button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-3">
              <Field label={t("field_studentName")}>
                <input className={inputCls} style={inputStyle} value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} required />
              </Field>
              <Field label={t("field_school")}>
                <select className={inputCls} style={inputStyle} value={studentForm.schoolId}
                  onChange={(e) => setStudentForm({ ...studentForm, schoolId: e.target.value })} required>
                  <option value="">{t("option_selectSchool")}</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label={t("field_parentName")}>
                  <input className={inputCls} style={inputStyle} value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })} />
                </Field>
                <Field label={t("field_parentPhone")}>
                  <input className={inputCls} style={inputStyle} value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })} required maxLength={10} />
                </Field>
              </div>
              <Field label={t("field_route")}>
                <input className={inputCls} style={inputStyle} value={studentForm.route}
                  onChange={(e) => setStudentForm({ ...studentForm, route: e.target.value })} />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <Field label={t("field_cycle")}>
                  <select className={inputCls} style={inputStyle} value={studentForm.cycleMonths}
                    onChange={(e) => setStudentForm({ ...studentForm, cycleMonths: e.target.value })}>
                    <option value="1">1 mo</option>
                    <option value="2">2 mo</option>
                    <option value="3">3 mo</option>
                  </select>
                </Field>
                <Field label={t("field_startDate")}>
                  <input type="date" className={inputCls} style={inputStyle} value={studentForm.startDate}
                    onChange={(e) => setStudentForm({ ...studentForm, startDate: e.target.value })} required />
                </Field>
                <Field label={t("field_amount")}>
                  <input type="number" className={inputCls} style={inputStyle} value={studentForm.amount}
                    onChange={(e) => setStudentForm({ ...studentForm, amount: e.target.value })} />
                </Field>
              </div>

              {addStudentError && (
                <div className="text-sm rounded-md px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}>
                  {addStudentError}
                </div>
              )}

              <button type="submit" disabled={addStudentLoading} className="w-full rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "#F5A623", color: "#0B1220" }}>
                {addStudentLoading ? <Spinner /> : null}
                {t("btn_addToRoster")}
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
              <span className="text-sm font-semibold">{t("modal_renew")} — {renewTarget.name}</span>
              <button onClick={() => setRenewTarget(null)}><X size={16} color="#7A879C" /></button>
            </div>
            <form onSubmit={handleRenew} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Field label={t("field_cycle")}>
                  <select className={inputCls} style={inputStyle} value={renewForm.cycleMonths}
                    onChange={(e) => setRenewForm({ ...renewForm, cycleMonths: e.target.value })}>
                    <option value="1">1 mo</option>
                    <option value="2">2 mo</option>
                    <option value="3">3 mo</option>
                  </select>
                </Field>
                <Field label={t("field_startDate")}>
                  <input type="date" className={inputCls} style={inputStyle} value={renewForm.startDate}
                    onChange={(e) => setRenewForm({ ...renewForm, startDate: e.target.value })} required />
                </Field>
                <Field label={t("field_amount")}>
                  <input type="number" className={inputCls} style={inputStyle} value={renewForm.amount}
                    onChange={(e) => setRenewForm({ ...renewForm, amount: e.target.value })} />
                </Field>
              </div>

              {renewError && (
                <div className="text-sm rounded-md px-3 py-2" style={{ background: "rgba(248,113,113,0.1)", color: "#F87171" }}>
                  {renewError}
                </div>
              )}

              <button type="submit" disabled={renewLoading} className="w-full rounded-md py-2 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "#F5A623", color: "#0B1220" }}>
                {renewLoading ? <Spinner /> : null}
                {t("btn_recordPayment")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}