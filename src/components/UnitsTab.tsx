import React from "react";
import { 
  ArrowLeft, 
  BookOpen, 
  Volume2, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Download
} from "lucide-react";
import { grade9Units } from "../data/grade9Units";
import { TextbookUnit, Question } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";

interface UnitsTabProps {
  selectedUnit: TextbookUnit | null;
  setSelectedUnit: (unit: TextbookUnit | null) => void;
  unitSubTab: "vocab" | "grammar" | "exercises" | "theory";
  setUnitSubTab: (tab: "vocab" | "grammar" | "exercises" | "theory") => void;
  vocabFlipId: string | null;
  setVocabFlipId: (id: string | null) => void;
  speakWord: (word: string) => void;
  unitAnswers: Record<string, string>;
  setUnitAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  unitSubmitted: Record<string, boolean>;
  handleSubmitUnitExercise: (qnId: string, userVal: string, correctVal: string) => void;
  handleExplainWithAI: (q: Question, userAnswer?: string, topicTitle?: string) => void;
  explainLoading: boolean;
  activeExplanation: any;
  setActiveExplanation: (exp: any) => void;
  allUnits?: TextbookUnit[];
}

export default function UnitsTab({
  selectedUnit,
  setSelectedUnit,
  unitSubTab,
  setUnitSubTab,
  vocabFlipId,
  setVocabFlipId,
  speakWord,
  unitAnswers,
  setUnitAnswers,
  unitSubmitted,
  handleSubmitUnitExercise,
  handleExplainWithAI,
  explainLoading,
  activeExplanation,
  setActiveExplanation,
  allUnits = []
}: UnitsTabProps) {

  const displayUnits = allUnits.length > 0 ? allUnits : grade9Units;

  if (!selectedUnit) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-[#3C3C3C] tracking-tight">Bài học sách giáo khoa lớp 9</h2>
          <p className="text-[#777777] font-semibold text-sm sm:text-base">Học liệu bám sát các Units sách tiếng Anh mới (chương trình chuẩn).</p>
        </div>

        {/* Units Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayUnits.map((u) => (
            <div 
              key={u.id}
              onClick={() => { setSelectedUnit(u); setUnitSubTab("vocab"); }}
              className="bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden hover:border-[#FF9600] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-60 select-none shadow-sm"
            >
              <div className="h-24 bg-gradient-to-br from-orange-100 to-blue-50 grid place-items-center overflow-hidden">
                {u.coverImageUrl ? <img src={u.coverImageUrl} className="w-full h-full object-cover" /> : <BookOpen className="h-9 w-9 text-[#FF9600]" />}
              </div>
              <div className="space-y-2 p-5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#FF9600] bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">{u.un}</span>
                  <span className="p-1 px-2 rounded-lg bg-slate-50 text-[11px] font-black text-[#777777] border border-[#E5E5E5]">
                    {u.vocabulary.length} từ vựng
                  </span>
                </div>
                <h3 className="font-display font-black text-base text-[#3C3C3C] leading-snug line-clamp-2">
                  {u.title}
                </h3>
                <p className="text-xs text-[#777777] font-bold">
                  {u.vietnameseTitle}
                </p>
              </div>

              <span className="text-xs sm:text-sm text-[#FF9600] font-black flex items-center justify-end gap-0.5 mt-2 p-5 pt-0">
                Bắt đầu học <ChevronRight className="h-4 w-4 stroke-[3]" />
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Active unit back button header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b-2 border-[#E5E5E5]">
        <button
          onClick={() => { setSelectedUnit(null); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] hover:bg-slate-50 font-black text-[11px] text-slate-700 rounded-xl transition-all cursor-pointer active:translate-y-[1px]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Trở lại danh sách Unit
        </button>

        <div className="text-left sm:text-right font-display select-none">
          <span className="text-[10px] font-black text-[#FF9600] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md uppercase tracking-wider">{selectedUnit.un}</span>
          <h2 className="text-base sm:text-lg font-black text-[#3C3C3C]">{selectedUnit.title}</h2>
          <p className="text-[11px] font-bold text-slate-400">{selectedUnit.vietnameseTitle}</p>
        </div>
      </div>

      {/* Internal Unit Subtab selectors */}
      <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-2xl select-none max-w-md border border-[#E2E8F0]">
        {(["vocab", "grammar", "exercises", "theory"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setUnitSubTab(tab)}
            className={`py-2 text-xs font-bold rounded-xl transition-all capitalize cursor-pointer ${
              unitSubTab === tab 
                ? "bg-white text-[#FF9600] shadow-sm border border-[#E2E8F0]" 
                : "text-slate-500 hover:text-slate-850"
            }`}
          >
            {tab === "vocab" ? "Từ vựng" : tab === "grammar" ? "Ngữ pháp" : tab === "exercises" ? "Luyện tập" : "Lý thuyết"}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: VOCABULARY */}
      {unitSubTab === "vocab" && (
        <div className="space-y-6 animate-fade-in select-none">
          <div className="bg-[#FFFDF9] border border-[#FFE0B2] p-4 rounded-xl flex items-start gap-2.5">
            <p className="text-xs text-amber-800 font-semibold leading-relaxed">
              <strong>Lớp học từ vựng Flashcard:</strong> Click vào mặt có chữ tiếng Anh để mở xem phiên âm và nghĩa tiếng Việt cùng với ví dụ, nhấp biểu tượng loa <Volume2 className="h-3 w-3 inline text-[#FF9600]" /> để nghe loa đọc phát âm chuẩn IPA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedUnit.vocabulary.map((vocab, index) => {
              const cardId = `card_${index}`;
              const isFlipped = vocabFlipId === cardId;

              return (
                <div 
                  key={index}
                  onClick={() => setVocabFlipId(isFlipped ? null : cardId)}
                  className="perspective h-44 w-full cursor-pointer"
                >
                  <div className={`relative w-full h-full duration-500 transform-style transition-transform ${isFlipped ? "rotate-y-180" : ""}`}>
                    
                    {/* Front side of card */}
                    <div className="absolute inset-0 bg-white border border-[#E2E8F0] rounded-3xl p-5 flex flex-col justify-between backface-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-slate-400 font-mono">#{index + 1}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); speakWord(vocab.word); }}
                          className="p-1 px-2.5 bg-orange-50 hover:bg-orange-100 rounded-xl text-[#FF9600] transition-colors border border-orange-150 flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span className="text-[9px] font-black">Nghe đọc</span>
                        </button>
                      </div>

                      <div className="text-center font-display">
                        <h4 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight leading-none">{vocab.word}</h4>
                        <p className="text-xs text-slate-400 font-bold mt-1.5 font-mono">{vocab.phonetic}</p>
                      </div>

                      <span className="text-[9px] text-[#777777] font-black text-center uppercase tracking-wider">Nhấn để xoay thẻ dịch nghĩa</span>
                    </div>

                    {/* Back side of card */}
                    <div className="absolute inset-0 bg-white border border-[#FFE0B2] rounded-3xl p-4 flex flex-col justify-between backface-hidden rotate-y-180 shadow-md">
                      <div className="space-y-1 bg-white border border-[#FFE0B2] rounded-xl p-2 select-text">
                        <span className="text-[8px] font-black text-[#FF9600] uppercase tracking-widest block leading-none">DỊCH NGHĨA</span>
                        <p className="text-xs font-black text-[#3C3C3C]">{vocab.meaning}</p>
                      </div>

                      <div className="space-y-1 bg-white border border-[#E5E5E5] rounded-xl p-2 select-text overflow-hidden">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">VÍ DỤ ĐI KÈM</span>
                        <p className="text-[10px] font-bold text-slate-500 italic leading-snug line-clamp-2">{vocab.example}</p>
                      </div>

                      <span className="text-[8.5px] text-[#FF9600] font-black text-center uppercase tracking-wider">Click để quay lại từ Tiếng Anh</span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: GRAMMAR CORES */}
      {unitSubTab === "grammar" && (
        <div className="space-y-6 animate-fade-in">
          {selectedUnit.grammar.map((gram, idx) => (
            <div key={idx} className="bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="p-1.5 rounded-xl bg-orange-100 text-[#FF9600]">
                  <BookOpen className="h-4.5 w-4.5" />
                </span>
                <h4 className="font-display font-black text-sm sm:text-base text-[#3C3C3C]">{gram.title}</h4>
              </div>

              <div className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed whitespace-pre-wrap select-text">
                {gram.content}
              </div>

              {gram.examples && gram.examples.length > 0 && (
                <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-4 rounded-xl space-y-2">
                  <span className="text-[9px] font-black text-[#777777] uppercase tracking-wider">VÍ DỤ ĐIỂN HÌNH CHỌN LỌC</span>
                  <div className="space-y-1.5 select-text">
                    {gram.examples.map((ex, exIdx) => (
                      <p key={exIdx} className="text-xs text-[#3C3C3C] font-semibold flex items-start gap-1">
                        <span className="text-[#FF9600] shrink-0 font-extrabold">✦</span> {ex}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: EXERCISES */}
      {unitSubTab === "exercises" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#EEF2FC] border border-[#C7D2FE] p-4 rounded-xl flex items-start gap-2.5">
            <p className="text-xs text-indigo-800 font-semibold leading-relaxed">
              <strong>Luyện Trắc nghiệm lý thuyết:</strong> Hãy giải quyết các câu hỏi bên dưới. Sau khi trả lời, em có thể nhấp <strong>Hỏi Trợ lý AI giải thích</strong> để nghe Gia sư phân tích tỉ mỉ nhé!
            </p>
          </div>

          <div className="space-y-6">
            {selectedUnit.exercises.map((q, index) => {
              const uAns = unitAnswers[q.id] || "";
              const uSub = !!unitSubmitted[q.id];
              const isCorrectResult = uAns.trim().toLowerCase() === q.correctValue.trim().toLowerCase();

              return (
                <div key={q.id} className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                  
                  {/* Group header if reading context */}
                  {q.groupHeader && (
                    <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-4 rounded-xl text-xs text-[#777777] whitespace-pre-wrap font-bold select-text">
                      {q.groupHeader}
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div className="flex items-start gap-2 select-none">
                    <span className="bg-[#F7F7F7] border border-[#E5E5E5] text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-lg">Câu {index + 1}</span>
                    <h4 className="text-xs sm:text-sm font-black text-[#3C3C3C] leading-snug pt-0.5 select-text">
                      {q.question}
                    </h4>
                  </div>

                  {/* Option Choice buttons */}
                  {q.type === "single-choice" && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 select-none">
                      {q.options.map((opt) => {
                        const isChosen = uAns === opt;
                        const isCorrectOpt = opt.startsWith(q.correctValue) || opt === q.correctValue;

                        let styleClass = "border border-[#E2E8F0] hover:bg-slate-50 text-slate-650 shadow-sm";
                        if (isChosen) {
                          styleClass = "border border-[#FF9600] bg-orange-50 text-[#FF9600] shadow-sm font-bold";
                        }
                        if (uSub) {
                          if (isCorrectOpt) {
                            styleClass = "border border-emerald-500 bg-emerald-50 text-emerald-700 font-extrabold shadow-sm";
                          } else if (isChosen && !isCorrectResult) {
                            styleClass = "border border-rose-500 bg-rose-50 text-rose-700 font-extrabold shadow-sm";
                          } else {
                            styleClass = "border border-slate-100 bg-slate-50 text-slate-400 pointer-events-none";
                          }
                        }

                        return (
                          <button
                            key={opt}
                            disabled={uSub}
                            onClick={() => handleSubmitUnitExercise(q.id, opt, q.correctValue)}
                            className={`p-3 text-left rounded-xl text-xs font-bold transition-all cursor-pointer ${styleClass}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Typing answers for rewrite/reorder */}
                  {q.type !== "single-choice" && (
                    <div className="space-y-3 pt-1 select-none">
                      <input
                        type="text"
                        disabled={uSub}
                        placeholder={uSub ? "Dạng bài tự luận..." : "Hãy gõ câu trả lời của em tại đây..."}
                        value={uAns}
                        onChange={(e) => setUnitAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#FF9600]"
                      />
                      {!uSub && (
                        <button
                          disabled={!uAns.trim()}
                          onClick={() => handleSubmitUnitExercise(q.id, uAns, q.correctValue)}
                          className="px-4 py-2 bg-[#0EA5E9] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-[11px] rounded-xl active:translate-y-[1px] cursor-pointer shadow-sm"
                        >
                          Nộp câu trả lời
                        </button>
                      )}
                    </div>
                  )}

                  {/* Feedback on submit */}
                  {uSub && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2.5 mt-2 select-none">
                      <div className="flex items-center gap-2">
                        {isCorrectResult ? (
                          <span className="flex items-center gap-1.5 text-xs font-black text-green-600 bg-green-50 p-1.5 px-2.5 rounded-xl border border-green-200">
                            <CheckCircle2 className="h-4.5 w-4.5" /> Thầy Cô khen ngợi, đáp án đúng!
                          </span>
                        ) : (
                          <div className="text-xs font-semibold text-slate-650 bg-red-50 p-2 rounded-xl border border-red-150 text-left">
                            <span className="font-extrabold text-[#FF4B4B]">Chưa đúng:</span> Em đã chọn `<span className="font-extrabold">{uAns}</span>`.
                            <br />Đáp án chuẩn: <span className="font-extrabold text-[#58CC02]">{q.correctValue}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleExplainWithAI(q, uAns, selectedUnit.title)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg transition-colors border border-indigo-150 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500 fill-current" />
                        Hỏi Trợ lý AI giải thích
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 4: THEORY */}
      {unitSubTab === "theory" && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">Kênh tự học Lý thuyết & Video Bài giảng</h3>
              <p className="text-xs text-slate-400 font-bold leading-relaxed mt-1">
                Tập trung bồi dưỡng kiến thức nâng bám sát mục tiêu của Bộ GD&ĐT. Nội dung lý thuyết đúc kết từ vựng, cấu trúc ngữ pháp có trong chương trình tuyển sinh 9 vào 10.
              </p>
            </div>

            {/* Render video lecture list */}
            {((selectedUnit as any).theoryVideos && (selectedUnit as any).theoryVideos.length > 0) ? (
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">📺 Video bài giảng từ Thầy/Cô</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedUnit as any).theoryVideos.map((video: any, idx: number) => {
                    // Extract youtube embed id if needed, or render as iframe
                    const embedUrl = video.url.includes("youtube.com") || video.url.includes("youtu.be")
                      ? video.url.replace("watch?v=", "embed/")
                      : video.url;

                    return (
                      <div key={idx} className="bg-slate-55 border border-slate-100 p-4 rounded-2xl space-y-3">
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 shadow-sm">
                          <iframe 
                            width="100%" 
                            height="100%" 
                            src={embedUrl} 
                            title={video.title || "Video Bài giảng Chuyên sâu"}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            allowFullScreen
                          />
                        </div>
                        <b className="text-xs sm:text-sm font-black text-slate-800 leading-snug block pl-1">
                          {video.title || "Video hướng dẫn tự học bám sát chương trình"}
                        </b>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Default video lesson if none custom uploaded yet
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">📺 Video bài giảng cơ bản Gợi ý</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 shadow-sm">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                        title="Video Bài Sắp Xếp Chuyên sâu"
                        frameBorder="0" 
                        allowFullScreen
                      />
                    </div>
                    <b className="text-xs sm:text-sm font-black text-slate-800 leading-snug block">
                      Video tự học Tiếng Anh 9 Chương trình mới — Học cùng FoxieAI
                    </b>
                  </div>
                </div>
              </div>
            )}

            {(((selectedUnit as any).theoryVideoUrl) || ((selectedUnit as any).theoryPdfUrl) || ((selectedUnit as any).documentUrl) || ((selectedUnit as any).slidePdfUrl)) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                {(selectedUnit as any).theoryVideoUrl && <a href={(selectedUnit as any).theoryVideoUrl} target="_blank" className="p-3 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-100 text-[#ff8a00] font-black text-xs flex items-center justify-between">Video YouTube <Download className="h-4 w-4"/></a>}
                {(selectedUnit as any).theoryPdfUrl && <a href={(selectedUnit as any).theoryPdfUrl} target="_blank" className="p-3 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-100 text-[#ff8a00] font-black text-xs flex items-center justify-between">PDF lý thuyết <Download className="h-4 w-4"/></a>}
                {(selectedUnit as any).documentUrl && <a href={(selectedUnit as any).documentUrl} target="_blank" className="p-3 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-100 text-[#ff8a00] font-black text-xs flex items-center justify-between">Tài liệu Word/Excel <Download className="h-4 w-4"/></a>}
                {(selectedUnit as any).slidePdfUrl && <a href={(selectedUnit as any).slidePdfUrl} target="_blank" className="p-3 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-100 text-[#ff8a00] font-black text-xs flex items-center justify-between">Slide bài giảng <Download className="h-4 w-4"/></a>}
              </div>
            )}

            {/* Document files and Slides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-105">
              
              <div className="p-4 bg-[#FFFDF9] border border-[#FFE0B2] rounded-2xl text-left">
                <h4 className="text-xs font-black text-amber-700 tracking-wider uppercase mb-2">📑 Đề cương PDF đính kèm Tự học</h4>
                {((selectedUnit as any).theoryPdfs && (selectedUnit as any).theoryPdfs.length > 0) ? (
                  <div className="space-y-2">
                    {(selectedUnit as any).theoryPdfs.map((pdf: any, idx: number) => (
                      <a 
                        key={idx}
                        href={pdf.url === "#" ? undefined : pdf.url}
                        onClick={() => pdf.url === "#" && alert("Mẫu học liệu PDF đang được tải xuống từ máy chủ VocaFox Cloud...")}
                        className="p-3 bg-white hover:bg-amber-50 rounded-xl border border-[#FFE0B2] flex items-center justify-between no-underline text-slate-751 hover:text-[#ff8a00] font-bold text-xs"
                      >
                        <span className="truncate pr-2">📄 {pdf.name}</span>
                        <Download className="h-4 w-4 shrink-0 text-amber-500" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-bold mt-1 leading-snug">Hiện tại chương này chưa có tệp PDF lý thuyết tải lên. Em hãy tham gia trao đổi qua các bài học nhé!</p>
                )}
              </div>

              <div className="p-4 bg-emerald-50/40 border border-emerald-150 rounded-2xl text-left">
                <h4 className="text-xs font-black text-emerald-800 tracking-wider uppercase mb-2">📊 Bài giảng Slide trình chiếu (PowerPoint)</h4>
                {((selectedUnit as any).theorySlides && (selectedUnit as any).theorySlides.length > 0) ? (
                  <div className="space-y-2">
                    {(selectedUnit as any).theorySlides.map((slide: any, idx: number) => (
                      <a
                        key={idx}
                        href={slide.url === "#" ? undefined : slide.url}
                        onClick={() => slide.url === "#" && alert("Mẫu slide PowerPoint đang được tải xuống từ kho học liệu...")}
                        className="p-3 bg-white hover:bg-emerald-50 rounded-xl border border-emerald-150 flex items-center justify-between no-underline text-slate-730 hover:text-emerald-700 font-bold text-xs"
                      >
                        <span className="truncate pr-2">📊 {slide.name}</span>
                        <Download className="h-4 w-4 shrink-0 text-emerald-500" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-bold mt-1 leading-snug">Hiện tại chương này chưa có slide bài giảng tải lên từ thầy cô. Chúc các em học tốt!</p>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
      {activeExplanation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto animate-slide-up-fade">
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-[#1CB0F6]">
                  <Sparkles className="h-5 w-5 fill-current" />
                  <span className="text-xs font-black uppercase tracking-wider font-display">Gia sư AI Tiếng Anh Lớp 9</span>
                </div>
                <button
                  onClick={() => setActiveExplanation(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
                >
                  <XIcon />
                </button>
              </div>

              <div className="space-y-2 select-text">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">CÂU HỎI HỌC TẬP</span>
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

              <div className="text-xs text-slate-600 font-medium leading-relaxed select-text bg-[#F7F7F7] border border-[#E5E5E5] p-5 rounded-2xl max-h-[40vh] overflow-y-auto">
                {explainLoading ? (
                  <div className="flex items-center justify-center p-8 flex-col gap-2.5 select-none text-slate-400 font-display">
                    <span className="animate-spin text-xl">⏳</span>
                    <span className="text-[10px] font-black tracking-wide">Trợ Lý AI đang biên soạn nội dung giải nghĩa...</span>
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
                Đã hiểu chi tiết bài học!
              </button>
            </div>
          </div>
        </div>
      )}

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
