import React, { useState, useEffect } from "react";
import { 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Compass, 
  Award, 
  ChevronRight, 
  Sparkles, 
  BookOpenCheck, 
  Calendar, 
  Target, 
  Trophy, 
  X,
  Play,
  Send,
  MessageSquare
} from "lucide-react";
import { VOCAFOX_LOGO_URL } from "./AuthModal";

interface DashboardTabProps {
  currentUser: any;
  setActiveTab: (tab: any) => void;
  onOpenAuth: (tab: any) => void;
}

const HANDBOOK_TIPS = [
  {
    category: "Phát âm & Trọng âm",
    title: "Mẹo phát âm đuôi -ED dễ nhớ",
    content: "Đuôi -ED được phát âm theo 3 quy tắc sau:\n\n1. Quy tắc /ɪd/: Động từ kết thúc bằng phụ âm /t/ hoặc /d/ (Ví dụ: wanted, needed, hoặc các tính từ đặc biệt: sacred, naked).\n2. Quy tắc /t/: Động từ kết thúc bằng các âm vô thanh: s, f, p, k, sh, ch (ví dụ: stopped, cooked, laughed, washed).\n3. Quy tắc /d/: Các nguyên âm hữu thanh và âm còn lại."
  },
  {
    category: "Phát âm & Trọng âm",
    title: "Mẹo phát âm đuôi -S/ES",
    content: "Dưới đây là 3 quy tắc phát âm đuôi -S/ES hệ thống nhất:\n\n1. Quy tắc /s/: Kết thúc bằng các phụ âm vô thanh /p, t, k, f, θ/ (ví dụ: stops, cats, books).\n2. Quy tắc /ɪz/: Kết thúc bằng các âm s, z, x, sh, ch, ge, ce (ví dụ: boxes, houses, washes, changes).\n3. Quy tắc /z/: Các trường hợp hữu thanh còn lại."
  },
  {
    category: "Ngữ pháp Trọng điểm",
    title: "Cấu trúc Ước (WISH) chinh phục điểm 9, 10",
    content: "Dạng bài viết lại câu với WISH luôn có trong đề thi:\n\n* Ước tương lai: S1 + wish(es) + S2 + would/could + V-inf\n* Ước hiện tại: S1 + wish(es) + S2 + V2/ed (động từ To-be đổi thành were cho tất cả ngôi)\n* Ước quá khứ: S1 + wish(es) + S2 + had + V3/ed (bày tỏ sự nuối tiếc ở quá khứ)"
  },
  {
    category: "Ngữ pháp Trọng điểm",
    title: "Cú pháp So Sánh Kép (Double Comparative)",
    content: "Cấu trúc diễn tả mối quan hệ nhân quả tương ứng 'Càng... thì càng...':\n\n* Công thức: The + so sánh hơn + S + V, the + so sánh hơn + S + V.\n* Ví dụ đầy đủ:\n  - The older she gets, the wiser she becomes. (Cô ấy càng lớn, cô ấy càng thông thái).\n  - The more you practice, the better you perform."
  }
];

