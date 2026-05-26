import React, { useState } from "react";
import { 
  Menu, 
  X, 
  RefreshCw,
  LogOut,
  User,
  Sparkles,
  Zap,
  Home,
  BookOpen,
  GraduationCap,
  Sparkle,
  Compass,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Award,
  Users,
  ShieldAlert
} from "lucide-react";
import { VOCAFOX_LOGO_URL } from "./AuthModal";

interface HeaderProps {
  currentUser: { name: string; email: string; isPro: boolean; uid: string; role?: "student" | "teacher" | "admin" } | null;
  activeTab: "dashboard" | "units" | "exams" | "practice" | "progress" | "teacher" | "admin";
  setActiveTab: (tab: "dashboard" | "units" | "exams" | "practice" | "progress" | "teacher" | "admin") => void;
  studyStreak: number;
  avatarDropdownOpen: boolean;
  setAvatarDropdownOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onResetData: () => void;
  onUnlockVIP: () => void;
  setSelectedUnit: (unit: any) => void;
  setSelectedExam: (exam: any) => void;
  setExamStarted: (started: boolean) => void;
}

export default function Header({
  currentUser,
  activeTab,
  setActiveTab,
  studyStreak,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleLogout,
  onOpenAuth,
  onResetData,
  onUnlockVIP,
  setSelectedUnit,
  setSelectedExam,
  setExamStarted
}: HeaderProps) {
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const dynamicNavItems = (() => {
    if (currentUser?.role === "admin") {
      return [
        { id: "admin" as const, label: "Quản trị hệ thống", icon: ShieldAlert },
        { id: "units" as const, label: "Thư viện học liệu SGK", icon: BookOpen },
        { id: "exams" as const, label: "Kho đề thi thử tuyển sinh", icon: GraduationCap }
      ];
    } else if (currentUser?.role === "teacher") {
      return [
        { id: "teacher" as const, label: "Lớp học", icon: Users },
        { id: "units" as const, label: "Thư viện học liệu SGK", icon: BookOpen },
        { id: "exams" as const, label: "Kho đề thi thử tuyển sinh", icon: GraduationCap }
      ];
    } else {
      // Students gets the exact 5 items shown in Photo 3
      return [
        { id: "dashboard" as const, label: "Trang chủ", icon: Home },
        { id: "teacher" as const, label: "Lớp học", icon: Users },
        { id: "units" as const, label: "Thư viện học liệu SGK", icon: BookOpen },
        { id: "exams" as const, label: "Kho đề thi thử tuyển sinh", icon: GraduationCap },
        { id: "practice" as const, label: "Luyện tập hằng ngày", icon: Compass },
        { id: "progress" as const, label: "Báo cáo phân tích", icon: BarChart3 }
      ];
    }
  })();

  const handleTabClick = (tabId: "dashboard" | "units" | "exams" | "practice" | "progress" | "teacher" | "admin") => {
    setActiveTab(tabId);
    setSelectedUnit(null);
    setSelectedExam(null);
    setExamStarted(false);
    setMobileMenuOpen(false);
  };

  const LogoBox = () => (
    <div className="w-12 h-12 rounded-2xl bg-[#FFEFC6] flex items-center justify-center relative shadow-sm border border-[#FFE0B2] overflow-hidden">
      <img
        src={VOCAFOX_LOGO_URL}
        alt="VocaFox Mini Logo"
        className="w-10 h-10 object-contain select-none"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'inline';
        }}
      />
      {/* Fallback minimal Fox Face SVG */}
      <svg className="w-7 h-7 text-[#FF9600] hidden" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 66,54 L 54,14 C 52,10 57,8 61,12 L 82,38 Z" fill="#FF9600" />
        <path d="M 134,54 L 146,14 C 148,10 143,8 139,12 L 118,38 Z" fill="#FF9600" />
        <path d="M 52,140 C 44,110 50,88 75,66 C 82,74 92,80 100,80 C 108,80 118,74 125,66 C 150,88 156,110 148,140 C 142,162 128,172 100,172 C 72,172 58,162 52,140 Z" fill="#FF9600" />
        <path d="M 58,90 C 48,105 52,117 75,125 C 72,107 68,97 58,90 Z" fill="#FFFFFF" />
        <path d="M 142,90 C 152,105 148,117 125,125 C 128,107 132,97 142,90 Z" fill="#FFFFFF" />
      </svg>
      {/* Small green status dot */}
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full animate-pulse" />
    </div>
  );

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP/TABLET SIDEBAR MODE (md and up) */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col w-[292px] h-screen sticky top-0 bg-[rgba(255,255,255,0.85)] border-r border-[rgba(16,33,63,0.06)] p-[22px_20px] justify-between select-none z-30 shrink-0 overflow-y-auto font-sans shadow-sm">
        
        {/* Top container containing Profile branding & introduction details */}
        <div>
          
          {/* Logo & description box matching Brand Card layout in Ảnh 1 exactly */}
          <div className="bg-white border border-[#e8edf5]/80 rounded-[32px] p-[18px_18px_14px_18px] shadow-[0_12px_44px_rgba(16,33,63,0.05)] mb-[22px] flex flex-col gap-3 font-sans relative">
            
            {/* Top brand details row */}
            <div 
              onClick={() => handleTabClick("dashboard")}
              className="flex items-center gap-[12px] cursor-pointer group"
            >
              {/* Brand mark badge circle matching Ảnh 1 exactly */}
              <img
  src="/logo-1.png"
  alt="VocaFox"
  className="h-8 w-8 object-contain"
