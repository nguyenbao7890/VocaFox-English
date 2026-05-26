import React, { useState } from "react";
import { 
  Volume2, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  BookOpen, 
  Award,
  BookMarked,
  Info
} from "lucide-react";
import { grade9Units } from "../data/grade9Units";
import { Question } from "../types";

interface PracticeTabProps {
  activePracticeSubTab: "flashcard" | "reading" | "pronunciation" | "mistakes" | "mission";
  setActivePracticeSubTab: (tab: "flashcard" | "reading" | "pronunciation" | "mistakes" | "mission") => void;
  speakWord: (word: string) => void;
  attemptsHistory: any[];
  examAnswers: any;
  handleExplainWithAI: (q: Question, userAnswer?: string, topicTitle?: string) => void;
  explainLoading: boolean;
  activeExplanation: any;
  setActiveExplanation: (exp: any) => void;
}

export default function PracticeTab({
  activePracticeSubTab,
  setActivePracticeSubTab,
  speakWord,
  attemptsHistory,
  examAnswers,
  handleExplainWithAI,
  explainLoading,
  activeExplanation,
  setActiveExplanation
}: PracticeTabProps) {

  // Get all vocabulary items together for listing
  const allVocab = grade9Units.flatMap(u => u.vocabulary);
  const [vocabSearch, setVocabSearch] = useState("");
  const [activeIpaWord, setActiveIpaWord] = useState<string | null>(null);

  const filteredVocab = allVocab.filter(v => 
    v.word.toLowerCase().includes(vocabSearch.toLowerCase()) || 
    v.meaning.toLowerCase().includes(vocabSearch.toLowerCase())
  );

  // Extract mistakes from exam attempts (where userAnswer !== correctValue)
  const extractMistakes = () => {
    const list: Array<{ q: Question; examTitle: string; uAns: string }> = [];
    attemptsHistory.forEach(attempt => {
      // Find the corresponding exam to load correct objects
      const isIncorrectAnswers = Object.entries(attempt.answers).forEach(([qId, ans]) => {
        // Find inside mockExams
        let foundQ: Question | null = null;
        const currentExam = require("../data/mockExams").mockExams.find((e: any) => e.id === attempt.examId);
        if (currentExam) {
          currentExam.sections.forEach((sec: any) => {
            const q = sec.questions.find((question: any) => question.id === qId);
            if (q) foundQ = q;
          });
        }
        
        if (foundQ) {
          const isCorrect = (ans as string).trim().toLowerCase() === (foundQ as Question).correctValue.trim().toLowerCase();
          if (!isCorrect) {
            list.push({
              q: foundQ,
              examTitle: attempt.examTitle,
              uAns: ans as string
            });
          }
        }
      });
    });
    return list;
  };

  // Safe wrapper for mistakes logging
  let mistakes: Array<{ q: Question; examTitle: string; uAns: string }> = [];
  try {
    // If not in node environment or before fully bundled, fallback to search in local arrays
    grade9Units.forEach(unit => {
      unit.exercises.forEach(q => {
        // Find in local storage-like exam answers if any
        if (examAnswers[q.id] && examAnswers[q.id].trim().toLowerCase() !== q.correctValue.trim().toLowerCase()) {
          mistakes.push({
            q,
            examTitle: `${unit.un} Exercise`,
            uAns: examAnswers[q.id]
          });
        }
      });
    });
  } catch(e) {
    console.error("Exercises scan error", e);
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="space-y-1 select-none">
        <h2 className="text-2xl sm:text-3xl font-display font-black text-[#3C3C3C] tracking-tight">Khu luyện tập tương tác</h2>
        <p className="text-[#777777] font-semibold text-sm sm:text-base">Xây dựng thói quen phản xạ ngôn ngữ bền vững thông qua công cụ rèn luyện rải rác.</p>
      </div>

      {/* Navigation submenu bars */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#E5E5E5] pb-3 select-none">
        {([
          { id: "flashcard", label: "Kho Từ Điển Học Sinh" },
          { id: "pronunciation", label: "Phát Âm Tiêu Chuẩn IPA" },
          { id: "mistakes", label: "Sổ Tay Lỗi Sai (Mistakes Log)" },
          { id: "mission", label: "Bậc Thầy Thành Tích" }
        ] as const).map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActivePracticeSubTab(sub.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
              activePracticeSubTab === sub.id
                ? "bg-[#FFEFC6] text-[#D97706] border-[#FFE0B2] shadow-sm"
                : "border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-600"
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* A. FLASHCARDS COMPREHENSIVE SEARCH & DICTIONARY */}
      {activePracticeSubTab === "flashcard" && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <h3 className="font-display font-black text-base sm:text-lg text-[#3C3C3C]">Từ điển từ vựng bám sát 10 Units</h3>
            
            <input
              type="text"
              placeholder="🔍 Tìm nhanh từ hoặc nghĩa..."
              value={vocabSearch}
              onChange={(e) => setVocabSearch(e.target.value)}
              className="w-full sm:w-72 p-2 bg-white border border-[#E2E8F0] focus:border-[#FF9600] rounded-xl text-xs font-semibold focus:outline-none transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocab.slice(0, 45).map((v, i) => (
              <div 
                key={i}
                className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between h-38 relative hover:border-[#FF9600] hover:shadow-md transition-all group select-none shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-black text-base text-[#3C3C3C] tracking-tight">{v.word}</h4>
                    <button
                      onClick={() => speakWord(v.word)}
                      className="p-1 text-slate-400 hover:text-[#FF9600] rounded-full transition-colors cursor-pointer"
                    >
                      <Volume2 className="h-5 w-5 stroke-[2.5]" />
                    </button>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-400">{v.phonetic}</p>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-slate-50">
                  <p className="text-sm font-extrabold text-[#777777] line-clamp-1">{v.meaning}</p>
                  <p className="text-xs text-slate-400 truncate italic">Ex: {v.example}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredVocab.length === 0 && (
            <p className="text-center py-12 text-sm text-slate-450 font-bold select-none">Không tìm thấy từ vựng học thuật phù hợp.</p>
          )}

          {filteredVocab.length > 45 && (
            <p className="text-center text-xs text-slate-440 font-bold select-none">Hệ thống đang hiển thị 45 từ vựng phổ biến nhất. Hãy gõ từ khóa để lọc chi tiết.</p>
          )}
        </div>
      )}

      {/* B. PRONUNCIATION IPA BENCH */}
      {activePracticeSubTab === "pronunciation" && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-6 select-none animate-fade-in shadow-sm">
          <div className="space-y-1">
            <h3 className="font-display font-black text-sm sm:text-base text-[#3C3C3C]">Học âm chuẩn quốc tế cùng máy đọc IPA</h3>
            <p className="text-[#777777] text-xs font-semibold leading-relaxed">Em nhấp trực tiếp vào các từ vựng đặc trưng để hệ thống tự động tổng hợp cấu trúc âm và phát thanh từ vựng đó ra loa.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { word: "Beautiful", phonetic: "/ˈbjuːtɪfl/", desc: "Trọng âm 1" },
              { word: "Environment", phonetic: "/ɪnˈvaɪrənmənt/", desc: "Trọng âm 2" },
              { word: "Traditional", phonetic: "/trəˈdɪʃənl/", desc: "Trọng âm 2" },
              { word: "Community", phonetic: "/kəˈmjuːnəti/", desc: "Trọng âm 2" },
              { word: "Eco-friendly", phonetic: "/ˌiːkəʊ ˈfrendli/", desc: "Trọng âm 3" },
              { word: "Technology", phonetic: "/tekˈnɒlədʒi/", desc: "Trọng âm 2" },
              { word: "Volunteer", phonetic: "/ˌvɒlənˈtɪə(r)/", desc: "Trọng âm 3" },
              { word: "Fascinating", phonetic: "/ˈfæsɪneɪtɪŋ/", desc: "Trọng âm 1" }
            ].map((ipa, idx) => (
              <div 
                key={idx}
                onClick={() => { setActiveIpaWord(ipa.word); speakWord(ipa.word); }}
                className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-28 text-center shadow-sm ${
                  activeIpaWord === ipa.word 
                    ? "bg-amber-50/50 border-[#FF9600] ring-1 ring-[#FF9600]/30" 
                    : "bg-white border-[#E2E8F0] hover:bg-slate-50"
                }`}
              >
                <div className="space-y-1 select-none">
                  <span className="text-[8px] font-black text-[#FF9600] bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{ipa.desc}</span>
                  <h4 className="font-display font-black text-xs text-[#3C3C3C]">{ipa.word}</h4>
                </div>
                <p className="text-[10px] font-semibold text-slate-400 font-mono flex items-center justify-center gap-1">
                  <Volume2 className="h-3 w-3 inline text-[#FF9600]" /> {ipa.phonetic}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. MISTAKES WORKBOOK (SỔ LỖI SAI) */}
      {activePracticeSubTab === "mistakes" && (
        <div className="space-y-4 animate-fade-in select-text">
          <div className="space-y-1 select-none">
            <h3 className="font-display font-black text-sm sm:text-base text-[#3C3C3C]">Sổ lỗi sai phòng thi của Học sinh</h3>
            <p className="text-[#777777] text-xs font-semibold leading-relaxed">
              Các câu hỏi ôn tập Unit hoặc câu đề thi bị trả lời sai sẽ tự động đồng bộ vào đây, hỗ trợ rèn luyện lại tránh bẫy oan ngớ ngẩn trong phòng thi thật.
            </p>
          </div>

          {mistakes.length === 0 ? (
            <div className="bg-[#FFFDF9] border border-[#FFE0B2] p-8 rounded-3xl text-center select-none space-y-2">
              <span className="text-2xl block">🌟</span>
              <h4 className="font-black text-xs text-amber-800">Sổ lỗi sai trống trơn!</h4>
              <p className="text-[11px] text-[#777777] font-semibold max-w-sm mx-auto leading-relaxed">Thầy Cô chúc mừng em chưa mắc khuyết điểm hoặc lỗi sai ngớ ngẩn nào. Hãy giải đề thi tuyển sinh để rà quét lỗ hổng ngữ pháp nhé!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mistakes.map((mis, index) => (
                <div key={index} className="bg-white border border-[#E2E8F0] rounded-3xl p-5 space-y-4 select-text shadow-sm hover:shadow-md hover:border-[#FF9600] transition-colors">
                  <div className="flex items-center justify-between pointer-events-none select-none">
                    <span className="text-[8.5px] font-black text-[#FF4B4B] bg-red-50 border border-red-150 px-2.5 py-0.5 rounded-md uppercase tracking-wider">{mis.examTitle}</span>
                    <span className="text-[9px] font-black text-slate-400">LỖI THỨ #{index + 1}</span>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-display font-black text-xs sm:text-sm text-[#3C3C3C] leading-snug">{mis.q.question}</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-50 border border-red-200 p-2 text-center text-red-700 font-extrabold rounded-xl">
                        <span className="text-[8px] uppercase tracking-widest font-black block leading-none">EM CHỌN SAI</span>
                        <p className="text-xs truncate">{mis.uAns || "Trống"}</p>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 p-2 text-center text-green-700 font-extrabold rounded-xl">
                        <span className="text-[8px] uppercase tracking-widest font-black block leading-none">ĐÁP ÁN ĐÚNG</span>
                        <p className="text-xs truncate">{mis.q.correctValue}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center select-none pt-2.5 border-t border-slate-50">
                    <span className="text-[10px] text-slate-400 font-semibold italic">Gợi ý mặc định: {mis.q.explanation}</span>
                    <button
                      onClick={() => handleExplainWithAI(mis.q, mis.uAns, mis.examTitle)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg transition-colors border border-indigo-150 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 fill-current" /> Hỏi AI cứu trợ giải nghĩa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* D. MASTER ACHIEVEMENTS CHECKLIST */}
      {activePracticeSubTab === "mission" && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-5 animate-fade-in select-none shadow-sm">
          <div className="space-y-1">
            <h3 className="font-display font-black text-sm sm:text-base text-[#3C3C3C]">Bộ huy hiệu thành tích của học sinh</h3>
            <p className="text-[#777777] text-xs font-semibold leading-relaxed">Em càng chăm chỉ hoàn thành nhiệm vụ và giải đề tuyển sinh lớp 10, các huy chương lấp lánh dưới đây sẽ tự động bật kích hoạt bừng sáng.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Học sinh Nhập môn", desc: "Đã rà rà học từ vựng bài học thành công.", state: true },
              { title: "Vua Streak 3 ngày", desc: "Học tập kiên trì liên tục 3 ngày.", state: true },
              { title: "Bậc thầy giải đề", desc: "Hoàn thiện ít nhất 1 bài thi 10.0 điểm.", state: false },
              { title: "Hảo hữu AI", desc: "Đặt câu hỏi cứu trợ cùng thầy cô AI.", state: true }
            ].map((ach, idx) => (
              <div 
                key={idx}
                className={`p-4 border rounded-2xl flex items-center gap-3.5 transition-all shadow-sm ${
                  ach.state 
                    ? "bg-amber-50/30 border-[#FFE0B2]" 
                    : "bg-slate-50 border-[#E2E8F0] opacity-50"
                }`}
              >
                <div className="text-2xl shrink-0 p-2 bg-white rounded-xl border border-[#E5E5E5] shadow-sm select-none">
                  {ach.state ? "🏅" : "🔒"}
                </div>
                <div className="text-left font-display">
                  <h4 className={`font-black text-xs ${ach.state ? "text-amber-800" : "text-[#777777]"}`}>{ach.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-tight mt-0.5">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
