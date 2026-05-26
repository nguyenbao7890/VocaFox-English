import React, { useEffect, useRef, useState } from "react";
import { supabase, apiFetch, CurrentUserProfile, AppRole } from "./supabase";
import { TextbookUnit, MockExam, Question, UserExamAttempt } from "./types";
import { explainQuestionWithAI, sendAIChatMessage } from "./services/api";
import { grade9Units } from "./data/grade9Units";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import DashboardTab from "./components/DashboardTab";
import UnitsTab from "./components/UnitsTab";
import ExamsTab from "./components/ExamsTab";
import PracticeTab from "./components/PracticeTab";
import ProgressTab from "./components/ProgressTab";
import TeacherTab from "./components/TeacherTab";
import StudentClassesTab from "./components/StudentClassesTab";
import AdminTab from "./components/AdminTab";
import AIChatBox from "./components/AIChatBox";

type Tab = "dashboard" | "units" | "exams" | "practice" | "progress" | "teacher" | "admin";

type MeResponse = {
  success: boolean;
  user: CurrentUserProfile & {
    completedUnits?: number[];
    studyStreak?: number;
  };
};

type UnitsResponse = {
  success: boolean;
  units: TextbookUnit[];
};

type AttemptsResponse = {
  success: boolean;
  attempts: UserExamAttempt[];
};

type FooterActionTab = Tab;