/>

              <div className="text-left font-sans">
                <h2 className="text-[21px] font-[905] tracking-tight text-[#10213f] leading-none group-hover:text-[#ff8a00] transition-colors flex items-center gap-[1px]">
                  Voca<span className="text-[#ff8a00]">Fox</span>
                </h2>
              </div>
            </div>

            {/* User Info Capsule matching Ảnh 1 exactly (nested inside the brand card) */}
            <div className="relative mt-1.5 bg-[#f4f7fc]/90 border border-[#e8edf5] rounded-[22px] p-[10px_12px] flex items-center justify-between gap-2.5 text-left w-full">
              
              <div className="flex items-center gap-[10px] min-w-0">
                {/* Avatar sphere with orange bold character */}
                <div className="w-[40px] h-[40px] rounded-full bg-white border border-[#e8edf5] flex items-center justify-center text-[#ff8a00] font-[900] text-[16px] shadow-sm shrink-0">
                  {currentUser && currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "H"}
                </div>

                <div className="min-w-0 flex flex-col justify-center">
                  <p className="text-[13px] font-[800] text-[#10213f] leading-tight truncate">
                    {currentUser ? currentUser.name : "Học viên ..."}
                  </p>
                  <p className="text-[10.5px] font-[700] text-[#667085] leading-none mt-1">
                    Lớp 9
                  </p>
                </div>
              </div>

              {/* 3-line hamburger button with 3 stacked horizontal lines */}
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`w-[36px] h-[36px] bg-white border border-[#e8edf5] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#ff8a00]/40 transition-all shadow-sm shrink-0 focus:outline-none ${dropdownOpen ? "border-[#ff8a00] h-[36px]" : ""}`}
                title="Quản lý tài khoản"
              >
                <span className="w-4 h-[2px] bg-[#10213f]/80 rounded-full"></span>
                <span className="w-4 h-[2px] bg-[#10213f]/80 rounded-full"></span>
                <span className="w-4 h-[2px] bg-[#10213f]/80 rounded-full"></span>
              </button>

              {/* Floating dropdown absolute popover list for Account & Settings */}
              {dropdownOpen && (
                <div className="absolute top-[108%] right-0 w-[210px] bg-white border border-[#e8edf5] shadow-[0_16px_48px_rgba(16,33,63,0.16)] rounded-[20px] p-2 z-50 animate-fade-in flex flex-col font-sans">
                  
                  {currentUser ? (
                    <>
                      <div className="p-2 border-b border-[#f4f7fc] select-none text-left mb-1">
                        <p className="text-[9px] font-black uppercase tracking-wider text-[#94a3b8] leading-none">Tài khoản</p>
                        <p className="text-[11px] text-[#64748b] truncate mt-1">{currentUser.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          onResetData();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-[#f4f7fc] text-[12.5px] font-[700] text-[#465872] hover:text-[#ff8a00] rounded-xl transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent outline-none"
                      >
                        Đồng bộ học lực
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          alert("Hệ thống VocaFox đang bám sát cấu trúc ôn thi Tiếng Anh 9 chuẩn Bộ GD&ĐT!");
                        }}
                        className="w-full text-left p-2 hover:bg-[#f4f7fc] text-[12.5px] font-[700] text-[#465872] hover:text-[#ff8a00] rounded-xl transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent outline-none"
                      >
                        Quản lý tài khoản
                      </button>

                      <div className="border-t border-[#f4f7fc] my-1" />

                      <button
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-xl transition-colors flex items-center gap-2 font-[700] text-[12.5px] cursor-pointer border-0 bg-transparent"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          onOpenAuth("login");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-[#f4f7fc] text-[12.5px] font-[800] text-[#10213f] rounded-xl transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                      >
                        Đăng nhập tài khoản
                      </button>
                      <button
                        onClick={() => {
                          onOpenAuth("register");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-[#fff8ef] text-[12.5px] font-[800] text-[#ff8a00] rounded-xl transition-colors flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                      >
                        Tạo tài khoản học sinh
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
          
          {/* Vertical Navigation link items (image 1 style with 58px tall elegant actions) */}
          <nav className="flex flex-col gap-[10px] px-1 font-sans">
            {dynamicNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full h-[58px] min-h-[58px] flex items-center justify-between px-[22px] rounded-[22px] font-[800] text-[15.5px] transition-all duration-300 cursor-pointer border-0 group select-none outline-none ${
                    isActive
                      ? "bg-gradient-to-r from-[#ff8a00] to-[#ffa624] text-white shadow-[0_12px_28px_rgba(255,138,0,0.22)]"
                      : "text-[#465872] bg-transparent hover:bg-[#f4f7fb] hover:text-[#10213f]"
                  }`}
                >
                  <span className="tracking-wide text-left">{item.label}</span>
                  <span className={`text-[19px] font-[900] transition-colors leading-none pb-0.5 ${
                    isActive ? "text-white" : "text-[#10213f]/40 group-hover:text-[#ff8a00]"
                  }`}>
                    ›
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions, stats & minimal streak wrapper */}
        <div className="space-y-[14px] pt-4 border-t border-[#e8edf5]">
          
          {/* Streak removed */}

        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE TOPBAR MODE (< md) */}
      {/* ========================================================= */}
      <header className="md:hidden sticky top-0 bg-[#F8FAFC] border-b border-[#E2E8F0] h-16 flex items-center justify-between px-4 z-40 select-none shadow-sm shrink-0 w-full font-sans">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => handleTabClick("dashboard")} 
          className="flex items-center gap-2 cursor-pointer"
        >
          <LogoBox />
          <div>
            <h1 className="font-display font-black text-base text-[#1E293B] tracking-tight leading-none">
              Voca<span className="text-[#FF9600]">Fox</span>
            </h1>
          </div>
        </div>

        {/* Right tools (Menu trigger) */}
        <div className="flex items-center gap-3">
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 text-xs font-bold rounded-xl bg-orange-50 text-[#FF9600] hover:bg-orange-100 border border-orange-200 cursor-pointer transition-colors"
          >
            {mobileMenuOpen ? "Đóng [X]" : "Menu ☰"}
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 3. MOBILE MENU SLIDE-IN SYSTEM DRAWER */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex font-sans">
          {/* Black Translucent Overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
          />

          {/* Side Drawer Body */}
          <div className="relative flex flex-col w-5/6 max-w-sm h-full bg-[#F8FAFC] border-r-2 border-[#E2E8F0] p-5 shadow-2xl justify-between animate-slide-right overflow-y-auto">
            
            <div className="space-y-6">
              {/* Drawer header */}
              <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
                <div onClick={() => handleTabClick("dashboard")} className="flex items-center gap-2 cursor-pointer">
                  <LogoBox />
                  <span className="font-display font-black text-base text-[#1E293B]">VocaFox Menu</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 px-1.5 border border-[#E2E8F0] rounded-lg hover:bg-slate-50"
                >
                  <X className="h-4 w-4 text-slate-400 stroke-[2.5]" />
                </button>
              </div>

              {/* Slogan */}
              <p className="text-[10px] font-black text-[#64748B] tracking-widest text-center leading-relaxed uppercase">
                Master English, Break through the Future
              </p>

              {/* Vertical Navigation Stack */}
              <nav className="space-y-1.5 px-1 font-sans">
                {dynamicNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between p-3.5 text-xs font-black rounded-xl transition-all cursor-pointer border ${
                        isActive
                          ? "bg-[#FF9600] text-white border-[#FF9600] px-4 shadow-sm"
                          : "text-slate-650 border-transparent bg-transparent hover:bg-white hover:border-[#E2E8F0]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile drawer bottom actions */}
            <div className="space-y-3.5 pt-4 border-t border-[#E2E8F0]">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E2E8F0]">
                    <div className={`w-9 h-9 rounded-full ${currentUser.role === "admin" ? "bg-rose-100 text-rose-600 border-rose-200" : currentUser.role === "teacher" ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-slate-100 text-[#FF9600] border-[#E2E8F0]"} border font-black text-xs flex items-center justify-center shrink-0`}>
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="font-bold text-xs text-slate-850 truncate leading-none">{currentUser.name}</p>
                      <p className="text-[9px] text-[#64748B] font-black uppercase mt-1 leading-none">
                        {currentUser.role === "admin" 
                          ? "Quản Trị Viên" 
                          : currentUser.role === "teacher" 
                            ? "Giáo viên" 
                            : "Học Viên VocaFox"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { onResetData(); setMobileMenuOpen(false); }}
                      className="py-2 border border-[#E2E8F0] bg-white rounded-xl text-center text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                    >
                      Đồng bộ
                    </button>
                    <button 
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl text-center text-[10px] font-black text-rose-500 transition-colors cursor-pointer"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1 font-sans">
                  <button 
                    onClick={() => { onOpenAuth("login"); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 border-2 border-[#E2E8F0] font-black text-xs text-slate-600 bg-white hover:bg-[#F8FAFC] rounded-xl transition-all cursor-pointer text-center"
                  >
                    Đăng nhập
                  </button>
                  <button 
                    onClick={() => { onOpenAuth("register"); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 bg-[#FF9600] font-black text-xs text-white rounded-xl hover:bg-[#FFA524] transition-all cursor-pointer text-center"
                  >
                    Đăng ký tài viên
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
