import React, { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, Clock, Download, FileText, Loader2, MessageCircle, RefreshCw, School, Send, Users, Video } from "lucide-react";
import { apiFetch } from "../supabase";
import { explainQuestionWithAI } from "../services/api";
import MarkdownRenderer from "./MarkdownRenderer";

type Props = { currentUser?: { uid?: string; id?: string; name?: string; email?: string; role?: string } | null };
type ClassRecord = { id: string; name: string; code: string; meeting_url?: string; student_count?: number; teacher?: { name?: string; email?: string } };
type ClassMessage = { id: string | number; user_id: string; message_text: string; emoji?: string; created_at: string; profiles?: { name?: string; role?: string } };
type Assignment = { id: string | number; type: "lesson" | "exam" | "live"; title: string; description?: string; target?: string; payload?: any; created_at?: string; available_from?: string; due_at?: string; time_limit_minutes?: number };
type OnlineTest = { id: string; title: string; class_id: string; open_at: string; close_at: string; duration_minutes: number };

type StatusType = "success" | "error" | "info";
type Status = { type: StatusType; text: string } | null;

function fmt(value?: string) {
  if (!value) return "—";
  try { return new Date(value).toLocaleString("vi-VN"); } catch { return value; }
}

function flattenQuestions(exam: any): any[] {
  if (Array.isArray(exam?.questions)) return exam.questions;
  return (exam?.sections || []).flatMap((section: any) => section.questions || []);
}

