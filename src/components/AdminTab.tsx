import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Users, 
  Award, 
  Trash2, 
  Search, 
  TrendingUp, 
  UserPlus, 
  ShieldAlert, 
  Sparkles, 
  Settings, 
  Database,
  Grid,
  FileText,
  Youtube,
  Plus,
  X,
  Upload,
  Brain,
  Clock,
  Play,
  Lock,
  MessageSquareCode,
  Edit3,
  BookOpen,
  RefreshCw,
  LogOut,
  User,
  CheckCircle,
  Download
} from "lucide-react";
import { apiFetch } from "../supabase";
import { MockExam, TextbookUnit, VocabItem, GrammarTopic, Question } from "../types";
import { mockExams } from "../data/mockExams";

interface SystemUser {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  role: "student" | "parent" | "admin" | "teacher";
  studyStreak: number;
  usageHours?: number;
  activityCount?: { lessons: number; exams: number };
}

interface AdminTabProps {
  currentUser?: {
    uid?: string;
    email?: string;
    name?: string;
    role?: "student" | "parent" | "admin" | "teacher";
    isPro?: boolean;
  } | null;
  allUnits?: TextbookUnit[];
  setAllUnits?: React.Dispatch<React.SetStateAction<TextbookUnit[]>>;
  handleLogout?: () => void;
  onResetData?: () => void;
}

