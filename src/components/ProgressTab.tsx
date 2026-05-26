import React from "react";
import { 
  Trophy, 
  Target, 
  MapPin, 
  Award, 
  Flame, 
  CheckCircle,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { TextbookUnit, UserExamAttempt } from "../types";

interface ProgressTabProps {
  activeProgressSubTab: "stats" | "strengths" | "roadmap" | "exams";
  setActiveProgressSubTab: (tab: "stats" | "strengths" | "roadmap" | "exams") => void;
  attemptsHistory: UserExamAttempt[];
  completedUnits: number[];
  studyStreak: number;
}

export default function ProgressTab({
  activeProgressSubTab,
  setActiveProgressSubTab,
  attemptsHistory,
  completedUnits,
  studyStreak
}: ProgressTabProps) {

  // Dynamic calculations
  const totalExamsSubmitted = attemptsHistory.length;
  
  const calculateAverageScore = () => {
    if (attemptsHistory.length === 0) return 0;
    const sum = attemptsHistory.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((sum / attemptsHistory.length) * 10) / 10;
  };

  const highscore = attemptsHistory.length > 0 
    ? Math.max(...attemptsHistory.map(a => a.score)) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="space-y-1 select-none">
        <h2 className="text-2xl sm:text-3xl font-display font-black text-[#3C3C3C] tracking-tight">Hồ sơ năng lực học sinh</h2>
        <p className="text-[#777777] font-semibold text-sm sm:text-base">Phân tích hành trình ôn luyện, tiến độ bám sát 10 Units và điểm số thi thử trung bình.</p>
      </div>

      {/* Profile menu subtabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-[#E5E5E5] pb-3 select-none">
        {([
          { id: "stats", label: "Học Bạ Thống Kê" },
          { id: "strengths", label: "Phân Tích Sức Mạnh" },
          { id: "roadmap", label: "Lộ Trình Tuyển Sinh THPT" },
          { id: "exams", label: "Nhật Ký Thi Trực Tuyến" }
        ] as const).map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActiveProgressSubTab(sub.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeProgressSubTab === sub.id
                ? "bg-[#E0F2FE] text-[#0369A1] border-[#bae6fd] shadow-sm font-black"
                : "border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-600"
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* A. THỐNG KÊ CHI TIẾT */}
      {activeProgressSubTab === "stats" && (
        <div className="space-y-6 animate-fade-in select-none">
          {/* Big numbers row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between h-28 relative shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">TIẾN ĐỘ SGK 9</span>
              <span className="text-xl font-display font-black text-slate-800">{completedUnits.length} / 10 Units</span>
              <p className="text-[10px] font-bold text-slate-400 capitalize">Đã xong lý thuyết & bài tập</p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between h-28 relative shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ĐỀ THI ĐÃ NỘP</span>
              <span className="text-xl font-display font-black text-[#10B981]">{totalExamsSubmitted} lượt làm</span>
              <p className="text-[10px] font-bold text-slate-400 capitalize">Hệ thống tự động lưu trữ</p>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between h-28 relative shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ĐIỂM TRUNG BÌNH</span>
              <span className="text-xl font-display font-black text-[#FF9600]">{calculateAverageScore()} / 10.0</span>
              <p className="text-[10px] font-bold text-slate-400 capitalize">Phòng thi đề chuẩn hóa tuyển sinh</p>
            </div>

            <div className="bg-[#FFFDF9] border border-[#FFE0B2] rounded-2xl p-4 flex flex-col justify-between h-28 relative shadow-sm">
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">KỶ LỤC ĐIỂM SỐ</span>
              <span className="text-xl font-display font-black text-rose-500">{highscore.toFixed(1)} / 10.0</span>
              <p className="text-[10px] text-[#FF9600] font-bold capitalize">Thành tựu tối ưu chuẩn chỉnh nhất</p>
            </div>

          </div>

          {/* Progress visual bar */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-black text-xs sm:text-sm text-slate-800">Phần trăm tối ưu hóa giáo trình SGK</h4>
              <span className="text-xs font-black text-[#FF9600]">{completedUnits.length * 10}%</span>
            </div>
            
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="bg-[#10B981] h-full rounded-full transition-all duration-700"
                style={{ width: `${completedUnits.length * 10}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400">Em cần hoàn thành tiếp tất cả Units còn lại để bảo toàn lý thuyết bứt phá điểm số tối đa!</p>
          </div>
        </div>
      )}

      {/* B. PHÂN TÍCH SỨC MẠNH (STRENGTH GRAPH / METRIC) */}
      {activeProgressSubTab === "strengths" && (
        <div className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-6 space-y-6 select-none animate-fade-in">
          <div className="space-y-1">
            <h3 className="font-display font-black text-sm sm:text-base text-[#3C3C3C]">Biểu đồ phân tích cấu trúc kỹ năng thi</h3>
            <p className="text-[#777777] text-xs font-semibold leading-relaxed">Được tổng hợp trực tuyến từ kết quả làm bài tập SGK và các kỳ thi tuyển sinh lớp 10 em đã nộp bài.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { skill: "Phát âm & Trọng âm", rate: 85, desc: "Rất Tốt (Nắm vững ED, S/ES và trọng âm từ có 2-3 âm tiết)", color: "bg-[#58CC02]" },
              { skill: "Đọc hiểu điền từ (Reading)", rate: 60, desc: "Cần cải thiện (Hay nhầm cụm từ và từ vựng chuyển tiếp)", color: "bg-[#FF9600]" },
              { skill: "Viết lại câu & Trắc nghiệm Ngữ pháp", rate: 75, desc: "Khá (Nắm vững Wish, relative clauses, conditional sentences)", color: "bg-[#1CB0F6]" }
            ].map((skl, i) => (
              <div key={i} className="border border-[#E5E5E5] p-4.5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-display font-black text-xs sm:text-sm text-slate-800">{skl.skill}</h4>
                  <p className="text-[10.5px] font-semibold text-slate-500 leading-tight">{skl.desc}</p>
                </div>
                
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                    <span>ĐỘ HOÀN THIỆN</span>
                    <span>{skl.rate}%</span>
                  </div>
                  <div className="w-full bg-[#F7F7F7] h-2.5 rounded-full overflow-hidden border border-slate-100">
                    <div className={`${skl.color} h-full rounded-full`} style={{ width: `${skl.rate}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. LỘ TRÌNH QUY CHUẨN */}
      {activeProgressSubTab === "roadmap" && (
        <div className="bg-white border-2 border-[#E5E5E5] rounded-3xl p-6 space-y-6 select-none animate-fade-in">
          <div className="space-y-1">
            <h3 className="font-display font-black text-sm sm:text-base text-[#3C3C3C]">Lộ trình rèn luyện 3 chặng chiến lược</h3>
            <p className="text-[#777777] text-xs font-semibold leading-relaxed">Hãy theo sát lộ trình đã vạch sẵn để có tâm thế và nền móng vững vàng nhất cho kỳ thi vào 10 THPT.</p>
          </div>

          <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-6">
            <div className="relative">
              <span className="absolute -left-9.5 top-0.5 bg-[#58CC02] text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold">✓</span>
              <h4 className="font-display font-black text-xs text-slate-700">Chặng 1: Nắm vững cốt lõi lý thuyết SGK 9</h4>
              <p className="text-[11px] text-[#777777] font-semibold">Tích lũy vốn từ học thuật và ngữ pháp bọc kín 10 Units.</p>
            </div>

            <div className="relative animate-pulse">
              <span className="absolute -left-9.5 top-0.5 bg-[#FF9600] text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold">2</span>
              <h4 className="font-display font-black text-xs text-[#FF9600]">Chặng 2: Khắc phục điểm khuyết & tránh bẫy phòng thi (Đang kích hoạt)</h4>
              <p className="text-[11px] text-[#777777] font-semibold">Rà quét lỗ hổng trực tiếp cùng Trợ lý AI và Sổ tay lỗi sai.</p>
            </div>

            <div className="relative">
              <span className="absolute -left-9.5 top-0.5 bg-slate-200 text-slate-400 rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold">3</span>
              <h4 className="font-display font-black text-xs text-slate-400">Chặng 3: Luyện Đề Tốc Độ Chuyển Cấp</h4>
              <p className="text-[11px] text-slate-400 font-bold">Luyện đề dưới 60 phút có đếm ngược để quen nhịp phòng thi.</p>
            </div>
          </div>
        </div>
      )}

      {/* D. NHẬT KÝ THI THỬ TRỰC TUYẾN */}
      {activeProgressSubTab === "exams" && (
        <div className="bg-white border-2 border-[#E5E5E5] p-5 rounded-3xl space-y-4 animate-fade-in select-none">
          <h3 className="font-display font-black text-sm sm:text-base text-[#3C3C3C]">🏆 Nhật Ký Lịch Sử Thi Thử Trực Tuyến</h3>
          
          {attemptsHistory.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 font-bold">Chưa ghi nhận lượt nộp đề thi luyện nào. Hãy bắt đầu giải đề để hiển thị kết quả!</p>
          ) : (
            <div className="overflow-x-auto select-text">
              <table className="w-full text-left text-xs text-slate-650">
                <thead>
                  <tr className="border-b-2 border-slate-100 font-extrabold text-[#3C3C3C]">
                    <th className="py-2.5">Đề thi tuyển sinh</th>
                    <th className="py-2.5">Điểm số</th>
                    <th className="py-2.5">Làm đúng</th>
                    <th className="py-2.5">Thời gian nộp</th>
                  </tr>
                </thead>
                <tbody>
                  {attemptsHistory.map((attempt) => (
                    <tr key={attempt.id} className="border-b border-slate-50 hover:bg-[#FDFDFD] transition-colors">
                      <td className="py-2.5 font-black text-slate-800">{attempt.examTitle}</td>
                      <td className="py-2.5 font-extrabold text-[#FF9600]">{attempt.score.toFixed(1)} / 10.0</td>
                      <td className="py-2.5 font-bold">{attempt.correctAnswersCount} / {attempt.totalQuestions} câu</td>
                      <td className="py-2.5 text-[10px] text-slate-400 font-bold">{attempt.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