export default function StudentClassesTab({ currentUser }: Props) {
  const userId = currentUser?.uid || currentUser?.id || "";
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [onlineTests, setOnlineTests] = useState<OnlineTest[]>([]);
  const [messages, setMessages] = useState<ClassMessage[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [activeTest, setActiveTest] = useState<{ test: OnlineTest; attempt: any; exam: any } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any | null>(null);
  const [autoExplanations, setAutoExplanations] = useState<Record<string, string>>({});
  const [autoExplainLoading, setAutoExplainLoading] = useState(false);

  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId) || classes[0], [classes, selectedClassId]);
  const resources = assignments.filter(a => a.type === "lesson" || a.type === "live");

  const notify = (text: string, type: StatusType = "success") => setStatus({ text, type });

  const loadClasses = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await apiFetch<any>("/api/classes/my");
      const list = res.classes || [];
      setClasses(list);
      const firstId = selectedClassId || list[0]?.id || "";
      if (firstId) setSelectedClassId(firstId);
    } catch (e: any) {
      notify(e?.message || "Không tải được danh sách lớp.", "error");
    } finally { setLoading(false); }
  };

  const loadClassData = async (classId = selectedClass?.id || "") => {
    if (!classId) return;
    try {
      const [assignmentRes, messageRes] = await Promise.all([
        apiFetch<any>(`/api/classes/${classId}/assignments`),
        apiFetch<any>(`/api/classes/${classId}/messages`),
      ]);
      setAssignments(assignmentRes.assignments || []);
      setOnlineTests(assignmentRes.onlineTests || []);
      setMessages(messageRes.messages || []);
    } catch (e: any) {
      notify(e?.message || "Không tải được dữ liệu lớp.", "error");
    }
  };

  useEffect(() => { loadClasses(); }, [currentUser?.email]);
  useEffect(() => { if (selectedClass?.id) loadClassData(selectedClass.id); }, [selectedClass?.id]);

  useEffect(() => {
    if (!result || !activeTest) return;

    let cancelled = false;
    const questions = flattenQuestions(activeTest.exam);
    if (!questions.length) return;

    setAutoExplainLoading(true);
    (async () => {
      for (const q of questions) {
        if (cancelled) break;
        const id = q.id || String(questions.indexOf(q));
        const existing = String(q.explanation || "").trim();
        const needsAi = !existing || /^trích xuất từ tài liệu/i.test(existing) || existing.length < 35;
        if (!needsAi) {
          setAutoExplanations(prev => ({ ...prev, [id]: existing }));
          continue;
        }
        const normalizedQuestion = {
          ...q,
          id,
          correctValue: q.correctValue || q.correctAnswer || q.answer || "",
          explanation: q.explanation || ""
        };
        const text = await explainQuestionWithAI(normalizedQuestion, answers[id] || "", activeTest.test.title);
        if (!cancelled) setAutoExplanations(prev => ({ ...prev, [id]: text }));
      }
      if (!cancelled) setAutoExplainLoading(false);
    })();

    return () => { cancelled = true; };
  }, [result?.attempt?.id, activeTest?.test?.id]);


  const joinClass = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return notify("Nhập mã lớp trước đã nhé.", "error");
    setLoading(true);
    try {
      const res = await apiFetch<any>("/api/classes/join", { method: "POST", body: JSON.stringify({ code }) });
      notify(`Đã tham gia lớp ${res.class?.name || code}.`);
      setJoinCode("");
      await loadClasses();
      if (res.class?.id) setSelectedClassId(res.class.id);
    } catch (e: any) {
      notify(e?.message || "Mã lớp không đúng hoặc lớp không tồn tại.", "error");
    } finally { setLoading(false); }
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || !selectedClass?.id) return;
    try {
      await apiFetch(`/api/classes/${selectedClass.id}/messages`, { method: "POST", body: JSON.stringify({ messageText: text }) });
      setChatInput("");
      loadClassData(selectedClass.id);
    } catch (e: any) {
      notify(e?.message || "Chưa gửi được tin nhắn.", "error");
    }
  };

  const startTest = async (test: OnlineTest) => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    setAutoExplanations({});
    try {
      const res = await apiFetch<any>(`/api/online-tests/${test.id}/start`, { method: "POST", body: JSON.stringify({}) });
      setActiveTest({ test, attempt: res.attempt, exam: res.exam || {} });
    } catch (e: any) {
      notify(e?.message || "Bài kiểm tra chưa mở hoặc đã đóng.", "error");
    } finally { setLoading(false); }
  };

  const submitTest = async () => {
    if (!activeTest) return;
    setLoading(true);
    try {
      const res = await apiFetch<any>(`/api/online-tests/${activeTest.test.id}/submit`, { method: "POST", body: JSON.stringify({ answers }) });
      setResult(res);
      notify("Đã nộp bài kiểm tra.");
    } catch (e: any) {
      notify(e?.message || "Không nộp được bài.", "error");
    } finally { setLoading(false); }
  };

  if (!currentUser) {
    return <section className="student-class-page"><style>{studentClassCss}</style><div className="sc-empty">Bạn cần đăng nhập để vào lớp học.</div></section>;
  }

  const questions = activeTest ? flattenQuestions(activeTest.exam) : [];

  return <section className="student-class-page"><style>{studentClassCss}</style>
    <div className="sc-head">
      <div>
        <span>🧑‍🏫 Lớp học của tôi</span>
        <h1>Lớp học</h1>
        <p>Xem lớp đã tham gia, nhập mã lớp mới, nhận tài nguyên, làm bài kiểm tra và chat nội bộ.</p>
      </div>
      <button onClick={() => { loadClasses(); if (selectedClass?.id) loadClassData(selectedClass.id); }}>{loading ? <Loader2 className="spin" size={18}/> : <RefreshCw size={18}/>} Làm mới</button>
    </div>

    {status && <div className={`sc-status ${status.type}`}>{status.text}</div>}

    <div className="sc-grid">
      <aside className="sc-panel">
        <h2>Tham gia lớp</h2>
        <div className="sc-join"><input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Nhập mã lớp..." onKeyDown={e => e.key === "Enter" && joinClass()}/><button onClick={joinClass}>Vào lớp</button></div>
        <h2>Danh sách lớp</h2>
        <div className="sc-class-list">
          {classes.map(c => <button key={c.id} className={selectedClass?.id === c.id ? "active" : ""} onClick={() => setSelectedClassId(c.id)}><b>{c.name}</b><span>GV: {c.teacher?.name || c.teacher?.email || "—"}</span><code>{c.code}</code></button>)}
          {!classes.length && <div className="sc-empty">Bạn chưa tham gia lớp nào. Nhập mã lớp giáo viên gửi để bắt đầu.</div>}
        </div>
      </aside>

      <main className="sc-main">
        {!selectedClass ? <div className="sc-empty big">Chọn hoặc nhập mã lớp để xem tài nguyên và bài kiểm tra.</div> : activeTest ? <div className="sc-panel">
          <div className="sc-test-head"><div><span>Đang làm bài</span><h2>{activeTest.test.title}</h2><p>{activeTest.test.duration_minutes} phút · {questions.length} câu</p></div><button className="soft" onClick={() => { setActiveTest(null); setResult(null); setAnswers({}); setAutoExplanations({}); if (selectedClass?.id) loadClassData(selectedClass.id); }}>← Thoát về lớp học</button></div>
          {questions.map((q: any, index: number) => {
            const qid = q.id || String(index);
            const detail = result?.detail?.find?.((d: any) => d.questionId === qid);
            const correctAnswer = detail?.correctAnswer || q.correctValue || q.correctAnswer || q.answer || "";
            return <div className="sc-question" key={qid}>
              <b>Câu {index + 1}. {q.question}</b>
              {Array.isArray(q.options) ? q.options.map((option: string) => <label key={option}><input type="radio" name={qid} checked={answers[qid] === option} disabled={!!result} onChange={() => setAnswers(prev => ({ ...prev, [qid]: option }))}/>{option}</label>) : <textarea value={answers[qid] || ""} disabled={!!result} onChange={e => setAnswers(prev => ({ ...prev, [qid]: e.target.value }))} placeholder="Nhập câu trả lời..."/>}
              {result && <div className="sc-explain">
                <div><b>Em chọn:</b> {answers[qid] || "Không trả lời"}</div>
                <div><b>Đáp án đúng:</b> {correctAnswer || "Đang cập nhật"}</div>
                <div className="sc-explain-box">
                  <b>Giải thích chi tiết tự động:</b>
                  {autoExplanations[qid] ? <MarkdownRenderer content={autoExplanations[qid]} /> : <p>{autoExplainLoading ? "FoxieAI đang tạo lời giải cho câu này..." : (q.explanation || detail?.explanation || "Chưa có giải thích.")}</p>}
                </div>
              </div>}
            </div>;
          })}
          {!questions.length && <div className="sc-empty">Bài kiểm tra này chưa có dữ liệu câu hỏi.</div>}
          {result && <div className="sc-result"><CheckCircle2 size={20}/> Điểm: <b>{result.score ?? "Đã nộp"}</b></div>}
          {result && <div className="sc-actions"><button onClick={() => { setActiveTest(null); setResult(null); setAnswers({}); setAutoExplanations({}); if (selectedClass?.id) loadClassData(selectedClass.id); }}>← Hoàn thành, quay lại lớp học</button></div>}
          {!result && <div className="sc-actions"><button disabled={!questions.length || loading} onClick={submitTest}>{loading ? "Đang nộp..." : "Nộp bài"}</button></div>}
        </div> : <>
          <div className="sc-class-hero">
            <div><span><School size={16}/> Lớp đang học</span><h2>{selectedClass.name}</h2><p>Giáo viên: {selectedClass.teacher?.name || selectedClass.teacher?.email || "—"}</p></div>
            {selectedClass.meeting_url && <a href={selectedClass.meeting_url} target="_blank" rel="noreferrer"><Video size={17}/> Vào lớp online</a>}
          </div>

          <div className="sc-two">
            <div className="sc-panel"><h2><BookOpenCheck size={20}/> Tài nguyên lớp học</h2>{resources.map(a => <div className="sc-row" key={a.id}><div><b>{a.title}</b><span>{a.description || a.payload?.fileName || a.target || "Tài nguyên giáo viên đăng"}</span></div>{(a.payload?.fileData || a.target) && <a href={a.payload?.fileData ? `data:${a.payload?.mimeType || "application/octet-stream"};base64,${a.payload.fileData}` : a.target} download={a.payload?.fileName || undefined} target="_blank" rel="noreferrer"><Download size={15}/> Mở</a>}</div>)}{!resources.length && <div className="sc-empty">Chưa có tài nguyên trong lớp này.</div>}</div>
            <div className="sc-panel"><h2><FileText size={20}/> Bài kiểm tra trực tuyến</h2>{onlineTests.map(t => <div className="sc-row" key={t.id}><div><b>{t.title}</b><span><Clock size={13}/> Mở: {fmt(t.open_at)} · Đóng: {fmt(t.close_at)} · {t.duration_minutes} phút</span></div><button onClick={() => startTest(t)}>Làm bài</button></div>)}{!onlineTests.length && <div className="sc-empty">Chưa có bài kiểm tra được giao.</div>}</div>
          </div>

          <div className="sc-panel sc-chat"><h2><MessageCircle size={20}/> Chat nội bộ</h2><div className="sc-chat-body">{messages.map(m => <div key={m.id} className={(m.user_id === userId) ? "mine" : "other"}><div><b>{m.profiles?.name || (m.user_id === userId ? "Bạn" : "Thành viên")}</b><p>{m.emoji || ""} {m.message_text}</p><small>{fmt(m.created_at)}</small></div></div>)}{!messages.length && <div className="sc-empty">Chưa có tin nhắn trong lớp.</div>}</div><div className="sc-chat-input"><input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Nhắn cho lớp..." onKeyDown={e => e.key === "Enter" && sendMessage()}/><button onClick={sendMessage}><Send size={17}/></button></div></div>
        </>}
      </main>
    </div>
  </section>;
}