function AppFooter({
  onNavigate,
  onRequireLogin,
  currentTab = "dashboard",
  role = "student",
}: {
  onNavigate?: (tab: FooterActionTab) => void;
  onRequireLogin?: () => void;
  currentTab?: FooterActionTab;
  role?: AppRole | "guest";
}) {
  const currentYear = new Date().getFullYear();

  const handleClick = (tab: FooterActionTab) => {
    if (onNavigate) {
      onNavigate(tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (onRequireLogin) {
      onRequireLogin();
    }
  };

  const studentFooterGroups: Array<{
    title: string;
    links: Array<{ label: string; tab: FooterActionTab }>;
  }> = [
    {
      title: "Học tập",
      links: [
        { label: "Trang chủ học viên", tab: "dashboard" },
        { label: "Lớp học của tôi", tab: "teacher" },
        { label: "Thư viện học liệu SGK", tab: "units" },
        { label: "Kho đề thi thử tuyển sinh", tab: "exams" },
      ],
    },
    {
      title: "Công cụ luyện tập",
      links: [
        { label: "Luyện tập hằng ngày", tab: "practice" },
        { label: "Báo cáo phân tích", tab: "progress" },
        { label: "FoxieAI trợ lý học tập", tab: "dashboard" },
      ],
    },
  ];

  const teacherFooterGroups: Array<{
    title: string;
    links: Array<{ label: string; tab: FooterActionTab }>;
  }> = [
    {
      title: "Công cụ giáo viên",
      links: [
        { label: "Teacher Workspace", tab: "teacher" },
        { label: "Thư viện học liệu SGK", tab: "units" },
        { label: "Kho đề thi thử tuyển sinh", tab: "exams" },
      ],
    },
  ];

  const footerGroups = role === "teacher" || currentTab === "teacher" ? teacherFooterGroups : studentFooterGroups;

  return (
    <footer className="mt-14 w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="px-7 py-10 sm:px-9 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr_1fr]">
          <div className="text-left">
            <div className="flex items-center gap-3">
              <img
                src="/logo-1.png"
                alt="VocaFox"
                className="h-11 w-11 object-contain"
              />

              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  Voca<span className="text-[#FF7A1A]">Fox</span>
                </h2>

                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#0B5CAD]">
                  English Learning Platform
                </p>
              </div>
            </div>

            <h3 className="mt-7 max-w-sm text-3xl font-black leading-tight tracking-tight text-slate-950">
              Master English,
              <br />
              Conquer the Future.
            </h3>

            <p className="mt-5 max-w-sm text-sm font-semibold leading-7 text-slate-500">
              Nền tảng học tiếng Anh lớp 9, luyện thi vào 10, quản lý học liệu,
              theo dõi tiến độ và hỗ trợ học tập bằng FoxieAI.
            </p>
          </div>

          <div className="grid gap-9 sm:grid-cols-2">
            {footerGroups.map((group) => (
              <div key={group.title} className="text-left">
                <h3 className="text-[12px] font-black uppercase tracking-[0.22em] text-slate-950">
                  {group.title}
                </h3>

                <div className="mt-5 space-y-3">
                  {group.links.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleClick(item.tab)}
                      className="block text-left text-sm font-bold leading-6 text-slate-500 transition hover:text-[#FF7A1A]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-left">
            <h3 className="text-[12px] font-black uppercase tracking-[0.22em] text-slate-950">
              Liên hệ & hỗ trợ
            </h3>

            <div className="mt-5 space-y-4">
              <a
                href="mailto:nbao8887@gmail.com"
                className="block text-sm font-bold text-slate-600 transition hover:text-[#FF7A1A]"
              >
                nbao8887@gmail.com
              </a>

              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Page</p>
                <p className="mt-1 text-sm font-extrabold text-slate-800">VocaFox English</p>
              </div>

              <p className="text-sm font-semibold leading-7 text-slate-500">
                Hỗ trợ tài khoản, lớp học, học liệu, đề thi và FoxieAI.
              </p>

              <a
                href="mailto:nbao8887@gmail.com?subject=Hỗ trợ VocaFox English"
                className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-[#FF7A1A]"
              >
                Gửi yêu cầu hỗ trợ
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-6 text-xs font-bold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} VocaFox English. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Master English</span>
            <span>Conquer the Future</span>
            <span>FoxieAI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [activePracticeSubTab, setActivePracticeSubTab] = useState<
    "flashcard" | "reading" | "pronunciation" | "mistakes" | "mission"
  >("flashcard");
  const [activeProgressSubTab, setActiveProgressSubTab] = useState<
    "stats" | "strengths" | "roadmap" | "exams"
  >("stats");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as AppRole,
  });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const [selectedUnit, setSelectedUnit] = useState<TextbookUnit | null>(null);
  const [unitSubTab, setUnitSubTab] = useState<
    "vocab" | "grammar" | "exercises" | "theory"
  >("vocab");
  const [vocabFlipId, setVocabFlipId] = useState<string | null>(null);
  const [allUnits, setAllUnits] = useState<TextbookUnit[]>(grade9Units);

  const [unitAnswers, setUnitAnswers] = useState<Record<string, string>>({});
  const [unitSubmitted, setUnitSubmitted] = useState<Record<string, boolean>>({});

  const [selectedExam, setSelectedExam] = useState<MockExam | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [examAttempt, setExamAttempt] = useState<UserExamAttempt | null>(null);
  const [attemptsHistory, setAttemptsHistory] = useState<UserExamAttempt[]>([]);

  const [completedUnits, setCompletedUnits] = useState<number[]>([]);
  const [studyStreak, setStudyStreak] = useState(0);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([
    {
      sender: "ai",
      text: "Xin chào! Mình là FoxieAI. Bạn muốn mình giúp ôn từ vựng, ngữ pháp hay luyện đề hôm nay?",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const [explainLoading, setExplainLoading] = useState(false);
  const [activeExplanation, setActiveExplanation] = useState<{
    questionText: string;
    correctValue: string;
    userAnswer?: string;
    text: string;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.title = "VocaFox English";
  }, []);

  const normalizeEmail = (email: string) => email.trim().toLowerCase();

  const openAuth = (tab: "login" | "register") => {
    setAuthTab(tab);
    setAuthForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });
    setAuthError("");
    setAuthSuccess("");
    setAuthModalOpen(true);
  };

  const routeByRole = (role?: AppRole) => {
    setActiveTab(role === "admin" ? "admin" : role === "teacher" ? "teacher" : "dashboard");
  };

  const refreshMe = async (accessToken?: string) => {
    const { data } = await supabase.auth.getSession();
    const token = accessToken || data.session?.access_token;

    if (!token) {
      setCurrentUser(null);
      setAuthLoading(false);
      return;
    }

    const me = await apiFetch<MeResponse>("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCurrentUser(me.user);
    setCompletedUnits(me.user.completedUnits || []);
    setStudyStreak(me.user.studyStreak || 0);
    routeByRole(me.user.role);
    setAuthLoading(false);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const oauthError =
      searchParams.get("error_description") ||
      hashParams.get("error_description") ||
      searchParams.get("error") ||
      hashParams.get("error");

    if (oauthError) {
      setAuthError(decodeURIComponent(oauthError));
      setAuthModalOpen(true);
      window.history.replaceState({}, document.title, window.location.origin + "/");
    }

    refreshMe().catch(() => setAuthLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange(
      (
        _event: string,
        session: { access_token?: string; user?: { id: string; email?: string } } | null
      ) => {
        if (!session?.access_token) {
          setCurrentUser(null);
          setAuthLoading(false);
          setActiveTab("dashboard");
        } else {
          setTimeout(() => {
            refreshMe(session.access_token).catch(() => setAuthLoading(false));
          }, 0);
        }
      }
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    apiFetch<UnitsResponse>("/api/units")
      .then((r) => setAllUnits(r.units?.length ? r.units : grade9Units))
      .catch(() => setAllUnits(grade9Units));
  }, []);

  useEffect(() => {
    const localHistory = localStorage.getItem("grade9_exams_history");
    const localCompleted = localStorage.getItem("grade9_completed_units");

    if (localHistory) setAttemptsHistory(JSON.parse(localHistory));
    if (localCompleted) setCompletedUnits(JSON.parse(localCompleted));
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    apiFetch<AttemptsResponse>("/api/attempts")
      .then((r) => setAttemptsHistory(r.attempts || []))
      .catch(() => undefined);
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      apiFetch("/api/usage/ping", {
        method: "POST",
        body: JSON.stringify({ seconds: 30 }),
      }).catch(() => undefined);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser?.uid]);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    } else if (examStarted && timeLeft === 0) {
      handleCompleteExam();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [examStarted, timeLeft]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const email = normalizeEmail(authForm.email);

    if (!authForm.name.trim()) return setAuthError("Vui lòng nhập họ và tên.");
    if (!email.includes("@")) return setAuthError("Vui lòng nhập email hợp lệ.");
    if (authForm.password.length < 6) return setAuthError("Mật khẩu phải có ít nhất 6 ký tự.");
    if (authForm.password !== authForm.confirmPassword) {
      return setAuthError("Mật khẩu xác nhận không trùng khớp.");
    }

    const role = authForm.role === "teacher" ? "teacher" : "student";

    setAuthLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: authForm.password,
      options: {
        data: {
          name: authForm.name.trim(),
          role,
        },
      },
    });

    if (error) {
      setAuthLoading(false);
      return setAuthError(error.message);
    }

    const token = data.session?.access_token;

    if (token) {
      try {
        await refreshMe(token);
        routeByRole(role);
        setAuthModalOpen(false);
        setAuthForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "student",
        });
      } catch (err: any) {
        setAuthError(err?.message || "Đăng ký thành công nhưng chưa tải được dashboard.");
      } finally {
        setAuthLoading(false);
      }

      return;
    }

    setAuthLoading(false);
    setAuthTab("login");
    setAuthError("Tài khoản đã được tạo. Supabase đang yêu cầu xác thực email, hãy xác thực rồi đăng nhập.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    const email = normalizeEmail(authForm.email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: authForm.password,
    });

    if (error || !data.session?.access_token) {
      setAuthLoading(false);
      return setAuthError("Email hoặc mật khẩu không chính xác.");
    }

    try {
      await refreshMe(data.session.access_token);
      setAuthSuccess("Đăng nhập thành công!");
      setAuthModalOpen(false);
    } catch (err: any) {
      setAuthLoading(false);
      setAuthError(err?.message || "Đăng nhập Supabase thành công nhưng server chưa tải được hồ sơ người dùng.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab("dashboard");
    setAvatarDropdownOpen(false);
  };

  const speakWord = (word: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Thiết bị không hỗ trợ phát âm thanh.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const formatTime = (seconds: number) => {
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  const handleStartExam = (exam: MockExam) => {
    setSelectedExam(exam);
    setExamAnswers({});
    setTimeLeft(exam.duration * 60);
    setExamStarted(true);
    setExamAttempt(null);
  };

  const handleCompleteExam = async () => {
    if (!selectedExam) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    let totalQuestions = 0;
    let correctAnswersCount = 0;

    selectedExam.sections?.forEach((section) => {
      section.questions?.forEach((q) => {
        totalQuestions++;

        const userVal = (examAnswers[q.id] || "").trim().toLowerCase();
        const correctVal = String(q.correctValue || (q as any).correctAnswer || "")
          .trim()
          .toLowerCase();

        if (q.type === "single-choice") {
          if (
            userVal &&
            (userVal === correctVal ||
              correctVal.startsWith(userVal.charAt(0)) ||
              userVal.startsWith(correctVal.charAt(0)))
          ) {
            correctAnswersCount++;
          }
        } else {
          const clean = (s: string) =>
            s
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
              .replace(/\s+/g, " ");

          if (clean(userVal) === clean(correctVal) && userVal) {
            correctAnswersCount++;
          }
        }
      });
    });

    const attempt: UserExamAttempt = {
      id: "attempt_" + Date.now(),
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      score: totalQuestions
        ? Math.round((correctAnswersCount / totalQuestions) * 100) / 10
        : 0,
      totalQuestions,
      correctAnswersCount,
      timeSpentSeconds: selectedExam.duration * 60 - timeLeft,
      submittedAt: new Date().toLocaleString("vi-VN"),
      answers: { ...examAnswers },
    };

    const newHistory = [attempt, ...attemptsHistory];

    setAttemptsHistory(newHistory);
    setExamAttempt(attempt);
    setExamStarted(false);

    localStorage.setItem("grade9_exams_history", JSON.stringify(newHistory));

    if (currentUser) {
      apiFetch("/api/attempts", {
        method: "POST",
        body: JSON.stringify({ attempt }),
      }).catch(console.warn);
    }
  };

  const handleSubmitUnitExercise = async (qnId: string, userVal: string) => {
    setUnitAnswers((p) => ({ ...p, [qnId]: userVal }));
    setUnitSubmitted((p) => ({ ...p, [qnId]: true }));

    if (!selectedUnit || completedUnits.includes(selectedUnit.id)) return;

    const next = [...completedUnits, selectedUnit.id];

    setCompletedUnits(next);
    localStorage.setItem("grade9_completed_units", JSON.stringify(next));

    if (currentUser) {
      apiFetch<{ completedUnits: number[] }>("/api/progress/completed-unit", {
        method: "POST",
        body: JSON.stringify({ unitId: selectedUnit.id }),
      })
        .then((r) => r.completedUnits && setCompletedUnits(r.completedUnits))
        .catch(console.warn);
    }
  };

  const handleExplainWithAI = async (q: Question, userAnswer?: string, topicTitle?: string) => {
    setExplainLoading(true);
    setActiveExplanation({
      questionText: q.question,
      correctValue: q.correctValue,
      userAnswer,
      text: "FoxieAI đang phân tích lời giải...",
    });

    const text = await explainQuestionWithAI(q, userAnswer, topicTitle);

    setActiveExplanation({
      questionText: q.question,
      correctValue: q.correctValue,
      userAnswer,
      text,
    });

    setExplainLoading(false);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput;

    setChatMessages((p) => [...p, { sender: "user", text: userText }]);
    setChatInput("");
    setChatLoading(true);

    const aiReply = await sendAIChatMessage(userText, chatMessages, selectedUnit, selectedExam);

    setChatMessages((p) => [...p, { sender: "ai", text: aiReply }]);
    setChatLoading(false);
  };

  const handleResetData = () => {
    localStorage.clear();
    setAttemptsHistory([]);
    setCompletedUnits([]);
    setStudyStreak(0);
  };

  const handleUnlockVIP = () => {
    alert("Tính năng VIP nên được cấp quyền từ Admin trên Supabase để đảm bảo dữ liệu thật và phân quyền đúng.");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl ring-1 ring-orange-100">
            <img src="/logo-1.png" alt="VocaFox" className="h-14 w-14 object-contain" />
          </div>

          <h1 className="text-2xl font-black text-slate-900">
            Voca<span className="text-orange-500">Fox</span>
          </h1>

          <p className="mt-3 text-sm font-semibold text-slate-500">
            Đang tải dữ liệu học tập...
          </p>

          <div className="mx-auto mt-5 h-2 w-44 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-orange-400" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFDF9] via-[#F5F9FF] to-white text-[#10213F] font-sans selection:bg-[#FED7AA] selection:text-amber-900 scroll-smooth relative overflow-x-hidden leading-normal">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,122,26,0.18)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(43,120,255,0.18)_0%,transparent_70%)] pointer-events-none" />

        <nav className="max-w-[1180px] w-[calc(100%-40px)] mx-auto mt-5 h-[72px] border border-[rgba(16,33,63,0.08)] select-none bg-white/78 backdrop-blur-md rounded-full flex items-center justify-between px-6 sticky top-4 z-50 shadow-[0_14px_40px_rgba(16,33,63,0.08)]">
          <a href="#" className="flex items-center gap-3 font-extrabold text-xl tracking-tight">
            <img src="/logo-1.png" alt="VocaFox" className="h-8 w-8 object-contain" />
            <span>
              Voca<span className="text-[#FF7A1A]">Fox</span>
            </span>
          </a>

          <div className="hidden md:flex gap-[28px] items-center text-[#42526b] font-semibold text-sm">
            <a href="#features" className="hover:text-[#FF7A1A] transition-colors">
              Tính năng
            </a>
            <a href="#exam" className="hover:text-[#FF7A1A] transition-colors">
              Luyện thi
            </a>
            <a href="#how" className="hover:text-[#FF7A1A] transition-colors">
              Cách học
            </a>
          </div>

          <div className="flex gap-2.5 items-center">
            <button
              onClick={() => openAuth("login")}
              className="bg-[#f3f6fb] hover:bg-slate-200 text-[#10213F] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-transform hover:-translate-y-[1px] cursor-pointer"
            >
              Đăng nhập
            </button>

            <button
              onClick={() => openAuth("register")}
              className="bg-gradient-to-r from-[#FF7A1A] to-[#E85F00] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-transform hover:-translate-y-[1px] shadow-[0_14px_28px_rgba(255,122,26,0.28)] cursor-pointer"
            >
              Bắt đầu học
            </button>
          </div>
        </nav>

        <section className="max-w-[1180px] w-[calc(100%-40px)] mx-auto mt-[72px] mb-[90px] grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[rgba(255,122,26,0.12)] border border-[rgba(255,122,26,0.2)] text-[#C94D00] px-4 py-2 rounded-full font-extrabold text-[13px] tracking-wide uppercase">
              Dành cho học sinh lớp 9 ôn thi tiếng Anh vào lớp 10
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[76px] font-black text-[#10213F] tracking-tight leading-[0.94] m-0">
              <span className="bg-gradient-to-r from-[#FF7A1A] via-[#FFB13D] 45% to-[#2B78FF] bg-clip-text text-transparent">
                Master English, Conquer the Future
              </span>
            </h1>

            <p className="text-base sm:text-xl text-[#53627a] font-medium leading-relaxed max-w-[610px] m-0">
              VocaFox giúp bạn học từ vựng, củng cố ngữ pháp và luyện các dạng câu hỏi
              thường gặp trong đề thi tiếng Anh vào lớp 10.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <button
                onClick={() => openAuth("register")}
                className="bg-gradient-to-br from-[#FF7A1A] to-[#E85F00] text-white font-bold text-sm px-6 py-4 rounded-full transition-transform hover:-translate-y-0.5 shadow-[0_14px_28px_rgba(255,122,26,0.28)] cursor-pointer"
              >
                Học thử miễn phí →
              </button>

              <button
                onClick={() => openAuth("login")}
                className="bg-gradient-to-br from-[#3C8BFF] to-[#1D58E8] text-white font-bold text-sm px-6 py-4 rounded-full transition-transform hover:-translate-y-0.5 shadow-[0_14px_28px_rgba(43,120,255,0.25)] cursor-pointer"
              >
                Xem lộ trình luyện thi
              </button>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 font-semibold text-xs sm:text-sm text-[#53627a]">
              <span>Bám sát chương trình lớp 9</span>
              <span>Tập trung thi vào 10</span>
              <span>Luyện tập mỗi ngày</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[500px] flex items-center justify-center">
            <div className="w-[390px] max-w-[90%] bg-white border-[10px] border-[#13213A] rounded-[44px] p-[22px] shadow-[0_24px_70px_rgba(16,33,63,0.12)] z-0 text-left select-none relative">
              <div className="h-[36px] flex justify-between items-center font-extrabold text-[13px] text-[#10213F] pl-1">
                <span>VocaFox</span>
                <span className="text-[#FF7A1A]">Chuỗi 7 ngày</span>
              </div>

              <div className="bg-gradient-to-br from-[#FFF5E8] to-[#EAF4FF] rounded-[28px] p-6 border border-[rgba(16,33,63,0.08)] my-3.5">
                <h3 className="m-0 font-display font-black text-[24px] text-[#10213F] tracking-tight leading-tight">
                  Sẵn sàng cho nhiệm vụ tiếng Anh hôm nay?
                </h3>

                <p className="m-0 text-[#667085] text-xs font-semibold leading-relaxed mt-2.5">
                  Luyện từ vựng và câu hỏi thi chỉ trong 15 phút mỗi ngày.
                </p>

                <div className="h-3 rounded-full bg-[rgba(16,33,63,0.1)] overflow-hidden mt-5 mb-2.5 font-mono">
                  <span className="block w-[72%] h-full rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#2B78FF]" />
                </div>

                <small className="text-[#667085] font-extrabold text-[11px]">
                  Đã hoàn thành 72% mục tiêu tuần
                </small>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3.5">
                {[
                  ["120+", "câu hỏi luyện thi"],
                  ["A2–B1", "mục tiêu năng lực"],
                  ["15 phút", "luyện tập mỗi ngày"],
                  ["4 phần", "từ vựng, ngữ pháp, đọc hiểu, đề thi"],
                ].map(([number, label]) => (
                  <div
                    key={label}
                    className="bg-white border border-[rgba(16,33,63,0.08)] rounded-[18px] p-4"
                  >
                    <b className="block text-[#10213F] text-[22px] font-extrabold tracking-tight leading-none">
                      {number}
                    </b>
                    <small className="text-[#667085] font-semibold text-xs block mt-1">
                      {label}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="max-w-[1180px] w-[calc(100%-40px)] mx-auto mb-[90px]"
        >
          <div className="text-center max-w-[760px] mx-auto mb-11">
            <div className="text-[#E85F00] font-extrabold text-xs tracking-widest uppercase mb-3">
              Vì sao chọn VocaFox
            </div>

            <h2 className="text-3xl sm:text-[45px] font-black text-[#10213F] tracking-tight leading-none mb-4">
              Cách ôn tiếng Anh thông minh hơn cho kỳ thi vào 10
            </h2>

            <p className="text-slate-500 font-bold text-[15px] sm:text-[17px] leading-relaxed m-0">
              VocaFox chia việc ôn tập thành các nhiệm vụ ngắn, dễ theo dõi,
              giúp học sinh biết hôm nay cần học gì và cần ôn gì.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Từ vựng theo chủ đề",
                desc: "Học các nhóm từ thường gặp trong chương trình lớp 9 và đề thi vào 10.",
              },
              {
                title: "Ngữ pháp dễ hiểu",
                desc: "Ôn trọng tâm bằng giải thích ngắn gọn, ví dụ rõ ràng và bài kiểm tra nhanh.",
              },
              {
                title: "Luyện câu hỏi dạng đề thi",
                desc: "Thực hành trắc nghiệm, đọc hiểu, tìm lỗi sai và đề luyện tập có giới hạn thời gian.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="bg-white border border-slate-100/80 rounded-[24px] p-8 shadow-[0_12px_35px_rgba(16,33,63,0.03)] text-left hover:border-[#FF7A1A] transition-all"
              >
                <h3 className="text-slate-800 font-extrabold text-[21px] tracking-tight mb-2.5">
                  {item.title}
                </h3>
                <p className="m-0 text-[#667085] leading-relaxed font-semibold text-sm">
                  {item.desc}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="exam"
          className="max-w-[1180px] w-[calc(100%-40px)] mx-auto mb-[90px]"
        >
          <div className="bg-gradient-to-br from-[#10213F] to-[#173766] text-white rounded-[32px] p-8 sm:p-11 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-[0_24px_70px_rgba(16,33,63,0.12)] relative overflow-hidden">
            <div className="absolute w-[340px] h-[340px] rounded-full right-[-120px] top-[-110px] bg-[#FF7A1A]/35 blur-2xl pointer-events-none" />

            <div className="lg:col-span-5 text-left space-y-5 z-10">
              <div className="text-[#FFBD7A] font-extrabold text-xs tracking-widest uppercase">
                Luyện thi vào lớp 10
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight m-0">
                Luyện đúng dạng bài trước ngày thi thật
              </h2>

              <p className="text-white/70 leading-relaxed text-sm font-semibold m-0">
                Học sinh có thể theo lộ trình theo tuần, ôn lại phần còn yếu và tăng sự tự tin trước kỳ thi.
              </p>

              <button
                onClick={() => openAuth("login")}
                className="inline-flex items-center gap-1 bg-gradient-to-r from-[#FF7A1A] to-[#E85F00] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer font-sans"
              >
                Xem lộ trình học
              </button>
            </div>

            <div className="lg:col-span-7 space-y-3.5 z-10 text-left font-sans">
              {[
                ["Tăng tốc từ vựng", "Luyện từ theo chủ đề thường gặp", "10 phút"],
                ["Trọng tâm ngữ pháp", "Thì, mệnh đề, câu bị động, câu điều kiện", "15 phút"],
                ["Thử thách đọc hiểu", "Short passages with câu hỏi luyện thi", "20 phút"],
                ["Đề thi thử", "Làm bài theo thời gian và xem kết quả", "45 phút"],
              ].map(([title, desc, time]) => (
                <div
                  key={title}
                  className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-5 backdrop-blur-md"
                >
                  <div>
                    <b className="block text-white text-base">{title}</b>
                    <small className="text-white/65 font-semibold text-xs">{desc}</small>
                  </div>
                  <span className="bg-white/14 px-3 py-1.5 rounded-full text-white font-bold text-xs select-none">
                    {time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how"
          className="max-w-[1180px] w-[calc(100%-40px)] mx-auto mb-[90px]"
        >
          <div className="text-center max-w-[760px] mx-auto mb-11">
            <div className="text-[#FF7A1A] font-extrabold text-xs tracking-widest uppercase mb-3">
              Cách học
            </div>

            <h2 className="text-3xl sm:text-[45px] font-black text-[#10213F] tracking-tight leading-none mb-4">
              From luyện tập mỗi ngày to exam confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left font-sans">
            {[
              ["1", "Đặt mục tiêu", "Chọn thời gian thi, mục tiêu điểm số và trình độ hiện tại."],
              ["2", "Làm nhiệm vụ", "Hoàn thành bài học ngắn về từ vựng, ngữ pháp và đọc hiểu."],
              ["3", "Sửa điểm yếu", "Xem lại lỗi sai với giải thích đơn giản và ví dụ dễ nhớ."],
              ["4", "Làm đề thi thử", "Đo mức độ sẵn sàng bằng các bài luyện đề có tính giờ."],
            ].map(([step, title, desc]) => (
              <div
                key={step}
                className="bg-[#FFF8EF] border border-[#FF7A1A]/16 rounded-[22px] p-6"
              >
                <div className="w-[38px] h-[38px] rounded-xl bg-[#FF7A1A] text-white flex items-center justify-center font-black text-sm mb-4 font-mono">
                  {step}
                </div>

                <h3 className="text-[#10213F] font-bold text-lg mb-2">{title}</h3>

                <p className="m-0 text-[#667085] font-semibold text-xs leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1180px] w-[calc(100%-40px)] mx-auto mb-[70px]">
          <div className="bg-gradient-to-br from-[#FF7A1A] via-[#FF9D2E] to-[#FF7A1A] text-white rounded-[38px] p-10 sm:p-14 text-center shadow-[0_25px_70px_rgba(255,122,26,0.28)] relative overflow-hidden">
            <h2 className="text-3xl sm:text-[45px] font-black tracking-tight text-white leading-tight max-w-[760px] mx-auto mb-4">
              Làm chủ tiếng Anh • Chinh phục tương lai
            </h2>

            <p className="text-white/85 text-[15px] sm:text-[18px] leading-relaxed max-w-[680px] mx-auto mb-7 font-semibold">
              Bắt đầu hành trình cùng VocaFox và chuẩn bị cho kỳ thi tiếng Anh vào lớp 10 một cách tự tin hơn.
            </p>

            <button
              onClick={() => openAuth("register")}
              className="bg-gradient-to-r from-[#3C8BFF] to-[#1D58E8] text-white font-black text-sm sm:text-base px-8 py-4 rounded-full transition-transform hover:-translate-y-0.5 shadow-lg cursor-pointer"
            >
              Tạo tài khoản miễn phí
            </button>
          </div>
        </section>

        <div className="max-w-[1180px] w-[calc(100%-40px)] mx-auto mb-[34px]">
          <AppFooter
            onRequireLogin={() => {
              setAuthTab("login");
              setAuthModalOpen(true);
            }}
          />
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          authTab={authTab}
          setAuthTab={setAuthTab}
          authForm={authForm}
          setAuthForm={setAuthForm}
          authError={authError}
          authSuccess={authSuccess}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
        />
      </div>
    );
  }

  const isTeacherWorkspace = activeTab === "teacher" && currentUser?.role === "teacher";
  const isAdminWorkspace = activeTab === "admin";
  const isWorkspaceFullScreen = isTeacherWorkspace || isAdminWorkspace;

  return (
    <div className="min-h-screen flex bg-[#FCFBFA] text-[#10213F] font-sans">
      {!isWorkspaceFullScreen && (
        <Header
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          studyStreak={studyStreak}
          avatarDropdownOpen={avatarDropdownOpen}
          setAvatarDropdownOpen={setAvatarDropdownOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          handleLogout={handleLogout}
          onOpenAuth={(tab) => {
            setAuthTab(tab);
            setAuthForm({
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
              role: "student",
            });
            setAuthModalOpen(true);
          }}
          onResetData={handleResetData}
          onUnlockVIP={handleUnlockVIP}
          setSelectedUnit={setSelectedUnit}
          setSelectedExam={setSelectedExam}
          setExamStarted={setExamStarted}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main
          className={
            isWorkspaceFullScreen
              ? "flex-1 w-full p-0"
              : "flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
          }
        >
          {activeTab === "dashboard" && (
            <div className="[&_footer]:hidden">
              <DashboardTab
                currentUser={currentUser}
                setActiveTab={setActiveTab}
                onOpenAuth={(tab) => {
                  setAuthTab(tab);
                  setAuthModalOpen(true);
                }}
              />
            </div>
          )}

          {activeTab === "units" && (
            <UnitsTab
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              unitSubTab={unitSubTab}
              setUnitSubTab={setUnitSubTab}
              vocabFlipId={vocabFlipId}
              setVocabFlipId={setVocabFlipId}
              speakWord={speakWord}
              unitAnswers={unitAnswers}
              setUnitAnswers={setUnitAnswers}
              unitSubmitted={unitSubmitted}
              handleSubmitUnitExercise={handleSubmitUnitExercise}
              handleExplainWithAI={handleExplainWithAI}
              explainLoading={explainLoading}
              activeExplanation={activeExplanation}
              setActiveExplanation={setActiveExplanation}
              allUnits={allUnits}
            />
          )}

          {activeTab === "exams" && (
            <ExamsTab
              selectedExam={selectedExam}
              setSelectedExam={setSelectedExam}
              examStarted={examStarted}
              setExamStarted={setExamStarted}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              examAttempt={examAttempt}
              setExamAttempt={setExamAttempt}
              examAnswers={examAnswers}
              setExamAnswers={setExamAnswers}
              handleStartExam={handleStartExam}
              handleCompleteExam={handleCompleteExam}
              formatTime={formatTime}
              handleExplainWithAI={handleExplainWithAI}
              explainLoading={explainLoading}
              activeExplanation={activeExplanation}
              setActiveExplanation={setActiveExplanation}
            />
          )}

          {activeTab === "practice" && (
            <PracticeTab
              activePracticeSubTab={activePracticeSubTab}
              setActivePracticeSubTab={setActivePracticeSubTab}
              speakWord={speakWord}
              attemptsHistory={attemptsHistory}
              examAnswers={examAnswers}
              handleExplainWithAI={handleExplainWithAI}
              explainLoading={explainLoading}
              activeExplanation={activeExplanation}
              setActiveExplanation={setActiveExplanation}
            />
          )}

          {activeTab === "progress" && (
            <ProgressTab
              activeProgressSubTab={activeProgressSubTab}
              setActiveProgressSubTab={setActiveProgressSubTab}
              attemptsHistory={attemptsHistory}
              completedUnits={completedUnits}
              studyStreak={studyStreak}
            />
          )}

          {activeTab === "teacher" && currentUser?.role === "teacher" && (
            <TeacherTab
              currentUser={currentUser}
              handleLogout={handleLogout}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "teacher" && currentUser?.role !== "teacher" && (
            <StudentClassesTab currentUser={currentUser} />
          )}

          {activeTab === "admin" && (
            <AdminTab
              currentUser={currentUser}
              allUnits={allUnits}
              setAllUnits={setAllUnits}
              handleLogout={handleLogout}
              onResetData={handleResetData}
            />
          )}
        </main>

        {!isWorkspaceFullScreen && (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <AppFooter onNavigate={setActiveTab} currentTab={activeTab} role={currentUser?.role || "student"} />
          </div>
        )}
      </div>

      <AIChatBox
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatMessages={chatMessages}
        chatLoading={chatLoading}
        handleSendChatMessage={handleSendChatMessage}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        authTab={authTab}
        setAuthTab={setAuthTab}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        authSuccess={authSuccess}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
      />
    </div>
  );
}