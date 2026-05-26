import React from "react";
import {
  BookOpen,
  GraduationCap,
  ClipboardList,
  BarChart3,
  Bot,
  ShieldCheck,
  Mail,
  Headphones,
  ExternalLink
} from "lucide-react";

type VocaFoxFooterProps = {
  onNavigate?: (tab: string) => void;
};

const toolGroups = [
  {
    title: "Không gian học tập",
    items: [
      { label: "Trang chủ học viên", tab: "home", icon: GraduationCap },
      { label: "Lớp học", tab: "classroom", icon: BookOpen },
      { label: "Thư viện học liệu SGK", tab: "materials", icon: BookOpen },
      { label: "Kho đề thi thử tuyển sinh", tab: "exams", icon: ClipboardList }
    ]
  },
  {
    title: "Công cụ luyện tập",
    items: [
      { label: "Luyện tập hằng ngày", tab: "practice", icon: ClipboardList },
      { label: "Báo cáo phân tích", tab: "analytics", icon: BarChart3 },
      { label: "FoxieAI trợ lý học tập", tab: "ai", icon: Bot }
    ]
  },
  {
    title: "Lớp học",
    items: [
      { label: "Dashboard giáo viên", tab: "teacher", icon: GraduationCap },
      { label: "Công cụ lớp học", tab: "classroom", icon: ShieldCheck }
    ]
  }
];

const VocaFoxFooter: React.FC<VocaFoxFooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                🦊
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  Voca<span className="text-orange-500">Fox</span>
                </h2>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700">
                  English Learning Platform
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-500">
              Nền tảng học tiếng Anh lớp 9, ôn luyện đề thi vào 10, quản lý học liệu,
              phân tích tiến độ và hỗ trợ học tập bằng FoxieAI.
            </p>

            <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-sky-800">
                Page
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-800">
                VocaFox English
              </p>
            </div>
          </div>

          {/* Tools */}
          <div className="grid gap-6 sm:grid-cols-3">
            {toolGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                  {group.title}
                </h3>

                <div className="mt-4 space-y-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleNavigate(item.tab)}
                        className="group flex w-full items-center gap-2 rounded-xl px-0 py-1.5 text-left text-sm font-bold text-slate-500 transition hover:text-sky-700"
                      >
                        <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-sky-600" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Liên hệ & hỗ trợ
            </h3>

            <div className="mt-4 space-y-3">
              <a
                href="mailto:nbao8887@gmail.com"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                <Mail className="h-5 w-5 text-orange-500" />
                <span className="break-all">nbao8887@gmail.com</span>
              </a>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <Headphones className="mt-0.5 h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm font-extrabold text-slate-800">
                    Hỗ trợ học tập & kỹ thuật
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Liên hệ khi cần hỗ trợ tài khoản, lớp học, học liệu, đề thi hoặc FoxieAI.
                  </p>
                </div>
              </div>

              <a
                href="mailto:nbao8887@gmail.com?subject=Hỗ trợ VocaFox English"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-600"
              >
                Gửi yêu cầu hỗ trợ
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 text-xs font-bold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} VocaFox English. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-3">
            <span>SGK English 9</span>
            <span>•</span>
            <span>Exam Bank</span>
            <span>•</span>
            <span>FoxieAI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default VocaFoxFooter;