const studentClassCss = `
.student-class-page{font-family:Plus Jakarta Sans,Inter,system-ui,sans-serif;color:#10213f}.sc-head{background:linear-gradient(135deg,#fff7ed,#fff);border:1px solid #fed7aa;border-radius:30px;padding:26px;margin-bottom:18px;display:flex;justify-content:space-between;gap:18px;align-items:center}.sc-head span,.sc-class-hero span,.sc-test-head span{color:#ea580c;font-weight:950;font-size:13px}.sc-head h1{margin:6px 0;font-size:34px;letter-spacing:-1px}.sc-head p,.sc-class-hero p{margin:0;color:#64748b;font-weight:700}.sc-head button,.sc-join button,.sc-row button,.sc-actions button,.sc-class-hero a,.sc-test-head button{border:0;border-radius:17px;background:#f97316;color:#fff;padding:12px 16px;font-weight:950;display:inline-flex;gap:8px;align-items:center;cursor:pointer;text-decoration:none}.sc-test-head button.soft{background:#fff;border:1px solid #e8edf5;color:#475569}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.sc-status{border-radius:18px;padding:13px 16px;margin-bottom:16px;font-weight:850;border:1px solid}.sc-status.success{background:#ecfdf5;color:#059669;border-color:#bbf7d0}.sc-status.error{background:#fef2f2;color:#dc2626;border-color:#fecaca}.sc-status.info{background:#eff6ff;color:#2563eb;border-color:#bfdbfe}.sc-grid{display:grid;grid-template-columns:320px 1fr;gap:18px}.sc-panel{background:white;border:1px solid #e8edf5;border-radius:28px;padding:20px;box-shadow:0 12px 34px rgba(16,33,63,.04)}.sc-panel h2{margin:0 0 14px;display:flex;gap:8px;align-items:center;font-size:21px}.sc-join{display:flex;gap:8px;margin-bottom:22px}.sc-join input,.sc-chat-input input,.sc-question textarea{width:100%;border:1px solid #e8edf5;border-radius:16px;padding:12px 14px;font-weight:800;outline:none}.sc-class-list{display:grid;gap:10px}.sc-class-list button{background:#fff;border:1px solid #e8edf5;border-radius:20px;padding:14px;text-align:left;cursor:pointer}.sc-class-list button.active{background:#fff7ed;border-color:#fdba74}.sc-class-list b,.sc-class-list span,.sc-class-list code{display:block}.sc-class-list span,.sc-row span{color:#64748b;font-size:13px;font-weight:750;margin-top:4px}.sc-class-list code{color:#ea580c;font-weight:950;margin-top:5px}.sc-class-hero{background:white;border:1px solid #fed7aa;border-radius:30px;padding:24px;margin-bottom:18px;display:flex;justify-content:space-between;gap:18px;align-items:center}.sc-class-hero h2{font-size:30px;margin:8px 0 4px}.sc-two{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}.sc-row{border:1px solid #e8edf5;border-radius:20px;padding:14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px}.sc-row a{border:1px solid #fed7aa;color:#ea580c;border-radius:15px;padding:10px 12px;font-weight:950;text-decoration:none;display:inline-flex;gap:6px;align-items:center}.sc-empty{border:1px dashed #fdba74;background:#fff7ed;color:#9a3412;border-radius:18px;padding:16px;font-weight:850}.sc-empty.big{text-align:center;padding:50px}.sc-chat-body{background:#fff9f2;border:1px solid #fed7aa;border-radius:22px;padding:14px;min-height:260px;max-height:390px;overflow:auto}.mine,.other{display:flex;margin-bottom:10px}.mine{justify-content:flex-end}.mine>div,.other>div{max-width:78%;border-radius:18px;background:#fff;border:1px solid #fed7aa;padding:10px 12px}.mine>div{background:#f97316;color:#fff;border-color:#f97316}.mine p,.other p{margin:4px 0;font-weight:750}.mine small,.other small{opacity:.65}.sc-chat-input{display:flex;gap:10px;margin-top:12px}.sc-chat-input button{border:0;border-radius:16px;background:#f97316;color:white;padding:0 15px}.sc-test-head{display:flex;justify-content:space-between;gap:18px;align-items:center;border-bottom:1px solid #e8edf5;padding-bottom:14px;margin-bottom:14px}.sc-test-head h2{margin:5px 0}.sc-test-head p{margin:0;color:#64748b;font-weight:750}.sc-question{border:1px solid #e8edf5;border-radius:20px;padding:16px;margin-bottom:12px}.sc-question b{display:block;margin-bottom:10px}.sc-question label{display:block;border:1px solid #eef2f7;border-radius:15px;padding:10px 12px;margin:8px 0;font-weight:750;cursor:pointer}.sc-question input{margin-right:8px}.sc-result{background:#ecfdf5;color:#047857;border:1px solid #bbf7d0;border-radius:18px;padding:14px;font-weight:950;display:flex;gap:8px;align-items:center}.sc-explain{margin-top:12px;border-top:1px solid #eef2f7;padding-top:12px;color:#475569;font-size:13px;font-weight:750}.sc-explain-box{margin-top:10px;background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:12px;line-height:1.55}.sc-explain-box p{margin:6px 0 0}.sc-actions{display:flex;justify-content:flex-end;margin-top:12px}.sc-actions button:disabled{opacity:.55;cursor:not-allowed}@media(max-width:1000px){.sc-grid,.sc-two{grid-template-columns:1fr}.sc-head,.sc-class-hero,.sc-test-head{flex-direction:column;align-items:flex-start}}`;