export default function AdminTab({ 
  currentUser, 
  allUnits = [], 
  setAllUnits, 
  handleLogout, 
  onResetData 
}: AdminTabProps) {
  
  // Sidebar State on Mobile
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Navigation active panel
  const [activePanel, setActivePanel] = useState<"home" | "materials" | "exams" | "users">("home");

  // State mapping for Unit Manager 
  const [selectedUnitId, setSelectedUnitId] = useState<number>(allUnits[0]?.id || 1);
  const [materialsTab, setMaterialsTab] = useState<"unit" | "vocab" | "grammar" | "exercises" | "theory">("unit");
  const [unitDetailOpen, setUnitDetailOpen] = useState(true);
  const [editingMaterial, setEditingMaterial] = useState<{ type: "vocab" | "grammar" | "exercises" | "theory"; index: number; group?: "videos" | "pdfs" | "slides" } | null>(null);
  
  // Unit creation/editing fields
  const [unitMode, setUnitMode] = useState<"edit" | "create">("edit");
  const [unitTitle, setUnitTitle] = useState("");
  const [unitVietnameseTitle, setUnitVietnameseTitle] = useState("");
  const [unitOverview, setUnitOverview] = useState("");
  const [unitCoverImageUrl, setUnitCoverImageUrl] = useState("");

  // Manual course creation states
  // Vocab fields
  const [vocabWord, setVocabWord] = useState("");
  const [vocabPhonetic, setVocabPhonetic] = useState("");
  const [vocabMeaning, setVocabMeaning] = useState("");
  const [vocabExample, setVocabExample] = useState("");
  
  // Grammar fields
  const [grammarTitle, setGrammarTitle] = useState("");
  const [grammarExplanation, setGrammarExplanation] = useState("");
  const [grammarExamplesText, setGrammarExamplesText] = useState("");

  // Exercise fields
  const [exerciseQuestion, setExerciseQuestion] = useState("");
  const [exerciseType, setExerciseType] = useState<"single-choice" | "reorder" | "rewrite">("single-choice");
  const [exerciseOptionA, setExerciseOptionA] = useState("");
  const [exerciseOptionB, setExerciseOptionB] = useState("");
  const [exerciseOptionC, setExerciseOptionC] = useState("");
  const [exerciseOptionD, setExerciseOptionD] = useState("");
  const [exerciseCorrect, setExerciseCorrect] = useState("");
  const [exerciseExplanationText, setExerciseExplanationText] = useState("");

  // Theory fields
  const [theoryPdfFile, setTheoryPdfFile] = useState<File | null>(null);
  const [theoryPdfUrl, setTheoryPdfUrl] = useState("");
  const [theoryPdfName, setTheoryPdfName] = useState("");
  
  const [theorySlideFile, setTheorySlideFile] = useState<File | null>(null);
  const [theorySlideUrl, setTheorySlideUrl] = useState("");
  const [theorySlideName, setTheorySlideName] = useState("");
  
  const [theoryVideoUrl, setTheoryVideoUrl] = useState("");
  const [theoryVideoTitle, setTheoryVideoTitle] = useState("");

  // AI Exam Generator states
  const [examFile, setExamFile] = useState<File | null>(null);
  const [examTitleInput, setExamTitleInput] = useState("Đề khảo sát năng lực Tiếng Anh 9");
  const [examDurationInput, setExamDurationInput] = useState(45);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [aiAlert, setAiAlert] = useState<{ type: "success" | "danger" | "info"; text: string } | null>(null);
  const [previewExam, setPreviewExam] = useState<MockExam | null>(null);
  const [pastedExamText, setPastedExamText] = useState("");
  const [examSourceUrl, setExamSourceUrl] = useState("");
  const [examsList, setExamsList] = useState<MockExam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // Users overview states
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [selectedUserForChart, setSelectedUserForChart] = useState<string>("");
  const [searchUserQuery, setSearchUserQuery] = useState("");

  // Simulation map of weekly access hours (T2 - CN) for students with dynamic state support
  const [userChartsMap, setUserChartsMap] = useState<Record<string, { weekdayMinutes: number[]; lessons: number; exams: number; duration: string; lastScore: number }>>({});

  const selectedUnit = allUnits.find(u => u.id === selectedUnitId) || allUnits[0];

  // Preload lists from Firestore on mount
  useEffect(() => {
    fetchRegisteredExams();
    fetchUsersOverview();
  }, []);

  useEffect(() => {
    if (!selectedUnit) return;
    if (unitMode === "edit") {
      setUnitTitle(selectedUnit.title || "");
      setUnitVietnameseTitle(selectedUnit.vietnameseTitle || "");
      setUnitOverview(selectedUnit.overview || "");
      setUnitCoverImageUrl(selectedUnit.coverImageUrl || "");
    }
  }, [selectedUnitId, selectedUnit?.title, selectedUnit?.vietnameseTitle, selectedUnit?.overview, selectedUnit?.coverImageUrl, unitMode]);

  const getNextUnitId = () => {
    const maxId = allUnits.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0);
    return maxId + 1;
  };

  const nextUnitId = getNextUnitId();
  const createUnitPreview = unitMode === "create";

  const persistUnit = async (unit: TextbookUnit, successMessage: string) => {
    await apiFetch(`/api/units/${unit.id}`, { method: "PUT", body: JSON.stringify({ unit }) });
    if (setAllUnits) {
      setAllUnits(prev => {
        const exists = prev.some(u => u.id === unit.id);
        const next = exists ? prev.map(u => u.id === unit.id ? unit : u) : [...prev, unit];
        return next.sort((a, b) => Number(a.id) - Number(b.id));
      });
    }
    setSelectedUnitId(unit.id);
    alert(successMessage);
  };

  const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Không thể đọc file."));
    reader.readAsDataURL(file);
  });

  const handleCoverUpload = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh bìa hợp lệ: PNG, JPG, WEBP...");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setUnitCoverImageUrl(dataUrl);
  };

  const resetUnitFormForCreate = () => {
    const nextId = getNextUnitId();
    setUnitMode("create");
    setMaterialsTab("unit");
    setUnitDetailOpen(true);
    setUnitTitle("");
    setUnitVietnameseTitle("");
    setUnitOverview("");
    setUnitCoverImageUrl("");
    setSelectedUnitId(nextId);
    setEditingMaterial(null);
    setTimeout(() => {
      document.getElementById("admin-unit-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleSaveUnitInfo = async () => {
    if (!unitTitle.trim() || !unitVietnameseTitle.trim()) {
      alert("Vui lòng nhập tên bài học tiếng Anh và tiêu đề tiếng Việt.");
      return;
    }

    const id = unitMode === "create" ? getNextUnitId() : selectedUnitId;
    const baseUnit = unitMode === "edit" && selectedUnit ? selectedUnit : null;
    const unit: TextbookUnit = {
      id,
      un: baseUnit?.un || `Unit ${id}`,
      title: unitTitle.trim(),
      vietnameseTitle: unitVietnameseTitle.trim(),
      overview: unitOverview.trim() || "Bài học mới do Admin VocaFox tạo.",
      coverImageUrl: unitCoverImageUrl.trim() || undefined,
      theoryVideoUrl: baseUnit?.theoryVideoUrl,
      theoryPdfUrl: baseUnit?.theoryPdfUrl,
      documentUrl: baseUnit?.documentUrl,
      slidePdfUrl: baseUnit?.slidePdfUrl,
      vocabulary: baseUnit?.vocabulary || [],
      grammar: baseUnit?.grammar || [],
      pronunciation: baseUnit?.pronunciation || { title: "Pronunciation", explanation: "", examples: [] },
      exercises: baseUnit?.exercises || []
    };
    Object.assign(unit, {
      theoryVideos: (baseUnit as any)?.theoryVideos || [],
      theoryPdfs: (baseUnit as any)?.theoryPdfs || [],
      theorySlides: (baseUnit as any)?.theorySlides || []
    });

    try {
      await persistUnit(unit, unitMode === "create" ? `Đã tạo bài học mới ${unit.un}: ${unit.title}.` : `Đã cập nhật thông tin ${unit.un}: ${unit.title}.`);
      setUnitMode("edit");
    } catch (err) {
      console.error(err);
      alert("Không thể lưu thông tin bài học. Vui lòng kiểm tra kết nối hoặc quyền Admin.");
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    const unit = allUnits.find(u => u.id === unitId);
    if (!unit) return;
    if (!window.confirm(`Xóa toàn bộ bài học ${unit.un}: ${unit.title}? Hành động này sẽ gỡ bài khỏi dashboard học sinh.`)) return;

    try {
      await apiFetch(`/api/units/${unitId}`, { method: "DELETE" });
      if (setAllUnits) setAllUnits(prev => prev.filter(u => u.id !== unitId));
      const nextUnit = allUnits.find(u => u.id !== unitId);
      if (nextUnit) setSelectedUnitId(nextUnit.id);
      alert("Đã xóa bài học khỏi hệ thống.");
    } catch (err) {
      console.error(err);
      alert("Không thể xóa bài học. Vui lòng kiểm tra kết nối hoặc quyền Admin.");
    }
  };

  const handleDeleteMaterialItem = async (type: "vocab" | "grammar" | "exercises" | "theory", index: number, group?: "videos" | "pdfs" | "slides") => {
    if (!selectedUnit) return;
    if (!window.confirm("Bạn có chắc muốn xóa mục học liệu này khỏi bài học?")) return;
    const updatedUnit: TextbookUnit = { ...selectedUnit };
    if (type === "vocab") updatedUnit.vocabulary = (updatedUnit.vocabulary || []).filter((_, i) => i !== index);
    if (type === "grammar") updatedUnit.grammar = (updatedUnit.grammar || []).filter((_, i) => i !== index);
    if (type === "exercises") updatedUnit.exercises = (updatedUnit.exercises || []).filter((_, i) => i !== index);
    if (type === "theory") {
      if (group === "videos") {
        (updatedUnit as any).theoryVideos = ((updatedUnit as any).theoryVideos || []).filter((_: any, i: number) => i !== index);
        if (!((updatedUnit as any).theoryVideos || []).length) (updatedUnit as any).theoryVideoUrl = "";
      }
      if (group === "pdfs") {
        (updatedUnit as any).theoryPdfs = ((updatedUnit as any).theoryPdfs || []).filter((_: any, i: number) => i !== index);
        if (!((updatedUnit as any).theoryPdfs || []).length) (updatedUnit as any).theoryPdfUrl = "";
      }
      if (group === "slides") {
        (updatedUnit as any).theorySlides = ((updatedUnit as any).theorySlides || []).filter((_: any, i: number) => i !== index);
        if (!((updatedUnit as any).theorySlides || []).length) (updatedUnit as any).slidePdfUrl = "";
      }
    }
    try {
      await persistUnit(updatedUnit, "Đã xóa mục học liệu khỏi bài học.");
      if (editingMaterial?.type === type && editingMaterial.index === index) setEditingMaterial(null);
    } catch (err) {
      console.error(err);
      alert("Không thể xóa học liệu. Vui lòng thử lại.");
    }
  };

  const handleEditMaterialItem = (type: "vocab" | "grammar" | "exercises" | "theory", index: number, group?: "videos" | "pdfs" | "slides") => {
    if (!selectedUnit) return;
    setMaterialsTab(type);
    setEditingMaterial({ type, index, group });
    if (type === "vocab") {
      const item = selectedUnit.vocabulary?.[index];
      if (item) { setVocabWord(item.word || ""); setVocabPhonetic(item.phonetic || ""); setVocabMeaning(item.meaning || ""); setVocabExample(item.example || ""); }
    }
    if (type === "grammar") {
      const item = selectedUnit.grammar?.[index];
      if (item) { setGrammarTitle(item.title || ""); setGrammarExplanation(item.content || ""); setGrammarExamplesText((item.examples || []).join("\n")); }
    }
    if (type === "exercises") {
      const item = selectedUnit.exercises?.[index];
      if (item) {
        setExerciseQuestion(item.question || "");
        setExerciseType(item.type || "single-choice");
        setExerciseOptionA(item.options?.[0] || ""); setExerciseOptionB(item.options?.[1] || ""); setExerciseOptionC(item.options?.[2] || ""); setExerciseOptionD(item.options?.[3] || "");
        setExerciseCorrect(item.correctValue || ""); setExerciseExplanationText(item.explanation || "");
      }
    }
    if (type === "theory") {
      if (group === "videos") { const item = ((selectedUnit as any).theoryVideos || [])[index]; if (item) { setTheoryVideoTitle(item.title || ""); setTheoryVideoUrl(item.url || ""); } }
      if (group === "pdfs") { const item = ((selectedUnit as any).theoryPdfs || [])[index]; if (item) { setTheoryPdfName(item.name || ""); setTheoryPdfUrl(item.url || ""); } }
      if (group === "slides") { const item = ((selectedUnit as any).theorySlides || [])[index]; if (item) { setTheorySlideName(item.name || ""); setTheorySlideUrl(item.url || ""); } }
    }
  };

  const fetchUsersOverview = async () => {
    try {
      // Đọc dữ liệu thật từ backend Supabase thay cho Firestore.
      const data = await apiFetch<any>("/api/admin/stats");
      const stats = data.stats || data;
      const loaded: SystemUser[] = [];
      const updatedMap: Record<string, { weekdayMinutes: number[]; lessons: number; exams: number; duration: string; lastScore: number }> = {};

      const users = Array.isArray(stats.users) ? stats.users : [];
      for (const u of users) {
        const userName = u.name || u.email || "Học viên";
        const activeHours = Number(u.usage_time_seconds || u.usageTimeSeconds || 0) / 3600;
        const lessonsCount = Number(u.completedCount || u.completed_count || u.completedUnits?.length || 0);
        const examsCount = Number(u.attemptsCount || u.attempts_count || 0);
        const lastScore = Number(u.avgScore || u.avg_score || 0);
        const weekdayMinutes = Array.isArray(u.weekdayMinutes) ? u.weekdayMinutes : [0, 0, 0, 0, 0, 0, 0];

        loaded.push({
          id: String(u.id || u.user_id || u.email),
          name: userName,
          email: u.email || "",
          isPro: !!(u.is_pro ?? u.isPro),
          role: (u.role || "student") as any,
          studyStreak: Number(u.study_streak || u.studyStreak || 0),
          usageHours: parseFloat(activeHours.toFixed(1)),
          activityCount: { lessons: lessonsCount, exams: examsCount }
        });

        updatedMap[userName] = {
          weekdayMinutes,
          lessons: lessonsCount,
          exams: examsCount,
          duration: `${parseFloat(activeHours.toFixed(1))} giờ`,
          lastScore
        };
      }

      setUsersList(loaded);
      setUserChartsMap(updatedMap);
      setSelectedUserForChart((prev) => prev && updatedMap[prev] ? prev : (loaded[0]?.name || ""));
    } catch (e) {
      console.warn("Lỗi lấy danh sách người dùng thực tế:", e);
      setUsersList([]);
      setUserChartsMap({});
      setSelectedUserForChart("");
    }
  };

  const fetchRegisteredExams = async () => {
    setLoadingExams(true);
    try {
      const data = await apiFetch<{ success?: boolean; exams?: MockExam[] }>("/api/exams");
      const list: MockExam[] = Array.isArray(data.exams) ? data.exams : [];
      const deletedIds: string[] = JSON.parse(localStorage.getItem("voca_deleted_exam_ids") || "[]");
      const combined = [...list];

      mockExams.forEach((mock) => {
        if (!combined.some(e => e.id === mock.id)) {
          combined.push(mock);
        }
      });

      setExamsList(combined.filter(e => !deletedIds.includes(e.id)));
    } catch (err) {
      console.error("Lỗi lấy danh sách đề thi:", err);
      const deletedIds: string[] = JSON.parse(localStorage.getItem("voca_deleted_exam_ids") || "[]");
      setExamsList(mockExams.filter(e => !deletedIds.includes(e.id)));
    } finally {
      setLoadingExams(false);
    }
  };

  // Add or edit individual items to selected textbook unit
  const handleSaveMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (materialsTab === "unit") {
      await handleSaveUnitInfo();
      return;
    }

    const unitToModify = allUnits.find(u => u.id === selectedUnitId);
    if (!unitToModify) {
      alert("⚠️ Vui lòng chọn hoặc tạo bài học trước khi thêm học liệu.");
      return;
    }

    let updatedUnit: TextbookUnit = { ...unitToModify };

    const replaceOrAppend = <T,>(list: T[], item: T) => {
      if (editingMaterial && editingMaterial.type === materialsTab && editingMaterial.index >= 0) {
        return list.map((oldItem, index) => index === editingMaterial.index ? item : oldItem);
      }
      return [...list, item];
    };

    if (materialsTab === "vocab") {
      if (!vocabWord.trim() || !vocabMeaning.trim()) {
        alert("⚠️ Vui lòng hoàn tất mục Từ vựng tiếng Anh và Nghĩa tiếng Việt!");
        return;
      }
      const newVocab: VocabItem = {
        word: vocabWord.trim(),
        phonetic: vocabPhonetic.trim() || "/.../",
        meaning: vocabMeaning.trim(),
        example: vocabExample.trim() || `Example sentence for word ${vocabWord}`
      };
      updatedUnit.vocabulary = replaceOrAppend(updatedUnit.vocabulary || [], newVocab);
      setVocabWord(""); setVocabPhonetic(""); setVocabMeaning(""); setVocabExample("");

    } else if (materialsTab === "grammar") {
      if (!grammarTitle.trim() || !grammarExplanation.trim()) {
        alert("⚠️ Vui lòng nhập thông tin tiêu đề và cơ sở lý thuyết!");
        return;
      }
      const newGrammar: GrammarTopic = {
        title: grammarTitle.trim(),
        content: grammarExplanation.trim(),
        examples: grammarExamplesText.trim() ? grammarExamplesText.split("\n").map(x => x.trim()).filter(Boolean) : []
      };
      updatedUnit.grammar = replaceOrAppend(updatedUnit.grammar || [], newGrammar);
      setGrammarTitle(""); setGrammarExplanation(""); setGrammarExamplesText("");

    } else if (materialsTab === "exercises") {
      if (!exerciseQuestion.trim() || !exerciseCorrect.trim()) {
        alert("⚠️ Vui lòng nhập câu hỏi kiểm tra và phương án chấm điểm!");
        return;
      }
      const newQuestion: Question = {
        id: editingMaterial?.type === "exercises" ? (updatedUnit.exercises?.[editingMaterial.index]?.id || `m_ex_${Date.now()}`) : `m_ex_${Date.now()}`,
        question: exerciseQuestion.trim(),
        type: exerciseType,
        options: exerciseType === "single-choice" ? [
          exerciseOptionA.trim() || "A",
          exerciseOptionB.trim() || "B",
          exerciseOptionC.trim() || "C",
          exerciseOptionD.trim() || "D"
        ] : undefined,
        correctValue: exerciseCorrect.trim(),
        explanation: exerciseExplanationText.trim() || "VocaFox AI hướng dẫn chi tiết."
      };
      updatedUnit.exercises = replaceOrAppend(updatedUnit.exercises || [], newQuestion);
      setExerciseQuestion(""); setExerciseOptionA(""); setExerciseOptionB(""); setExerciseOptionC(""); setExerciseOptionD(""); setExerciseCorrect(""); setExerciseExplanationText("");

    } else if (materialsTab === "theory") {
      const hasVideo = theoryVideoUrl.trim();
      const hasPdf = theoryPdfName.trim() || theoryPdfUrl.trim();
      const hasSlide = theorySlideName.trim() || theorySlideUrl.trim();
      if (!hasVideo && !hasPdf && !hasSlide) {
        alert("⚠️ Vui lòng nhập ít nhất 1 link YouTube, link PDF hoặc link slide lý thuyết.");
        return;
      }

      if (hasVideo) {
        const video = { title: theoryVideoTitle.trim() || "Video bài học YouTube", url: theoryVideoUrl.trim() };
        const videos = [...(((updatedUnit as any).theoryVideos || []) as any[])];
        if (editingMaterial?.type === "theory" && editingMaterial.group === "videos") videos[editingMaterial.index] = video;
        else videos.push(video);
        (updatedUnit as any).theoryVideos = videos;
        (updatedUnit as any).theoryVideoUrl = video.url;
      }
      if (hasPdf) {
        const pdf = { name: theoryPdfName.trim() || "Tài liệu PDF lý thuyết", url: theoryPdfUrl.trim() || "#" };
        const pdfs = [...(((updatedUnit as any).theoryPdfs || []) as any[])];
        if (editingMaterial?.type === "theory" && editingMaterial.group === "pdfs") pdfs[editingMaterial.index] = pdf;
        else pdfs.push(pdf);
        (updatedUnit as any).theoryPdfs = pdfs;
        (updatedUnit as any).theoryPdfUrl = pdf.url;
        (updatedUnit as any).documentUrl = pdf.url;
      }
      if (hasSlide) {
        const slide = { name: theorySlideName.trim() || "Slide bài giảng", url: theorySlideUrl.trim() || "#" };
        const slides = [...(((updatedUnit as any).theorySlides || []) as any[])];
        if (editingMaterial?.type === "theory" && editingMaterial.group === "slides") slides[editingMaterial.index] = slide;
        else slides.push(slide);
        (updatedUnit as any).theorySlides = slides;
        (updatedUnit as any).slidePdfUrl = slide.url;
      }
      setTheoryPdfName(""); setTheoryPdfUrl(""); setTheorySlideName(""); setTheorySlideUrl(""); setTheoryVideoUrl(""); setTheoryVideoTitle("");
    }

    try {
      await persistUnit(updatedUnit, editingMaterial ? `Đã cập nhật học liệu trong "${updatedUnit.un}: ${updatedUnit.title}".` : `🎉 Đã thêm học liệu vào "${updatedUnit.un}: ${updatedUnit.title}".`);
      setEditingMaterial(null);
    } catch (err) {
      console.error(err);
      alert("❌ Lưu trữ thất bại. Quý Admin vui lòng kiểm tra lại kết nối hoặc quyền Admin.");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error || new Error("Không thể đọc file."));
    reader.readAsDataURL(file);
  });

  const parseExamWithAI = async (payload: Record<string, any>) => {
    const res = await fetch("/api/ai/parse-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success || !data.exam) {
      throw new Error(data.error || "AI chưa trích xuất được cấu trúc đề thi.");
    }
    return data;
  };

  // AI Exam upload: PDF, DOC/DOCX, TXT và ảnh scan rõ nét
  const handleUploadExamBtn = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExamFile(file);
    setUploadLoading(true);
    setPreviewExam(null);
    setAiAlert({ type: "info", text: "FoxieAI đang đọc file gốc và trích xuất đúng các câu hỏi có thật trong tài liệu..." });

    try {
      const fileData = await fileToBase64(file);
      const data = await parseExamWithAI({
        fileData,
        mimeType: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
        fileName: file.name,
        title: examTitleInput,
        duration: examDurationInput
      });

      setPreviewExam(data.exam);
      const total = data.extractedQuestionCount || data.meta?.totalQuestions || data.exam.sections?.reduce((sum: number, sec: any) => sum + (sec.questions?.length || 0), 0) || 0;
      setAiAlert({ type: "success", text: `AI đã trích xuất đề từ file thành công (${total} câu). Thầy/Cô rà soát lại rồi đăng cho học sinh.` });
    } catch (err: any) {
      setPreviewExam(null);
      setAiAlert({ type: "danger", text: `AI phân tách file thất bại: ${err.message || err}. Hãy thử PDF rõ nét hơn, DOCX chuẩn văn bản hoặc dán thêm nội dung/link Docs.` });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleTextExtractBtn = async () => {
    const textContent = pastedExamText.trim();
    const sourceUrl = examSourceUrl.trim();

    if (!textContent && !sourceUrl) {
      alert("Vui lòng dán đề thi thô, dán link Google Docs/Word online hoặc tải file PDF/Word/TXT.");
      return;
    }

    setUploadLoading(true);
    setPreviewExam(null);
    setAiAlert({ type: "info", text: sourceUrl ? "FoxieAI đang lấy nội dung từ link tài liệu và trích xuất đề thi..." : "FoxieAI đang phân tích văn bản đề thi thô..." });

    try {
      const data = await parseExamWithAI({
        textContent,
        sourceUrl,
        title: examTitleInput,
        duration: examDurationInput
      });

      setPreviewExam(data.exam);
      const total = data.extractedQuestionCount || data.meta?.totalQuestions || data.exam.sections?.reduce((sum: number, sec: any) => sum + (sec.questions?.length || 0), 0) || 0;
      setAiAlert({ type: "success", text: `AI đã trích xuất đề thi thành công (${total} câu). Vui lòng rà soát trước khi đăng.` });
    } catch (err: any) {
      setPreviewExam(null);
      setAiAlert({ type: "danger", text: `AI phân tách thất bại: ${err.message || err}. Không tạo đề mô phỏng để tránh sai dữ liệu.` });
    } finally {
      setUploadLoading(false);
    }
  };

  const generateSimulatedExam = (fileName: string) => {
    // Generate simulated high quality MCQ test with solutions matching standard formats
    const randomId = "exam_" + Math.floor(Math.random() * 1000000);
    const mockCreated: MockExam = {
      id: randomId,
      title: examTitleInput || `Đề thi trích xuất từ ${fileName}`,
      duration: examDurationInput || 45,
      sections: [
        {
          id: "sec1",
          title: "Part I: Phonetics & Vocabulary",
          instruction: "Choose the option that best completes each sentence:",
          questions: [
            {
              id: `${randomId}_q1`,
              question: "If we continue to pollute our local rivers, we won't have any clean water to use. Which word is the closest in meaning to 'pollute'?",
              type: "single-choice",
              options: ["A. clean", "B. contaminate", "C. purify", "D. preserve"],
              correctValue: "B. contaminate",
              explanation: "Contaminate nghĩa là làm nhiễm bẩn, đồng nghĩa hoàn toàn với pollute (ô nhiễm)."
            },
            {
              id: `${randomId}_q2`,
              question: "The artisan spent three weeks crafting this beautiful pottery pot. What does 'artisan' mean?",
              type: "single-choice",
              options: ["A. teacher", "B. craftsman", "C. student", "D. dentist"],
              correctValue: "B. craftsman",
              explanation: "Artisan tương đương craftsman, mang nghĩa thực tế chỉ thợ thủ công lành nghề."
            }
          ]
        },
        {
          id: "sec2",
          title: "Part II: Grammar & Structure",
          instruction: "Select the most grammatically correct response:",
          questions: [
            {
              id: `${randomId}_q3`,
              question: "I really look forward to ________ my pen pal in London next week.",
              type: "single-choice",
              options: ["A. meet", "B. meeting", "C. met", "D. meets"],
              correctValue: "B. meeting",
              explanation: "Cấu trúc 'look forward to' luôn đi kèm cụm động từ thêm đuôi -ing (V-ing)."
            }
          ]
        }
      ]
    };

    setPreviewExam(mockCreated);
    setAiAlert({
      type: "success",
      text: `🎉 AI đã tổng hợp thành công đề thi thử Tiếng Anh trắc nghiệm cực kỳ tối ưu từ tài liệu đính kèm!`
    });
    setUploadLoading(false);
  };

  const handlePublishExamClick = async () => {
    if (!previewExam) {
      alert("⚠️ Không có dữ liệu đề thi được chuẩn bị để đăng.");
      return;
    }

    const finalExam: MockExam = {
      ...previewExam,
      title: examTitleInput || previewExam.title,
      duration: Number(examDurationInput) || previewExam.duration
    };

    try {
      // Save exam to Firestore database exams collection
      await apiFetch(`/api/exams/${encodeURIComponent(finalExam.id)}`, { method: "PUT", body: JSON.stringify({ exam: finalExam }) });
      
      // Update local exam stats list
      setExamsList(prev => {
        const index = prev.findIndex(item => item.id === finalExam.id);
        if (index > -1) {
          return prev.map(item => item.id === finalExam.id ? finalExam : item);
        } else {
          return [finalExam, ...prev];
        }
      });

      alert(`🎉 Đã đăng tải thành công đề thi "${finalExam.title}" (${finalExam.duration} phút) sang dashboard Đề thi của học sinh!`);
      // Reset simulator preview
      setPreviewExam(null);
      setAiAlert(null);
      setExamFile(null);
    } catch (e) {
      console.error(e);
      alert("⚠️ Không thể đăng tải đề thi lên cơ sở dữ liệu học tập. Vui lòng kết nối Internet.");
    }
  };

  const handleDeleteDbExam = async (examId: string) => {
    if (!window.confirm("Thầy/Cô có chắc chắn muốn gỡ đề thi này khỏi hệ thống? Học sinh sẽ không thể làm đề thi này nữa.")) {
      return;
    }
    
    // Track deleted IDs in localStorage for offline persistence & default exams deletion support
    const deletedIds: string[] = JSON.parse(localStorage.getItem("voca_deleted_exam_ids") || "[]");
    if (!deletedIds.includes(examId)) {
      deletedIds.push(examId);
      localStorage.setItem("voca_deleted_exam_ids", JSON.stringify(deletedIds));
    }
    
    try {
      await apiFetch(`/api/exams/${encodeURIComponent(examId)}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Firestore delete issue, but offline delete succeeded:", err);
    }
    
    setExamsList(prev => prev.filter(ex => ex.id !== examId));
    alert("Đã gỡ bỏ bài thi thử khỏi kho tài liệu thành công.");
  };

  // Safe fetch values for selected active state
  const activeChart = userChartsMap[selectedUserForChart] || { weekdayMinutes: [0, 0, 0, 0, 0, 0, 0], lessons: 0, exams: 0, duration: "0 giờ", lastScore: 0 };
  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="admin-shell min-h-screen bg-[#f7fbff] font-sans antialiased text-[#0f1b33]">
      
      {/* ========================================== */}
      {/* 1. SIDEBAR NAVIGATION */}
      {/* ========================================== */}
      <aside className={`sidebar shrink-0 ${mobileSidebarOpen ? "show" : ""}`} id="sidebar">
        
        {/* Brand container */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 mb-5 shadow-sm">
          <div className="flex items-center gap-[12px] cursor-pointer group mb-4">
            <div className="w-[46px] h-[46px] rounded-[16px] bg-[#0b3a6f] text-white flex items-center justify-center font-[900] text-[20px] tracking-tight shadow-[0_8px_20px_rgba(255,138,0,0.18)] select-none shrink-0">
              VF
            </div>
            <div className="text-left font-sans">
              <h2 className="text-[21px] font-[905] tracking-tight text-[#0b1f3a] leading-none group-hover:text-[#0b5cad] transition-colors">
                Voca<span className="text-[#0b5cad]">Fox</span>
              </h2>
            </div>
          </div>

          {/* Admin Info Capsule */}
          <div className="relative bg-[#f7fbff] border border-slate-200 rounded-[20px] p-3 flex items-center justify-between gap-1 w-full">
            <div className="flex items-center gap-2.5 min-w-0 text-left">
              <div className="w-10 h-10 rounded-full bg-[#eaf4ff] border border-[#b8d7f4] flex items-center justify-center text-[#0b5cad] font-[900] text-[15px] shadow-sm shrink-0">
                A
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="text-[13px] font-[850] text-[#0b1f3a] leading-tight truncate">
                  Admin Voca<span className="text-[#0b5cad]">Fox</span>
                </p>
                <p className="text-[10px] font-bold text-slate-500 leading-none mt-1">
                  Quản trị hệ thống
                </p>
              </div>
            </div>

            {/* Hamburger option inside side information capsule */}
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-8 h-8 rounded-xl bg-white flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#eaf4ff] transition-all text-[#0b3a6f] border border-slate-200 focus:outline-none"
              title="Quản trị"
            >
              <span className="w-3.5 h-[2px] bg-[#0b3a6f] rounded-full"></span>
              <span className="w-3.5 h-[2px] bg-[#0b3a6f] rounded-full"></span>
              <span className="w-3.5 h-[2px] bg-[#0b3a6f] rounded-full"></span>
            </button>

            {/* Inside Admin Dropdown details */}
            {profileDropdownOpen && (
              <div className="absolute top-[108%] right-0 w-[190px] bg-white border border-[#e8edf5] shadow-[0_16px_48px_rgba(16,33,63,0.16)] rounded-[20px] p-1.5 z-50 text-slate-800 flex flex-col text-left">
                <div className="p-2 border-b border-slate-100 select-none mb-1">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 leading-none">Tài khoản</p>
                  <p className="text-[10.5px] text-slate-500 truncate mt-1">{currentUser?.email || "nbao8887@gmail.com"}</p>
                </div>

                <button
                  onClick={() => {
                    if (onResetData) onResetData();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 hover:bg-[#f3f6fb] text-[12px] font-[750] text-[#465872] hover:text-[#0b5cad] rounded-xl transition-colors flex items-center gap-2 border-0 bg-transparent cursor-pointer"
                >
                  Đồng bộ học lực
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    alert("Cơ sở dữ liệu VocaFox đang bám sát chương trình giảng dạy của Bộ GD&ĐT!");
                  }}
                  className="w-full text-left p-2 hover:bg-[#f3f6fb] text-[12px] font-[750] text-[#465872] hover:text-[#0b5cad] rounded-xl transition-colors flex items-center gap-2 border-0 bg-transparent cursor-pointer"
                >
                  Quản lý tài khoản
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() => {
                    if (handleLogout) handleLogout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left p-2 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded-xl transition-colors flex items-center gap-2 font-[750] text-[12px] cursor-pointer border-0 bg-transparent"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sidebar Menus  */}
        <nav className="side-menu text-left font-sans">
          <button 
            type="button"
            onClick={() => { setActivePanel("home"); setMobileSidebarOpen(false); }}
            className={`w-full outline-none border-0 bg-transparent text-left menu-link flex items-center justify-between gap-1.5 cursor-pointer ${
              activePanel === "home" ? "active text-white" : ""
            }`}
          >
            <span>Trang chủ</span>
            <span className="text-[18px]">›</span>
          </button>

          <button 
            type="button"
            onClick={() => { setActivePanel("materials"); setMobileSidebarOpen(false); }}
            className={`w-full outline-none border-0 bg-transparent text-left menu-link flex items-center justify-between gap-1.5 cursor-pointer ${
              activePanel === "materials" ? "active text-white" : ""
            }`}
          >
            <span>Quản lý học liệu</span>
            <span className="text-[18px]">›</span>
          </button>

          <button 
            type="button"
            onClick={() => { setActivePanel("exams"); setMobileSidebarOpen(false); }}
            className={`w-full outline-none border-0 bg-transparent text-left menu-link flex items-center justify-between gap-1.5 cursor-pointer ${
              activePanel === "exams" ? "active text-white" : ""
            }`}
          >
            <span>Ngân hàng đề thi</span>
            <span className="text-[18px]">›</span>
          </button>

          <button 
            type="button"
            onClick={() => { setActivePanel("users"); setMobileSidebarOpen(false); }}
            className={`w-full outline-none border-0 bg-transparent text-left menu-link flex items-center justify-between gap-1.5 cursor-pointer ${
              activePanel === "users" ? "active text-white" : ""
            }`}
          >
            <span>Quản trị người dùng</span>
            <span className="text-[18px]">›</span>
          </button>
        </nav>

        <div className="sidebar-note select-none text-left">
          Hệ thống VocaFox quản trị toàn phần. Cho phép đăng tải học liệu, video lý thuyết bám sát SGK và kiến tạo đề thi thử trắc nghiệm bằng Trí tuệ nhân tạo.
        </div>
      </aside>

      {/* ========================================== */}
      {/* 2. MAIN WORKSPACE CONTENT CONTAINER */}
      {/* ========================================== */}
      <main className="main w-full min-w-0">
        
        {/* TOP COMPONENT HEADER */}
        <header className="topbar select-none">
          <div className="page-title text-left">
            <b id="pageTitle">
              {activePanel === "home" && "Dashboard Admin"}
              {activePanel === "materials" && "Quản lý học liệu Lớp 9"}
              {activePanel === "exams" && "Ngân hàng đề thi AI"}
              {activePanel === "users" && "Quản lý & Thống kê sinh viên"}
            </b>
            <small id="pageSubtitle">
              {activePanel === "home" && "Trung tâm điều hành hệ thống VocaFox"}
              {activePanel === "materials" && "Thiết lập bồi dưỡng từ vựng, ngữ pháp, bài ôn tập và bài giảng lý thuyết"}
              {activePanel === "exams" && "Nhập đề thi qua tệp PDF để AI tự phân tích và biên dịch trắc nghiệm chuẩn Bộ"}
              {activePanel === "users" && "Chi tiết hoạt động tích cực của Phụ huynh và Học sinh lớp 9"}
            </small>
          </div>

          <div className="search-box relative hidden sm:block">
            <input 
              type="text" 
              placeholder="Tìm kiếm nhanh thông tin..." 
              className="px-4 py-2 focus:border-[#0b5cad] focus:ring-1 focus:ring-[#0b5cad]"
            />
          </div>

          <div className="top-actions shrink-0">
            <button 
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="btn btn-secondary mobile-menu-btn md:hidden"
              id="openMenu"
            >
              Menu
            </button>
            <button 
              onClick={() => document.getElementById("ai_floating_chat_box")?.click()}
              className="btn btn-primary"
            >
              Mở FoxieAI ⚡
            </button>
          </div>
        </header>

        <div className="content">

          {/* ========================================== */}
          {/* PANEL A: HOME DASHBOARD */}
          {/* ========================================== */}
          {activePanel === "home" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Admin Core Hero Banner */}
              <div className="admin-hero">
                <div className="hero-inner">
                  <div>
                    <div className="hero-kicker font-sans">VocaFox Admin Portal</div>

                    <h1 className="hero-title font-sans font-black tracking-tight leading-none text-white">
                      Điều hành hệ thống <br />
                      <span className="text-[#bfe3ff] font-[900]">VocaFox Learning</span>
                    </h1>

                    <p className="hero-desc">
                      Quản lý chuyên sâu học liệu Lớp 9 bám sát chương trình sách giáo khoa chuẩn, đính kèm giải thuật AI bóc tách bài kiểm tra thử từ PDF, lập báo cáo giám sát tổng thể hoạt động truy cập học sinh.
                    </p>

                    <div className="hero-actions font-sans">
                      <button 
                        onClick={() => setActivePanel("materials")}
                        className="btn btn-primary px-6 py-3 font-extrabold"
                      >
                        Quản lý học liệu
                      </button>
                      <button 
                        onClick={() => setActivePanel("exams")}
                        className="btn btn-secondary px-6 py-3 font-extrabold"
                      >
                        Tạo đề thi bằng AI
                      </button>
                    </div>
                  </div>

                  <div className="admin-visual select-none">
                    <div className="server-ui w-full max-w-[430px]">
                      <div className="server-top"></div>

                      <div className="server-row">
                        <span className="flex items-center gap-2">Learning Content DB 🗄️</span>
                        <span className="server-dot"></span>
                      </div>

                      <div className="server-row">
                        <span className="flex items-center gap-2">Gemini Exam Parser API 🧠</span>
                        <span className="server-dot"></span>
                      </div>

                      <div className="server-row">
                        <span className="flex items-center gap-2">User Traffic Analytics 📊</span>
                        <span className="server-dot"></span>
                      </div>

                      <div className="server-row">
                        <span className="flex items-center gap-2">FoxieAI Chat Assistant 💬</span>
                        <span className="server-dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Quick Counter Widgets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card">
                  <small>Tổng học sinh đăng ký</small>
                  <b className="text-slate-800 text-3xl font-black">{usersList.length}</b>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5">Sĩ tử & Phụ huynh kết nối</p>
                </div>

                <div className="stat-card">
                  <small>Học liệu đính kèm</small>
                  <b className="text-[#0b5cad] text-3xl font-black">{allUnits.length * 4 || 32} bài học</b>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5">Vocabulary, Từ vựng, Ngữ pháp</p>
                </div>

                <div className="stat-card">
                  <small>Đề thi trong ngân hàng</small>
                  <b className="text-[#0b5cad] text-3xl font-black">{examsList.length + 3} đề thi</b>
                  <p className="text-[11px] text-slate-500 font-bold mt-1.5">AI tự bóc tách lập tức</p>
                </div>

                <div className="stat-card">
                  <small>Hoạt động trực tiếp (Hôm nay)</small>
                  <b className="text-indigo-650 text-3xl font-black">124 lượt</b>
                  <p className="text-[11px] text-[#0b5cad] font-bold mt-1.5">⚡ Tăng 14% so với hôm qua</p>
                </div>
              </div>

              {/* Home Activity List and Administration state */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                <div className="panel bg-white">
                  <h3 className="font-extrabold text-slate-800 border-b border-slate-100 pb-3">
                    Nhật ký vận hành
                  </h3>
                  <div className="activity-list">
                    <div className="activity-item select-none text-left">
                      <div>
                        <b className="text-xs text-slate-800 font-extrabold block">Bồi dưỡng Unit 4: Remembering the Past</b>
                        <small className="text-[10.5px] text-slate-450 block mt-1">Admin đính kèm thêm bài lý thuyết PDF và 4 từ vựng mới.</small>
                      </div>
                      <span className="badge">Chương Trình</span>
                    </div>

                    <div className="activity-item select-none text-left">
                      <div>
                        <b className="text-xs text-slate-800 font-extrabold block">Kiến lập Đề ôn thi số 4 thành công</b>
                        <small className="text-[10.5px] text-slate-450 block mt-1">AI hoàn thiện cấu trúc phỏng theo mẫu Bộ gồm 40 câu hỏi.</small>
                      </div>
                      <span className="badge-primary badge bg-sky-50 text-[#0b3a6f] font-black">AI EXAM</span>
                    </div>

                    <div className="activity-item select-none text-left">
                      <div>
                        <b className="text-xs text-slate-800 font-extrabold block">Thống kê phụ huynh liên kết</b>
                        <small className="text-[10.5px] text-slate-450 block mt-1">Ghi nhận thêm 4 tài khoản phụ huynh theo sát lộ trình vào 10.</small>
                      </div>
                      <span className="badge bg-indigo-50 text-indigo-700">Người dùng</span>
                    </div>
                  </div>
                </div>

                <div className="panel bg-white">
                  <h3 className="font-extrabold text-[#0f1b33] border-b border-slate-100 pb-3">
                    Hiệu suất AI Trợ lý
                  </h3>
                  <p className="text-xs text-slate-400 leading-snug font-bold mt-1 mb-3">
                    VocaFox AI hỗ trợ rà duyệt dịch đề tự động, giải nghĩa chuyên mục phát hiện lỗi bẫy phòng thi.
                  </p>
                  
                  <div className="activity-list">
                    <div className="activity-item bg-sky-50/20 border-emerald-100/50 flex justify-between items-center p-3.5 rounded-xl">
                      <div>
                        <b className="text-xs text-[#06170f] font-black">Tạo học liệu và lý thuyết tự động</b>
                        <p className="text-[11px] text-[#0b3a6f] mt-1 font-bold">Khởi tạo nhanh chuỗi câu hỏi cho Unit</p>
                      </div>
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
                    </div>

                    <div className="activity-item bg-orange-50/20 border-orange-100/50 flex justify-between items-center p-3.5 rounded-xl">
                      <div>
                        <b className="text-xs text-orange-950 font-black">Chấm thi và soạn thảo giải thích bài tập</b>
                        <p className="text-[11px] text-orange-700 mt-1 font-bold">Lược lập nhanh đáp án đúng cùng mô dẫm chi tiết</p>
                      </div>
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* PANEL B: LEARNING MATERIALS (QUẢN LÝ HỌC LIỆU) */}
          {/* ========================================== */}
          {activePanel === "materials" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="material-layout">
                
                {/* 2.1 TEXTBOOK UNITS LIST LEFT COLUMN */}
                <div className="space-y-3">
                  <div className="bg-white border border-[#e8edf5] rounded-[28px] p-5 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#0f1b33]">Danh mục bài học SGK Lớp 9</h3>
                    <p className="text-[11px] text-slate-400 font-bold mb-4">Chọn chương học để bổ sung bồi dưỡng lý thuyết hoặc ôn tập.</p>
                    
                    <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={resetUnitFormForCreate}
                        className="w-full mb-3 p-3 rounded-2xl border border-dashed border-[#0b5cad] bg-[#eaf4ff] text-[#0b3a6f] font-black text-xs flex items-center justify-center gap-2 hover:bg-[#dceeff] transition-colors"
                      >
                        <Plus className="h-4 w-4" /> Tạo bài học / Unit mới
                      </button>
                      {createUnitPreview && (
                        <div className="p-3.5 rounded-[22px] border-2 border-dashed border-[#0b5cad] bg-[#f2f8ff] text-left mb-2 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9.5px] font-black text-[#0b5cad] bg-white px-2 py-0.5 rounded-full border border-[#b9dbff]">
                              Unit {selectedUnitId || nextUnitId}
                            </span>
                            <span className="text-[10px] text-[#0b5cad] font-black">ĐANG TẠO MỚI</span>
                          </div>
                          <h4 className="text-[13.5px] font-black text-[#10213f] mt-1.5 truncate">
                            {unitTitle.trim() || "Bài học mới"}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate italic font-bold">
                            {unitVietnameseTitle.trim() || "Nhập thông tin ở khung bên phải rồi bấm Lưu"}
                          </p>
                        </div>
                      )}
                      {allUnits.map((u) => {
                        const isSelected = selectedUnitId === u.id && unitMode === "edit";
                        return (
                          <div 
                            key={u.id}
                            onClick={() => { setSelectedUnitId(u.id); setUnitMode("edit"); setUnitDetailOpen(true); setEditingMaterial(null); }}
                            className={`p-3.5 rounded-[22px] border transition-all cursor-pointer text-left ${
                              isSelected 
                                ? "bg-[#eaf4ff] border-[#0b5cad] shadow-sm" 
                                : "bg-white border-[#e8edf5] hover:border-[#0b5cad]/30"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9.5px] font-black text-[#0b5cad] bg-[#fff8ef] px-2 py-0.5 rounded-full border border-[rgba(255,138,0,0.18)]">
                                {u.un}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold font-mono">ID: {u.id}</span>
                            </div>
                            <h4 className="text-[13.5px] font-black text-[#10213f] mt-1.5 truncate">
                              {u.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate italic font-bold">
                              {u.vietnameseTitle}
                            </p>
                            
                            {/* Counter badges */}
                            <div className="flex gap-2.5 items-center mt-3 select-none text-[10px] font-bold text-slate-400">
                              <span>📚 {u.vocabulary?.length || 0} từ</span>
                              <span>•</span>
                              <span>💡 {u.grammar?.length || 0} ngữ pháp</span>
                              <span>•</span>
                              <span>📝 {u.exercises?.length || 0} bài tập</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2.2 THE RIGHT PANEL OR "CỬA SỔ QUẢN LÝ" */}
                <div className="manage-box" id="admin-unit-editor">
                  {createUnitPreview && (
                    <div className="mb-4 rounded-2xl border border-[#0b5cad]/25 bg-[#eaf4ff] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wide text-[#0b5cad]">Đang tạo bài học mới</p>
                        <h2 className="text-lg font-black text-[#10213f]">Unit {selectedUnitId || nextUnitId}</h2>
                        <p className="text-xs text-slate-600 font-bold mt-1">Điền tên bài học, tiêu đề tiếng Việt, mô tả rồi bấm “Lưu bài học mới”. Sau đó bạn có thể thêm từ vựng, ngữ pháp, bài tập và lý thuyết cho Unit này.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setUnitMode("edit"); setSelectedUnitId(allUnits[0]?.id || 1); }}
                        className="px-4 py-2 rounded-xl bg-white text-slate-600 font-black text-xs border border-slate-200 hover:bg-slate-50"
                      >
                        Hủy tạo
                      </button>
                    </div>
                  )}
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-lg font-black text-[#10213f] tracking-tight">Cửa sổ quản lý học liệu</h2>
                    <p className="text-xs text-slate-450 leading-relaxed font-bold mt-1">
                      Admin trực tiếp soạn thảo thêm nội dung từ vựng flashcard, ngữ pháp chuẩn, dạng câu gợi ý bài tập và tệp đính kèm lý thuyết. Dữ liệu sẽ đồng hóa lập tức đến giao diện học viên!
                    </p>
                  </div>

                  {/* Sub-Form Tab selectors inside Cửa sổ quản lý */}
                  <div className="manage-tabs select-none">
                    {(["unit", "vocab", "grammar", "exercises", "theory"] as const).map((tab) => {
                      const labels = {
                        unit: "Thông tin bài học",
                        vocab: "Flashcard từ vựng",
                        grammar: "Ngữ pháp",
                        exercises: "Câu hỏi bài tập",
                        theory: "Lý thuyết"
                      };
                      return (
                        <button
                          key={tab}
                          onClick={() => setMaterialsTab(tab)}
                          className={`manage-tab font-[800] text-xs px-4 py-2 rounded-full transition-all cursor-pointer ${
                            materialsTab === tab 
                              ? "bg-[#0b5cad] text-white shadow-sm" 
                              : "bg-[#f3f6fb] text-slate-650 hover:bg-slate-200"
                          }`}
                        >
                          {labels[tab]}
                        </button>
                      );
                    })}
                  </div>

                  {/* FORM BODY FOR MANUAL ADDING */}
                  <form onSubmit={handleSaveMaterialSubmit} className="form-grid">
                    
                    <div className="form-row">
                      <label>Chỉ định bài học</label>
                      <select 
                        value={selectedUnitId}
                        onChange={(e) => { setSelectedUnitId(Number(e.target.value)); setUnitMode("edit"); }}
                        className="p-2.5 font-bold text-xs bg-slate-50 rounded-xl"
                      >
                        {createUnitPreview && (
                          <option value={selectedUnitId}>Unit {selectedUnitId || nextUnitId} — Bài học mới chưa lưu</option>
                        )}
                        {allUnits.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.un} — {u.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {materialsTab === "unit" && (
                      <>
                        <div className="form-row full">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div>
                              <label>{unitMode === "create" ? `Tạo bài học / Unit mới: Unit ${selectedUnitId || nextUnitId}` : "Chỉnh sửa thông tin bài học"}</label>
                              <p className="text-[11px] text-slate-400 font-bold mt-1">Bài học mới sẽ xuất hiện trong dashboard học sinh sau khi lưu.</p>
                            </div>
                            {unitMode === "edit" && selectedUnit && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUnit(selectedUnit.id)}
                                className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 font-black text-xs hover:bg-rose-100 border-0 flex items-center gap-1.5"
                              >
                                <Trash2 className="h-4 w-4" /> Xóa bài học
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="form-row">
                          <label>Tên bài học tiếng Anh</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Environment Protection"
                            value={unitTitle}
                            onChange={(e) => setUnitTitle(e.target.value)}
                          />
                        </div>

                        <div className="form-row">
                          <label>Tiêu đề tiếng Việt</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Bảo vệ môi trường"
                            value={unitVietnameseTitle}
                            onChange={(e) => setUnitVietnameseTitle(e.target.value)}
                          />
                        </div>

                        <div className="form-row full">
                          <label>Mô tả / mục tiêu bài học</label>
                          <textarea
                            placeholder="Nhập tóm tắt nội dung, kỹ năng và mục tiêu học tập của Unit này..."
                            value={unitOverview}
                            onChange={(e) => setUnitOverview(e.target.value)}
                          />
                        </div>

                        <div className="form-row full grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <div className="h-36 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                            {unitCoverImageUrl ? (
                              <img src={unitCoverImageUrl} className="w-full h-full object-cover" alt="Ảnh bìa bài học" />
                            ) : (
                              <BookOpen className="h-10 w-10 text-[#0b5cad]" />
                            )}
                          </div>
                          <div>
                            <label>Ảnh bìa bài học</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                              className="mb-2"
                            />
                            <input
                              type="text"
                              placeholder="Hoặc dán link ảnh bìa bài học"
                              value={unitCoverImageUrl.startsWith("data:") ? "" : unitCoverImageUrl}
                              onChange={(e) => setUnitCoverImageUrl(e.target.value)}
                            />
                            <p className="text-[11px] text-slate-400 font-bold mt-2">Có thể upload ảnh trực tiếp hoặc dùng link ảnh công khai.</p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* DYNAMIC FIELD RENDER DEP ON SUBTAB */}
                    {materialsTab === "vocab" && (
                      <>
                        <div className="form-row">
                          <label>Tên từ vựng Tiếng Anh</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: artisan, handicraft, community"
                            value={vocabWord}
                            onChange={(e) => setVocabWord(e.target.value)}
                          />
                        </div>

                        <div className="form-row">
                          <label>Từ ký phát âm IPA (Phonetic)</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: /ˌɑːtɪˈzæn/"
                            value={vocabPhonetic}
                            onChange={(e) => setVocabPhonetic(e.target.value)}
                          />
                        </div>

                        <div className="form-row full">
                          <label>Nghĩa tiếng Việt giải thích</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: thợ thủ công lành nghề"
                            value={vocabMeaning}
                            onChange={(e) => setVocabMeaning(e.target.value)}
                          />
                        </div>

                        <div className="form-row full">
                          <label>Mẫu câu ví dụ (Example sentence)</label>
                          <textarea 
                            placeholder="Ví dụ: The skilled artisan spent months carving this elegant marble statue."
                            value={vocabExample}
                            onChange={(e) => setVocabExample(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {materialsTab === "grammar" && (
                      <>
                        <div className="form-row">
                          <label>Tên chuyên mục chuyên đề Ngữ pháp</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: Phrasal Verbs, Comparison of Adjectives"
                            value={grammarTitle}
                            onChange={(e) => setGrammarTitle(e.target.value)}
                          />
                        </div>

                        <div className="form-row full">
                          <label>Bản chất cấu trúc vế lý thuyết</label>
                          <textarea 
                            placeholder="Ví dụ: Cụm động từ gồm động từ + giới từ/trạng từ. Cần chú trọng các kết cấu đặc trưng..."
                            value={grammarExplanation}
                            onChange={(e) => setGrammarExplanation(e.target.value)}
                          />
                        </div>

                        <div className="form-row full">
                          <label>Các câu ví dụ liên kết (Gõ mỗi câu một dòng)</label>
                          <textarea 
                            placeholder="Ví dụ: We must look up the new words carefully.&#10;She decided to turn down the offer."
                            value={grammarExamplesText}
                            onChange={(e) => setGrammarExamplesText(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {materialsTab === "exercises" && (
                      <>
                        <div className="form-row">
                          <label>Loại câu đặt hỏi</label>
                          <select
                            value={exerciseType}
                            onChange={(e) => setExerciseType(e.target.value as any)}
                          >
                            <option value="single-choice">Trắc nghiệm chọn một đáp án (single-choice)</option>
                            <option value="reorder">Sắp xếp chuỗi từ (reorder)</option>
                            <option value="rewrite">Viết lại câu tương ứng (rewrite)</option>
                          </select>
                        </div>

                        <div className="form-row full">
                          <label>Câu hỏi / Đề mục kiểm tra</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: What _______ we do helper community last Sunday?"
                            value={exerciseQuestion}
                            onChange={(e) => setExerciseQuestion(e.target.value)}
                          />
                        </div>

                        {exerciseType === "single-choice" && (
                          <div className="form-row full grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                            <div>
                              <label className="text-[11px] mb-1">Phương án A</label>
                              <input 
                                type="text" 
                                placeholder="A. do" 
                                value={exerciseOptionA}
                                onChange={(e) => setExerciseOptionA(e.target.value)}
                                className="p-2 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] mb-1">Phương án B</label>
                              <input 
                                type="text" 
                                placeholder="B. did" 
                                value={exerciseOptionB}
                                onChange={(e) => setExerciseOptionB(e.target.value)}
                                className="p-2 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] mb-1">Phương án C</label>
                              <input 
                                type="text" 
                                placeholder="C. have done" 
                                value={exerciseOptionC}
                                onChange={(e) => setExerciseOptionC(e.target.value)}
                                className="p-2 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] mb-1">Phương án D</label>
                              <input 
                                type="text" 
                                placeholder="D. will do" 
                                value={exerciseOptionD}
                                onChange={(e) => setExerciseOptionD(e.target.value)}
                                className="p-2 text-xs"
                              />
                            </div>
                          </div>
                        )}

                        <div className="form-row">
                          <label>Đáp án chính xác xác thực</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: B. did (hoặc câu hoàn hảo)"
                            value={exerciseCorrect}
                            onChange={(e) => setExerciseCorrect(e.target.value)}
                          />
                        </div>

                        <div className="form-row full">
                          <label>Giải nghĩa cụ thể lỗi bẫy phòng thi</label>
                          <textarea 
                            placeholder="Ví dụ: Từ nhận dạng 'last Sunday' thuộc thì quá khứ đơn, nên mượn trợ động từ did."
                            value={exerciseExplanationText}
                            onChange={(e) => setExerciseExplanationText(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {materialsTab === "theory" && (
                      <div className="form-row full space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-slate-755 mb-1">File PDF tóm tắt lý thuyết</label>
                            <input 
                              type="text" 
                              placeholder="Ví dụ: Ly-Thuyet-Từ-Vựng-Bồi-Dưỡng.pdf"
                              value={theoryPdfName}
                              onChange={(e) => setTheoryPdfName(e.target.value)}
                            />
                            <input 
                              type="text" 
                              placeholder="Dán link lưu trữ File PDF (hoặc bỏ trống)"
                              className="mt-1.5 text-xs p-2 bg-slate-50"
                              value={theoryPdfUrl}
                              onChange={(e) => setTheoryPdfUrl(e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-black text-slate-755 mb-1">Tài liệu Slide bài giảng (PPT/PDF)</label>
                            <input 
                              type="text" 
                              placeholder="Ví dụ: Slide-Bo-Tro-Kien-Thuc.pptx"
                              value={theorySlideName}
                              onChange={(e) => setTheorySlideName(e.target.value)}
                            />
                            <input 
                              type="text" 
                              placeholder="Dán link lưu trữ Slide (hoặc bỏ trống)"
                              className="mt-1.5 text-xs p-2 bg-slate-50"
                              value={theorySlideUrl}
                              onChange={(e) => setTheorySlideUrl(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="bg-[#f7fbff] border border-[#d7e5f4] rounded-2xl p-4">
                          <label className="block text-[11px] font-black text-slate-755 mb-2">Video YouTube bài giảng cho học sinh</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Tiêu đề video: Ví dụ Unit 1 - Local Community"
                              value={theoryVideoTitle}
                              onChange={(e) => setTheoryVideoTitle(e.target.value)}
                            />
                            <input
                              type="url"
                              placeholder="Dán link YouTube: https://www.youtube.com/watch?v=..."
                              value={theoryVideoUrl}
                              onChange={(e) => setTheoryVideoUrl(e.target.value)}
                            />
                          </div>
                          <p className="text-[11px] text-slate-400 font-bold mt-2">Link này sẽ đồng bộ sang phần video bài học trong dashboard học sinh.</p>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="form-row full pt-3 border-t border-slate-100 flex justify-end">
                      <button 
                        type="submit" 
                        className="btn btn-primary bg-[#0b5cad] hover:bg-[#0b3a6f] text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer border-0"
                      >
                        {materialsTab === "unit" && unitMode === "create" ? "⚡ Lưu bài học mới" : materialsTab === "unit" ? "⚡ Lưu thông tin bài học" : "⚡ Lưu học liệu mới sang hệ thống"}
                      </button>
                    </div>

                  </form>

                  {selectedUnit && unitMode === "edit" && (
                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => setUnitDetailOpen(!unitDetailOpen)}
                        className="w-full flex items-center justify-between rounded-2xl bg-[#f7fbff] border border-[#d7e5f4] p-4 text-left text-[#0b1f3a] font-black hover:bg-[#eaf4ff] transition-colors"
                      >
                        <span>Chi tiết học liệu của {selectedUnit.un}: {selectedUnit.title}</span>
                        <span>{unitDetailOpen ? "Ẩn" : "Xem"}</span>
                      </button>

                      {unitDetailOpen && (
                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-slate-100 bg-white p-4">
                            <h4 className="font-black text-[#0b3a6f] text-sm mb-3">Từ vựng ({selectedUnit.vocabulary?.length || 0})</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                              {(selectedUnit.vocabulary || []).map((item, index) => (
                                <div key={`${item.word}-${index}`} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between gap-3">
                                  <div className="min-w-0">
                                    <b className="text-xs text-slate-800">{item.word}</b>
                                    <p className="text-[11px] text-slate-500 truncate">{item.meaning}</p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button type="button" onClick={() => handleEditMaterialItem("vocab", index)} className="p-2 rounded-lg bg-sky-50 text-[#0b5cad] border-0"><Edit3 className="h-3.5 w-3.5" /></button>
                                    <button type="button" onClick={() => handleDeleteMaterialItem("vocab", index)} className="p-2 rounded-lg bg-rose-50 text-rose-600 border-0"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                </div>
                              ))}
                              {(!selectedUnit.vocabulary || selectedUnit.vocabulary.length === 0) && <p className="text-xs text-slate-400 font-bold">Chưa có từ vựng.</p>}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-100 bg-white p-4">
                            <h4 className="font-black text-[#0b3a6f] text-sm mb-3">Ngữ pháp ({selectedUnit.grammar?.length || 0})</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                              {(selectedUnit.grammar || []).map((item, index) => (
                                <div key={`${item.title}-${index}`} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between gap-3">
                                  <div className="min-w-0">
                                    <b className="text-xs text-slate-800">{item.title}</b>
                                    <p className="text-[11px] text-slate-500 truncate">{item.content}</p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button type="button" onClick={() => handleEditMaterialItem("grammar", index)} className="p-2 rounded-lg bg-sky-50 text-[#0b5cad] border-0"><Edit3 className="h-3.5 w-3.5" /></button>
                                    <button type="button" onClick={() => handleDeleteMaterialItem("grammar", index)} className="p-2 rounded-lg bg-rose-50 text-rose-600 border-0"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                </div>
                              ))}
                              {(!selectedUnit.grammar || selectedUnit.grammar.length === 0) && <p className="text-xs text-slate-400 font-bold">Chưa có ngữ pháp.</p>}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-100 bg-white p-4">
                            <h4 className="font-black text-[#0b3a6f] text-sm mb-3">Bài tập ({selectedUnit.exercises?.length || 0})</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                              {(selectedUnit.exercises || []).map((item, index) => (
                                <div key={`${item.id}-${index}`} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between gap-3">
                                  <div className="min-w-0">
                                    <b className="text-xs text-slate-800 line-clamp-1">{item.question}</b>
                                    <p className="text-[11px] text-slate-500 truncate">Đáp án: {item.correctValue}</p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button type="button" onClick={() => handleEditMaterialItem("exercises", index)} className="p-2 rounded-lg bg-sky-50 text-[#0b5cad] border-0"><Edit3 className="h-3.5 w-3.5" /></button>
                                    <button type="button" onClick={() => handleDeleteMaterialItem("exercises", index)} className="p-2 rounded-lg bg-rose-50 text-rose-600 border-0"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                </div>
                              ))}
                              {(!selectedUnit.exercises || selectedUnit.exercises.length === 0) && <p className="text-xs text-slate-400 font-bold">Chưa có bài tập.</p>}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-100 bg-white p-4">
                            <h4 className="font-black text-[#0b3a6f] text-sm mb-3">Lý thuyết / Video</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                              {(((selectedUnit as any).theoryVideos || []) as any[]).map((item, index) => (
                                <div key={`video-${index}`} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between gap-3">
                                  <div className="min-w-0">
                                    <b className="text-xs text-slate-800">YouTube: {item.title}</b>
                                    <p className="text-[11px] text-slate-500 truncate">{item.url}</p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button type="button" onClick={() => handleEditMaterialItem("theory", index, "videos")} className="p-2 rounded-lg bg-sky-50 text-[#0b5cad] border-0"><Edit3 className="h-3.5 w-3.5" /></button>
                                    <button type="button" onClick={() => handleDeleteMaterialItem("theory", index, "videos")} className="p-2 rounded-lg bg-rose-50 text-rose-600 border-0"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                </div>
                              ))}
                              {(((selectedUnit as any).theoryPdfs || []) as any[]).map((item, index) => (
                                <div key={`pdf-${index}`} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between gap-3">
                                  <div className="min-w-0">
                                    <b className="text-xs text-slate-800">PDF: {item.name}</b>
                                    <p className="text-[11px] text-slate-500 truncate">{item.url}</p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button type="button" onClick={() => handleEditMaterialItem("theory", index, "pdfs")} className="p-2 rounded-lg bg-sky-50 text-[#0b5cad] border-0"><Edit3 className="h-3.5 w-3.5" /></button>
                                    <button type="button" onClick={() => handleDeleteMaterialItem("theory", index, "pdfs")} className="p-2 rounded-lg bg-rose-50 text-rose-600 border-0"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                </div>
                              ))}
                              {(((selectedUnit as any).theorySlides || []) as any[]).map((item, index) => (
                                <div key={`slide-${index}`} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between gap-3">
                                  <div className="min-w-0">
                                    <b className="text-xs text-slate-800">Slide: {item.name}</b>
                                    <p className="text-[11px] text-slate-500 truncate">{item.url}</p>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button type="button" onClick={() => handleEditMaterialItem("theory", index, "slides")} className="p-2 rounded-lg bg-sky-50 text-[#0b5cad] border-0"><Edit3 className="h-3.5 w-3.5" /></button>
                                    <button type="button" onClick={() => handleDeleteMaterialItem("theory", index, "slides")} className="p-2 rounded-lg bg-rose-50 text-rose-600 border-0"><Trash2 className="h-3.5 w-3.5" /></button>
                                  </div>
                                </div>
                              ))}
                              {!(((selectedUnit as any).theoryVideos || []).length || ((selectedUnit as any).theoryPdfs || []).length || ((selectedUnit as any).theorySlides || []).length) && <p className="text-xs text-slate-400 font-bold">Chưa có tài liệu lý thuyết/video.</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* PANEL C: EXAM BANK (NGÂN HÀNG ĐỀ THI) */}
          {/* ========================================== */}
          {activePanel === "exams" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="exam-layout">
                
                {/* PDF/Word AI input panel */}
                <div className="upload-zone text-white">
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
                    <Brain className="h-6 w-6 text-[#bfe3ff] animate-pulse" /> Kiến tạo đề thi bằng Trí tuệ AI
                  </h2>
                  <p className="text-xs text-slate-200 font-bold leading-relaxed mt-1">
                    Quý Admin vui lòng dán biểu mẫu văn bản thô hoặc tải tài liệu gốc PDF/Word lên. Trí tuệ nhân tạo VocaFox AI sẽ tự động phân tách cấu trúc ngữ pháp trắc nghiệm, đánh dấu điểm và lập bảng đáp án lời giải tức thì.
                  </p>

                  {/* Drag drop area */}
                  <div className="upload-box relative border border-dashed border-white/30 bg-white/5 rounded-2xl p-6 text-center select-none mt-4">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                      onChange={handleUploadExamBtn}
                    />
                    <Upload className="h-10 w-10 text-sky-200 mx-auto mb-2.5" />
                    <b className="text-sm block text-white font-extrabold">Kéo thả file tài liệu vào đây</b>
                    <p className="text-[11px] text-slate-300 mt-1">Chấp nhận PDF, DOC/DOCX, TXT hoặc ảnh scan rõ nét.</p>
                    <button className="btn btn-primary py-1.5 px-4 text-xs mt-3 bg-white text-[#0b3a6f] hover:bg-slate-100 border-0">
                      Chọn file tài liệu
                    </button>
                    
                    {examFile && (
                      <p className="text-[11px] text-sky-200 font-bold mt-2">
                        📄 File đã chọn: {examFile.name} ({(examFile.size/1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  {/* Manual Paste fallback option */}
                  <div className="mt-5 space-y-3 pt-4 border-t border-white/10">
                    <label className="text-[11px] font-black uppercase text-sky-200 tracking-wider block">Dán link Google Docs/Word online hoặc văn bản đề thi thô</label>
                    <input
                      type="url"
                      placeholder="Dán link Google Docs/Word/PDF công khai, ví dụ: https://docs.google.com/document/d/..."
                      value={examSourceUrl}
                      onChange={(e) => setExamSourceUrl(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-[#d7e5f4] rounded-xl font-bold text-[#0b1f3a] outline-none focus:border-[#0b5cad]"
                    />
                    <textarea 
                      placeholder="Hoặc dán trực tiếp nội dung đề thi tiếng Anh thô vào đây..."
                      value={pastedExamText}
                      onChange={(e) => setPastedExamText(e.target.value)}
                      rows={4}
                      className="w-full text-xs p-2.5 bg-white border border-[#d7e5f4] rounded-xl font-mono text-[#0b1f3a] outline-none focus:border-[#0b5cad]"
                    />
                    <button 
                      type="button"
                      onClick={handleTextExtractBtn}
                      className="btn btn-orange py-2 px-4 text-xs font-black rounded-lg text-white"
                    >
                      Trích xuất đề bằng AI
                    </button>
                  </div>

                  {/* Customizing fields */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 mt-5">
                    <div className="form-row text-[#0f1b33]">
                      <label style={{ color: "white" }} className="text-white">Đặt tên đề thi mới</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Đề khảo thí tuyển sinh số 05" 
                        value={examTitleInput}
                        onChange={(e) => setExamTitleInput(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="form-row text-[#0f1b33]">
                      <label style={{ color: "white" }} className="text-white">Thời gian (Phút)</label>
                      <input 
                        type="number" 
                        placeholder="Thời gian thi..." 
                        value={examDurationInput}
                        onChange={(e) => setExamDurationInput(Number(e.target.value))}
                        className="bg-white"
                      />
                    </div>
                  </div>

                </div>

                {/* Left previews and list details */}
                <div className="space-y-4">
                  
                  {/* AI process alerts */}
                  {aiAlert && (
                    <div className={`p-4 rounded-2xl text-[12.5px] font-bold border ${
                      aiAlert.type === "success" 
                        ? "bg-sky-50 border-sky-200 text-[#0b3a6f]" 
                        : aiAlert.type === "danger"
                          ? "bg-rose-50 border-rose-200 text-rose-700"
                          : "bg-blue-50 border-blue-200 text-blue-700"
                    }`}>
                      <div className="flex items-center gap-2">
                        {aiAlert.type === "info" && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
                        {aiAlert.type === "success" && <CheckCircle className="h-4 w-4 text-[#0b5cad]" />}
                        <span>{aiAlert.text}</span>
                      </div>
                    </div>
                  )}

                  {/* Loaded AI PDF structure previews */}
                  {previewExam && (
                    <div className="panel bg-gradient-to-r from-teal-50/50 to-indigo-50/30 border-teal-100 p-5 rounded-3xl">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-3.5">
                        <div className="text-left">
                          <span className="text-[10px] font-black tracking-widest text-[#0b5cad] uppercase bg-amber-50 px-2.5 py-0.5 rounded-full border border-[rgba(255,138,0,0.18)]">Cấu trúc AI trích lọc thành công</span>
                          <h4 className="text-sm font-black text-slate-800 mt-1">{previewExam.title} ({previewExam.duration} Phút)</h4>
                        </div>
                        <span className="text-[#0b3a6f] font-extrabold text-[12.5px] bg-sky-100 px-3 py-1 rounded-xl">⚡ AI READY</span>
                      </div>

                      {/* Sections map summaries */}
                      <div className="space-y-3 max-h-[210px] overflow-y-auto pr-1">
                        {previewExam.sections.map((sec, idx) => (
                          <div key={idx} className="bg-white/90 border border-slate-100 p-3 rounded-xl shadow-xs text-xs">
                            <p className="font-extrabold text-slate-800">{sec.title}</p>
                            <p className="text-[10.5px] text-slate-400 font-bold italic mt-0.5">{sec.instruction}</p>
                            
                            <div className="space-y-1.5 mt-2 text-[11px] text-slate-650">
                              {sec.questions.map((q, qidx) => (
                                <p key={qidx} className="truncate">
                                  <b>Câu {qidx + 1}:</b> {q.question} 
                                  <span className="text-[#0b5cad] font-bold"> (ĐÁ: {q.correctValue})</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-4 flex gap-2">
                        <button 
                          onClick={handlePublishExamClick}
                          className="btn btn-orange w-full py-3 text-[13.5px]"
                        >
                          🔥 Đăng tải đề thi để học sinh làm bài
                        </button>
                        <button 
                          onClick={() => setPreviewExam(null)}
                          className="btn btn-secondary py-3 px-4 text-[13.5px] hover:bg-slate-200"
                        >
                          Hủy
                        </button>
                      </div>

                    </div>
                  )}

                  {/* System exam state summaries - moved out of the compressed column */}
                </div>

              </div>

              {/* OUTSIDE GRID - EXTREMELY PROMINENT FULL WIDTH ACTIVE EXAMS LIST */}
              <div className="panel bg-white shadow-md border border-slate-200 p-6 rounded-3xl mt-6">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
                    Danh sách các Đề ôn luyện thi lớp 10 đã phát hành ({examsList.length} đề thi)
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Đây là danh sách tất cả các đề ôn thi bám sát cấu trúc vào 10 mà học sinh có thể tiếp cận ôn luyện trực tuyến. Thầy/Cô có thể nhấn "Xóa đề thi" để gỡ bỏ hoàn toàn khỏi ứng dụng.</p>
                </div>

                {examsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có đề ôn thi nào được phát hành. Hãy dán đề hoặc tải File mẫu ở trên để đăng bài mới nhé!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {examsList.map((ex) => (
                      <div 
                        key={ex.id} 
                        className="p-5 rounded-3xl bg-slate-50 border border-slate-150 flex flex-col justify-between hover:border-[#0b5cad]/30 transition-all shadow-sm"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black tracking-widest text-[#0b5cad] uppercase bg-amber-50 px-2.5 py-1 rounded-lg border border-[rgba(255,138,0,0.18)]">
                              MÃ SỐ: {ex.id.slice(-6).toUpperCase()}
                            </span>
                            <span className="text-[9px] font-extrabold px-2 py-0.5 bg-sky-100 text-[#0b3a6f] rounded-md">LIVE ACTIVE</span>
                          </div>
                          <h4 className="text-slate-800 text-sm font-black leading-snug line-clamp-2">
                            {ex.title}
                          </h4>
                          <small className="text-[11px] text-[#64748b] font-bold block mt-1.5">
                            ⏳ {ex.duration} phút làm bài • Chấm thi tự động
                          </small>
                        </div>
                        
                        <div className="flex justify-end border-t border-slate-150 pt-3 mt-4">
                          <button 
                            type="button"
                            onClick={() => handleDeleteDbExam(ex.id)}
                            className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-black text-xs transition-colors flex items-center justify-center gap-1.5 border-0 cursor-pointer"
                            title="Yêu cầu xóa và gỡ bỏ đề ôn"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Xóa đề thi vĩnh viễn</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* PANEL D: MANAGEMENT & ANALYTICS (QUẢN TRỊ NGƯỜI DÙNG) */}
          {/* ========================================== */}
          {activePanel === "users" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Top traffic details widget stats */}
              {(() => {
                const studentUsers = usersList.filter(u => u.role === "student");
                const totalVocabUnitsCompleted = usersList.reduce((sum, u) => sum + (u.activityCount?.lessons || 0), 0);
                const totalExamAttempts = usersList.reduce((sum, u) => sum + (u.activityCount?.exams || 0), 0);
                const totalAccessHours = usersList.reduce((sum, u) => sum + (u.usageHours || 0), 0).toFixed(1);

                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="stat-card">
                      <small>Tổng cộng sĩ tử đăng ký</small>
                      <b className="text-[#0b5cad] text-3xl font-black">{studentUsers.length}</b>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">Lớp 9 ôn thi bám sát Bộ GD</p>
                    </div>

                    <div className="stat-card flex flex-col justify-between">
                      <small>Lượt xem học liệu SGK</small>
                      <b className="text-[#0b5cad] text-3xl font-black">{totalVocabUnitsCompleted} lượt học</b>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">Phổ cập đầy đủ từ vựng ôn tập</p>
                    </div>

                    <div className="stat-card font-sans flex flex-col justify-between">
                      <small>Lượt ôn luyện kiểm tra thử</small>
                      <b className="text-[#0b3a6f] text-3xl font-black">{totalExamAttempts} lượt làm</b>
                      <p className="text-[11px] text-[#0b3a6f] font-bold mt-1">Chấm điểm tự động bởi AI</p>
                    </div>

                    <div className="stat-card flex flex-col justify-between">
                      <small>Tổng thời lượng truy cập tuần</small>
                      <b className="text-slate-800 text-3xl font-black">{totalAccessHours} giờ</b>
                      <p className="text-[11px] text-[#0b5cad] font-extrabold mt-1">⚡ Tương tác trung bình cao</p>
                    </div>
                  </div>
                );
              })()}

              {/* Grid split */}
              <div className="users-layout select-none font-sans">
                
                {/* Users List Table block */}
                <div className="table-card select-none">
                  <div className="flex justify-between items-center mb-4 text-left flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none">Kiểm soát người dùng VocaFox</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Click vào tên thành viên xem biểu đồ thời lượng và học lực chi tiết hằng ngày!</p>
                    </div>

                    <div className="relative shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search className="h-3.5 w-3.5" />
                      </span>
                      <input 
                        type="text" 
                        placeholder="Tìm thành viên..."
                        className="p-1 px-3 pl-8 text-xs bg-slate-100 rounded-lg border-0 outline-none w-36 font-bold"
                        value={searchUserQuery}
                        onChange={(e) => setSearchUserQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="user-table text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-2">Họ & tên Học viên</th>
                          <th className="pb-2">Trường / Vai trò</th>
                          <th className="pb-2">Truy cập</th>
                          <th className="pb-2">Lượt ôn luyện</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const isSelected = selectedUserForChart === u.name;
                          return (
                            <tr 
                              key={u.id}
                              className={`border-b border-slate-50 hover:bg-[#fffcf7] transition-all cursor-pointer ${
                                isSelected ? "bg-[#fffafa]" : ""
                              }`}
                              onClick={() => setSelectedUserForChart(u.name)}
                            >
                              <td className="py-2.5 font-extrabold text-[#0b5cad] cursor-pointer hover:underline">
                                {u.name}
                              </td>
                              <td className="py-2.5">
                                <span className={`role-pill ${
                                  u.role === "admin" 
                                    ? "bg-rose-50 text-rose-700" 
                                    : u.role === "parent"
                                      ? "bg-indigo-50 text-indigo-700"
                                      : "bg-[#eaf4ff] text-[#0b3a6f]"
                                }`}>
                                  {u.role === "student" ? "Học sinh" : u.role === "parent" ? "Phụ huynh" : "Admin"}
                                </span>
                              </td>
                              <td className="py-2.5 font-bold text-slate-650">
                                {u.usageHours} giờ/tuần
                              </td>
                              <td className="py-2.5 text-slate-450 font-bold font-mono">
                                {u.activityCount?.lessons || 0} bài • {u.activityCount?.exams || 0} đề
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Vertical access time chart showing heights dynamically */}
                <div className="analytics-card text-left">
                  <span className="text-[10px] font-black uppercase text-sky-200 tracking-wider">Chi tiết Học viên năng động</span>
                  <h3 className="chart-title text-[#10213f] font-[900] truncate mt-1">{selectedUserForChart}</h3>
                  <div className="chart-subtitle text-xs text-slate-400 font-bold mb-4">Biểu đồ thời gian truy cập trong tuần vừa qua (phút)</div>

                  {/* Verticals */}
                  <div className="week-chart p-4 rounded-xl border border-slate-50 bg-[#f9fcfa] flex items-end justify-between select-none">
                    {activeChart.weekdayMinutes.map((minutes, index) => {
                      const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
                      // Calculate scale pct to bounds (max 200px equivalent height)
                      const barHeight = Math.min(minutes, 200);
                      return (
                        <div key={index} className="bar-col flex flex-col items-center gap-1.5 flex-1 group">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white font-mono text-[9px] px-1 rounded absolute -translate-y-6">
                            {minutes}m
                          </span>
                          <div 
                            className="bar-fill w-6 rounded-t-lg bg-gradient-to-t from-emerald-800 via-emerald-500 to-emerald-300 hover:opacity-85 transition-all shadow-sm cursor-pointer"
                            style={{ height: `${barHeight}px` }} 
                          />
                          <span className="text-[10px] font-black text-slate-500">{weekdays[index]}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary grid detail on selection */}
                  <div className="analytics-grid grid grid-cols-2 gap-3 mt-4">
                    <div className="mini-analytics p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <small className="text-slate-400 font-bold block">Tập trung học liệu</small>
                      <b className="text-slate-800 text-lg font-black block mt-1">{activeChart.lessons} bài học</b>
                    </div>

                    <div className="mini-analytics p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <small className="text-slate-400 font-bold block">Đề thi hoàn thiện</small>
                      <b className="text-[#0b5cad] text-lg font-black block mt-1">{activeChart.exams} bài làm</b>
                    </div>

                    <div className="mini-analytics p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-left">
                      <small className="text-slate-400 font-bold block">Tổng giờ học tuần</small>
                      <b className="text-[#0b3a6f] text-lg font-black block mt-1">{activeChart.duration}</b>
                    </div>

                    <div className="mini-analytics p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <small className="text-slate-400 font-bold block">Điểm thử trung bình</small>
                      <b className="text-indigo-750 text-lg font-black block mt-1">
                        {activeChart.lastScore > 0 ? `${activeChart.lastScore} / 10` : "Chưa chấm"}
                      </b>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SYSTEM FOOTER */}
          {/* ========================================== */}
          <footer className="footer select-none border-t border-slate-100 mt-12 py-8">
            <div className="footer-grid grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-550">
              <div className="text-left">
                <div className="brand-name text-slate-800 font-black text-base flex">
                  Voca<span className="text-[#0b5cad]">Fox</span> <span className="text-[10px] uppercase font-black tracking-widest text-[#0b5cad] ml-1 leading-normal">System Portal</span>
                </div>
                <p className="text-slate-400 pr-5 mt-2 font-bold leading-relaxed">
                  Bảng tổng thống điều khiển hệ thống, cấu tạo bài kiểm tra thử qua PDF của AI thông minh, hỗ trợ giảng đường tiếng Anh lớp 9 hiệu quả tối đa.
                </p>
              </div>

              <div className="text-left font-sans">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase mb-2">Chức năng quản trị</h4>
                <div className="footer-links flex flex-col gap-1.5 font-bold">
                  <button onClick={() => setActivePanel("home")} className="text-left bg-transparent border-0 outline-none text-slate-500 hover:text-[#0b5cad] cursor-pointer">Trang chủ quản trị viên</button>
                  <button onClick={() => setActivePanel("materials")} className="text-left bg-transparent border-0 outline-none text-slate-500 hover:text-[#0b5cad] cursor-pointer">Cập nhật Unit bồi dưỡng SGK</button>
                  <button onClick={() => setActivePanel("exams")} className="text-left bg-transparent border-0 outline-none text-slate-500 hover:text-[#0b5cad] cursor-pointer">Ngân hàng đề khảo cứu AI</button>
                  <button onClick={() => setActivePanel("users")} className="text-left bg-transparent border-0 outline-none text-slate-500 hover:text-[#0b5cad] cursor-pointer">Thống kê hoạt động sinh viên</button>
                </div>
              </div>

              <div className="text-left select-text">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase mb-2">Liên kết Quản Trị</h4>
                <p className="text-slate-450 font-bold">Email chính thức: <span className="font-extrabold text-slate-800">nbao8887@gmail.com</span></p>
                <p className="text-slate-450 font-bold mt-1.5">Máy chủ dịch vụ: <span className="text-[#0b5cad] font-extrabold select-none">⚡ Hoạt động ổn định (ONLINE)</span></p>
              </div>
            </div>
          </footer>

        </div>
      </main>



    </div>
  );
}