export default function DashboardTab({ currentUser, setActiveTab, onOpenAuth }: DashboardTabProps) {
  const [activeTip, setActiveTip] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Foxie AI chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    {
      sender: "ai",
      text: "Xin chào! Mình là FoxieAI. Bạn muốn mình giúp ôn từ vựng, giải thích ngữ pháp hay gợi ý bài luyện hôm nay?"
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // Supabase migration: lectures are optional; keep empty until a dedicated table/API is added.
    setLectures([]);
  }, []);

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      if (data && data.reply) {
        setChatMessages(prev => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { sender: "ai", text: "Xin lỗi, đã xảy ra lỗi từ máy chủ AI hoặc thiếu GEMINI_API_KEY." }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: "ai", text: "Lỗi kết nối máy chủ AI VocaFox." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const completedLessons =
    Array.isArray(currentUser?.completed_units)
      ? currentUser.completed_units.length
      : Array.isArray(currentUser?.completedUnits)
        ? currentUser.completedUnits.length
        : Number(currentUser?.completed_lessons || currentUser?.completedLessons || 0);

  const reviewedWords = Number(
    currentUser?.reviewed_words ||
    currentUser?.reviewedWords ||
    currentUser?.vocabulary_reviewed ||
    currentUser?.vocabularyReviewed ||
    0
  );

  const latestExamScoreRaw =
    currentUser?.latest_exam_score ??
    currentUser?.latestExamScore ??
    currentUser?.last_exam_score ??
    currentUser?.lastExamScore ??
    null;

  const latestExamScore =
    latestExamScoreRaw !== null && latestExamScoreRaw !== undefined && latestExamScoreRaw !== ""
      ? Number(latestExamScoreRaw).toFixed(1)
      : "—";

  const readinessLevel =
    currentUser?.readiness_level ||
    currentUser?.readinessLevel ||
    "Chưa có";

  return (
    <div className="space-y-8 animate-fade-in font-sans select-none">
      
      {/* SCOPED COMPONENT STYLES FOR REDESIGNED MATCHING LOOK */}
      <style>{`
        .custom-dashboard {
          --orange: #ff8a00;
          --orange-dark: #e85f00;
          --navy: #10213f;
          --blue: #2b78ff;
          --sky: #eaf4ff;
          --cream: #fff8ef;
          --white: #ffffff;
          --muted: #667085;
          --line: #e8edf5;
          --soft-line: rgba(16, 33, 63, 0.08);
          --shadow: 0 24px 70px rgba(16, 33, 63, 0.12);
        }

        /* HERO */
        .hero-panel {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 18% 0%, rgba(255, 138, 0, .14), transparent 28%),
            linear-gradient(135deg, #ffffff 0%, #fffaf3 52%, #f6fbff 100%);
          border: 1px solid rgba(255, 138, 0, .16);
          border-radius: 38px;
          padding: 46px;
          box-shadow: var(--shadow);
        }

        .hero-panel:after {
          content: "";
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          right: -110px;
          top: -120px;
          background: rgba(43, 120, 255, .1);
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          gap: 34px;
          align-items: center;
        }

        .hero-kicker {
          display: inline-flex;
          width: fit-content;
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(255, 138, 0, .1);
          color: var(--orange-dark);
          border: 1px solid rgba(255, 138, 0, .22);
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 18px;
        }

        .hero-title {
          margin: 0 0 18px;
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.1;
          letter-spacing: -0.075em;
          font-weight: 900;
          color: #10213f;
          text-align: left;
        }

        .hero-title .brand-span {
          color: #ff8a00;
        }

        .hero-desc {
          margin: 0 0 28px;
          color: #53627a;
          font-size: 16px;
          line-height: 1.7;
          font-weight: 600;
          max-width: 680px;
          text-align: left;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        /* HERO IMAGE */
        .hero-image-card {
          position: relative;
          min-height: 390px;
          background:
            radial-gradient(circle at 18% 18%, rgba(255, 138, 0, .16), transparent 28%),
            radial-gradient(circle at 88% 10%, rgba(43, 120, 255, .14), transparent 30%),
            linear-gradient(145deg, #ffffff, #f8fbff);
          border: 1px solid var(--line);
          border-radius: 34px;
          padding: 18px;
          box-shadow: 0 18px 48px rgba(16, 33, 63, 0.09);
          overflow: hidden;
          display: grid;
          place-items: center;
        }

        .student-illustration {
          width: min(100%, 520px);
          height: auto;
          display: block;
          filter: drop-shadow(0 20px 36px rgba(16, 33, 63, 0.08));
        }

        /* STATS */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin: 24px 0;
        }

        .stat-card {
          background: white;
          border: 1px solid var(--line);
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 12px 32px rgba(16, 33, 63, 0.06);
          text-align: left;
        }

        .stat-card small {
          display: block;
          color: var(--muted);
          font-weight: 800;
          margin-bottom: 10px;
        }

        .stat-card b {
          font-size: 30px;
          letter-spacing: -0.06em;
          color: #10213f;
          font-weight: 900;
        }

        .stat-card span {
          display: block;
          margin-top: 8px;
          color: #53627a;
          font-size: 13px;
          font-weight: 700;
        }

        /* SECTIONS */
        .section-head {
          margin: 38px 0 18px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
        }

        .section-head h2 {
          margin: 0 0 8px;
          font-size: 32px;
          letter-spacing: -0.06em;
          font-weight: 900;
          color: #10213f;
          text-align: left;
        }

        .section-head p {
          margin: 0;
          color: var(--muted);
          font-weight: 600;
          line-height: 1.6;
          text-align: left;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .tool-card {
          background: white;
          border: 1px solid var(--line);
          border-radius: 28px;
          padding: 26px;
          min-height: 230px;
          box-shadow: 0 12px 34px rgba(16, 33, 63, 0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: .2s ease;
          text-align: left;
        }

        .tool-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(16, 33, 63, 0.10);
          border-color: rgba(255, 138, 0, .35);
        }

        .tool-card h3 {
          margin: 0 0 12px;
          font-size: 22px;
          letter-spacing: -0.045em;
          font-weight: 900;
          color: #10213f;
        }

        .tool-card p {
          margin: 0;
          color: #5f6f89;
          font-weight: 600;
          line-height: 1.65;
        }

        .tool-link {
          margin-top: 24px;
          width: fit-content;
          color: var(--orange-dark);
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* HOME SHOWCASE */
        .home-english-section {
          margin-top: 38px;
        }

        .english-showcase {
          background:
            radial-gradient(circle at 16% 12%, rgba(255, 138, 0, .16), transparent 28%),
            radial-gradient(circle at 88% 0%, rgba(43, 120, 255, .14), transparent 30%),
            linear-gradient(135deg, #ffffff, #fffaf3 52%, #f6fbff);
          border: 1px solid rgba(255, 138, 0, .16);
          border-radius: 38px;
          padding: 42px;
          display: grid;
          grid-template-columns: .95fr 1.05fr;
          gap: 34px;
          align-items: center;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .showcase-label {
          display: inline-flex;
          width: fit-content;
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(255, 138, 0, .1);
          color: var(--orange-dark);
          border: 1px solid rgba(255, 138, 0, .22);
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 18px;
        }

        .showcase-content h2 {
          margin: 0 0 16px;
          font-size: clamp(30px, 4vw, 42px);
          line-height: 1.1;
          letter-spacing: -0.065em;
          font-weight: 900;
          color: #10213f;
          text-align: left;
        }

        .showcase-content p {
          margin: 0;
          color: #53627a;
          font-size: 16px;
          line-height: 1.75;
          font-weight: 600;
          text-align: left;
        }

        .showcase-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .showcase-tags span {
          background: white;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 10px 14px;
          color: var(--navy);
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 10px 24px rgba(16,33,63,.06);
        }

        .study-photo-card {
          min-height: 360px;
          border-radius: 34px;
          background:
            linear-gradient(rgba(16, 33, 63, .05), rgba(16, 33, 63, .05)),
            url("https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80");
          background-size: cover;
          background-position: center;
          box-shadow: 0 24px 60px rgba(16,33,63,.14);
          border: 1px solid rgba(255,255,255,.7);
        }

        /* FOXIE AI */
        .ai-chat-embedded {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 50;
        }

        .ai-panel-embedded {
          width: 330px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 26px;
          box-shadow: 0 24px 70px rgba(16, 33, 63, 0.18);
          overflow: hidden;
          margin-bottom: 14px;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .ai-head-embedded {
          background: linear-gradient(135deg, var(--navy), #173766);
          color: white;
          padding: 18px;
          text-align: left;
        }

        .ai-head-embedded b {
          display: block;
          font-size: 17px;
          margin-bottom: 4px;
        }

        .ai-head-embedded small {
          color: rgba(255,255,255,.72);
          font-weight: 600;
        }

        .ai-body-embedded {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 260px;
          overflow-y: auto;
        }

        .ai-message-embedded {
          border-radius: 18px;
          padding: 13px 14px;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 600;
          max-width: 90%;
        }

        .ai-message-embedded.ai {
          background: #f8fbff;
          border: 1px solid var(--line);
          color: #53627a;
          align-self: flex-start;
          text-align: left;
        }

        .ai-message-embedded.user {
          background: #ff8a00;
          color: white;
          align-self: flex-end;
          text-align: left;
        }

        .ai-input-embedded {
          display: flex;
          gap: 8px;
          padding: 0 18px 18px;
        }

        .ai-input-embedded input {
          flex: 1;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 12px 14px;
          outline: none;
          font-weight: 600;
          font-size: 13px;
        }

        .ai-input-embedded input:focus {
          border-color: rgba(255, 138, 0, .6);
        }

        .ai-send-embedded {
          border: 0;
          border-radius: 999px;
          padding: 0 14px;
          background: #ff8a00;
          color: white;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-toggle-embedded {
          width: 72px;
          height: 72px;
          border: 0;
          border-radius: 26px;
          background: linear-gradient(135deg, #ff8a00, #e85f00);
          color: white;
          box-shadow: 0 18px 44px rgba(255, 138, 0, 0.34);
          cursor: pointer;
          display: grid;
          place-items: center;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        /* RESPONSIVE */
        @media (max-width: 1100px) {
          .hero-inner,
          .english-showcase {
            grid-template-columns: 1fr;
          }

          .stats-grid,
          .tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 720px) {
          .hero-panel {
            padding: 28px;
            border-radius: 28px;
          }

          .hero-actions .btn {
            width: 100%;
          }

          .hero-image-card {
            min-height: 300px;
            border-radius: 28px;
          }

          .student-illustration {
            width: 100%;
          }

          .stats-grid,
          .tools-grid {
            grid-template-columns: 1fr;
          }

          .section-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .english-showcase {
            padding: 28px;
            border-radius: 28px;
          }

          .study-photo-card {
            min-height: 280px;
            border-radius: 28px;
          }

          .ai-panel-embedded {
            width: calc(100vw - 32px);
          }
        }
      `}</style>
      
      <div className="custom-dashboard space-y-8">

        {/* --- DYNAMIC WELCOME TITLE --- */}
        <div className="text-left py-1">
          <p className="text-[#ff8a00] font-black text-xs uppercase tracking-widest">
            {currentUser?.role === "student" ? "KHÔNG GIAN HỌC TẬP" : "TRANG CHỦ HỆ THỐNG"}
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-[#10213f] tracking-tight">
            Chào mừng học viên, <span className="text-[#ff8a00]">{currentUser?.name || "Fox Learner"}</span>!
          </h2>
        </div>


        {/* --- 1. HERO PANEL IN DESIRED DESIGN STYLE --- */}
        <section className="hero-panel" id="home">
          <div className="hero-inner">
            <div className="flex flex-col justify-center">
              <div className="hero-kicker font-sans">English Grade 9 Learning Space</div>

              <h1 className="hero-title">
                Chào mừng tới <span className="brand-span">Voca<span>Fox</span></span>
              </h1>

              <p className="hero-desc font-sans">
                Học từ vựng, ôn ngữ pháp, luyện đọc hiểu và làm quen với các dạng đề thi tiếng Anh vào lớp 10
                trong một không gian học tập trực quan, sinh động và dễ theo dõi.
              </p>

              <div className="hero-actions">
                <button 
                  onClick={() => setActiveTab("practice")} 
                  className="px-6 py-3.5 bg-[#ff8a00] hover:bg-[#e85f00] text-white font-extrabold text-xs sm:text-sm rounded-full cursor-pointer shadow-lg transition-all"
                >
                  Luyện tập hôm nay
                </button>
                <button 
                  onClick={() => setActiveTab("exams")} 
                  className="px-6 py-3.5 bg-[#10213f] hover:bg-[#172e5c] text-white font-extrabold text-xs sm:text-sm rounded-full cursor-pointer shadow-lg transition-all"
                >
                  Làm đề thi thử
                </button>
              </div>
            </div>

            <div className="hero-image-card">
              <svg className="student-illustration" viewBox="0 0 620 520" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="38" y="34" width="544" height="420" rx="42" fill="#FFFFFF"/>
                <circle cx="500" cy="95" r="72" fill="#EAF4FF"/>
                <circle cx="118" cy="112" r="58" fill="#FFF3E4"/>

                <rect x="132" y="310" width="356" height="40" rx="20" fill="#FF8A00"/>
                <rect x="104" y="344" width="412" height="36" rx="18" fill="#10213F"/>
                <rect x="144" y="374" width="28" height="90" rx="14" fill="#10213F"/>
                <rect x="448" y="374" width="28" height="90" rx="14" fill="#10213F"/>

                <rect x="190" y="198" width="236" height="130" rx="18" fill="#F8FBFF" stroke="#E8EDF5" stroke-width="3"/>
                <path d="M308 198V328" stroke="#E8EDF5" stroke-width="3"/>
                <path d="M215 230H280" stroke="#FF8A00" stroke-width="10" stroke-linecap="round"/>
                <path d="M215 260H278" stroke="#D7E1EF" stroke-width="10" stroke-linecap="round"/>
                <path d="M334 230H400" stroke="#2B78FF" stroke-width="10" stroke-linecap="round"/>
                <path d="M334 260H390" stroke="#D7E1EF" stroke-width="10" stroke-linecap="round"/>

                <circle cx="310" cy="134" r="54" fill="#FFB45C"/>
                <path d="M260 126C264 82 294 58 332 68C364 76 380 102 374 132C346 120 306 118 260 126Z" fill="#10213F"/>
                <circle cx="290" cy="138" r="6" fill="#10213F"/>
                <circle cx="333" cy="138" r="6" fill="#10213F"/>
                <path d="M296 162C307 171 323 171 334 162" stroke="#10213F" stroke-width="6" stroke-linecap="round"/>

                <path d="M238 260C246 212 270 184 310 184C350 184 374 212 382 260L358 302H262L238 260Z" fill="#2B78FF"/>
                <path d="M262 302H358L372 345H248L262 302Z" fill="#10213F"/>

                <path d="M250 245C220 252 196 270 184 304" stroke="#FFB45C" stroke-width="22" stroke-linecap="round"/>
                <path d="M370 245C402 252 426 270 438 304" stroke="#FFB45C" stroke-width="22" stroke-linecap="round"/>

                <rect x="78" y="154" width="132" height="94" rx="22" fill="#FFFFFF" stroke="#E8EDF5" stroke-width="3"/>
                <path d="M104 184H178" stroke="#FF8A00" stroke-width="10" stroke-linecap="round"/>
                <path d="M104 212H158" stroke="#D7E1EF" stroke-width="10" stroke-linecap="round"/>

                <rect x="414" y="142" width="122" height="96" rx="22" fill="#FFFFFF" stroke="#E8EDF5" stroke-width="3"/>
                <path d="M440 174H506" stroke="#2B78FF" stroke-width="10" stroke-linecap="round"/>
                <path d="M440 202H488" stroke="#D7E1EF" stroke-width="10" stroke-linecap="round"/>

                <circle cx="120" cy="286" r="18" fill="#FF8A00"/>
                <circle cx="506" cy="292" r="16" fill="#2B78FF"/>
                <circle cx="470" cy="74" r="10" fill="#FF8A00"/>
              </svg>
            </div>
          </div>
        </section>

        {/* --- 2. STATS ROW IN DESIRED DESIGN STYLE --- */}
        <section className="stats-grid font-sans">
          <article className="stat-card">
            <small>Bài học đã hoàn thành</small>
            <b>{completedLessons}</b>
            <span>
              {completedLessons > 0
                ? "Dữ liệu từ tiến độ học của bạn"
                : "Bạn chưa hoàn thành bài học nào"}
            </span>
          </article>

          <article className="stat-card">
            <small>Từ vựng đã ôn</small>
            <b>{reviewedWords}</b>
            <span>
              {reviewedWords > 0
                ? "Số từ đã ghi nhận trong quá trình học"
                : "Chưa có dữ liệu ôn từ vựng"}
            </span>
          </article>

          <article className="stat-card">
            <small>Điểm luyện đề gần nhất</small>
            <b>{latestExamScore}</b>
            <span>
              {latestExamScore !== "—"
                ? "Điểm từ lần luyện đề gần nhất"
                : "Bạn chưa làm bài luyện đề nào"}
            </span>
          </article>

          <article className="stat-card">
            <small>Mức độ sẵn sàng</small>
            <b>{readinessLevel}</b>
            <span>
              {readinessLevel !== "Chưa có"
                ? "Dựa trên kết quả học và luyện đề"
                : "Chưa đủ dữ liệu để đánh giá"}
            </span>
          </article>
        </section>

        {/* --- 3. TOOLS GRID OR ACTION PATHWAYS --- */}
        <section id="library">
          <div className="section-head">
            <div>
              <h2>Công cụ học tập</h2>
              <p>Truy cập nhanh các khu vực quan trọng trong hệ thống học tiếng Anh lớp 9.</p>
            </div>
            <button 
              onClick={() => setActiveTab("units")} 
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-full cursor-pointer transition-colors"
            >
              Xem tất cả
            </button>
          </div>

          <div className="tools-grid">
            <article className="tool-card">
              <div>
                <h3>Thư viện học liệu</h3>
                <p>
                  Tổng hợp bài học SGK, từ vựng theo chủ đề, ngữ pháp trọng tâm và tài liệu ôn thi vào lớp 10.
                </p>
              </div>
              <button onClick={() => setActiveTab("units")} className="tool-link cursor-pointer border-0 bg-transparent p-0">
                Mở thư viện <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            </article>

            <article className="tool-card">
              <div>
                <h3>Đề thi thử</h3>
                <p>
                  Làm đề theo thời gian, xem kết quả, phân tích lỗi sai và nhận gợi ý phần cần ôn lại.
                </p>
              </div>
              <button onClick={() => setActiveTab("exams")} className="tool-link cursor-pointer border-0 bg-transparent p-0">
                Vào kho đề thi <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            </article>

            <article className="tool-card">
              <div>
                <h3>Luyện tập hằng ngày</h3>
                <p>
                  Hoàn thành nhiệm vụ ngắn mỗi ngày: từ vựng, ngữ pháp, đọc hiểu và câu hỏi dạng đề thi.
                </p>
              </div>
              <button onClick={() => setActiveTab("practice")} className="tool-link cursor-pointer border-0 bg-transparent p-0">
                Bắt đầu luyện tập <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            </article>
          </div>
        </section>

        {/* --- 4. VIDEO LECTURES / ONLINE LESSONS --- */}
        {lectures.length > 0 && (
          <div className="space-y-4 text-left pt-2 font-sans">
            <div className="space-y-1">
              <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1 font-extrabold uppercase tracking-widest inline-block mb-1">
                BÀI GIẢNG ĐỘC QUYỀN 🎥
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#10213f] tracking-tight">
                Video bài học tuyển chọn nổi bật
              </h3>
              <p className="text-slate-500 font-semibold text-xs sm:text-sm">
                Xem và tích lũy phản xạ nghe giảng, mở khóa chiến thuật xử lý các câu tiếng Anh hóc búa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lectures.map((item) => {
                const videoId = item.youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&\s]+)/)?.[1];
                const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500";
                return (
                  <div 
                    key={item.id}
                    onClick={() => videoId && setActiveVideoUrl(videoId)}
                    className="bg-white border border-[#E2E8F0] hover:border-orange-400 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-video w-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
                        <img 
                          src={thumbnail} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center text-white">
                          <span className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:bg-orange-600 hover:scale-110 transition-all shrink-0">
                            <Play className="h-5 w-5 fill-current text-white pl-0.5" />
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-1.5 text-left">
                        <h4 className="font-extrabold text-sm text-[#1E293B] line-clamp-1 group-hover:text-orange-500 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-bold line-clamp-2 leading-relaxed">
                          {item.description || "Bài giảng tiếng Anh trực quan tóm tắt từ vựng, mẹo ôn thi hữu ích lớp 9."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Embedded YouTube video modal player */}
        {activeVideoUrl && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 text-center">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
              <button 
                onClick={() => setActiveVideoUrl(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-950 transition-colors z-20 hover:cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="aspect-video w-full bg-slate-950">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideoUrl}?autoplay=1`}
                  className="w-full h-full"
                  title="VocaFox YouTube Video Masterclass"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* --- 5. EXAM STRATEGY - BÍ QUYẾT PHÒNG THI --- */}
        <div className="border border-[#E2E8F0] bg-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
            <div className="text-left space-y-1">
              <span className="text-[10px] text-[#ff8a00] font-black uppercase tracking-widest block">CẨM NANG ÔN LUYỆN</span>
              <h3 className="text-lg sm:text-xl font-black text-[#10213f]">Mưu lược & Bí quyết chinh phục phòng thi</h3>
              <p className="text-xs text-slate-500 font-semibold">Tóm tắt các kiến thức cốt lỗi và kỹ thuật nhận diện các bẫy thường gặp trong đề thi lớp 10.</p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 text-xs text-slate-400 font-bold justify-end">
              <Calendar className="h-4 w-4 text-orange-500" /> Định kỳ cập nhật
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HANDBOOK_TIPS.map((tip, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveTip(tip)}
                className="bg-[#F8FAFC]/50 hover:bg-white border border-[#E2E8F0] hover:border-[#ff8a00] p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group text-left shadow-sm"
              >
                <div className="space-y-2">
                  <span className="inline-block text-[9.5px] font-extrabold text-[#ff8a00] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    {tip.category}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-[#10213f] group-hover:text-[#ff8a00] transition-colors">
                    {tip.title}
                  </h4>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10.5px] text-[#ff8a00] font-bold mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  Đọc cẩm nang <ChevronRight className="h-3 w-3 stroke-[2.5]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- 6. ENGLISH SHOWCASE BANNER MATCHING TEMPLATE --- */}
        <section className="home-english-section">
          <div className="english-showcase">
            <div className="showcase-content">
              <span className="showcase-label">Không gian học tiếng Anh lớp 9</span>

              <h2>Học tiếng Anh sinh động hơn mỗi ngày</h2>

              <p>
                VocaFox giúp học sinh ôn từ vựng, luyện ngữ pháp, đọc hiểu và làm quen với các dạng bài thi
                bằng giao diện trực quan, dễ theo dõi và phù hợp với mục tiêu thi vào lớp 10.
              </p>

              <div className="showcase-tags">
                <span>Vocabulary</span>
                <span>Grammar</span>
                <span>Reading</span>
                <span>Mock Test</span>
              </div>
            </div>

            <div className="study-photo-card"></div>
          </div>
        </section>

        {/* --- 7. MODERN DIALOG FOR HANDBOOK TIPS --- */}
        {activeTip && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="p-6 sm:p-7 space-y-5">
                
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-black text-[#ff8a00] bg-orange-50 px-2.5 py-1 rounded-lg uppercase tracking-wide border border-orange-100">
                    {activeTip.category}
                  </span>
                  <button
                    onClick={() => setActiveTip(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="space-y-2 text-left">
                  <h4 className="text-base sm:text-lg font-extrabold text-[#10213f]">{activeTip.title}</h4>
                </div>

                <div className="text-xs text-slate-600 font-semibold whitespace-pre-wrap leading-relaxed bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl select-text text-left">
                  {activeTip.content}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTip(null)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Tôi đã ghi nhớ, quay lại!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- 8. FLOATING FOXIE AI CHAT FROM GRAPHIC --- */}
      <div className="ai-chat-embedded">
        {chatOpen && (
          <div className="ai-panel-embedded">
            <div className="ai-head-embedded flex items-center justify-between">
              <div>
                <b>FoxieAI</b>
                <small>Trợ lý học tiếng Anh của VocaFox</small>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-white/60 hover:text-white bg-transparent border-0 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="ai-body-embedded">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`ai-message-embedded ${msg.sender === "ai" ? "ai" : "user"}`}>
                  {msg.text}
                </div>
              ))}
              {chatLoading && (
                <div className="ai-message-embedded ai italic text-slate-400">
                  FoxieAI đang suy nghĩ phản hồi...
                </div>
              )}
            </div>

            <form onSubmit={handleSendChatMessage} className="ai-input-embedded">
              <input 
                type="text" 
                placeholder="Nhập câu hỏi học tập của bạn..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
              />
              <button type="submit" className="ai-send-embedded" disabled={chatLoading}>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        <button 
          className="ai-toggle-embedded" 
          onClick={() => setChatOpen(!chatOpen)}
          aria-label="Trò chuyện với trợ lý AI"
        >
          {chatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 text-white" />}
        </button>
      </div>

    </div>
  );
}
