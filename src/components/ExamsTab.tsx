import React from "react";
import { 
  ArrowLeft, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  BookOpen,
  XCircle,
  HelpCircle as HelpIcon,
  ChevronRight
} from "lucide-react";
import { mockExams } from "../data/mockExams";
import { apiFetch } from "../supabase";
import { MockExam, UserExamAttempt, Question } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { explainQuestionWithAI } from "../services/api";

interface ExamsTabProps {
  selectedExam: MockExam | null;
  setSelectedExam: (exam: MockExam | null) => void;
  examStarted: boolean;
  setExamStarted: (started: boolean) => void;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  examAttempt: UserExamAttempt | null;
  setExamAttempt: (attempt: UserExamAttempt | null) => void;
  examAnswers: Record<string, string>;
  setExamAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleStartExam: (exam: MockExam) => void;
  handleCompleteExam: () => void;
  formatTime: (sec: number) => string;
  handleExplainWithAI: (q: Question, userAnswer?: string, topicTitle?: string) => void;
  explainLoading: boolean;
  activeExplanation: any;
  setActiveExplanation: (exp: any) => void;
}

export default function ExamsTab({
  selectedExam,
  setSelectedExam,
  examStarted,
  setExamStarted,
  timeLeft,
  setTimeLeft,
  examAttempt,
  setExamAttempt,
  examAnswers,
  setExamAnswers,
  handleStartExam,
  handleCompleteExam,
  formatTime,
  handleExplainWithAI,
  explainLoading,
  activeExplanation,
  setActiveExplanation
}: ExamsTabProps) {
  const [dbExams, setDbExams] = React.useState<MockExam[]>([]);
  const [autoExplanations, setAutoExplanations] = React.useState<Record<string, string>>({});
  const [autoExplainLoading, setAutoExplainLoading] = React.useState(false);

  const loadPublicExams = React.useCallback(async () => {
    try {
      const data = await apiFetch<{ success?: boolean; exams?: MockExam[] }>("/api/exams");
      const exams = Array.isArray(data.exams) ? data.exams : [];
      setDbExams(exams);
    } catch (error) {
      console.warn("Không tải được kho đề từ server, dùng đề mẫu.", error);
      setDbExams([]);
    }
  }, []);

  React.useEffect(() => {
    loadPublicExams();
    window.addEventListener("focus", loadPublicExams);
    return () => window.removeEventListener("focus", loadPublicExams);
  }, [loadPublicExams]);

  React.useEffect(() => {
    if (!examAttempt || !selectedExam) return;

    let cancelled = false;
    const questions = selectedExam.sections.flatMap(section => section.questions || []);
    const needsAi = questions.filter(q => {
      const existing = String(q.explanation || "").trim();
      return !existing || /^trích xuất từ tài liệu/i.test(existing) || existing.length < 35;
    });

    if (!needsAi.length) return;

    setAutoExplainLoading(true);
    (async () => {
      for (const q of needsAi) {
        if (cancelled) break;
        const userAnswer = examAttempt.answers?.[q.id] || "";
        const text = await explainQuestionWithAI(q, userAnswer, selectedExam.title);
        if (!cancelled) {
          setAutoExplanations(prev => ({ ...prev, [q.id]: text }));
        }
      }
      if (!cancelled) setAutoExplainLoading(false);
    })();

    return () => { cancelled = true; };
  }, [examAttempt?.id, selectedExam?.id]);


  if (!selectedExam && !examAttempt) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-[#3C3C3C] tracking-tight">Ôn thi tuyển sinh vào lớp 10</h2>
          <p className="text-[#777777] font-semibold text-sm sm:text-base">Phòng thi thử trực tuyến giúp nâng cao tốc độ, rèn kỹ năng giải đề của học sinh lớp 9.</p>
        </div>

        {/* Exams list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(() => {
            const deletedIds: string[] = JSON.parse(localStorage.getItem("voca_deleted_exam_ids") || "[]");
            const combinedList: MockExam[] = [];
            
            dbExams.forEach(exam => {
              if (!deletedIds.includes(exam.id)) {
                combinedList.push(exam);
              }
            });
            mockExams.forEach(exam => {
              if (!deletedIds.includes(exam.id) && !combinedList.some(e => e.id === exam.id)) {
                combinedList.push(exam);
              }
            });
            
            return combinedList.map((exam) => (
              <div 
                key={exam.id}
                className="bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all select-none shadow-sm hover:shadow-md hover:border-[#0EA5E9]"
              >
                <div className="space-y-2 text-left">
                  <span className="text-[10px] font-black text-[#0EA5E9] bg-sky-50 border border-blue-100 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">ĐỀ THI TUYỂN SINH</span>
                  <h3 className="font-display font-black text-base sm:text-lg text-[#1E293B] leading-snug">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-[#64748B] font-bold flex items-center gap-1.5 pt-1">
                    ⏳ Thời gian hoàn thành: <strong className="text-slate-800">{exam.duration} phút</strong>
                  </p>
                </div>

                <button
                  onClick={() => handleStartExam(exam)}
                  className="w-full py-2.5 bg-[#0EA5E9] text-white font-bold text-xs rounded-xl hover:bg-[#38BDF8] transition-all cursor-pointer text-center shadow-sm"
                >
                  Bắt đầu giải đề thi vào 10
                </button>
              </div>
            ));
          })()}
        </div>
      </div>
    );
  }

  // ONGOING EXAM
  if (examStarted && selectedExam) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="sticky top-18 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 z-10 select-none shadow-sm">
          <div className="text-center sm:text-left">
            <h3 className="text-xs sm:text-sm font-bold text-[#1E293B]">{selectedExam.title}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phòng thi đang giám sát bài làm trực tuyến...</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-display font-black text-xs select-none">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={handleCompleteExam}
              className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm"
            >
              Nộp Bài Thi
            </button>
          </div>
        </div>

        {/* Sections Listing */}
        <div className="space-y-8 select-text">
          {selectedExam.sections.map((section, sIdx) => (
            <div key={section.id} className="space-y-4">
              <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-5 rounded-2xl space-y-2">
                <span className="text-[9px] font-black text-[#FF9600] uppercase tracking-wider block">PHẦN {sIdx + 1}</span>
                <h4 className="font-display font-black text-sm sm:text-base text-[#3C3C3C]">{section.title}</h4>
                <p className="text-xs text-[#777777] font-semibold italic">{section.instruction}</p>
                {section.passage && (
                  <div className="mt-4 p-4 bg-white border border-[#E5E5E5] rounded-xl text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold whitespace-pre-wrap select-text">
                    {section.passage}
                  </div>
                )}
              </div>

              {/* Questions Loop */}
              <div className="space-y-5">
                {section.questions.map((q, idx) => {
                  const ans = examAnswers[q.id] || "";
                  return (
                    <div key={q.id} className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-5 sm:p-6 space-y-4">
                      
                      {/* Sub Group Header if any */}
                      {q.groupHeader && (
                        <div className="text-xs text-[#777777] font-bold bg-[#F8FAFC] border border-slate-100 p-3 rounded-xl whitespace-pre-wrap select-text">
                          {q.groupHeader}
                        </div>
                      )}

                      <div className="flex items-start gap-2 select-none">
                        <span className="bg-[#F7F7F7] border border-[#E5E5E5] text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-lg">Câu {idx + 1}</span>
                        <h5 className="text-xs sm:text-sm font-black text-[#3C3C3C] leading-snug pt-0.5 select-text">
                          {q.question}
                        </h5>
                      </div>

                      {q.type === "single-choice" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
                          {q.options.map((opt) => {
                            const isSelected = ans === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => setExamAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                className={`p-3 text-left rounded-xl text-xs font-semibold transition-all border cursor-pointer shadow-sm ${
                                  isSelected 
                                    ? "border-[#0EA5E9] bg-sky-50 text-[#0EA5E9]" 
                                    : "border-[#E2E8F0] hover:bg-slate-50 text-slate-600"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type !== "single-choice" && (
                        <div className="select-none">
                          <input
                            type="text"
                            placeholder="Gõ chính tả câu hoàn thiện..."
                            value={ans}
                            onChange={(e) => setExamAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                            className="w-full p-3 bg-slate-50 border border-[#E2E8F0] focus:border-[#0EA5E9] focus:bg-white rounded-xl text-xs font-semibold focus:outline-none transition-all"
                          />
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions inside Exam */}
        <div className="flex justify-end select-none">
          <button
            onClick={handleCompleteExam}
            className="px-8 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center shadow-md"
          >
            Nộp và chấm bài thi 🏆
          </button>
        </div>
      </div>
    );
  }

  // EXAM RESULTS PANEL (examAttempt is active)
  if (examAttempt && selectedExam) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        
        {/* Results Hero */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 text-center space-y-4 select-none shadow-sm">
          <div className="inline-block bg-orange-50 text-[#FF9600] font-black text-[10px] border border-orange-100 px-3 py-1 rounded-full uppercase tracking-wider">
            KẾT QUẢ GIẢI ĐỀ THI LỚP 10
          </div>
          
          <h3 className="font-display font-black text-lg text-[#1E293B]">{examAttempt.examTitle}</h3>
          
          <div className="flex justify-center items-center gap-6 pt-2">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-display font-black text-[#FF9600] block">{examAttempt.score.toFixed(1)}</span>
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block mt-1">ĐIỂM SỐ CHUẨN</span>
            </div>
            
            <div className="w-px h-8 bg-[#E2E8F0]" />
            
            <div className="text-center">
              <span className="text-2xl font-black text-[#10B981] block">{examAttempt.correctAnswersCount} / {examAttempt.totalQuestions}</span>
              <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider block mt-1">CÂU TRẢ LỜI ĐÚNG</span>
            </div>
          </div>

          <p className="text-xs font-semibold text-[#64748B] max-w-sm mx-auto leading-relaxed pt-2">
            Tuyệt vời! Kết quả này đã ghi nhận thành công và tự động phân tích các chủ điểm kiến thức tương ứng vào Hồ sơ năng lực của học sinh.
          </p>

          <button
            onClick={() => { setSelectedExam(null); setExamAttempt(null); }}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl active:translate-y-[1px] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại bài thi khác
          </button>
        </div>

        {/* Detailed Correction list */}
        <div className="space-y-4 select-text">
          <h4 className="text-base font-black text-[#222222] font-display select-none">Chi tiết sửa lỗi từng câu hỏi:</h4>

          {selectedExam.sections.map((section, sIdx) => (
            <div key={section.id} className="space-y-4">
              <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 rounded-xl select-none">
                <p className="text-xs font-black text-[#3C3C3C]">Phần {sIdx + 1}: {section.title}</p>
              </div>

              {section.questions.map((q, idx) => {
                const uAns = examAttempt.answers[q.id] || "";
                const userVal = uAns.trim().toLowerCase();
                const rawCorrect = String(q.correctValue || (q as any).correctAnswer || (q as any).correct_value || (q as any).correct || "");
                const correctVal = rawCorrect.trim().toLowerCase();
                let isCorrect = false;

                if (q.type === "single-choice") {
                  const userFirstChar = userVal.charAt(0);
                  const correctFirstChar = correctVal.charAt(0);
                  if (userVal !== "" && (
                    userVal === correctVal ||
                    (correctFirstChar && userVal.startsWith(correctFirstChar)) ||
                    (userFirstChar && correctVal.startsWith(userFirstChar))
                  )) {
                    isCorrect = true;
                  }
                } else {
                  const cleanUser = userVal.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");
                  const cleanCorrect = correctVal.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ");
                  if (cleanUser === cleanCorrect && cleanUser !== "") {
                    isCorrect = true;
                  }
                }

                return (
                  <div key={q.id} className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm text-left">
                    
                    <div className="flex items-start gap-2 select-none">
                      <span className="bg-[#F7F7F7] border border-[#E5E5E5] text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-lg">Câu {idx + 1}</span>
                      <h5 className="text-xs sm:text-sm font-black text-[#3C3C3C] leading-snug pt-0.5 select-text">
                        {q.question}
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`p-3 rounded-xl border select-text ${isCorrect ? "bg-[#f0fdf4] border-emerald-200 text-emerald-800 font-extrabold" : "bg-red-50 border-red-200 text-red-700 font-extrabold"}`}>
                        <span className="text-[8px] uppercase tracking-widest font-bold block mb-1">EM CHỌN</span>
                        <p className="text-xs truncate">{uAns || "Không trả lời"}</p>
                      </div>

                      {!isCorrect && (
                        <div className="p-3 rounded-xl border bg-[#f0fdf4] border-emerald-200 text-emerald-850 font-extrabold select-text">
                          <span className="text-[8px] uppercase tracking-widest font-bold block mb-1">ĐÁP ÁN ĐÚNG</span>
                          <p className="text-xs truncate">{q.correctValue || rawCorrect}</p>
                        </div>
                      )}
                    </div>

                    {/* Explanations block */}
                    {(autoExplanations[q.id] || q.explanation || autoExplainLoading) && (
                      <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl select-text">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#d97706] flex items-center gap-1 mb-1.5">
                          <Sparkles className="h-3 w-3 text-amber-500 fill-current" />
                          Giải thích chi tiết tự động từ VocaFox AI:
                        </span>
                        <div className="text-xs text-slate-700 leading-relaxed font-semibold">
                          {autoExplanations[q.id] ? (
                            <MarkdownRenderer content={autoExplanations[q.id]} />
                          ) : q.explanation ? (
                            <MarkdownRenderer content={q.explanation} />
                          ) : (
                            <span className="text-slate-500 font-bold">FoxieAI đang tạo giải thích cho câu này...</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-50 select-none">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isCorrect ? "bg-green-100 text-green-750" : "bg-red-100 text-red-750"}`}>
                        {isCorrect ? "✓ HOÀN THÀNH" : "✗ CÓ LỖI SAI"}
                      </span>

                      <button
                        onClick={() => handleExplainWithAI(q, uAns, selectedExam.title)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg transition-colors border border-indigo-150 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500 fill-current" />
                        Trò chuyện thêm với Trợ lý AI
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Explanation Dialog Box
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto animate-slide-up-fade">
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex justify-between items-start border-b border-rose-50 pb-3">
            <div className="flex items-center gap-1.5 text-[#1CB0F6]">
              <Sparkles className="h-5 w-5 fill-current" />
              <span className="text-xs font-black uppercase tracking-wider font-display">Gia sư Luyện thi vào 10 AI</span>
            </div>
            <button
              onClick={() => setActiveExplanation(null)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
            >
              <XIcon />
            </button>
          </div>

          <div className="space-y-2 select-text">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">CÂU HỎI TRONG ĐỀ THI</span>
            <p className="text-xs sm:text-sm font-black text-slate-800 bg-[#F7F7F7] p-3 rounded-xl border border-[#E5E5E5]">{activeExplanation.questionText}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#FFFDF9] border border-[#FFE0B2] p-2.5 rounded-xl text-center select-text">
              <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest block leading-none mb-1">EM CHỌN</span>
              <p className="text-xs font-extrabold text-[#FF9600] truncate">{activeExplanation.userAnswer || "Chưa làm"}</p>
            </div>
            <div className="bg-green-50 border border-green-200 p-2.5 rounded-xl text-center select-text">
              <span className="text-[8px] font-black text-green-700 uppercase tracking-widest block leading-none mb-1">ĐÁP ÁN CHUẨN</span>
              <p className="text-xs font-extrabold text-green-600 truncate">{activeExplanation.correctValue}</p>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-medium leading-relaxed select-text bg-[#F7F7F7] border border-[#E5E5E5] p-5 rounded-2xl max-h-[40vh] overflow-y-auto font-sans">
            {explainLoading ? (
              <div className="flex items-center justify-center p-8 flex-col gap-2.5 select-none text-slate-400 font-display">
                <span className="animate-spin text-xl text-[#FF9600]">⏳</span>
                <span className="text-[10px] font-black tracking-wide">Trợ Lý AI đang nghiên cứu và xây dựng cấu trúc giải nghĩa...</span>
              </div>
            ) : (
              <MarkdownRenderer content={activeExplanation.text} />
            )}
          </div>

          <button
            disabled={explainLoading}
            onClick={() => setActiveExplanation(null)}
            className="w-full py-3 bg-[#1CB0F6] text-white font-black text-xs rounded-xl transition-colors cursor-pointer text-center"
          >
            Đã thông suốt đề thi này!
          </button>
        </div>
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
