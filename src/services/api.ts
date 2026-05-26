import { Question } from "../types";

export interface ExplanationResponse {
  success: boolean;
  explanation: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
}

/**
 * Service to handle all client-side communication with the Express back-end
 */
export async function explainQuestionWithAI(
  q: Question,
  userAnswer?: string,
  topicTitle?: string
): Promise<string> {
  try {
    const response = await fetch("/api/explain-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q.question,
        options: q.options,
        userAnswer: userAnswer || "Người học xem đáp án chi tiết trực tiếp",
        correctValue: q.correctValue,
        explanation: q.explanation,
        topicContext: topicTitle || "Ôn tập kiến thức"
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      if (errData && errData.explanation) {
        return errData.explanation;
      }
      throw new Error("HTTP error " + response.status);
    }

    const data = await response.json();
    if (data.success) {
      return data.explanation;
    } else {
      return data.explanation || `### 💡 Hướng dẫn đáp án từ Hệ thống:\n\n* **Đáp án chính xác**: **${q.correctValue}**\n\n**Giải thích chi tiết**:\n${q.explanation}\n\n*Bài này tập trung kiểm tra trọng điểm ngữ pháp hoặc phát âm lớp 9. Hãy rà soát lại lý thuyết để nắm vững bài thi thực tế nhé!*`;
    }
  } catch (err) {
    console.error("Error fetching AI explanation from back-end:", err);
    return `### 📡 Mất Kết Nối Hệ Thống\n\nKhông thể tải giải nghĩa AI từ FoxieAI lúc này. Gợi ý làm bài từ đáp án chuẩn:\n\n* **Đáp án**: ${q.correctValue}\n* **Chi tiết gợi ý**: ${q.explanation}`;
  }
}

export async function sendAIChatMessage(
  message: string,
  chatHistory: Array<{ sender: "user" | "ai"; text: string }>,
  activeUnit?: any,
  activeExam?: any
): Promise<string> {
  try {
    const messages = [
      ...chatHistory.map((msg) => ({
        role: msg.sender === "ai" ? "assistant" : "user",
        content: msg.text
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        messages,
        chatHistory,
        activeUnit,
        activeExam
      })
    });

    const data = await response.json().catch(() => null);

    const aiText =
      data?.reply ||
      data?.text ||
      data?.message ||
      "";

    if (!response.ok) {
      if (aiText) {
        return aiText;
      }

      return `FoxieAI chưa kết nối được Gemini. Lỗi backend: ${
        data?.error || `HTTP ${response.status}`
      }`;
    }

    return (
      aiText ||
      "FoxieAI chưa có câu trả lời. Bạn thử hỏi lại theo cách khác nhé."
    );
  } catch (err: any) {
    console.error("Error communicating with FoxieAI Gemini backend:", err);
    return `FoxieAI chưa kết nối được Gemini. Lỗi kết nối frontend/backend: ${
      err?.message || "Không rõ lỗi"
    }. Hãy mở http://localhost:3000/api/health để kiểm tra server có đọc được GEMINI_API_KEY chưa.`;
  }
}
