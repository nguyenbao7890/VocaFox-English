import React, { useEffect, useState } from "react";

export const VOCAFOX_LOGO_URL = "/logo-1.png";


function EyeIcon({ hidden = false }: { hidden?: boolean }) {
  if (hidden) {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
        <path d="M16.7 16.7A10.8 10.8 0 0 1 12 18c-5 0-8.5-4.2-9.7-6a15.5 15.5 0 0 1 3.1-3.7" />
        <path d="M8.5 5.4A10.4 10.4 0 0 1 12 5c5 0 8.5 4.2 9.7 6a15.1 15.1 0 0 1-2.2 2.8" />
        <path d="M3 3l18 18" />
      </svg>
    );
  }

  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.3 12S5.8 5 12 5s9.7 7 9.7 7-3.5 7-9.7 7-9.7-7-9.7-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authTab: "login" | "register";
  setAuthTab: (tab: "login" | "register") => void;
  authForm: any;
  setAuthForm: React.Dispatch<React.SetStateAction<any>>;
  authError: string;
  authSuccess: string;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  authTab,
  setAuthTab,
  authForm,
  setAuthForm,
  authError,
  authSuccess,
  handleLogin,
  handleRegister
}: AuthModalProps) {
  const [extraFieldVal, setExtraFieldVal] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentRole = authForm.role || "student";

  useEffect(() => {
    if (authTab === "register" && currentRole === "admin") {
      setAuthForm((prev: any) => ({ ...prev, role: "student" }));
    }
  }, [authTab, currentRole, setAuthForm]);

  const switchAuthTab = (tab: "login" | "register") => {
    setAuthTab(tab);
    if (tab === "register" && currentRole === "admin") {
      setAuthForm((prev: any) => ({ ...prev, role: "student" }));
    }
  };

  if (!isOpen) return null;

  const getRoleDetails = (role: string) => {
    switch (role) {
      case "student":
        return {
          login: "Học sinh sẽ được chuyển đến trang học tập, nhiệm vụ hằng ngày và luyện đề tiếng Anh lớp 9.",
          register: "Tài khoản học sinh dùng để học từ vựng, làm bài luyện tập, xem kết quả và theo dõi tiến độ.",
          label: "Lớp / Trường học",
          placeholder: "Ví dụ: Lớp 9A1 - THCS Nguyễn Trãi"
        };
      case "teacher":
        return {
          login: "Giáo viên đăng nhập để quản lý lớp, xem tiến độ học sinh và theo dõi kết quả luyện đề.",
          register: "Tài khoản giáo viên dùng để tạo lớp, chia sẻ mã lớp và xem báo cáo học tập của học sinh trong lớp.",
          label: "Mã giáo viên hoặc tên trường/lớp",
          placeholder: "Ví dụ: GV-THCS-NguyenTrai hoặc English 9A1"
        };
      case "admin":
      default:
        return {
          login: "Admin đăng nhập vào hệ thống để quản lý từ liệu lớp 9, đề thi vào 10 và người dùng.",
          register: "Tài khoản admin nên được quản trị viên khởi tạo hoặc cấp quyền đặc thù trong hệ thống.",
          label: "Mã bảo mật admin",
          placeholder: "Nhập mã xác thực phân quyền admin"
        };
    }
  };

  const roleNotes = getRoleDetails(currentRole);

  const handlePasswordChange = (val: string) => {
    setAuthForm({
      ...authForm,
      password: val
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white auth-page select-none">
      {/* SCOPED STYLES PREVENTING COLLISION AND RESTORING DESIGN EXCELLENCE */}
      <style>{`
        .auth-page {
          --orange: #ff7a1a;
          --orange-dark: #e85f00;
          --navy: #10213f;
          --blue: #2b78ff;
          --sky: #eaf4ff;
          --cream: #fff8ef;
          --white: #ffffff;
          --muted: #667085;
          --green: #18a058;
          --line: #e8edf5;
          --shadow: 0 24px 70px rgba(16, 33, 63, 0.12);
          --radius-xl: 32px;
          --radius-lg: 24px;
          --radius-md: 16px;
          margin: 0;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: var(--navy);
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 122, 26, 0.18), transparent 30%),
            radial-gradient(circle at 82% 5%, rgba(43, 120, 255, 0.18), transparent 28%),
            linear-gradient(180deg, #fffaf4 0%, #f7fbff 52%, #ffffff 100%);
          display: flex;
          flex-direction: column;
        }

        .auth-page a {
          color: inherit;
          text-decoration: none;
        }

        /* NAV */
        .auth-page .nav {
          width: min(1180px, calc(100% - 40px));
          margin: 20px auto 0;
          height: 72px;
          border: 1px solid rgba(16, 33, 63, 0.08);
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(18px);
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px 0 24px;
          position: relative;
          z-index: 20;
          box-shadow: 0 14px 40px rgba(16, 33, 63, 0.08);
        }

        .auth-page .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.04em;
        }

        .auth-page .brand-mark {
          width: 44px;
          height: 44px;
          border-radius: 15px;
          background: linear-gradient(135deg, var(--orange), #ffb13d);
          display: grid;
          place-items: center;
          color: white;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: -0.05em;
          box-shadow: 0 10px 25px rgba(255, 122, 26, 0.35);
        }

        .auth-page .brand-name {
          color: var(--navy);
        }

        .auth-page .brand-name span {
          color: var(--orange);
        }

        .auth-page .nav-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .auth-page .btn {
          border: 0;
          border-radius: 999px;
          padding: 13px 20px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
        }

        .auth-page .btn:hover {
          transform: translateY(-2px);
        }

        .auth-page .btn-secondary {
          background: #f3f6fb;
          color: var(--navy);
        }

        .auth-page .btn-primary {
          background: linear-gradient(135deg, var(--orange), var(--orange-dark));
          color: white;
          box-shadow: 0 14px 28px rgba(255, 122, 26, 0.28);
        }

        .auth-page .btn-blue {
          background: linear-gradient(135deg, #3c8bff, #1d58e8);
          color: white;
          box-shadow: 0 14px 28px rgba(43, 120, 255, 0.25);
        }

        /* LAYOUT */
        .auth-page .auth-wrapper {
          width: min(1180px, calc(100% - 40px));
          margin: 64px auto 70px;
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 56px;
          align-items: center;
        }

        /* LEFT */
        .auth-page .auth-hero {
          position: relative;
        }

        .auth-page .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 122, 26, 0.12);
          color: #c94d00;
          border: 1px solid rgba(255, 122, 26, 0.2);
          padding: 9px 14px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 13px;
          margin-bottom: 22px;
        }

        .auth-page h1 {
          font-size: clamp(32px, 4vw, 54px);
          line-height: .96;
          letter-spacing: -0.075em;
          margin: 0 0 22px;
          text-align: left;
        }

        .auth-page .gradient-text {
          background: linear-gradient(135deg, var(--orange), #ffb13d 45%, var(--blue));
          -webkit-background-clip: text;
          color: transparent;
        }

        .auth-page .fox-learner {
          white-space: nowrap;
          display: inline-block;
        }

        .auth-page .subtitle {
          font-size: 17px;
          line-height: 1.7;
          color: #53627a;
          margin: 0 0 30px;
          max-width: 620px;
          text-align: left;
        }

        .auth-page .trust-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          color: #53627a;
          font-weight: 700;
          font-size: 14px;
        }

        .auth-page .trust-row span {
          display: inline-flex;
          align-items: center;
          background: rgba(255,255,255,.7);
          border: 1px solid rgba(16,33,63,.08);
          padding: 10px 13px;
          border-radius: 999px;
        }

        /* MINI PREVIEW */
        .auth-page .preview-card {
          margin-top: 34px;
          background: white;
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          padding: 24px;
          box-shadow: 0 18px 55px rgba(16, 33, 63, 0.10);
          max-width: 520px;
          position: relative;
          overflow: hidden;
          text-align: left;
        }

        .auth-page .preview-card:after {
          content: "";
          position: absolute;
          width: 210px;
          height: 210px;
          border-radius: 50%;
          right: -80px;
          top: -80px;
          background: rgba(255,122,26,.14);
        }

        .auth-page .preview-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          position: relative;
          z-index: 2;
        }

        .auth-page .preview-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 800;
        }

        .auth-page .preview-mark {
          width: 54px;
          height: 54px;
          border-radius: 19px;
          background: linear-gradient(135deg, #ff7a1a, #ffb13d);
          display: grid;
          place-items: center;
          color: white;
          font-weight: 900;
          letter-spacing: -0.06em;
          box-shadow: 0 12px 26px rgba(255,122,26,.25);
        }

        .auth-page .badge {
          background: var(--sky);
          color: #1d58e8;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .auth-page .preview-list {
          display: grid;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .auth-page .preview-item {
          background: #f8fbff;
          border: 1px solid rgba(16,33,63,.07);
          border-radius: 18px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .auth-page .preview-item b {
          display: block;
          margin-bottom: 5px;
        }

        .auth-page .preview-item small {
          color: var(--muted);
          font-weight: 600;
        }

        .auth-page .score {
          font-weight: 900;
          color: var(--orange-dark);
        }

        /* AUTH CARD */
        .auth-page .auth-card {
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(16,33,63,.08);
          border-radius: 38px;
          box-shadow: var(--shadow);
          padding: 34px;
          position: relative;
        }

        .auth-page .auth-card-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-page .auth-card-header h2 {
          margin: 0 0 10px;
          font-size: clamp(26px, 3.5vw, 36px);
          line-height: 1.05;
          letter-spacing: -0.065em;
        }

        .auth-page .auth-card-header p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          font-weight: 500;
        }

        /* TABS */
        .auth-page .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #f3f6fb;
          border-radius: 999px;
          padding: 6px;
          margin-bottom: 22px;
        }

        .auth-page .tab-btn {
          border: 0;
          border-radius: 999px;
          padding: 13px 16px;
          background: transparent;
          color: #53627a;
          font-weight: 800;
          cursor: pointer;
          transition: .2s ease;
        }

        .auth-page .tab-btn.active {
          background: white;
          color: var(--navy);
          box-shadow: 0 8px 24px rgba(16,33,63,.08);
        }

        /* ROLE */
        .auth-page .role-title {
          font-weight: 800;
          font-size: 14px;
          margin: 0 0 12px;
          text-align: left;
        }

        .auth-page .role-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 11px;
          margin-bottom: 22px;
        }

        .auth-page .role-option input {
          display: none;
        }

        .auth-page .role-card {
          cursor: pointer;
          background: #ffffff;
          border: 1.5px solid var(--line);
          border-radius: 20px;
          padding: 18px 12px;
          text-align: center;
          transition: .2s ease;
        }

        .auth-page .role-card b {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .auth-page .role-card small {
          color: var(--muted);
          font-weight: 600;
          font-size: 11px;
        }

        .auth-page .role-option input:checked + .role-card {
          border-color: var(--orange);
          background: #fff7ee;
          box-shadow: 0 14px 32px rgba(255,122,26,.16);
          transform: translateY(-2px);
        }

        /* FORMS */
        .auth-page .form {
          display: none;
        }

        .auth-page .form.active {
          display: block;
        }

        .auth-page .form-row {
          display: grid;
          gap: 8px;
          margin-bottom: 15px;
        }

        .auth-page .form-row label {
          font-size: 13px;
          font-weight: 800;
          color: #344054;
          text-align: left;
        }

        .auth-page .input-wrap {
          position: relative;
        }

        .auth-page .input-wrap.has-toggle input {
          padding-right: 50px;
        }

        .auth-page .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: #98a2b3;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: color .18s ease, background .18s ease, transform .18s ease;
        }

        .auth-page .password-toggle:hover {
          background: #f4f7fb;
          color: var(--orange);
          transform: translateY(-50%) scale(1.05);
        }

        .auth-page .password-toggle:focus-visible {
          outline: 3px solid rgba(255, 122, 26, .22);
          outline-offset: 2px;
        }

        .auth-page .password-toggle svg {
          display: block;
        }

        .auth-page input,
        .auth-page select {
          width: 100%;
          border: 1px solid var(--line);
          background: white;
          border-radius: 17px;
          padding: 15px 16px;
          font: inherit;
          color: var(--navy);
          outline: none;
          transition: .2s ease;
        }

        .auth-page input:focus,
        .auth-page select:focus {
          border-color: rgba(255,122,26,.65);
          box-shadow: 0 0 0 4px rgba(255,122,26,.12);
        }

        .auth-page .form-options {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin: 4px 0 20px;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }

        .auth-page .checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-page .checkbox input {
          width: 16px;
          height: 16px;
          padding: 0;
        }

        .auth-page .forgot {
          color: var(--blue);
          font-weight: 800;
        }

        .auth-page .submit-btn {
          width: 100%;
          padding: 15px 20px;
          font-size: 15px;
          margin-bottom: 16px;
        }


        .auth-page .switch-note {
          text-align: center;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          margin: 18px 0 0;
        }

        .auth-page .switch-note button {
          border: 0;
          background: transparent;
          color: var(--orange-dark);
          font-weight: 900;
          cursor: pointer;
        }

        .auth-page .role-note {
          margin-top: 14px;
          background: #f8fbff;
          border: 1px solid var(--line);
          color: #53627a;
          border-radius: 18px;
          padding: 13px 14px;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 600;
          text-align: left;
        }

        /* FOOTER */
        .auth-page .footer-note {
          text-align: center;
          color: var(--muted);
          font-size: 13px;
          font-weight: 600;
          margin-top: 24px;
        }

        /* RESPONSIVE */
        @media (max-width: 980px) {
          .auth-page .auth-wrapper {
            grid-template-columns: 1fr;
            gap: 34px;
            margin-top: 32px;
          }

          .auth-page .auth-hero {
            text-align: center;
          }

          .auth-page .auth-hero h1,
          .auth-page .auth-hero .subtitle {
            text-align: center;
            margin-left: auto;
            margin-right: auto;
          }

          .auth-page .subtitle,
          .auth-page .preview-card {
            margin-left: auto;
            margin-right: auto;
          }

          .auth-page .trust-row {
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .auth-page .nav {
            width: calc(100% - 24px);
            padding-left: 14px;
          }

          .auth-page .brand-name {
            font-size: 18px;
          }

          .auth-page .nav-actions .btn-secondary {
            display: none;
          }

          .auth-page .auth-wrapper {
            width: calc(100% - 24px);
            margin-top: 24px;
          }

          .auth-page .auth-card {
            padding: 22px;
            border-radius: 28px;
          }

          .auth-page .role-grid {
            grid-template-columns: 1fr;
          }

          .auth-page .role-card {
            text-align: center;
            padding: 16px;
          }

          .auth-page .form-options {
            flex-direction: column;
            align-items: flex-start;
          }

          .auth-page .preview-card {
            display: none;
          }
        }
      `}</style>

      {/* FLOATING TOP-RIGHT CLOSE BUTTON PRECISELY ACCORDING TO SCREENSHOT */}
      <button 
        type="button"
        onClick={onClose}
        id="btn-close-modal"
        className="absolute top-6 right-6 sm:top-8 sm:right-8 py-2.5 px-5 rounded-full text-slate-500 hover:text-slate-900 font-extrabold text-xs tracking-wider border-2 border-[#e8edf5] bg-white hover:bg-[#FAF9F8] shadow-sm z-50 transition-all cursor-pointer uppercase outline-none"
      >
        ĐÓNG QUAY LẠI [X]
      </button>

      {/* HEADER NAVIGATION */}
      <nav className="nav" id="auth-nav">
        <a href="#home" onClick={(e) => { e.preventDefault(); onClose(); }} className="brand" id="brand-logo">
          <img
  src="/logo-1.png"
  alt="VocaFox"
  className="h-8 w-8 object-contain"
/>
          <span className="brand-name">Voca<span>Fox</span></span>
        </a>

        <div className="nav-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} id="nav-btn-home">
            Về trang chủ
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose} id="nav-btn-start">
            Bắt đầu học
          </button>
        </div>
      </nav>

      {/* HERO & FORM WRAPPER */}
      <section className="auth-wrapper" id="auth-main-wrapper">

        {/* LEFT COLUMN: BRAND HERO ACTION PROMOTION */}
        <div className="auth-hero" id="left-hero-panel">
          <div className="eyebrow" id="hero-eyebrow">
            Đăng nhập để tiếp tục hành trình tiếng Anh lớp 9
          </div>

          <h1 id="hero-heading">
            <span className="gradient-text">Welcome back,<span className="fox-learner"> Fox Learner!</span></span>
          </h1>

          <p className="subtitle" id="hero-subtitle">
            Chọn vai trò của bạn để đăng nhập hoặc tạo tài khoản VocaFox. Học sinh luyện tập mỗi ngày, 
            giáo viên đồng hành bám sát, admin quản trị toàn diện hệ thống.
          </p>

          <div className="trust-row flex justify-start items-center" id="trust-indicator-row">
            <span>Học từ vựng lớp 9</span>
            <span>Luyện đề vào 10</span>
            <span>Theo dõi tiến độ</span>
          </div>

          <div className="preview-card" id="preview-data-card">
            <div className="preview-top">
              <div className="preview-title">
                <img
  src="/logo-1.png"
  alt="VocaFox"
  className="h-8 w-8 object-contain"
/>
                <div>
                  <b className="block">Bảng học hôm nay</b>
                  <small style={{ color: "#667085", fontWeight: "700" }}>15 phút để tiến bộ hơn</small>
                </div>
              </div>
              <span className="badge">Grade 9</span>
            </div>

            <div className="preview-list">
              <div className="preview-item">
                <div>
                  <b>Vocabulary Mission</b>
                  <small>12 từ mới về Environment</small>
                </div>
                <span className="score">+20 XP</span>
              </div>

              <div className="preview-item">
                <div>
                  <b>Grammar Boost</b>
                  <small>Câu bị động & mệnh đề quan hệ</small>
                </div>
                <span className="score">72%</span>
              </div>

              <div className="preview-item">
                <div>
                  <b>Mini Test</b>
                  <small>10 câu luyện thi nhanh</small>
                </div>
                <span className="score">B1</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GORGEOUS INTERACTIVE AUTHENTICATION BLOC */}
        <div className="auth-card" id="right-form-panel">
          
          <div className="auth-card-header">
            <h2>Vào VocaFox</h2>
            <p>Đăng nhập hoặc tạo tài khoản mới theo vai trò của bạn.</p>
          </div>

          {/* TAB CONTROL SWITCHES */}
          <div className="auth-tabs" id="auth-tab-switchees">
            <button 
              type="button"
              className={`tab-btn ${authTab === "login" ? "active" : ""}`}
              onClick={() => {
                switchAuthTab("login");
              }}
              id="tab-trigger-login"
            >
              Đăng nhập
            </button>
            <button 
              type="button"
              className={`tab-btn ${authTab === "register" ? "active" : ""}`}
              onClick={() => {
                switchAuthTab("register");
              }}
              id="tab-trigger-register"
            >
              Đăng ký
            </button>
          </div>

          <p className="role-title">{authTab === "register" ? "Đăng ký với vai trò" : "Bạn là ai?"}</p>

          {/* CHOOSE VÌ SAO BẠN TRÊN HỆ THỐNG */}
          <div className="role-grid" id="auth-role-selectors">
            <label className="role-option">
              <input 
                type="radio" 
                name="role" 
                value="student" 
                checked={currentRole === "student"} 
                onChange={() => setAuthForm({ ...authForm, role: "student" })}
              />
              <div className="role-card">
                <b>Học sinh</b>
                <small>Luyện học mỗi ngày</small>
              </div>
            </label>

            <label className="role-option">
              <input 
                type="radio" 
                name="role" 
                value="teacher" 
                checked={currentRole === "teacher"} 
                onChange={() => setAuthForm({ ...authForm, role: "teacher" })}
              />
              <div className="role-card">
                <b>Giáo viên</b>
                <small>Quản lý lớp học</small>
              </div>
            </label>

            {authTab === "login" && (
              <label className="role-option">
                <input 
                  type="radio" 
                  name="role" 
                  value="admin" 
                  checked={currentRole === "admin"} 
                  onChange={() => setAuthForm({ ...authForm, role: "admin" })}
                />
                <div className="role-card">
                  <b>Admin</b>
                  <small>Quản trị hệ thống</small>
                </div>
              </label>
            )}
          </div>

          {/* ALERTS POPUPS */}
          {authError && (
            <div className="bg-rose-50 border-2 border-rose-100 text-rose-700 p-3.5 rounded-2xl text-xs font-bold text-left mb-4" id="auth-error-block">
              ⚠️ {authError}
            </div>
          )}
          {authSuccess && authTab === "login" && (
            <div className="bg-emerald-50 border-2 border-emerald-100 text-emerald-700 p-3.5 rounded-2xl text-xs font-bold text-left mb-4" id="auth-success-block">
              🎉 {authSuccess}
            </div>
          )}

          {/* DYNAMIC SUBMISSION FORMS */}
          {authTab === "login" ? (
            <form onSubmit={handleLogin} className="form active" id="loginForm">
              <div className="form-row">
                <label>Email</label>
                <div className="input-wrap">
                  <input 
                    type="email" 
                    placeholder={
                      currentRole === "teacher" 
                        ? "giaovien@gmail.com" 
                        : currentRole === "admin" 
                          ? "nbao8887@gmail.com" 
                          : "hocsinh9a1@gmail.com"
                    }
                    required 
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    id="input-login-email"
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Mật khẩu</label>
                <div className="input-wrap has-toggle">
                  <input 
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="Mật khẩu tài khoản (Ví dụ: 123456)" 
                    required 
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    id="input-login-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    title={showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <EyeIcon hidden={showLoginPassword} />
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox">
                  <input type="checkbox" defaultChecked className="accent-[#ff7a1a]" />
                  Ghi nhớ đăng nhập
                </label>

                <a 
                  href="#forgot" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    alert("Tính năng khôi phục tài khoản đang chạy thử nghiệm. Vui lòng liên hệ quản trị viên nếu bạn cần đặt lại mật khẩu."); 
                  }} 
                  className="forgot"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <button className="btn btn-primary submit-btn uppercase" type="submit" id="btn-submit-login">
                Đăng nhập vào VocaFox
              </button>

              <div className="role-note" id="loginRoleNote">
                {roleNotes.login}
              </div>

              <p className="switch-note">
                Chưa có tài khoản?{" "}
                <button type="button" onClick={() => switchAuthTab("register")} id="btn-switch-to-register">Đăng ký ngay</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="form active" id="registerForm">
              <div className="form-row">
                <label>Họ và tên</label>
                <div className="input-wrap">
                  <input 
                    type="text" 
                    placeholder={
                      currentRole === "teacher" 
                        ? "Ví dụ: Lê Thị Thanh Nhàn" 
                        : currentRole === "admin" 
                          ? "Ví dụ: Vương Thừa Vũ" 
                          : "Ví dụ: Nguyễn Minh Anh"
                    }
                    required 
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    id="input-register-name"
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Email</label>
                <div className="input-wrap">
                  <input 
                    type="email" 
                    placeholder="email-dangki@gmail.com" 
                    required 
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    id="input-register-email"
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Mật khẩu</label>
                <div className="input-wrap has-toggle">
                  <input 
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Tạo mật khẩu an toàn (Ít nhất 6 ký tự)" 
                    required 
                    value={authForm.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    id="input-register-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    aria-label={showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    title={showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <EyeIcon hidden={showRegisterPassword} />
                  </button>
                </div>
              </div>

              <div className="form-row">
                <label>Xác nhận mật khẩu</label>
                <div className="input-wrap has-toggle">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu vừa tạo" 
                    required 
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                    id="input-register-confirm-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <EyeIcon hidden={showConfirmPassword} />
                  </button>
                </div>
              </div>

              {/* EXTRA ADAPTIVE INPUT BLOCK BASED ON SELECTED ROLE */}
              <div className="form-row" id="extraField">
                <label>{roleNotes.label}</label>
                <div className="input-wrap">
                  <input 
                    type="text" 
                    required
                    placeholder={roleNotes.placeholder}
                    value={extraFieldVal}
                    onChange={(e) => setExtraFieldVal(e.target.value)}
                    id="input-register-extra-field"
                  />
                </div>
              </div>

              <button className="btn btn-primary submit-btn uppercase" type="submit" id="btn-submit-register">
                Tạo tài khoản VocaFox
              </button>

              <div className="role-note" id="registerRoleNote">
                {roleNotes.register}
                {authTab === "register" && (
                  <div style={{ marginTop: 8 }}>Tài khoản Admin không được tạo từ màn hình đăng ký công khai.</div>
                )}
              </div>

              <p className="switch-note">
                Đã có tài khoản?{" "}
                <button type="button" onClick={() => switchAuthTab("login")} id="btn-switch-to-login">Đăng nhập</button>
              </p>
            </form>
          )}

          <div className="footer-note" id="footer-branding-note">
            © 2026 VocaFox. Master English, Conquer the Future.
          </div>
        </div>

      </section>
    </div>
  );
}
