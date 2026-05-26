import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3, BookMarked, BookOpenCheck, CalendarClock, ChevronDown, ClipboardCheck, Copy, Edit3,
  ExternalLink, FileText, FolderOpen, GraduationCap, Link as LinkIcon, Loader2, MessageCircle, LogOut,
  Plus, RefreshCw, School, Search, Send, Sparkles, Trash2, UploadCloud, Users, Video, X
} from "lucide-react";
import { apiFetch } from "../supabase";
import { TextbookUnit, MockExam } from "../types";
import { grade9Units } from "../data/grade9Units";
import { mockExams } from "../data/mockExams";

type WorkspacePage = "classHome" | "classResources" | "onlineTests" | "publicLibrary" | "publicExams";
type ModalName = "class" | "material" | "aiTest" | "quiz" | "onlineTest" | null;
type MaterialType = "PDF" | "Word" | "Slide" | "Video";
type StatusType = "success" | "error" | "info";
type Status = { type: StatusType; text: string } | null;

type StudentProfile = { id: string; name?: string; email?: string; study_streak?: number; completed_units?: number[]; usage_time_seconds?: number };
type ClassRecord = { id: string; name: string; code: string; meeting_url?: string; created_at?: string; class_members?: Array<{ user_id: string; profiles?: StudentProfile }>; student_count?: number };
type ClassMessage = { id: number | string; class_id: string; user_id: string; message_text: string; created_at: string; profiles?: { name?: string; role?: string } };
type TeacherMaterial = { id: string; title: string; type: MaterialType; grade?: string; description?: string; file_url?: string; web_url?: string; youtube_url?: string; slide_pdf_url?: string; cover_image_url?: string; created_at?: string; class_id?: string; metadata?: any };
type TeacherExam = { id: string; title: string; duration_minutes?: number; question_count?: number; source_pdf_url?: string; status?: string; content?: any; created_at?: string };
type TeacherQuiz = { id: string; title: string; source_type?: string; question_count?: number; content?: any; created_at?: string };
type OnlineTest = { id: string; title: string; class_id: string; exam_id?: string; open_at: string; close_at: string; duration_minutes: number; classes?: { name?: string } };
type Props = { currentUser?: { uid?: string; id?: string; name?: string; email?: string; role?: string } | null; setActiveTab?: (tab: any) => void; handleLogout?: () => void };

const defaultExamJson = { title: "Bài kiểm tra mới", durationMinutes: 45, questions: [{ id: "q1", question: "Choose the best answer.", type: "single-choice", options: ["A", "B", "C", "D"], correctAnswer: "A", explanation: "Đáp án A phù hợp nhất.", score: 1 }] };
const materialFilters: Array<"Tất cả" | MaterialType> = ["Tất cả", "PDF", "Word", "Slide", "Video"];

function makeLocalId(prefix: string) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
function makeClassCode() { return "VF" + Math.random().toString(36).slice(2, 8).toUpperCase(); }
function fmtDate(value?: string) { if (!value) return "—"; try { return new Date(value).toLocaleString("vi-VN"); } catch { return value; } }
function questionCount(exam: any) {
  if (typeof exam?.question_count === "number") return exam.question_count;
  const sections = exam?.content?.sections || exam?.sections || [];
  return sections.reduce((n: number, s: any) => n + (s.questions?.length || 0), 0) || exam?.content?.questions?.length || exam?.questions?.length || 0;
}
function appLink(path: string) { return `${window.location.origin}${path}`; }
function unitToMaterial(unit: TextbookUnit): TeacherMaterial { return { id: String(unit.id), title: unit.title, type: "PDF", grade: "Lớp 9", description: `${unit.overview || unit.vietnameseTitle || "Bài học SGK"} · ${unit.vocabulary?.length || 0} từ vựng · ${unit.grammar?.length || 0} điểm ngữ pháp` }; }
function examToTeacherExam(exam: MockExam): TeacherExam { return { id: exam.id, title: exam.title, duration_minutes: exam.duration, question_count: questionCount(exam), content: exam, status: "Kho đề chung" }; }
function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}


const demoExamUnitCommunity = {
  id: "demo_unit1_local_community",
  title: "Đề mẫu Unit 1 - Local Community",
  durationMinutes: 20,
  duration: 20,
  questions: [
    { id: "q1", type: "single-choice", question: "Choose the word whose underlined part is pronounced differently: community, custom, museum, culture.", options: ["A. community", "B. custom", "C. museum", "D. culture"], correctAnswer: "C. museum", correctValue: "C. museum", explanation: "Trong 'museum', chữ u thường phát âm /juː/, khác với âm /ʌ/ ở custom/culture và âm gần /ə/ trong community tùy vị trí. Khi làm dạng phát âm, hãy đọc âm chính của phần được hỏi thay vì nhìn mặt chữ.", score: 1 },
    { id: "q2", type: "single-choice", question: "Our neighbourhood is famous ___ its traditional craft village.", options: ["A. at", "B. for", "C. with", "D. about"], correctAnswer: "B. for", correctValue: "B. for", explanation: "Cụm cố định là 'be famous for something' nghĩa là nổi tiếng về điều gì. Vì vậy chọn 'for'.", score: 1 },
    { id: "q3", type: "single-choice", question: "The local people are trying to ___ their old customs.", options: ["A. preserve", "B. destroy", "C. replace", "D. ignore"], correctAnswer: "A. preserve", correctValue: "A. preserve", explanation: "'Preserve' nghĩa là bảo tồn. Câu nói người dân địa phương đang cố gắng bảo tồn phong tục cũ, phù hợp nghĩa nhất.", score: 1 },
    { id: "q4", type: "single-choice", question: "If tourists visit our village, they ___ learn how to make pottery.", options: ["A. can", "B. mustn't", "C. shouldn't", "D. needn't"], correctAnswer: "A. can", correctValue: "A. can", explanation: "Câu diễn tả khả năng/cơ hội khi du khách đến làng, nên dùng 'can'.", score: 1 },
    { id: "q5", type: "single-choice", question: "Choose the best sentence: The craft village / become / more popular / recent years.", options: ["A. The craft village becomes more popular recent years.", "B. The craft village has become more popular in recent years.", "C. The craft village became more popular in recent years.", "D. The craft village is becoming more popular yesterday."], correctAnswer: "B. The craft village has become more popular in recent years.", correctValue: "B. The craft village has become more popular in recent years.", explanation: "Dấu hiệu 'in recent years' thường dùng với thì hiện tại hoàn thành: has/have + V3. Chủ ngữ số ít 'The craft village' dùng 'has become'.", score: 1 }
  ]
};

const demoExamHealthyLiving = {
  id: "demo_unit3_healthy_living",
  title: "Đề mẫu Unit 3 - Healthy Living",
  durationMinutes: 25,
  duration: 25,
  questions: [
    { id: "q1", type: "single-choice", question: "You should eat more vegetables to stay ___.", options: ["A. health", "B. healthy", "C. unhealthy", "D. healthily"], correctAnswer: "B. healthy", correctValue: "B. healthy", explanation: "Sau động từ 'stay' cần tính từ để bổ nghĩa cho chủ ngữ. 'Healthy' là tính từ nghĩa là khỏe mạnh.", score: 1 },
    { id: "q2", type: "single-choice", question: "My brother gave ___ junk food last month.", options: ["A. up", "B. in", "C. out", "D. after"], correctAnswer: "A. up", correctValue: "A. up", explanation: "'Give up' nghĩa là từ bỏ. Câu có nghĩa anh trai tôi đã bỏ đồ ăn vặt tháng trước.", score: 1 },
    { id: "q3", type: "single-choice", question: "We need to drink enough water every day, ___?", options: ["A. do we", "B. don't we", "C. needn't we", "D. aren't we"], correctAnswer: "B. don't we", correctValue: "B. don't we", explanation: "Câu hỏi đuôi với động từ thường ở mệnh đề khẳng định dùng trợ động từ phủ định. 'need to' ở đây là động từ thường nên dùng 'don't we'.", score: 1 },
    { id: "q4", type: "single-choice", question: "Choose the word CLOSEST in meaning to 'balanced diet'.", options: ["A. a diet with only meat", "B. a diet with enough different nutrients", "C. a diet without breakfast", "D. a diet with too much sugar"], correctAnswer: "B. a diet with enough different nutrients", correctValue: "B. a diet with enough different nutrients", explanation: "'Balanced diet' là chế độ ăn cân bằng, có đủ nhóm chất dinh dưỡng khác nhau.", score: 1 },
    { id: "q5", type: "single-choice", question: "Nam exercises regularly. He wants to improve his fitness. Combine the sentences with 'so'.", options: ["A. Nam exercises regularly so he wants to improve his fitness.", "B. Nam wants to improve his fitness, so he exercises regularly.", "C. Nam exercises regularly, so he doesn't improve his fitness.", "D. Nam wants to improve his fitness so regularly he exercises."], correctAnswer: "B. Nam wants to improve his fitness, so he exercises regularly.", correctValue: "B. Nam wants to improve his fitness, so he exercises regularly.", explanation: "'So' nối nguyên nhân - kết quả. Vì Nam muốn cải thiện thể lực nên cậu ấy tập thể dục đều đặn.", score: 1 }
  ]
};

function demoExamContent(base: any) {
  const questions = base.questions;
  return {
    ...base,
    sections: [{ id: "sec_demo", title: "Trắc nghiệm", instruction: "Chọn đáp án đúng nhất.", passage: "", questions }]
  };
}

export default function TeacherTab({ currentUser, handleLogout, setActiveTab }: Props) {
  const teacherId = currentUser?.uid || currentUser?.id || "";
  const [page, setPage] = useState<WorkspacePage>("classHome");
  const [classMenuOpen, setClassMenuOpen] = useState(true);
  const [modal, setModal] = useState<ModalName>(null);
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [materialFilter, setMaterialFilter] = useState<typeof materialFilters[number]>("Tất cả");
  const [search, setSearch] = useState("");

  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [materials, setMaterials] = useState<TeacherMaterial[]>([]);
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [quizzes, setQuizzes] = useState<TeacherQuiz[]>([]);
  const [tests, setTests] = useState<OnlineTest[]>([]);
  const [messages, setMessages] = useState<ClassMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [classForm, setClassForm] = useState({ name: "", meetingUrl: "" });
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState({ title: "", type: "PDF" as MaterialType, grade: "Lớp 9", description: "", fileUrl: "", webUrl: "", youtubeUrl: "", slidePdfUrl: "", coverImageUrl: "", classId: "" });
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [publicUnits, setPublicUnits] = useState<TextbookUnit[]>(grade9Units);
  const [publicExamBank, setPublicExamBank] = useState<MockExam[]>(mockExams);
  const [quizForm, setQuizForm] = useState({ title: "Quiz mới", sourceType: "AI", source: "", questionCount: "10" });
  const [testForm, setTestForm] = useState({ title: "", classId: "", examId: "", openDate: "", openTime: "08:00", closeDate: "", closeTime: "21:00", durationMinutes: "45", shuffleQuestions: true, showScoreAfterSubmit: true, oneAttemptOnly: true });
  const [aiTestForm, setAiTestForm] = useState({ title: "Bài kiểm tra mới", classId: "", source: "", sourceUrl: "", openDate: "", openTime: "08:00", closeDate: "", closeTime: "21:00", durationMinutes: "45", questionCount: "20" });
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiReview, setAiReview] = useState<any | null>(null);

  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId) || classes[0], [classes, selectedClassId]);
  const students = selectedClass?.class_members || [];
  const filteredMaterials = useMemo(() => {
    const q = search.trim().toLowerCase();
    return materials.filter(m => (materialFilter === "Tất cả" || m.type === materialFilter) && (!q || `${m.title} ${m.description}`.toLowerCase().includes(q)));
  }, [materials, materialFilter, search]);
  const totals = useMemo(() => ({
    classes: classes.length,
    students: classes.reduce((sum, c) => sum + (c.class_members?.length || c.student_count || 0), 0),
    resources: materials.length,
    tests: tests.length,
  }), [classes, materials, tests]);

  const notify = (text: string, type: StatusType = "success") => setStatus({ text, type });
  const closeModal = () => { setModal(null); setAiReview(null); setAiFile(null); setMaterialFile(null); setEditingClassId(null); };
  const defaultDateWindow = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const toDate = (d: Date) => d.toISOString().slice(0, 10);
    return { openDate: toDate(now), closeDate: toDate(tomorrow) };
  };
  const openClassModal = (cls?: ClassRecord) => {
    setEditingClassId(cls?.id || null);
    setClassForm({ name: cls?.name || "", meetingUrl: cls?.meeting_url || "" });
    setModal("class");
  };
  const openOnlineTestModal = (exam?: TeacherExam) => {
    const dates = defaultDateWindow();
    setTestForm(p => ({
      ...p,
      title: exam?.title || p.title || "Bài kiểm tra mới",
      classId: selectedClass?.id || p.classId || "",
      examId: exam?.id || p.examId || "",
      openDate: p.openDate || dates.openDate,
      closeDate: p.closeDate || dates.closeDate,
    }));
    setModal("onlineTest");
  };
  const openAiTestModal = () => {
    const dates = defaultDateWindow();
    setAiTestForm(p => ({
      ...p,
      classId: selectedClass?.id || p.classId || "",
      openDate: p.openDate || dates.openDate,
      closeDate: p.closeDate || dates.closeDate,
    }));
    setModal("aiTest");
  };

  const loadMessages = async (classId = selectedClass?.id || "") => {
    if (!classId) return;
    try {
      const res = await apiFetch<any>(`/api/classes/${classId}/messages`);
      setMessages(res.messages || []);
    } catch { /* fallback */ }
  };

  const loadPublicContent = async () => {
    apiFetch<any>("/api/units")
      .then(r => setPublicUnits(r.units?.length ? r.units : grade9Units))
      .catch(() => setPublicUnits(grade9Units));
    apiFetch<any>("/api/exams")
      .then(r => setPublicExamBank(r.exams?.length ? r.exams : mockExams))
      .catch(() => setPublicExamBank(mockExams));
  };

  const loadWorkspace = async () => {
    if (!currentUser) {
      loadPublicContent();
      return;
    }
    setLoading(true);
    setStatus(null);
    loadPublicContent();
    try {
      const res = await apiFetch<any>("/api/teacher/workspace");
      setClasses(res.classes || []);
      setMaterials(res.materials || []);
      setExams((res.exams || []).map((e: any) => ({ ...e, question_count: e.question_count ?? questionCount(e) })));
      setQuizzes(res.quizzes || []);
      setTests(res.onlineTests || []);
      const first = selectedClassId || res.classes?.[0]?.id || "";
      if (first) { setSelectedClassId(first); loadMessages(first); }
    } catch (e: any) {
      setStatus({ type: "info", text: e.message || "Đang dùng dữ liệu mẫu vì chưa kết nối được workspace giáo viên." });
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadWorkspace();
    window.addEventListener("focus", loadPublicContent);
    return () => window.removeEventListener("focus", loadPublicContent);
  }, [currentUser?.email]);
  useEffect(() => { if (selectedClass?.id) loadMessages(selectedClass.id); }, [selectedClass?.id]);

  const copyText = async (text: string, label = "Đã sao chép") => {
    try { await navigator.clipboard.writeText(text); notify(label); } catch { notify(text, "info"); }
  };

  const saveClass = async () => {
    if (!classForm.name.trim()) return notify("Nhập tên lớp trước khi lưu.", "error");
    setLoading(true);
    try {
      if (editingClassId) {
        const res = await apiFetch<any>(`/api/teacher/classes/${editingClassId}`, { method: "PUT", body: JSON.stringify({ name: classForm.name.trim(), meetingUrl: classForm.meetingUrl.trim() }) });
        setClasses(prev => prev.map(c => c.id === editingClassId ? { ...c, ...(res.class || {}), name: classForm.name.trim(), meeting_url: classForm.meetingUrl.trim() } : c));
        notify("Đã cập nhật tên/lịch học online của lớp.");
      } else {
        const res = await apiFetch<any>("/api/teacher/classes-v2", { method: "POST", body: JSON.stringify({ name: classForm.name.trim(), meetingUrl: classForm.meetingUrl.trim() }) });
        setClasses(prev => [res.class, ...prev]);
        setSelectedClassId(res.class.id);
        notify(`Đã tạo lớp. Mã lớp: ${res.class.code}`);
      }
    } catch (e: any) {
      notify(e?.message || "Không lưu được lớp vào Supabase. Vui lòng kiểm tra server.ts và bảng classes/class_members.", "error");
    } finally { setClassForm({ name: "", meetingUrl: "" }); closeModal(); setLoading(false); }
  };

  const deleteClass = async (cls: ClassRecord) => {
    if (!cls?.id || !confirm(`Xóa lớp "${cls.name}"? Tài nguyên, bài kiểm tra, chat và danh sách học sinh trong lớp cũng sẽ bị xóa khỏi lớp.`)) return;
    setLoading(true);
    try {
      await apiFetch(`/api/teacher/classes/${cls.id}`, { method: "DELETE" });
      await loadWorkspace();
      if (selectedClassId === cls.id) setSelectedClassId(classes.find(c => c.id !== cls.id)?.id || "");
      notify("Đã xóa lớp học.");
    } catch (e: any) {
      notify(e?.message || "Không xóa được lớp trên server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const uploadMaterial = async () => {
    if (!materialForm.title.trim()) return notify("Nhập tên tài nguyên.", "error");
    if (["PDF", "Word", "Slide"].includes(materialForm.type) && !materialFile) return notify("Vui lòng upload file cho tài nguyên PDF/Word/Slide.", "error");
    if (!materialForm.classId && !selectedClass?.id) return notify("Chọn lớp để đăng tài nguyên cho học sinh.", "error");
    setLoading(true);
    try {
      const filePayload = materialFile ? {
        fileName: materialFile.name,
        mimeType: materialFile.type || "application/octet-stream",
        fileData: await fileToBase64(materialFile),
      } : {};
      const res = await apiFetch<any>("/api/teacher/materials", { method: "POST", body: JSON.stringify({ ...materialForm, ...filePayload, classId: materialForm.classId || selectedClass?.id || "" }) });
      setMaterials(prev => [res.material, ...prev]);
      notify("Đã upload và lưu tài nguyên lớp học.");
      await loadWorkspace();
    } catch (e: any) {
      notify(e?.message || "Không lưu được tài nguyên lên server, nên học sinh sẽ chưa thấy tài nguyên.", "error");
    } finally { setMaterialForm({ title: "", type: "PDF", grade: "Lớp 9", description: "", fileUrl: "", webUrl: "", youtubeUrl: "", slidePdfUrl: "", coverImageUrl: "", classId: selectedClass?.id || "" }); setMaterialFile(null); closeModal(); setLoading(false); }
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm("Xóa tài nguyên này?")) return;
    try {
      await apiFetch(`/api/teacher/materials/${id}`, { method: "DELETE" });
      await loadWorkspace();
      notify("Đã xóa tài nguyên.");
    } catch (e: any) {
      notify(e?.message || "Không xóa được tài nguyên trên server.", "error");
    }
  };


  const seedDemoDataForClass = async () => {
    if (!selectedClass?.id) return notify("Chọn lớp 9D1 trước khi tạo dữ liệu mẫu.", "error");
    if (!confirm(`Tạo dữ liệu mẫu gồm tài liệu, quiz và 2 bài kiểm tra trắc nghiệm cho lớp "${selectedClass.name}"?`)) return;
    const now = new Date();
    const openAt = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const closeAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    setLoading(true);
    try {
      const demoMaterials = [
        { title: "Tài liệu mẫu - Unit 1 Local Community", type: "PDF" as MaterialType, grade: "Lớp 9", description: "Phiếu tổng hợp từ vựng: community, suburb, facility, preserve, craft village. Học sinh mở trong Tài nguyên lớp học.", fileUrl: "https://example.com/vocafox/unit-1-local-community.pdf" },
        { title: "Slide mẫu - Unit 3 Healthy Living", type: "Slide" as MaterialType, grade: "Lớp 9", description: "Dàn ý bài giảng về healthy habits, balanced diet, give up, stay healthy.", slidePdfUrl: "https://example.com/vocafox/unit-3-healthy-living-slides.pdf" },
        { title: "Video mẫu - Mẹo làm trắc nghiệm tiếng Anh 9", type: "Video" as MaterialType, grade: "Lớp 9", description: "Video hướng dẫn cách loại trừ đáp án và đọc dấu hiệu thì trong đề kiểm tra.", youtubeUrl: "https://www.youtube.com/results?search_query=english+grade+9+test+tips" }
      ];

      const createdMaterials: TeacherMaterial[] = [];
      for (const m of demoMaterials) {
        const res = await apiFetch<any>("/api/teacher/materials", { method: "POST", body: JSON.stringify({ ...m, classId: selectedClass.id }) });
        if (res.material) createdMaterials.push(res.material);
      }

      const examPayloads = [
        { title: "Đề mẫu lớp 9D1 - Unit 1 Local Community", duration: 20, content: demoExamContent(demoExamUnitCommunity) },
        { title: "Đề mẫu lớp 9D1 - Unit 3 Healthy Living", duration: 25, content: demoExamContent(demoExamHealthyLiving) }
      ];
      const createdExams: TeacherExam[] = [];
      const createdTests: OnlineTest[] = [];
      for (const item of examPayloads) {
        const examRes = await apiFetch<any>("/api/teacher/exams", { method: "POST", body: JSON.stringify({ title: item.title, durationMinutes: item.duration, content: item.content }) });
        if (examRes.exam) {
          createdExams.push(examRes.exam);
          const testRes = await apiFetch<any>("/api/teacher/online-tests", { method: "POST", body: JSON.stringify({ title: item.title, classId: selectedClass.id, examId: examRes.exam.id, openAt, closeAt, durationMinutes: item.duration, shuffleQuestions: true, showScoreAfterSubmit: true, oneAttemptOnly: false }) });
          if (testRes.onlineTest) createdTests.push({ ...testRes.onlineTest, classes: { name: selectedClass.name } });
        }
      }

      const quizRes = await apiFetch<any>("/api/teacher/quizzes", { method: "POST", body: JSON.stringify({
        title: "Quiz nhanh mẫu 9D1 - Vocabulary Warm-up",
        sourceType: "Mẫu hệ thống",
        questionCount: 5,
        source: "Local Community, Healthy Living",
        content: { title: "Quiz nhanh mẫu 9D1 - Vocabulary Warm-up", questions: demoExamUnitCommunity.questions.slice(0, 3).concat(demoExamHealthyLiving.questions.slice(0, 2)) }
      }) });

      setMaterials(prev => [...createdMaterials, ...prev]);
      setExams(prev => [...createdExams, ...prev]);
      setTests(prev => [...createdTests, ...prev]);
      if (quizRes.quiz) setQuizzes(prev => [quizRes.quiz, ...prev]);
      notify(`Đã tạo dữ liệu mẫu cho ${selectedClass.name}. Học sinh bấm Làm mới ở dashboard lớp học sẽ thấy tài nguyên và bài kiểm tra.`, "success");
      setPage("onlineTests");
    } catch (e: any) {
      notify(e?.message || "Chưa tạo được dữ liệu mẫu. Kiểm tra đăng nhập giáo viên, Supabase và server.ts.", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateAiTest = async () => {
    if (!aiTestForm.title.trim() || !aiTestForm.classId) return notify("Chọn lớp và nhập tên bài kiểm tra.", "error");
    if (!aiFile && !aiTestForm.source.trim() && !aiTestForm.sourceUrl.trim()) return notify("Upload file PDF/Word/PowerPoint/TXT/ảnh, dán nội dung hoặc nhập link Google Docs công khai để AI trích xuất.", "error");
    setLoading(true);
    setAiReview(null);
    try {
      const payload: any = {
        title: aiTestForm.title,
        duration: Number(aiTestForm.durationMinutes) || 45,
        questionCount: Number(aiTestForm.questionCount) || 20,
      };
      if (aiFile) {
        payload.fileData = await fileToBase64(aiFile);
        payload.mimeType = aiFile.type || "application/octet-stream";
        payload.fileName = aiFile.name;
      }
      if (aiTestForm.source.trim()) payload.textContent = aiTestForm.source.trim();
      if (aiTestForm.sourceUrl.trim()) payload.sourceUrl = aiTestForm.sourceUrl.trim();
      const parsed = await apiFetch<any>("/api/teacher/exams/generate", { method: "POST", body: JSON.stringify({ ...payload, source: aiTestForm.source.trim(), sourceUrl: aiTestForm.sourceUrl.trim() }) });
      if (!parsed.success || !parsed.exam) throw new Error(parsed.error || "AI chưa trả về đề hợp lệ.");
      const exam = {
        ...parsed.exam,
        title: aiTestForm.title,
        duration: Number(aiTestForm.durationMinutes) || parsed.exam.duration || 45,
        durationMinutes: Number(aiTestForm.durationMinutes) || parsed.exam.durationMinutes || parsed.exam.duration || 45,
      };
      setAiReview(exam);
      notify(`AI đã tạo ${questionCount(exam)} câu trắc nghiệm. Xem nhanh rồi bấm giao bài.`, "success");
    } catch (e: any) {
      setAiReview(null);
      notify(e?.message || "AI không tạo được đề trắc nghiệm. Kiểm tra GEMINI_API_KEY hoặc thử file/nội dung rõ hơn.", "error");
    } finally { setLoading(false); }
  };

  const saveAiTestToClass = async () => {
    if (!aiReview) return notify("Hãy gen đề trước khi giao bài.", "error");
    if (!aiTestForm.classId || !aiTestForm.openDate || !aiTestForm.closeDate) return notify("Chọn lớp và đặt thời gian mở/đóng.", "error");
    const openAt = `${aiTestForm.openDate}T${aiTestForm.openTime}`;
    const closeAt = `${aiTestForm.closeDate}T${aiTestForm.closeTime}`;
    setLoading(true);
    try {
      const examRes = await apiFetch<any>("/api/teacher/exams", { method: "POST", body: JSON.stringify({ title: aiTestForm.title, durationMinutes: Number(aiTestForm.durationMinutes) || 45, content: aiReview }) });
      const testRes = await apiFetch<any>("/api/teacher/online-tests", { method: "POST", body: JSON.stringify({ title: aiTestForm.title, classId: aiTestForm.classId, examId: examRes.exam.id, openAt, closeAt, durationMinutes: Number(aiTestForm.durationMinutes) || 45, shuffleQuestions: true, showScoreAfterSubmit: true, oneAttemptOnly: true }) });
      setExams(prev => [examRes.exam, ...prev]);
      setTests(prev => [testRes.onlineTest, ...prev]);
      notify("Đã tạo bài kiểm tra trong lớp đã chọn.");
      await loadWorkspace();
    } catch (e: any) {
      notify(e?.message || "Không lưu/giao được bài kiểm tra lên server, nên học sinh sẽ chưa thấy bài.", "error");
    } finally { closeModal(); setLoading(false); }
  };

  const createQuiz = async () => {
    if (!quizForm.title.trim()) return notify("Nhập tên quiz.", "error");
    setLoading(true);
    try {
      const res = await apiFetch<any>("/api/teacher/quizzes", { method: "POST", body: JSON.stringify({ ...quizForm, questionCount: Number(quizForm.questionCount) || 10 }) });
      setQuizzes(prev => [res.quiz, ...prev]); notify("Đã tạo quiz.");
    } catch (e: any) {
      notify(e?.message || "Không lưu được quiz lên server.", "error");
    } finally { closeModal(); setLoading(false); }
  };

  const createOnlineTest = async () => {
    if (!testForm.title.trim() || !testForm.classId || !testForm.examId) return notify("Nhập đủ tên bài, lớp và đề thi.", "error");
    if (!testForm.openDate || !testForm.closeDate) return notify("Đặt ngày mở và ngày đóng bài kiểm tra.", "error");
    const openAt = `${testForm.openDate}T${testForm.openTime}`;
    const closeAt = `${testForm.closeDate}T${testForm.closeTime}`;
    setLoading(true);
    try {
      const res = await apiFetch<any>("/api/teacher/online-tests", { method: "POST", body: JSON.stringify({ title: testForm.title, classId: testForm.classId, examId: testForm.examId, openAt, closeAt, durationMinutes: Number(testForm.durationMinutes) || 45, shuffleQuestions: testForm.shuffleQuestions, showScoreAfterSubmit: testForm.showScoreAfterSubmit, oneAttemptOnly: testForm.oneAttemptOnly }) });
      setTests(prev => [res.onlineTest, ...prev]); notify("Đã tạo bài kiểm tra online.");
      await loadWorkspace();
    } catch (e: any) {
      notify(e?.message || "Không giao được bài kiểm tra lên server, nên học sinh sẽ chưa thấy bài.", "error");
    } finally { closeModal(); setLoading(false); }
  };

  const deleteOnlineTest = async (test: OnlineTest) => {
    if (!confirm(`Xóa bài kiểm tra đã giao "${test.title}"? Học sinh sẽ không còn thấy bài này.`)) return;
    setLoading(true);
    try {
      await apiFetch(`/api/teacher/online-tests/${test.id}`, { method: "DELETE" });
      await loadWorkspace();
      notify("Đã xóa bài kiểm tra đã giao.");
    } catch (e: any) {
      notify(e?.message || "Không xóa được bài kiểm tra. Kiểm tra server hoặc quyền lớp học.", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacherExam = async (exam: TeacherExam) => {
    if (!confirm(`Xóa đề kiểm tra "${exam.title}"? Các bài đã giao từ đề này cũng sẽ bị gỡ khỏi lớp.`)) return;
    setLoading(true);
    try {
      await apiFetch(`/api/teacher/exams/${exam.id}`, { method: "DELETE" });
      await loadWorkspace();
      notify("Đã xóa đề kiểm tra.");
    } catch (e: any) {
      notify(e?.message || "Không xóa được đề kiểm tra. Có thể đề này không thuộc tài khoản giáo viên hiện tại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quiz: TeacherQuiz) => {
    if (!confirm(`Xóa quiz "${quiz.title}"?`)) return;
    setLoading(true);
    try {
      await apiFetch(`/api/teacher/quizzes/${quiz.id}`, { method: "DELETE" });
      await loadWorkspace();
      notify("Đã xóa quiz.");
    } catch (e: any) {
      notify(e?.message || "Không xóa được quiz.", "error");
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!selectedClass?.id || !confirm("Xóa học sinh này khỏi lớp?")) return;
    try {
      await apiFetch(`/api/teacher/classes/${selectedClass.id}/students/${studentId}`, { method: "DELETE" });
      await loadWorkspace();
      notify("Đã xóa học sinh khỏi lớp.");
    } catch (e: any) {
      notify(e?.message || "Không xóa được học sinh khỏi lớp trên server.", "error");
    }
  };

  const sendMessage = async () => {
    const text = chatInput.trim(); if (!text || !selectedClass?.id) return;
    try {
      await apiFetch(`/api/classes/${selectedClass.id}/messages`, { method: "POST", body: JSON.stringify({ messageText: text }) });
      setChatInput(""); loadMessages(selectedClass.id);
    } catch {
      setMessages(prev => [...prev, { id: makeLocalId("msg"), class_id: selectedClass.id, user_id: teacherId, message_text: text, created_at: new Date().toISOString(), profiles: { name: currentUser?.name || "Giáo viên", role: "teacher" } }]);
      setChatInput("");
    }
  };

  if (!currentUser) return <div className="tw-login-note">Bạn cần đăng nhập bằng tài khoản giáo viên để dùng Teacher Workspace.</div>;

  const pageTitle = page === "publicLibrary" ? "Thư viện học liệu SGK" : page === "publicExams" ? "Kho đề thi thử tuyển sinh" : page === "classResources" ? "Tài nguyên lớp học" : page === "onlineTests" ? "Bài kiểm tra trực tuyến" : "Quản lý lớp học";

  return <div className="tw-app"><style>{teacherCss}</style>
    <aside className="tw-sidebar">
      <div className="tw-brand"><img src="/logo-1.png" alt="VocaFox"/><div><h1>Teacher<br/><span>Workspace</span></h1><p>VocaFox for Teachers</p></div></div>
      <div className="tw-user-card"><div className="tw-avatar">{(currentUser.name || currentUser.email || "T").slice(0,1).toUpperCase()}</div><div><b>{currentUser.name || "Giáo viên"}</b><span>{currentUser.email}</span></div></div>
      <nav className="tw-nav">
        <button className={page === "publicLibrary" ? "active" : ""} onClick={() => setPage("publicLibrary")}><BookOpenCheck size={21}/><span>Thư viện học liệu SGK<small>Học liệu có sẵn từ hệ thống</small></span></button>
        <button className={page === "publicExams" ? "active" : ""} onClick={() => setPage("publicExams")}><GraduationCap size={21}/><span>Kho đề thi thử tuyển sinh<small>Đề tham khảo do admin tạo</small></span></button>
        <button className={page === "classHome" ? "active parent" : "parent"} onClick={() => { setClassMenuOpen(!classMenuOpen); setPage("classHome"); }}><Users size={21}/><span>Quản lý lớp học<small>Mã lớp, chat, tiến độ</small></span><ChevronDown className={classMenuOpen ? "rotate" : ""} size={18}/></button>
        {classMenuOpen && <div className="tw-subnav">
          <button className={page === "classResources" ? "active" : ""} onClick={() => setPage("classResources")}><FolderOpen size={18}/>Tài nguyên lớp học</button>
          <button className={page === "onlineTests" ? "active" : ""} onClick={() => setPage("onlineTests")}><ClipboardCheck size={18}/>Bài kiểm tra trực tuyến</button>
        </div>}
      </nav>
      <div className="tw-create-card"><Sparkles size={26}/><h3>Tạo bài kiểm tra bằng AI</h3><p>Upload PDF/Word/PowerPoint, chọn lớp, đặt tên và thời gian.</p><button onClick={openAiTestModal}>+ Tạo bài kiểm tra</button></div>
      <button className="tw-logout" onClick={handleLogout}><LogOut size={18}/> Đăng xuất</button>
    </aside>

    <main className="tw-main">
      <header className="tw-topbar"><div><small>Chào mừng trở lại, {currentUser.name || "thầy/cô"}</small><h2>{pageTitle}</h2></div><div className="tw-actions"><button className="tw-btn tw-btn-soft" onClick={loadWorkspace}>{loading ? <Loader2 className="spin" size={18}/> : <RefreshCw size={18}/>} Làm mới</button><button className="tw-btn tw-btn-orange" onClick={() => openClassModal()}><Plus size={18}/> Tạo lớp</button></div></header>
      {status && <div className={`tw-status ${status.type}`}>{status.text}</div>}
      <section className="tw-welcome"><div><span>🦊 Teacher Workspace</span><h1>Chúc thầy/cô một buổi dạy hiệu quả.</h1></div><div className="tw-quick-stats"><Stat value={totals.classes} label="Lớp"/><Stat value={totals.students} label="Học sinh"/><Stat value={totals.resources} label="Tài nguyên"/><Stat value={totals.tests} label="Bài kiểm tra"/></div></section>
      {page === "classHome" && renderClasses()}
      {page === "classResources" && renderClassResources()}
      {page === "onlineTests" && renderOnlineTests()}
      {page === "publicLibrary" && renderPublicLibrary()}
      {page === "publicExams" && renderPublicExams()}
      <footer className="tw-footer"><div><b>VocaFox English</b><span>Hệ thống học liệu SGK 9, ôn thi vào 10 và quản lý lớp học.</span></div><div><a href="mailto:nbao8887@gmail.com">Liên hệ hỗ trợ</a><span>© 2026 VocaFox</span></div></footer>
    </main>

    {modal && <Modal title={modalTitle(modal)} onClose={closeModal}>{renderModal()}</Modal>}
  </div>;

  function renderClasses() {
    return <section className="tw-layout-classes">
      <div className="tw-panel"><PanelHead title="Danh sách lớp"><button className="tw-mini-btn" onClick={() => openClassModal()}><Plus size={16}/> Tạo lớp</button></PanelHead><div className="tw-class-list">{classes.map(c => <button key={c.id} className={selectedClass?.id === c.id ? "active" : ""} onClick={() => setSelectedClassId(c.id)}><b>{c.name}</b><span>{c.class_members?.length || c.student_count || 0} học sinh</span><code>{c.code}</code></button>)}{!classes.length && <Empty text="Chưa có lớp học. Bấm Tạo lớp để sinh mã vào lớp."/>}</div></div>
      <div className="tw-class-detail">{selectedClass ? <>
        <div className="tw-class-banner"><div><span className="tw-chip"><School size={16}/> Lớp đang quản lý</span><h3>{selectedClass.name}</h3><p>Học sinh nhập mã <b>{selectedClass.code}</b> để tham gia lớp.</p></div><div className="tw-banner-actions"><button onClick={() => copyText(selectedClass.code, "Đã sao chép mã lớp")}><Copy size={16}/> Mã lớp</button><button onClick={() => copyText(appLink(`/join-class/${selectedClass.code}`), "Đã sao chép link vào lớp")}><LinkIcon size={16}/> Link vào lớp</button><button onClick={seedDemoDataForClass}><Sparkles size={16}/> Tạo dữ liệu mẫu</button><button onClick={() => openClassModal(selectedClass)}><Edit3 size={16}/> Sửa lớp</button><button onClick={() => deleteClass(selectedClass)}><Trash2 size={16}/> Xóa lớp</button>{selectedClass.meeting_url && <a href={selectedClass.meeting_url} target="_blank" rel="noreferrer"><Video size={16}/> Học online</a>}</div></div>
        <div className="tw-class-tools"><ToolCard icon={<MessageCircle/>} title="Chat lớp" desc="Trao đổi với học sinh trong lớp." onClick={() => document.getElementById("teacher-chat")?.scrollIntoView({ behavior: "smooth" })}/><ToolCard icon={<FolderOpen/>} title="Tài nguyên lớp học" desc="Tài liệu riêng do giáo viên tạo." onClick={() => setPage("classResources")}/><ToolCard icon={<ClipboardCheck/>} title="Bài kiểm tra trực tuyến" desc="Tạo đề bằng AI và giao cho lớp." onClick={() => setPage("onlineTests")}/><ToolCard icon={<BarChart3/>} title="Theo dõi tiến độ" desc="Streak, unit hoàn thành và thời gian học." onClick={() => document.getElementById("progress-table")?.scrollIntoView({ behavior: "smooth" })}/></div>
        <PanelHead title="Tiến độ học sinh"/><div id="progress-table" className="tw-student-table"><div className="head"><span>Học sinh</span><span>Email</span><span>Streak</span><span>Hoàn thành</span><span>Thời gian</span><span></span></div>{students.map(s => { const p: StudentProfile = s.profiles || ({} as StudentProfile); const mins = Math.round((p.usage_time_seconds || 0) / 60); return <div className="row" key={s.user_id}><span><b>{p.name || "Học sinh"}</b></span><span>{p.email || "—"}</span><span>{p.study_streak || 0} ngày</span><span>{p.completed_units?.length || 0} unit</span><span>{mins} phút</span><button onClick={() => removeStudent(p.id || s.user_id)}><Trash2 size={14}/></button></div>; })}{!students.length && <Empty text="Chưa có học sinh trong lớp này."/>}</div>
        <div id="teacher-chat" className="tw-chat"><div className="tw-chat-head"><div><MessageCircle size={22}/><h3>Chat lớp {selectedClass.name}</h3></div><button onClick={() => loadMessages(selectedClass.id)}><RefreshCw size={16}/> Tải lại</button></div><div className="tw-chat-body">{messages.map(m => <div key={m.id} className={m.user_id === teacherId ? "mine" : "other"}><div><b>{m.profiles?.name || (m.user_id === teacherId ? "Bạn" : "Học sinh")}</b><p>{m.message_text}</p><small>{fmtDate(m.created_at)}</small></div></div>)}{!messages.length && <Empty text="Chưa có tin nhắn. Hãy gửi lời chào lớp."/>}</div><div className="tw-chat-input"><input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendMessage(); }} placeholder="Nhập tin nhắn cho lớp..."/><button onClick={sendMessage}><Send size={18}/></button></div></div>
      </> : <Empty text="Chọn hoặc tạo một lớp học để bắt đầu."/>}</div>
    </section>;
  }

  function renderClassResources() {
    return <section className="tw-section"><SectionTitle title="Tài nguyên lớp học" desc="Tài liệu riêng do giáo viên tự tạo cho lớp, không lấy trực tiếp từ kho học liệu admin."><button className="tw-btn tw-btn-orange" onClick={() => { setMaterialForm(p => ({ ...p, classId: selectedClass?.id || p.classId || "" })); setModal("material"); }}><Plus size={18}/> Thêm tài nguyên</button></SectionTitle><div className="tw-filter-row"><div className="tw-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tài nguyên..."/></div><div className="tw-tabs">{materialFilters.map(f => <button key={f} className={materialFilter === f ? "active" : ""} onClick={() => setMaterialFilter(f)}>{f}</button>)}</div></div><div className="tw-material-grid">{filteredMaterials.map(m => <article className="tw-material" key={m.id}>{m.cover_image_url ? <img src={m.cover_image_url} alt=""/> : <div className="tw-cover"><BookMarked size={30}/><b>{m.type}</b></div>}<div><span>{m.grade || "Lớp 9"} · {m.type}</span><h3>{m.title}</h3><p>{m.description || "Tài nguyên lớp học."}</p><div className="tw-row-actions"><a href={m.metadata?.fileData ? `data:${m.metadata?.mimeType || "application/octet-stream"};base64,${m.metadata.fileData}` : (m.file_url || m.web_url || m.youtube_url || m.slide_pdf_url || "#")} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Xem/Tải</a><button onClick={() => deleteMaterial(m.id)}><Trash2 size={15}/> Xóa</button></div></div></article>)}{!filteredMaterials.length && <Empty text="Chưa có tài nguyên lớp học."/>}</div></section>;
  }

  function renderOnlineTests() {
    return <section className="tw-section"><SectionTitle title="Bài kiểm tra trực tuyến" desc="Đề do giáo viên tự tạo hoặc gen bằng AI, chỉ xuất hiện trong lớp được giao."><div className="tw-actions"><button className="tw-btn tw-btn-soft" onClick={() => setModal("quiz")}><Sparkles size={18}/> Tạo quiz</button><button className="tw-btn tw-btn-orange" onClick={openAiTestModal}><UploadCloud size={18}/> AI tạo từ file</button><button className="tw-btn tw-btn-dark" onClick={() => openOnlineTestModal()}><CalendarClock size={18}/> Giao bài có sẵn</button><button className="tw-btn tw-btn-soft" onClick={seedDemoDataForClass}><Sparkles size={18}/> Tạo dữ liệu mẫu 9D1</button></div></SectionTitle><div className="tw-two-cols"><div className="tw-panel"><PanelHead title="Bài đã giao"/><div>{tests.map(t => <div className="tw-list-row" key={t.id}><div><b>{t.title}</b><span>{t.classes?.name || classes.find(c => c.id === t.class_id)?.name || "Lớp"} · {t.duration_minutes} phút · {fmtDate(t.open_at)}</span></div><div className="tw-row-actions"><button onClick={() => copyText(appLink(`/online-test/${t.id}`), "Đã sao chép link bài kiểm tra")}><LinkIcon size={15}/></button><button onClick={() => deleteOnlineTest(t)}><Trash2 size={15}/></button></div></div>)}{!tests.length && <Empty text="Chưa có bài kiểm tra online."/>}</div></div><div className="tw-panel"><PanelHead title="Quiz nhanh"><button className="tw-mini-btn" onClick={() => setModal("quiz")}>+ Quiz</button></PanelHead>{quizzes.map(q => <div className="tw-list-row" key={q.id}><div><b>{q.title}</b><span>{q.source_type || "AI"} · {q.question_count || 0} câu</span></div><div className="tw-row-actions"><button onClick={() => copyText(appLink(`/quiz/${q.id}`), "Đã sao chép link quiz")}><LinkIcon size={15}/></button><button onClick={() => deleteQuiz(q)}><Trash2 size={15}/></button></div></div>)}{!quizzes.length && <Empty text="Chưa có quiz."/>}</div></div><h3 className="tw-subtitle">Đề giáo viên đã tạo</h3><div className="tw-exam-grid">{exams.map(e => <article className="tw-exam" key={e.id}><div className="tw-exam-icon"><FileText size={24}/></div><h3>{e.title}</h3><p>{questionCount(e)} câu · {e.duration_minutes || 45} phút · {e.status || "Sẵn sàng"}</p><div className="tw-row-actions"><button onClick={() => openOnlineTestModal(e)}><CalendarClock size={15}/> Giao lớp</button><button onClick={() => deleteTeacherExam(e)}><Trash2 size={15}/> Xóa đề</button></div></article>)}{!exams.length && <Empty text="Chưa có đề riêng của giáo viên."/>}</div></section>;
  }

  function renderPublicLibrary() {
    const materials = publicUnits.map(unitToMaterial);
    return <section className="tw-section"><SectionTitle title="Thư viện học liệu SGK" desc="Học liệu có sẵn từ cùng kho học sinh đang dùng, do admin quản lý."><button className="tw-btn tw-btn-soft" onClick={() => { setActiveTab?.("units"); }}>Mở giao diện học sinh</button></SectionTitle><div className="tw-material-grid">{materials.map(m => <article className="tw-material" key={m.id}><div className="tw-cover"><BookMarked size={30}/><b>SGK</b></div><div><span>{m.grade} · Unit</span><h3>{m.title}</h3><p>{m.description}</p></div></article>)}</div></section>;
  }

  function renderPublicExams() {
    const publicExams = publicExamBank.map(examToTeacherExam);
    return <section className="tw-section"><SectionTitle title="Kho đề thi thử tuyển sinh" desc="Đề thi thử có sẵn từ cùng kho học sinh đang dùng, do admin quản lý."><button className="tw-btn tw-btn-soft" onClick={() => { setActiveTab?.("exams"); }}>Mở giao diện học sinh</button></SectionTitle><div className="tw-exam-grid">{publicExams.map(e => <article className="tw-exam" key={e.id}><div className="tw-exam-icon"><GraduationCap size={24}/></div><h3>{e.title}</h3><p>{questionCount(e)} câu · {e.duration_minutes || 45} phút</p></article>)}</div></section>;
  }

  function renderModal() {
    if (modal === "class") return <div className="tw-form-grid"><Field label="Tên lớp"><input value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} placeholder="Ví dụ: 9A1 - Anh văn"/></Field><Field label="Link học online"><input value={classForm.meetingUrl} onChange={e => setClassForm({ ...classForm, meetingUrl: e.target.value })} placeholder="Google Meet/Zoom..."/></Field><div className="tw-modal-actions"><button className="tw-btn tw-btn-soft" onClick={closeModal}>Hủy</button><button className="tw-btn tw-btn-orange" onClick={saveClass}>{editingClassId ? "Lưu thay đổi" : "Tạo lớp"}</button></div></div>;
    if (modal === "material") return <div className="tw-form-grid"><Field label="Tên tài nguyên"><input value={materialForm.title} onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}/></Field><Field label="Lớp nhận tài nguyên"><select value={materialForm.classId || selectedClass?.id || ""} onChange={e => setMaterialForm({ ...materialForm, classId: e.target.value })}><option value="">Chọn lớp</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Loại"><select value={materialForm.type} onChange={e => setMaterialForm({ ...materialForm, type: e.target.value as MaterialType })}>{materialFilters.filter(f => f !== "Tất cả").map(f => <option key={f}>{f}</option>)}</select></Field><Field label="Mô tả" wide><textarea value={materialForm.description} onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })}/></Field>{materialForm.type === "Video" ? <Field label="Link video" wide><input value={materialForm.youtubeUrl} onChange={e => setMaterialForm({ ...materialForm, youtubeUrl: e.target.value })} placeholder="Dán link YouTube/video lớp học..."/></Field> : <Field label="Upload file" wide><label className="tw-upload"><UploadCloud size={22}/><span>{materialFile ? materialFile.name : "Chọn file PDF/Word/PowerPoint"}</span><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={e => setMaterialFile(e.target.files?.[0] || null)}/></label></Field>}<div className="tw-modal-actions"><button className="tw-btn tw-btn-soft" onClick={closeModal}>Hủy</button><button className="tw-btn tw-btn-orange" onClick={uploadMaterial}>Lưu tài nguyên</button></div></div>;
    if (modal === "aiTest") return <div className="tw-form-grid"><Field label="Tên bài kiểm tra"><input value={aiTestForm.title} onChange={e => setAiTestForm({ ...aiTestForm, title: e.target.value })}/></Field><Field label="Lớp giao bài"><select value={aiTestForm.classId} onChange={e => setAiTestForm({ ...aiTestForm, classId: e.target.value })}><option value="">Chọn lớp</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Upload PDF/Word/PowerPoint/Ảnh" wide><label className="tw-upload"><UploadCloud size={22}/><span>{aiFile ? aiFile.name : "Chọn file .pdf, .doc, .docx, .ppt, .pptx, .txt, .png, .jpg"}</span><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,image/png,image/jpeg,image/webp" onChange={e => setAiFile(e.target.files?.[0] || null)}/></label></Field><Field label="Link tài liệu công khai" wide><input value={aiTestForm.sourceUrl} onChange={e => setAiTestForm({ ...aiTestForm, sourceUrl: e.target.value })} placeholder="Dán link Google Docs/website chứa đề thi nếu có..."/></Field><Field label="Hoặc dán nội dung đề" wide><textarea value={aiTestForm.source} onChange={e => setAiTestForm({ ...aiTestForm, source: e.target.value })} placeholder="Dán văn bản đề nếu không upload file..."/></Field><Field label="Số câu mong muốn"><input value={aiTestForm.questionCount} onChange={e => setAiTestForm({ ...aiTestForm, questionCount: e.target.value })}/></Field><Field label="Thời lượng phút"><input value={aiTestForm.durationMinutes} onChange={e => setAiTestForm({ ...aiTestForm, durationMinutes: e.target.value })}/></Field><Field label="Ngày mở"><input type="date" value={aiTestForm.openDate} onChange={e => setAiTestForm({ ...aiTestForm, openDate: e.target.value })}/></Field><Field label="Giờ mở"><input type="time" value={aiTestForm.openTime} onChange={e => setAiTestForm({ ...aiTestForm, openTime: e.target.value })}/></Field><Field label="Ngày đóng"><input type="date" value={aiTestForm.closeDate} onChange={e => setAiTestForm({ ...aiTestForm, closeDate: e.target.value })}/></Field><Field label="Giờ đóng"><input type="time" value={aiTestForm.closeTime} onChange={e => setAiTestForm({ ...aiTestForm, closeTime: e.target.value })}/></Field>{aiReview && <AiExamPreview exam={aiReview} />}<div className="tw-modal-actions"><button className="tw-btn tw-btn-soft" onClick={generateAiTest} disabled={loading}>{loading ? "Đang trích xuất..." : "AI trích xuất đề"}</button><button className="tw-btn tw-btn-orange" onClick={saveAiTestToClass} disabled={!aiReview || loading}>Giao bài cho lớp</button></div></div>;
    if (modal === "quiz") return <div className="tw-form-grid"><Field label="Tên quiz"><input value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}/></Field><Field label="Số câu"><input value={quizForm.questionCount} onChange={e => setQuizForm({ ...quizForm, questionCount: e.target.value })}/></Field><Field label="Nguồn/từ khóa" wide><textarea value={quizForm.source} onChange={e => setQuizForm({ ...quizForm, source: e.target.value })}/></Field><div className="tw-modal-actions"><button className="tw-btn tw-btn-soft" onClick={closeModal}>Hủy</button><button className="tw-btn tw-btn-orange" onClick={createQuiz}>Tạo quiz</button></div></div>;
    return <div className="tw-form-grid"><Field label="Tên bài kiểm tra"><input value={testForm.title} onChange={e => setTestForm({ ...testForm, title: e.target.value })}/></Field><Field label="Lớp"><select value={testForm.classId} onChange={e => setTestForm({ ...testForm, classId: e.target.value })}><option value="">Chọn lớp</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Đề đã tạo"><select value={testForm.examId} onChange={e => setTestForm({ ...testForm, examId: e.target.value })}><option value="">Chọn đề</option>{exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}</select></Field><Field label="Thời lượng phút"><input value={testForm.durationMinutes} onChange={e => setTestForm({ ...testForm, durationMinutes: e.target.value })}/></Field><Field label="Ngày mở"><input type="date" value={testForm.openDate} onChange={e => setTestForm({ ...testForm, openDate: e.target.value })}/></Field><Field label="Giờ mở"><input type="time" value={testForm.openTime} onChange={e => setTestForm({ ...testForm, openTime: e.target.value })}/></Field><Field label="Ngày đóng"><input type="date" value={testForm.closeDate} onChange={e => setTestForm({ ...testForm, closeDate: e.target.value })}/></Field><Field label="Giờ đóng"><input type="time" value={testForm.closeTime} onChange={e => setTestForm({ ...testForm, closeTime: e.target.value })}/></Field><div className="tw-modal-actions"><button className="tw-btn tw-btn-soft" onClick={closeModal}>Hủy</button><button className="tw-btn tw-btn-orange" onClick={createOnlineTest}>Giao bài</button></div></div>;
  }
}

function AiExamPreview({ exam }: { exam: any }) {
  const questions = Array.isArray(exam?.questions) ? exam.questions : (exam?.sections || []).flatMap((section: any) => section.questions || []);
  return <div className="tw-ai-preview">
    <b>Đề trắc nghiệm AI đã tạo: {questions.length} câu</b>
    <p>Đề sẽ được lưu thành bài kiểm tra làm trực tiếp, không hiển thị dạng code cho học sinh.</p>
    {questions.slice(0, 5).map((q: any, i: number) => <div key={q.id || i} className="tw-ai-q">
      <strong>Câu {i + 1}. {q.question}</strong>
      {Array.isArray(q.options) && <ul>{q.options.map((o: string) => <li key={o}>{o}</li>)}</ul>}
      <span>Đáp án: {q.correctAnswer || q.correctValue || q.answer || "Chưa có"}</span>
    </div>)}
    {questions.length > 5 && <small>... còn {questions.length - 5} câu nữa.</small>}
  </div>;
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="tw-stat"><strong>{value}</strong><span>{label}</span></div>; }
function PanelHead({ title, children }: { title: string; children?: React.ReactNode }) { return <div className="tw-panel-head"><h3>{title}</h3>{children}</div>; }
function SectionTitle({ title, desc, children }: { title: string; desc?: string; children?: React.ReactNode }) { return <div className="tw-section-title"><div><h3>{title}</h3>{desc && <p>{desc}</p>}</div>{children}</div>; }
function Empty({ text }: { text: string }) { return <div className="tw-empty">{text}</div>; }
function ToolCard({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) { return <button className="tw-tool-card" onClick={onClick}><span>{icon}</span><b>{title}</b><small>{desc}</small></button>; }
function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) { return <label className={`tw-field ${wide ? "wide" : ""}`}><span>{label}</span>{children}</label>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) { return <div className="tw-modal-backdrop"><div className="tw-modal"><div className="tw-modal-head"><h3>{title}</h3><button onClick={onClose}><X size={20}/></button></div>{children}</div></div>; }
function modalTitle(modal: ModalName) { return modal === "class" ? "Tạo lớp học" : modal === "material" ? "Thêm tài nguyên lớp học" : modal === "aiTest" ? "AI tạo bài kiểm tra từ file" : modal === "quiz" ? "Tạo quiz" : "Giao bài kiểm tra online"; }

const teacherCss = `
.tw-app{--orange:#ff7a1a;--orange2:#ff9600;--ink:#10213f;--muted:#64748b;--line:#e8edf5;--soft:#fff7ed;min-height:100vh;display:flex;background:linear-gradient(120deg,#fffaf5 0%,#ffffff 46%,#fff7ed 100%);color:var(--ink);font-family:'Plus Jakarta Sans',Inter,system-ui,sans-serif}.tw-login-note{padding:40px;font-weight:900}.tw-sidebar{width:370px;min-height:100vh;position:sticky;top:0;background:linear-gradient(180deg,#fff3e8,#fff 62%);border-right:1px solid #fed7aa;padding:32px;overflow:auto;flex-shrink:0}.tw-brand{display:flex;gap:14px;align-items:center;margin-bottom:26px}.tw-brand img{width:62px;height:62px;border-radius:20px;background:#fff;object-fit:contain;padding:7px}.tw-brand h1{font-size:32px;line-height:.95;margin:0;font-weight:800;letter-spacing:-1.1px}.tw-brand h1 span{color:var(--orange)}.tw-brand p{margin:8px 0 0;font-weight:900;color:#53627a}.tw-user-card{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid #fed7aa;border-radius:30px;padding:16px;margin-bottom:24px;box-shadow:0 16px 38px rgba(249,115,22,.08)}.tw-avatar{width:58px;height:58px;border-radius:20px;background:linear-gradient(135deg,#ff7a1a,#ff9d2e);display:grid;place-items:center;color:#fff;font-weight:950;font-size:22px}.tw-user-card b,.tw-user-card span{display:block}.tw-user-card b{font-size:17px}.tw-user-card span{color:#64748b;font-size:13px;font-weight:800;word-break:break-word}.tw-nav{display:grid;gap:10px}.tw-nav button{border:0;background:transparent;border-radius:23px;padding:16px;text-align:left;display:flex;align-items:center;gap:13px;color:#475569;font-weight:950;cursor:pointer;width:100%;transition:.18s}.tw-nav button:hover{background:#fff7ed}.tw-nav button.active{background:linear-gradient(135deg,#ff7a1a,#ff9600);color:white;box-shadow:0 18px 40px rgba(249,115,22,.24)}.tw-nav small{display:block;font-size:11px;font-weight:850;opacity:.72;margin-top:3px}.tw-nav .parent{justify-content:flex-start}.tw-nav .parent svg:last-child{margin-left:auto}.tw-nav .rotate{transform:rotate(180deg)}.tw-subnav{display:grid;gap:8px;margin:-2px 0 4px 24px;padding-left:14px;border-left:2px solid #fed7aa}.tw-subnav button{font-size:14px;padding:12px 14px;border-radius:18px;background:#fff}.tw-subnav button.active{background:#10213f;color:#fff;box-shadow:none}.tw-create-card{margin-top:22px;background:linear-gradient(135deg,#10213f,#1e3a8a);color:#fff;border-radius:28px;padding:22px;box-shadow:0 18px 48px rgba(16,33,63,.16)}.tw-create-card h3{margin:10px 0 6px}.tw-create-card p{margin:0;color:#dbeafe;font-size:13px;font-weight:750;line-height:1.55}.tw-create-card button{margin-top:15px;width:100%;border:0;background:#fff;color:#ea580c;border-radius:17px;padding:12px;font-weight:950;cursor:pointer}.tw-logout{width:100%;margin-top:18px;border:1px solid #fed7aa;background:#fff;color:#9a3412;border-radius:18px;padding:13px 14px;font-weight:950;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer}.tw-footer{margin-top:26px;border-top:1px solid #fed7aa;padding:20px 4px 8px;display:flex;justify-content:space-between;gap:16px;color:#64748b;font-size:12px;font-weight:800}.tw-footer b,.tw-footer span{display:block}.tw-footer a{color:#ea580c;text-decoration:none;font-weight:950}.tw-main{flex:1;min-width:0;padding:32px;overflow:auto}.tw-topbar,.tw-actions,.tw-section-title,.tw-panel-head,.tw-filter-row,.tw-banner-actions,.tw-row-actions{display:flex;align-items:center;justify-content:space-between;gap:12px}.tw-topbar{margin-bottom:18px}.tw-topbar small{color:#ea580c;font-weight:950}.tw-topbar h2{margin:4px 0 0;font-size:34px;letter-spacing:-.9px}.tw-btn,.tw-mini-btn{border:0;border-radius:17px;padding:12px 16px;font-weight:950;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}.tw-btn:disabled{opacity:.55;cursor:not-allowed}.tw-btn-soft,.tw-mini-btn{background:white;border:1px solid var(--line);color:#475569}.tw-btn-orange{background:var(--orange);color:white;box-shadow:0 12px 26px rgba(249,115,22,.22)}.tw-btn-dark{background:#111827;color:white}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.tw-status{border-radius:20px;padding:13px 16px;margin-bottom:16px;font-weight:850;border:1px solid}.tw-status.success{background:#ecfdf5;color:#059669;border-color:#bbf7d0}.tw-status.error{background:#fef2f2;color:#dc2626;border-color:#fecaca}.tw-status.info{background:#eff6ff;color:#2563eb;border-color:#bfdbfe}.tw-welcome{background:white;border:1px solid #fed7aa;border-radius:32px;padding:24px;margin-bottom:22px;display:grid;grid-template-columns:1fr 520px;gap:22px;box-shadow:0 18px 50px rgba(249,115,22,.07)}.tw-welcome span,.tw-chip{display:inline-flex;align-items:center;gap:6px;background:#fff7ed;color:#ea580c;border-radius:999px;padding:8px 12px;font-weight:950;font-size:13px}.tw-welcome h1{font-size:36px;line-height:1.08;letter-spacing:-1.2px;margin:14px 0 0}.tw-quick-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.tw-stat{background:#fff7ed;border:1px solid #fed7aa;border-radius:22px;padding:16px}.tw-stat strong{font-size:30px;display:block}.tw-stat span{color:#9a3412;font-weight:900;font-size:13px}.tw-layout-classes{display:grid;grid-template-columns:315px 1fr;gap:20px}.tw-panel,.tw-section,.tw-class-detail{background:white;border:1px solid var(--line);border-radius:30px;padding:22px;box-shadow:0 1px 0 rgba(15,23,42,.03)}.tw-panel-head{margin-bottom:16px}.tw-panel-head h3,.tw-section-title h3{margin:0;font-size:22px;letter-spacing:-.4px}.tw-section-title{align-items:flex-start;margin-bottom:18px}.tw-section-title p{margin:5px 0 0;color:var(--muted);font-weight:650}.tw-class-list{display:grid;gap:10px}.tw-class-list button{background:#fff;border:1px solid var(--line);border-radius:22px;padding:16px;text-align:left;cursor:pointer}.tw-class-list button.active{background:#fff7ed;border-color:#fdba74}.tw-class-list b,.tw-class-list span,.tw-class-list code{display:block}.tw-class-list span{color:#64748b;font-weight:800;font-size:13px;margin:4px 0}.tw-class-list code{color:#ea580c;font-weight:950}.tw-class-banner{background:linear-gradient(135deg,#fff7ed,#fff);border:1px solid #fed7aa;border-radius:28px;padding:24px;display:flex;justify-content:space-between;gap:18px}.tw-class-banner h3{font-size:32px;margin:14px 0 8px;letter-spacing:-.9px}.tw-class-banner p{margin:0;color:#64748b;font-weight:650;line-height:1.6}.tw-banner-actions{flex-wrap:wrap;justify-content:flex-end}.tw-banner-actions button,.tw-banner-actions a,.tw-row-actions button,.tw-row-actions a,.tw-list-row button{border:0;background:white;border:1px solid #fed7aa;color:#ea580c;border-radius:15px;padding:10px 12px;font-weight:950;text-decoration:none;display:inline-flex;align-items:center;gap:7px;cursor:pointer}.tw-class-tools{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin:18px 0}.tw-tool-card{border:1px solid #fed7aa;background:white;border-radius:24px;padding:18px;text-align:left;cursor:pointer}.tw-tool-card:hover,.tw-material:hover,.tw-exam:hover{transform:translateY(-3px);box-shadow:0 18px 35px rgba(249,115,22,.1)}.tw-tool-card span{width:48px;height:48px;border-radius:17px;background:#fff7ed;color:#ea580c;display:grid;place-items:center;margin-bottom:12px}.tw-tool-card b{display:block;font-size:16px}.tw-tool-card small{display:block;color:#64748b;font-weight:700;line-height:1.45;margin-top:6px}.tw-student-table{border:1px solid var(--line);border-radius:22px;overflow:auto;margin-bottom:18px}.tw-student-table .head,.tw-student-table .row{display:grid;grid-template-columns:1.2fr 1.5fr .7fr .8fr .8fr 44px;gap:10px;align-items:center;padding:13px 16px;min-width:780px}.tw-student-table .head{background:#f8fafc;color:#64748b;font-size:13px;font-weight:950}.tw-student-table .row{border-top:1px solid #f1f5f9;font-weight:750;color:#475569}.tw-student-table button{border:0;background:#fef2f2;color:#dc2626;border-radius:12px;padding:8px}.tw-chat{border:1px solid #fed7aa;border-radius:28px;overflow:hidden}.tw-chat-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #fed7aa}.tw-chat-head div{display:flex;align-items:center;gap:9px}.tw-chat-head h3{margin:0}.tw-chat-head button{border:0;border-radius:14px;background:#fff7ed;color:#ea580c;font-weight:950;padding:9px 11px;display:flex;gap:6px}.tw-chat-body{background:#fff9f2;padding:16px;min-height:240px;max-height:360px;overflow:auto}.tw-chat-body .mine,.tw-chat-body .other{display:flex;margin-bottom:11px}.tw-chat-body .mine{justify-content:flex-end}.tw-chat-body .mine>div,.tw-chat-body .other>div{max-width:78%;border-radius:20px;padding:11px 13px;background:#fff;border:1px solid #fed7aa}.tw-chat-body .mine>div{background:#f97316;color:#fff;border-color:#f97316}.tw-chat-body b{font-size:12px;opacity:.82}.tw-chat-body p{margin:4px 0;font-weight:750}.tw-chat-body small{opacity:.65}.tw-chat-input{display:flex;gap:10px;padding:13px;background:#fff;border-top:1px solid #fed7aa}.tw-chat-input input,.tw-field input,.tw-field select,.tw-field textarea,.tw-search input{width:100%;border:1px solid var(--line);border-radius:16px;padding:12px 14px;font-weight:750;outline:none;background:white}.tw-chat-input button{border:0;border-radius:16px;background:#f97316;color:white;padding:0 16px}.tw-filter-row{margin-bottom:18px;align-items:flex-start}.tw-search{display:flex;align-items:center;gap:8px;background:white;border:1px solid var(--line);border-radius:17px;padding:0 12px;min-width:280px}.tw-search input{border:0;padding-left:0}.tw-tabs{display:flex;gap:8px;flex-wrap:wrap}.tw-tabs button{border:0;border-radius:14px;padding:10px 14px;background:#f1f5f9;color:#475569;font-weight:900;cursor:pointer}.tw-tabs button.active{background:#f97316;color:white}.tw-material-grid,.tw-exam-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.tw-material,.tw-exam{background:white;border:1px solid var(--line);border-radius:26px;padding:16px;transition:.2s}.tw-material{display:grid;grid-template-columns:126px 1fr;gap:16px}.tw-material img,.tw-cover{width:126px;height:104px;border-radius:20px;object-fit:cover;background:#fff7ed;color:#ea580c;display:grid;place-items:center;text-align:center}.tw-material h3,.tw-exam h3{margin:7px 0;font-size:19px;letter-spacing:-.3px}.tw-material span,.tw-material p,.tw-exam p,.tw-list-row span{color:#64748b;font-weight:700;font-size:13px}.tw-material p{line-height:1.5}.tw-exam-icon{width:52px;height:52px;border-radius:18px;background:#fff7ed;color:#ea580c;display:grid;place-items:center;margin-bottom:12px}.tw-two-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}.tw-list-row{border:1px solid var(--line);border-radius:20px;padding:13px;margin-bottom:10px;display:flex;justify-content:space-between;gap:10px;align-items:center}.tw-list-row b,.tw-list-row span{display:block}.tw-subtitle{font-size:22px;margin:22px 0 14px}.tw-empty{border:1px dashed #fdba74;background:#fff7ed;color:#9a3412;border-radius:22px;padding:22px;text-align:center;font-weight:900;grid-column:1/-1}.tw-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.45);display:grid;place-items:center;z-index:1000;padding:20px}.tw-modal{width:min(900px,96vw);max-height:90vh;overflow:auto;background:white;border-radius:30px;border:1px solid #fed7aa;box-shadow:0 28px 90px rgba(15,23,42,.25);padding:22px}.tw-modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}.tw-modal-head h3{margin:0;font-size:24px}.tw-modal-head button{border:0;background:#f1f5f9;border-radius:14px;width:38px;height:38px;display:grid;place-items:center}.tw-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.tw-field span{display:block;font-size:12px;font-weight:950;color:#475569;margin-bottom:7px}.tw-field.wide{grid-column:1/-1}.tw-review{grid-column:1/-1;max-height:260px;overflow:auto;background:#0f172a;color:#e2e8f0;border-radius:18px;padding:14px;font-size:12px}.tw-ai-preview{grid-column:1/-1;background:#fff7ed;border:1px solid #fed7aa;border-radius:20px;padding:14px}.tw-ai-preview>b{display:block;color:#9a3412;margin-bottom:4px}.tw-ai-preview p{margin:0 0 10px;color:#64748b;font-weight:750}.tw-ai-q{background:#fff;border:1px solid #ffedd5;border-radius:16px;padding:10px;margin-top:8px}.tw-ai-q strong,.tw-ai-q span{display:block}.tw-ai-q ul{margin:8px 0;padding-left:20px}.tw-ai-q li{margin:3px 0;color:#475569;font-weight:750}.tw-modal-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:10px;margin-top:8px}.tw-upload{border:1.5px dashed #fdba74;border-radius:18px;padding:18px;background:#fff7ed;color:#9a3412;font-weight:900;display:flex;align-items:center;gap:10px;cursor:pointer}.tw-upload input{display:none}@media(max-width:1200px){.tw-layout-classes,.tw-welcome,.tw-two-cols{grid-template-columns:1fr}.tw-quick-stats,.tw-class-tools{grid-template-columns:repeat(2,1fr)}}@media(max-width:900px){.tw-app{display:block}.tw-sidebar{width:auto;min-height:auto;position:relative}.tw-main{padding:18px}.tw-topbar,.tw-section-title,.tw-filter-row,.tw-class-banner{flex-direction:column;align-items:flex-start}.tw-welcome h1{font-size:30px}.tw-quick-stats,.tw-material-grid,.tw-exam-grid,.tw-class-tools{grid-template-columns:1fr}.tw-material{grid-template-columns:1fr}.tw-material img,.tw-cover{width:100%;height:160px}.tw-form-grid{grid-template-columns:1fr}}
`;
