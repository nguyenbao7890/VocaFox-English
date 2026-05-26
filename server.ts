import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { mockExams } from "./src/data/mockExams";

// Load environment variables from the project root.
// Important on Windows/VS Code: the server only reads .env when it starts.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("[VocaFox ENV]", {
  cwd: process.cwd(),
  hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
  geminiModel: process.env.GEMINI_MODEL || "auto",
});

const app = express();
const PORT = Number(process.env.PORT || 3000);

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.APP_URL
].filter(Boolean) as string[]);

// Enable JSON and URL-encoded parsing. Keep payloads bounded so public API routes cannot be abused easily.
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

app.use("/api", (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else if (origin && process.env.NODE_ENV === "production") {
    return res.status(403).json({ success: false, error: "Forbidden origin" });
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Lazy-initialization helper for Gemini SDK to prevent startup crashes
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function fetchTextFromPublicDocument(sourceUrl: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    throw new Error("Link tài liệu không hợp lệ.");
  }

  if (!/^https?:$/.test(url.protocol)) {
    throw new Error("Chỉ hỗ trợ link http/https.");
  }

  const host = url.hostname.toLowerCase();
  let fetchUrl = sourceUrl;

  if (host.includes("docs.google.com") && url.pathname.includes("/document/")) {
    fetchUrl = sourceUrl.replace(/\/edit.*$/i, "/export?format=txt").replace(/\/view.*$/i, "/export?format=txt");
    if (!fetchUrl.includes("/export?format=txt")) fetchUrl += "/export?format=txt";
  } else if (host.includes("docs.google.com") && url.pathname.includes("/spreadsheets/")) {
    fetchUrl = sourceUrl.replace(/\/edit.*$/i, "/export?format=csv").replace(/\/view.*$/i, "/export?format=csv");
    if (!fetchUrl.includes("/export?format=csv")) fetchUrl += "/export?format=csv";
  }

  const response = await fetch(fetchUrl, {
    redirect: "follow",
    headers: { "User-Agent": "VocaFoxExamImporter/1.0" }
  });

  if (!response.ok) {
    throw new Error("Không đọc được link tài liệu. Hãy đặt quyền xem công khai hoặc tải file lên trực tiếp.");
  }

  const contentType = response.headers.get("content-type") || "";
  if (/application\/pdf|image\//i.test(contentType)) {
    throw new Error("Link này là PDF/ảnh. Vui lòng tải file trực tiếp để AI đọc chính xác hơn.");
  }

  const text = await response.text();
  const cleaned = text.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s{3,}/g, " ")
    .trim();

  if (cleaned.length < 30) {
    throw new Error("Link tài liệu quá ngắn hoặc chưa có quyền truy cập công khai.");
  }

  return cleaned.slice(0, 180000);
}

// ==================== OFFLINE EDUCATION FALLBACK MATCHER ====================

function getOfflineResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes("wish") || msg.includes("ước")) {
    return `### 🌸 Cấu trúc Câu ước (Wish Clauses) lớp 9 Ôn Thi Tuyển Sinh

Trong chương trình Tiếng Anh 9 ôn thi vào lớp 10, câu ước là chủ điểm ngữ pháp chắc chắn xuất hiện trong bài thi. Có 3 loại câu ước cơ bản như sau:

1. **Ước ở tương lai (Future wish):** diễn tả mong muốn điều gì đó tốt đẹp xảy ra trong tương lai.
   * **Cấu trúc:** \`S1 + wish(es) + S2 + would/could + V-inf\`
   * *Ví dụ:* *I wish I could speak English fluently.* (Tôi ước mình có thể nói tiếng Anh trôi chảy.)

2. **Ước ở hiện tại (Present wish):** ước một điều trái với thực tế ở hiện tại (không có thật).
   * **Cấu trúc:** \`S1 + wish(es) + S2 + V_ed / V2\` (Đối với động từ tobe, dùng **WERE** cho tất cả các ngôi kể cả he, she, it)
   * *Ví dụ:* *I wish I had a mobile school app right now.* (Tôi ước bây giờ tôi có một ứng dụng học tập di động.) 

3. **Ước ở quá khứ (Past wish):** ước một điều trái với thực tế đã xảy ra trong quá khứ.
   * **Cấu trúc:** \`S1 + wish(es) + S2 + had + V_ed / V3\`
   * *Ví dụ:* *I wish I had studied harder yesterday.* (Tôi ước hôm qua tôi đã học chăm chỉ hơn.)

**💡 Mẹo làm bài thi tuyển sinh:** Trong câu hỏi trắc nghiệm, nếu vế sau có từ chỉ thời gian ở quá khứ (như *yesterday, last year*), hãy chọn ngay đáp án có **had + V3**. Nếu có từ ở hiện tại (*now, today*), hãy chọn động từ ở quá khứ đơn **V2/ed**.`;
  }
  
  if (msg.includes("phát âm") || msg.includes("ed") || msg.includes("phát âm đuôi") || msg.includes("pronun")) {
    return `### 📚 Bí quyết phát âm đuôi "-ed" và "-s" siêu tốc cho sĩ tử

Đề thi tuyển sinh lớp 10 luôn có ít nhất 1 câu hỏi tìm từ có phần gạch chân phát âm khác biệt. Hãy nhớ 3 nhóm nguyên tắc vàng dưới đây:

#### 1. Phát âm đuôi "-ed":
* **Phát âm là /id/:** Khi động từ kết thúc bằng âm /t/ hoặc /d/.
  * *Mẹo ghi nhớ nhanh:* **T**iền **Đ**ô.
  * *Ví dụ:* *wanted, needed, decided.*
* **Phát âm là /t/:** Khi động từ kết thúc bằng các phụ âm vô thanh: /p/, /k/, /f/, /s/, /ʃ/ (sh), /tʃ/ (ch).
  * *Mẹo ghi nhớ nhanh:* **P**hải **K**ính **S**ợ **F**hương (Phượng) **Sh**ao **Ch**anh.
  * *Ví dụ:* *stopped, cooked, missed, washed, watched, laughed.*
* **Phát âm là /d/:** Đối với các âm còn lại (các âm hữu thanh và nguyên âm).
  * *Ví dụ:* *played, learned, loved, opened.*

#### 2. Phát âm đuôi "-s/-es":
* **Phát âm là /iz/:** Khi từ tận cùng bằng: /s/, /z/, /ʃ/, /tʃ/, /dʒ/ (các ký tự e.g. s, x, z, ch, sh, ge).
  * *Mẹo nhớ:* **S**óng **X**anh **G**iờ **Ch**ờ **Sh**ark.
* **Phát âm là /s/:** Khi từ tận cùng bằng các phụ âm vô thanh: /p/, /t/, /k/, /f/, /θ/.
  * *Mẹo nhớ:* **Th**ảo **Ph**ải **T**hắp **K**ính **F**hương (Hương).
* **Phát âm là /z/:** Cho các từ còn lại.

**💡 Mẹo phòng thi cực đỉnh:** Khi vào phòng thi bạn hay viết nhanh các cụm chữ cái viết tắt mẹo ra nháp để rà soát đáp án chỉ trong vòng 5 giây!`;
  }
  
  if (msg.includes("trọng âm") || msg.includes("stress")) {
    return `### ⚡ Quy tắc nhấn Trọng âm (Word Stress) cứu cánh kỳ thi tuyển sinh 10

Học quy tắc trọng âm giúp bạn vượt qua 2 câu hỏi ngữ âm dễ dàng và giao tiếp tự nhiên hơn:

#### 1. Từ có 2 âm tiết:
* **Danh từ và Tính từ:** Thường nhấn trọng âm ở **âm tiết thứ nhất**.
  * *Ví dụ:* \`'happy\` (tính từ), \`'table\` (danh từ), \`'active\` (tính từ).
* **Động từ:** Thường nhấn trọng âm ở **âm tiết thứ hai**.
  * *Ví dụ:* \`de'cide\`, \`in'vite\`, \`be'gin\`, \`for'get\`.

#### 2. Từ có 3 âm tiết trở lên:
* Các từ tận cùng bằng **-tion, -sion, -ic, -ial, -ian**: Nhấn trọng âm ở **âm tiết ngay sát trước nó**.
  * *Ví dụ:* \`prepa'ration\`, \`scien'tific\`, \`de'cision\`, \`musician\`.
* Các từ tận cùng bằng **-y, -ce, -ge, -ate**: Nhấn vào **âm tiết thứ 3 tính từ dưới lên**.
  * *Ví dụ:* \`'biology\`, \`'generate\`, \`con'sider\`.

**⚠️ Điểm bẫy phòng thi tuyển sinh:** Một số từ 2 âm tiết vừa là danh từ vừa là động từ bẫy thay đổi vị trí trọng âm (ví dụ: \`'present\` là món quà, nhưng \`pre'sent\` lại là thuyết trình). Bạn nhớ ghi nhớ điểm này nhé!`;
  }
  
  if (msg.includes("so sánh kép") || msg.includes("double") || msg.includes("càng")) {
    return `### 🌟 Cấu trúc so sánh kép (Double Comparison) - Quy tắc "Càng... Thì Càng..."

So sánh kép là cấu trúc điểm 10 trong bài thi tự luận viết lại câu hoặc câu trắc nghiệm hoàn thành. 

#### Công thức khái quát:
\`The + [so sánh hơn] + S + V, the + [so sánh hơn] + S + V\`

1. **Với tính từ/trạng từ ngắn (1 âm tiết):**
   * \`The + adj-ER + S + V, the + adj-ER + S + V\`
   * *Ví dụ:* *The harder you study, the easier you find the exam.* (Bạn càng học chăm chỉ, bạn càng thấy đề thi dễ.)

2. **Với tính từ/trạng từ dài (2 âm tiết trở lên):**
   * \`The MORE + adj/adv + S + V, the MORE + adj/adv + S + V\`
   * *Ví dụ:* *The more comfortable the classroom is, the more focused the students are.* (Lớp học càng tiện lợi, học sinh càng tập trung.)

**💡 Mẹo làm bài thi cực nhanh:** 
Luôn tìm cụm từ bắt đầu bằng chữ "**The + so sánh hơn**" ở cả hai vế trong đáp án trắc nghiệm. Nhiều đề thi bẫy bằng cách thay đổi trật tự từ hoặc thiếu chữ "The" ở vế thứ hai. Đừng để bị lừa nhé!`;
  }
  
  if (msg.includes("passive") || msg.includes("bị động") || msg.includes("câu bị động")) {
    return `### ⚙️ Hướng dẫn Câu bị động (Passive Voice) siêu dễ nhớ

Câu bị động được dùng khi ta muốn nhấn mạnh vào hành động hoặc đối tượng bị tác động, thay vì người thực hiện hành động. 

#### Công thức chung: 
\`S + Be + V_ed/V3 + (by O)\`

#### Bảng chuyển đổi nhanh theo các thì trong chương trình tiếng Anh lớp 9:
1. **Hiện tại đơn:** \`S + am/is/are + V_ed/V3\`
2. **Quá khứ đơn:** \`S + was/were + V_ed/V3\`
3. **Hiện tại hoàn thành:** \`S + have/has + been + V_ed/V3\`
4. **Động từ khuyết thiếu (can, must, should):** \`S + can/must/should + be + V_ed/V3\`

*Ví dụ chủ động:* *They built this school in 2020.*
*Chuyển sang bị động:* *This school was built in 2020.*

**💡 Bí quyết tự ôn thi:** Chú ý rằng các động từ không có tân ngữ trực tiếp đi kèm sẽ không có dạng bị động (ví dụ: *happen, arrive, go, look*). Bạn nhớ phân biệt để làm bài đúng nhé!`;
  }
  
  if (msg.includes("phrasal verb") || msg.includes("cụm động từ") || msg.includes("verb") || msg.includes("từ vựng")) {
    return `### 📑 Tổng hợp Cụm động từ (Phrasal Verbs) Tiếng Anh 9 hay gặp nhất

Các cụm động từ này thường xuất hiện trong các câu hỏi chọn đáp án đúng hoặc bài đọc điền từ của đề thi vào 10:

1. **Look forward to + V-ing:** Mong đợi, trông chờ điều gì.
   * *Ví dụ:* *I look forward to hearing from you.*
2. **Keep up with (someone/something):** Theo kịp, đuổi kịp ai đó.
   * *Ví dụ:* *You need to run faster to keep up with them.*
3. **Go on with / Carry on:** Tiếp tục làm gì.
   * *Ví dụ:* *Please go on with your English homework.*
4. **Give up:** Từ bỏ, bỏ cuộc.
   * *Ví dụ:* *Never give up on your dreams.*
5. **Get over (an illness/a problem):** Vượt qua, hồi phục sau khó khăn.
   * *Ví dụ:* *She finally got over her stage fright.*
6. **Take care of / Look after:** Chăm sóc, bảo vệ.
   * *Ví dụ:* *We must take care of our pets.*

**💡 Mẹo làm bài thi tuyển sinh:** Sau giới từ thường là động từ dạng **V-ing**. Đối với cụm "look forward to", chữ "to" là giới từ nên động từ theo sau bắt buộc phải ở dạng **V-ing** nhé!`;
  }
  
  if (msg.includes("mẹo") || msg.includes("bí quyết") || msg.includes("đề thi") || msg.includes("phòng thi") || msg.includes("thi thử") || msg.includes("lời khuyên")) {
    return `### 🏆 5 Bí quyết bứt phá điểm số thi Tiếng Anh vào 10 chuẩn xác

Dưới đây là kế hoạch chiến thuật giúp bạn chinh phục kỳ thi tuyển sinh lớp 10 đạt kết quả cao nhất từ FoxieAI:

1. **Luyện đề thi thử hằng ngày:** Sử dụng ngay mục "Đề thi thử" trực tiếp trên VocaFox để rèn luyện tốc độ làm bài trong 90 phút và quen áp lực thời gian thực tế.
2. **Học từ vựng theo cụm từ (Collocations & Idioms):** Đề thi tuyển sinh lớp 10 đặc biệt chuộng các cụm như *look forward to, depend on, have a good time*.
3. **Tìm và sửa lỗi sai:** Sau khi làm bài tập hay thi đề, hãy nhấn phân tích lời giải sư phạm chi tiết để phát hiện ra lỗi sai ngờ nghệch, ghi lại vào sổ tay để không lặp lại lần thứ hai.
4. **Sử dụng phương pháp loại trừ:** Đối với các câu hỏi khoai như ngữ âm hay tìm từ đồng nghĩa/trái nghĩa, hãy tìm các từ bạn biết rõ nghĩa nhất để loại trừ dần phương án khác.
5. **Phân bổ thời gian thông minh:** Dành 10 phút đầu làm các câu hỏi ngữ âm, trọng âm và từ vụng ngắn; 40 phút dành cho bài đọc hiểu và chọn đáp án dài; 15 phút cuối rà soát kiểm tra lại tô đáp án và các lỗi chính tả.

Chúc bạn sĩ tử ôn thi thật tập trung, giữ sức khỏe và đạt điểm số tối đa nhé!`;
  }
  
  // Default greeting / response
  return `Chào bạn! Tôi là trợ lý ảo FoxieAI - người đồng hành thông minh cùng học sinh lớp 9 ôn luyện Tiếng Anh bám sát SGK chuẩn mới (Global Success) và luyện thi chuyển cấp vào lớp 10.

*(Lưu ý nhỏ: Hệ thống phát hiện mã khóa GEMINI_API_KEY trong Settings bị trống hoặc đã hết hạn sử dụng. Tuy nhiên, tôi đã kích hoạt hệ dẫn đường offline thông minh để luôn sẵn sàng giảng bài, giải thích ngữ pháp và từ vựng hỗ trợ bạn học tập không gián đoạn!)*

Bạn hãy nhập hoặc hỏi tôi các câu hỏi học tập như sau:
* **"Công thức câu ước wish là gì?"**
* **"Mẹo phát âm ed nhanh nhất?"**
* **"Mẹo làm bài thi so sánh kép càng càng?"**
* **"Chỉ tôi quy tắc trọng âm 2 âm tiết?"**
* **"Các cụm phrasal verb hay gặp lớp 9?"**
* **"Chiến thuật phân bổ thời gian phòng thi vào 10?"**

Hãy gõ câu hỏi và tôi sẽ giải đáp chi tiết cùng giải pháp giúp bạn ôn luyện đạt điểm cao nhất!`;
}

function getOfflineQuestionExplanation(
  question: string, 
  userAnswer: string, 
  correctValue: string, 
  explanation: string = "", 
  topicContext: string = ""
): string {
  const isCorrect = String(userAnswer).trim().toLowerCase() === String(correctValue).trim().toLowerCase();
  
  return `### Lời Giải Thích Học Liệu Sư Phạm Từ FoxieAI 

Chào bạn học sinh thân mến! Dưới đây là phần giải tích câu hỏi tuyển sinh của bạn từ hệ thống học tập VocaFox:

* **Chủ đề ngữ pháp:** ${topicContext || "Ngữ pháp / Từ vựng Tiếng Anh 9 tổng hợp"}
* **Câu hỏi:** "${question}"
* **Câu trả lời của bạn:** \`${userAnswer || "Chưa trả lời"}\` 
* **Đáp án đúng:** \`${correctValue}\`
* **Kết quả:** ${isCorrect ? "🎉 **Chính xác! Bạn học rất xuất sắc.**" : "💪 **Chưa chính xác. Đừng nản lòng, chúng ta cùng học từ lỗi sai này nhé!**"}

#### ✍️ Phân tích bài tập & giải bẫy chi tiết:
1. ${explanation ? explanation : `Câu này kiểm tra kiến thức về ${topicContext || "ngữ pháp ôn thi vào lớp 10"}. Bạn cần chú ý cấu trúc của từ, bối cảnh thì của câu để lựa chọn đáp án chính xác.`}
2. **Dịch nghĩa câu:** Câu trên được dịch nghĩa tổng quan là: "*${question.replace(/"/g, "")}*"
3. **Mẹo phòng thi:** Khi gặp dạng câu này trong đề thi thật, luôn gạch chân dưới các từ chỉ thời gian, trạng từ hoặc động từ chính để tìm ra dấu hiệu nhận biết thì hoặc cấu trúc đi kèm (Ví dụ: Nếu có *yesterday* thì chọn Quá khứ đơn, nếu có *wish* thì lùi thì...).

*(Lưu ý: Do mã khóa GEMINI_API_KEY trong Settings có thể đã hết hạn, hệ thống đã tự động kích hoạt chế độ giải đề offline thông minh để bảo đảm quyền lợi học tập liên tục của bạn!)*

Chúc bạn ôn tập thật tốt và tự tin chinh phục điểm cao tuyển sinh vào 10 nhé!`;
}


// ==================== GEMINI REST CHAT HELPER ====================

function cleanGeminiApiKey(rawKey?: string): string {
  return (rawKey || "")
    .trim()
    .replace(/^GEMINI_API_KEY\s*=\s*/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function getGeminiApiKey(): string {
  return cleanGeminiApiKey(process.env.GEMINI_API_KEY);
}

function cleanAITextForMobile(rawText: string): string {
  return (rawText || "")
    // Remove fenced code markers but keep the code/text inside.
    .replace(/```[a-zA-Z0-9_-]*\n?/g, "")
    .replace(/```/g, "")
    // Remove Markdown quote markers.
    .replace(/^>\s?/gm, "")
    // Convert common LaTeX text commands to readable text.
    .replace(/\\text\{([^}]*)\}/g, "$1")
    .replace(/\\mathrm\{([^}]*)\}/g, "$1")
    .replace(/\\mathbf\{([^}]*)\}/g, "$1")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    // Remove LaTeX delimiters.
    .replace(/\$\$/g, "")
    .replace(/\$/g, "")
    .replace(/\\\(/g, "")
    .replace(/\\\)/g, "")
    .replace(/\\\[/g, "")
    .replace(/\\\]/g, "")
    // Make subscript/superscript readable on mobile.
    .replace(/_\{([^}]*)\}/g, "$1")
    .replace(/\^\{([^}]*)\}/g, "$1")
    .replace(/_([A-Za-z0-9]+)/g, "$1")
    .replace(/\^([A-Za-z0-9]+)/g, "$1")
    // Replace common LaTeX operators.
    .replace(/\\times/g, "x")
    .replace(/\\cdot/g, "·")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\Rightarrow/g, "→")
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\:/g, " ")
    .replace(/\\_/g, "_")
    // Reduce Markdown emphasis noise.
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    // Clean spacing.
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}


type GeminiChatResult = {
  ok: boolean;
  text?: string;
  error?: string;
  status?: number;
  model?: string;
};

async function discoverGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok || !Array.isArray(data?.models)) {
      return [];
    }

    const supported = data.models
      .filter((model: any) =>
        Array.isArray(model?.supportedGenerationMethods) &&
        model.supportedGenerationMethods.includes("generateContent")
      )
      .map((model: any) => String(model?.name || "").replace(/^models\//, ""))
      .filter(Boolean);

    const preferredOrder = [
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite"
    ];

    return [
      ...preferredOrder.filter((name: string) => supported.includes(name)),
      ...supported.filter((name: string) => /flash|pro/i.test(name) && !preferredOrder.includes(name)),
      ...supported.filter((name: string) => !preferredOrder.includes(name)),
    ];
  } catch (error) {
    console.warn("Could not discover Gemini models:", error);
    return [];
  }
}

async function callGeminiChatRest(params: {
  userMessage: string;
  conversationText: string;
  systemInstruction: string;
  contextStr: string;
}): Promise<GeminiChatResult> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      error: "Thiếu GEMINI_API_KEY. Hãy tạo file .env cùng cấp package.json, sau đó tắt server và chạy lại npm start.",
    };
  }

  const envModel = (process.env.GEMINI_MODEL || "").trim();
  const fallbackModels = [
    envModel,
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ].filter(Boolean);

  const discoveredModels = await discoverGeminiModels(apiKey);
  const modelsToTry = Array.from(new Set([...fallbackModels, ...discoveredModels]));

  if (modelsToTry.length === 0) {
    return {
      ok: false,
      status: 502,
      error: "Không tìm thấy model Gemini nào hỗ trợ generateContent. Kiểm tra API key trong Google AI Studio.",
    };
  }

  const promptText = `
Bối cảnh ứng dụng:
${params.contextStr}

Lịch sử hội thoại gần đây:
${params.conversationText}

Tin nhắn mới nhất của người dùng:
${params.userMessage}

Hãy trả lời tin nhắn mới nhất một cách hữu ích, đúng trọng tâm.
`;

  let lastError = "";

  for (const modelName of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: params.systemInstruction }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 1600,
            },
          }),
        }
      );

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        lastError = data?.error?.message || `HTTP ${response.status}`;
        console.warn(`Gemini REST failed with ${modelName}:`, lastError);
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts
        ?.map((part: any) => part?.text || "")
        .join("")
        .trim();

      if (text) {
        return {
          ok: true,
          text: cleanAITextForMobile(text),
          model: modelName,
        };
      }

      lastError = `Model ${modelName} không trả về nội dung.`;
    } catch (error: any) {
      lastError = error?.message || String(error);
      console.warn(`Gemini REST exception with ${modelName}:`, lastError);
    }
  }

  return {
    ok: false,
    status: 502,
    error: lastError || "Không gọi được Gemini API. Kiểm tra GEMINI_API_KEY, GEMINI_MODEL, quota hoặc billing của Google AI Studio.",
  };
}



async function callGeminiExamRest(params: {
  promptText: string;
  systemInstruction: string;
  fileData?: string;
  mimeType?: string;
}): Promise<GeminiChatResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return { ok: false, status: 500, error: "Thiếu GEMINI_API_KEY." };

  const envModel = (process.env.GEMINI_MODEL || "").trim();
  const fallbackModels = [envModel, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite"].filter(Boolean);
  const modelsToTry = Array.from(new Set([...fallbackModels, ...(await discoverGeminiModels(apiKey))]));
  let lastError = "";

  for (const modelName of modelsToTry) {
    try {
      const parts: any[] = [{ text: params.promptText }];
      if (params.fileData && params.mimeType) {
        parts.push({ inline_data: { mime_type: params.mimeType, data: params.fileData } });
      }
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: params.systemInstruction }] },
            contents: [{ role: "user", parts }],
            generationConfig: { temperature: 0.35, topP: 0.9, maxOutputTokens: 5000 },
          }),
        }
      );
      const data: any = await response.json().catch(() => ({}));
      if (!response.ok) {
        lastError = data?.error?.message || `HTTP ${response.status}`;
        continue;
      }
      const text = data?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text || "").join("").trim();
      if (text) return { ok: true, text, model: modelName };
      lastError = `Model ${modelName} không trả về nội dung.`;
    } catch (error: any) {
      lastError = error?.message || String(error);
    }
  }
  return { ok: false, status: 502, error: lastError || "Không gọi được Gemini API." };
}


// ==================== SUPABASE DATA LAYER ====================

type AppRole = "student" | "teacher" | "admin";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "thanhbinh2082004@gmail.com,nbao8887@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdmin;
}

async function getAuthedUser(req: express.Request) {
  const client = getSupabaseAdmin();
  if (!client) throw new Error("Thiếu SUPABASE_URL/VITE_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trên server.");
  const raw = String(req.headers.authorization || "");
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : "";
  const { data, error } = await client.auth.getUser(token);

if (error || !data.user) {
  console.warn("[Supabase auth.getUser failed]", {
    message: error?.message,
    status: error?.status,
    supabaseUrl,
    tokenPrefix: token.slice(0, 30),
  });

  throw new Error(
    error?.message
      ? `Token Supabase không hợp lệ: ${error.message}`
      : "Token Supabase không hợp lệ."
  );
}

return data.user;
}

async function isAdminEmail(email?: string | null): Promise<boolean> {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return false;

  // Keep .env support as an emergency/static fallback.
  if (ADMIN_EMAILS.includes(normalizedEmail)) return true;

  const client = getSupabaseAdmin();
  if (!client) return false;

  const { data, error } = await client
    .from("admin_emails")
    .select("email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    // If the table is missing or temporarily unavailable, do not break login.
    // Static ADMIN_EMAILS above still works.
    console.warn("[admin_emails] lookup failed:", error.message);
    return false;
  }

  return Boolean(data);
}

async function normalizeRole(email: string, role?: string): Promise<AppRole> {
  // Public signup metadata is never allowed to create an admin account.
  // Admin rights are granted only from server-side ADMIN_EMAILS or the admin_emails table.
  if (await isAdminEmail(email)) return "admin";
  return role === "teacher" ? "teacher" : "student";
}

async function profileFromAuthUser(user: any, existing?: any) {
  const email = String(user.email || existing?.email || "").toLowerCase();
  const meta = user.user_metadata || {};
  const role = await normalizeRole(email, existing?.role || meta.role);
  return {
    id: user.id,
    email,
    name: existing?.name || meta.name || meta.full_name || email.split("@")[0] || "Học viên VocaFox",
    role,
    is_pro: role === "admin" ? true : !!existing?.is_pro,
    completed_units: existing?.completed_units || [],
    study_streak: Number(existing?.study_streak || 0),
    usage_time_seconds: Number(existing?.usage_time_seconds || 0),
    updated_at: new Date().toISOString(),
  };
}

async function ensureProfile(user: any) {
  const client = getSupabaseAdmin();
  if (!client) throw new Error("Supabase server client chưa được cấu hình.");
  const { data: existing } = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const profile = await profileFromAuthUser(user, existing);
  const { data, error } = await client.from("profiles").upsert(profile).select("*").single();
  if (error) throw error;
  return data;
}

async function requireProfile(req: express.Request) {
  const user = await getAuthedUser(req);
  const profile = await ensureProfile(user);
  return { user, profile };
}

function requireAdmin(profile: any) {
  if (profile.role !== "admin") throw new Error("Bạn không có quyền Admin.");
}
function requireTeacherOrAdmin(profile: any) {
  if (profile.role !== "teacher" && profile.role !== "admin") throw new Error("Bạn không có quyền giáo viên.");
}
async function logActivity(userId: string, eventType: string, meta: Record<string, any> = {}) {
  const client = getSupabaseAdmin();
  if (!client) return;

  const { error } = await client
    .from("activity_events")
    .insert({ user_id: userId, event_type: eventType, meta });

  // Activity logging must never block login/dashboard loading.
  // Some @supabase/supabase-js versions do not support .throwOnError(),
  // so handle the returned error object directly instead.
  if (error) {
    console.warn("[activity_events] insert failed:", error.message);
  }
}

app.get("/api/me", async (req, res) => {
  try {
    const { user, profile } = await requireProfile(req);
    await logActivity(user.id, "login_seen");
    res.json({ success: true, user: {
      uid: profile.id, name: profile.name, email: profile.email, role: profile.role,
      isPro: !!profile.is_pro, completedUnits: profile.completed_units || [],
      studyStreak: Number(profile.study_streak || 0), classCode: profile.class_code || null,
    }});
  } catch (error: any) { res.status(401).json({ success: false, error: error.message }); }
});

app.put("/api/profile/role", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    if (profile.role === "admin") {
      return res.json({ success: true, role: "admin" });
    }
    const nextRole = req.body.role === "teacher" ? "teacher" : "student";
    const client = getSupabaseAdmin()!;
    const { data, error } = await client
      .from("profiles")
      .update({ role: nextRole, updated_at: new Date().toISOString() })
      .eq("id", profile.id)
      .select("role")
      .single();
    if (error) throw error;
    await logActivity(profile.id, "role_updated", { role: nextRole });
    res.json({ success: true, role: data.role });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get("/api/units", async (_req, res) => {
  try {
    const client = getSupabaseAdmin();
    if (!client) throw new Error("Supabase chưa được cấu hình.");
    const { data, error } = await client.from("units").select("*").order("id", { ascending: true });
    if (error) throw error;
    res.json({ success: true, units: (data || []).map((r: any) => r.content || r) });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.post("/api/units", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireAdmin(profile);
    const unit = req.body.unit || req.body;
    if (!unit?.id || !unit?.title) throw new Error("Unit cần có id và title.");
    const client = getSupabaseAdmin()!;
    const { data, error } = await client.from("units").insert({ id: Number(unit.id), title: unit.title, content: unit, updated_by: profile.id }).select("*").single();
    if (error) throw error;
    await logActivity(profile.id, "unit_created", { unitId: unit.id });
    res.json({ success: true, unit: data.content });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.put("/api/units/:id", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireAdmin(profile);
    const unit = req.body.unit || req.body;
    const client = getSupabaseAdmin()!;
    const { data, error } = await client.from("units").upsert({ id: Number(req.params.id), title: unit.title || `Unit ${req.params.id}`, content: unit, updated_by: profile.id, updated_at: new Date().toISOString() }).select("*").single();
    if (error) throw error;
    await logActivity(profile.id, "unit_updated", { unitId: req.params.id });
    res.json({ success: true, unit: data.content });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.delete("/api/units/:id", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireAdmin(profile);
    const client = getSupabaseAdmin()!;
    const { error } = await client.from("units").delete().eq("id", Number(req.params.id));
    if (error) throw error;
    await logActivity(profile.id, "unit_deleted", { unitId: req.params.id });
    res.json({ success: true });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.get("/api/attempts", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const client = getSupabaseAdmin()!;
    const { data, error } = await client.from("exam_attempts").select("attempt").eq("user_id", profile.id).order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, attempts: (data || []).map((r: any) => r.attempt) });
  } catch (error: any) { res.status(401).json({ success: false, error: error.message }); }
});

app.post("/api/attempts", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const attempt = req.body.attempt;
    if (!attempt?.id) throw new Error("Thiếu attempt.id");
    const client = getSupabaseAdmin()!;
    const { error } = await client.from("exam_attempts").upsert({ id: attempt.id, user_id: profile.id, exam_id: attempt.examId, score: attempt.score, attempt });
    if (error) throw error;
    await logActivity(profile.id, "exam_submitted", { examId: attempt.examId, score: attempt.score });
    res.json({ success: true });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});

app.post("/api/progress/completed-unit", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const unitId = Number(req.body.unitId);
    const completed = Array.from(new Set([...(profile.completed_units || []), unitId])).filter(Boolean);
    const client = getSupabaseAdmin()!;
    const { error } = await client.from("profiles").update({ completed_units: completed, updated_at: new Date().toISOString() }).eq("id", profile.id);
    if (error) throw error;
    await logActivity(profile.id, "unit_completed", { unitId });
    res.json({ success: true, completedUnits: completed });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});

app.post("/api/usage/ping", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const seconds = Math.max(1, Math.min(300, Number(req.body.seconds || 30)));
    const client = getSupabaseAdmin()!;
    const { error } = await client.rpc("increment_usage_seconds", { p_user_id: profile.id, p_seconds: seconds });
    if (error) {
      const next = Number(profile.usage_time_seconds || 0) + seconds;
      await client.from("profiles").update({ usage_time_seconds: next }).eq("id", profile.id);
    }
    await logActivity(profile.id, "usage_ping", { seconds });
    res.json({ success: true });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});

app.get("/api/admin/stats", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireAdmin(profile);
    const client = getSupabaseAdmin()!;
    const [{ data: users, error: usersErr }, { data: attempts, error: attemptsErr }, { data: events, error: eventsErr }, { data: units, error: unitsErr }, { data: exams }, { data: classes }] = await Promise.all([
      client.from("profiles").select("id,name,email,role,is_pro,study_streak,completed_units,usage_time_seconds,created_at").order("created_at", { ascending: false }),
      client.from("exam_attempts").select("user_id,score,created_at,exam_id"),
      client.from("activity_events").select("event_type,created_at,user_id,meta"),
      client.from("units").select("id"),
      client.from("exams").select("id"),
      client.from("classes").select("id"),
    ]);
    if (usersErr || attemptsErr || eventsErr || unitsErr) throw usersErr || attemptsErr || eventsErr || unitsErr;
    const attemptsByUser = new Map<string, any[]>();
    (attempts || []).forEach((a: any) => attemptsByUser.set(a.user_id, [...(attemptsByUser.get(a.user_id) || []), a]));
    const usersList = (users || []).map((u: any) => {
      const ua = attemptsByUser.get(u.id) || [];
      return { ...u, attemptsCount: ua.length, avgScore: ua.length ? Math.round((ua.reduce((s,a)=>s+Number(a.score||0),0)/ua.length)*10)/10 : 0, completedCount: Array.isArray(u.completed_units) ? u.completed_units.length : 0 };
    });
    const days: Record<string, number> = {};
    (events || []).forEach((e: any) => { const d = String(e.created_at).slice(0,10); days[d] = (days[d] || 0) + 1; });
    res.json({ success: true, stats: {
      totals: { users: usersList.length, students: usersList.filter((u:any)=>u.role==='student').length, teachers: usersList.filter((u:any)=>u.role==='teacher').length, admins: usersList.filter((u:any)=>u.role==='admin').length, attempts: (attempts||[]).length, units: (units||[]).length, exams: (exams||[]).length, classes: (classes||[]).length },
      users: usersList,
      attempts: attempts || [],
      events: events || [],
      activityByDay: Object.entries(days).sort().map(([date,count]) => ({ date, count })),
    }});
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

function makeClassCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
app.get("/api/teacher/dashboard", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const { data: classes, error } = await client.from("classes").select("*, class_members(user_id, profiles(id,name,email,study_streak,completed_units,usage_time_seconds))").eq("teacher_id", profile.id).order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, classes: classes || [] });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});
app.post("/api/teacher/classes", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const payload = { name: req.body.name || "Lớp tiếng Anh", teacher_id: profile.id, code: makeClassCode() };
    const { data, error } = await client.from("classes").insert(payload).select("*").single();
    if (error) throw error;
    await logActivity(profile.id, "class_created", { classId: data.id });
    res.json({ success: true, class: data });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});
app.post("/api/classes/join", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const code = String(req.body.code || "").trim().toUpperCase();
    const client = getSupabaseAdmin()!;
    const { data: klass, error } = await client.from("classes").select("*").eq("code", code).maybeSingle();
    if (error || !klass) throw new Error("Không tìm thấy mã lớp.");
    const { error: memberErr } = await client.from("class_members").upsert({ class_id: klass.id, user_id: profile.id });
    if (memberErr) throw memberErr;
    await logActivity(profile.id, "class_joined", { classId: klass.id });
    res.json({ success: true, class: klass });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});

async function canAccessClass(client: SupabaseClient, profile: any, classId: string) {
  if (profile.role === "admin") return true;
  const { data: klass, error: classErr } = await client.from("classes").select("id,teacher_id").eq("id", classId).maybeSingle();
  if (classErr || !klass) return false;
  if (klass.teacher_id === profile.id) return true;
  const { data: member, error: memberErr } = await client.from("class_members").select("class_id").eq("class_id", classId).eq("user_id", profile.id).maybeSingle();
  return !memberErr && !!member;
}

async function requireClassAccess(client: SupabaseClient, profile: any, classId: string) {
  const ok = await canAccessClass(client, profile, classId);
  if (!ok) throw new Error("Bạn không thuộc lớp này hoặc không có quyền truy cập.");
}

app.get("/api/classes/my", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const client = getSupabaseAdmin()!;
    const { data: memberships, error } = await client
      .from("class_members")
      .select("class_id, joined_at, classes(id,name,code,teacher_id,created_at)")
      .eq("user_id", profile.id)
      .order("joined_at", { ascending: false });
    if (error) throw error;

    const classRows = (memberships || []).map((m: any) => m.classes).filter(Boolean);
    const teacherIds = Array.from(new Set(classRows.map((c: any) => c.teacher_id).filter(Boolean)));
    const { data: teachers } = teacherIds.length
      ? await client.from("profiles").select("id,name,email").in("id", teacherIds)
      : { data: [] as any[] };
    const teacherMap = new Map((teachers || []).map((t: any) => [t.id, t]));

    const classes = await Promise.all(classRows.map(async (c: any) => {
      const { count } = await client.from("class_members").select("*", { count: "exact", head: true }).eq("class_id", c.id);
      return { ...c, teacher: teacherMap.get(c.teacher_id) || null, student_count: count || 0 };
    }));
    res.json({ success: true, classes });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.get("/api/classes/:classId/messages", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const client = getSupabaseAdmin()!;
    await requireClassAccess(client, profile, req.params.classId);
    const { data, error } = await client
      .from("class_messages")
      .select("id,class_id,user_id,message_text,emoji,created_at,profiles(name,role)")
      .eq("class_id", req.params.classId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw error;
    res.json({ success: true, messages: data || [] });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.post("/api/classes/:classId/messages", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const client = getSupabaseAdmin()!;
    await requireClassAccess(client, profile, req.params.classId);
    const messageText = String(req.body.messageText || "").trim().slice(0, 1500);
    const emoji = String(req.body.emoji || "").trim().slice(0, 8);
    if (!messageText && !emoji) throw new Error("Tin nhắn trống.");
    const { data, error } = await client
      .from("class_messages")
      .insert({ class_id: req.params.classId, user_id: profile.id, message_text: messageText, emoji })
      .select("id,class_id,user_id,message_text,emoji,created_at,profiles(name,role)")
      .single();
    if (error) throw error;
    await logActivity(profile.id, "class_message_sent", { classId: req.params.classId });
    res.json({ success: true, message: data });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});

app.get("/api/classes/:classId/assignments", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const client = getSupabaseAdmin()!;
    await requireClassAccess(client, profile, req.params.classId);
    const [{ data: assignments, error: assignmentsError }, { data: onlineTests, error: testsError }] = await Promise.all([
      client
        .from("class_assignments")
        .select("id,class_id,type,title,description,target,available_from,due_at,time_limit_minutes,payload,created_at")
        .eq("class_id", req.params.classId)
        .order("created_at", { ascending: false }),
      client
        .from("online_tests")
        .select("id,title,class_id,open_at,close_at,duration_minutes,created_at")
        .eq("class_id", req.params.classId)
        .order("created_at", { ascending: false })
    ]);
    if (assignmentsError || testsError) throw (assignmentsError || testsError);
    res.json({ success: true, assignments: assignments || [], onlineTests: onlineTests || [] });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.post("/api/teacher/classes/:classId/assignments", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const { data: klass, error: classErr } = await client.from("classes").select("id,teacher_id").eq("id", req.params.classId).maybeSingle();
    if (classErr || !klass) throw new Error("Không tìm thấy lớp.");
    if (profile.role !== "admin" && klass.teacher_id !== profile.id) throw new Error("Bạn chỉ được đăng hoạt động trong lớp của mình.");
    const type = ["lesson", "exam", "live"].includes(req.body.type) ? req.body.type : "lesson";
    const title = String(req.body.title || "").trim().slice(0, 180);
    if (!title) throw new Error("Thiếu tiêu đề hoạt động.");
    const payload = {
      class_id: req.params.classId,
      created_by: profile.id,
      type,
      title,
      description: String(req.body.description || "").trim().slice(0, 1000),
      target: String(req.body.target || "").trim().slice(0, 500),
      available_from: req.body.availableFrom || req.body.available_from || null,
      due_at: req.body.dueAt || req.body.due_at || null,
      time_limit_minutes: req.body.timeLimitMinutes ? Number(req.body.timeLimitMinutes) : null,
      payload: req.body.payload || {},
    };
    const { data, error } = await client.from("class_assignments").insert(payload).select("*").single();
    if (error) throw error;
    await logActivity(profile.id, "class_assignment_created", { classId: req.params.classId, type });
    res.json({ success: true, assignment: data });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});


// ==================== EXAM BANK MANAGEMENT ====================
app.get("/api/exams", async (_req, res) => {
  try {
    const client = getSupabaseAdmin();
    if (!client) return res.json({ success: true, exams: mockExams });
    const { data, error } = await client.from("exams").select("*").order("created_at", { ascending: false });
    if (error) {
      console.warn("[exams] falling back to local mock exams:", error.message);
      return res.json({ success: true, exams: mockExams });
    }
    const exams = (data || []).map((r: any) => r.content || r);
    res.json({ success: true, exams: exams.length ? exams : mockExams });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

app.put("/api/exams/:id", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireAdmin(profile);
    const exam = req.body.exam || req.body;
    if (!exam?.id || !exam?.title) throw new Error("Đề thi cần có id và title.");
    const client = getSupabaseAdmin()!;
    const { data, error } = await client
      .from("exams")
      .upsert({ id: String(exam.id), title: exam.title, content: exam, updated_by: profile.id, updated_at: new Date().toISOString() })
      .select("*")
      .single();
    if (error) throw error;
    await logActivity(profile.id, "exam_updated", { examId: exam.id });
    res.json({ success: true, exam: data.content });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.delete("/api/exams/:id", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireAdmin(profile);
    const client = getSupabaseAdmin()!;
    const { error } = await client.from("exams").delete().eq("id", String(req.params.id));
    if (error) throw error;
    await logActivity(profile.id, "exam_deleted", { examId: req.params.id });
    res.json({ success: true });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.post("/api/exams/generate", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireAdmin(profile);
    const source = String(req.body.source || "").slice(0, 30000);
    if (!source.trim()) throw new Error("Thiếu nội dung hoặc link PDF để gen đề.");

    const fallbackExam = {
      id: "exam_ai_" + Date.now(),
      title: "Đề AI từ PDF - bản nháp",
      duration: 60,
      sourcePdfUrl: source.startsWith("http") ? source : "",
      sections: [
        {
          id: "ai_sec_1",
          title: "Phần 1: Trắc nghiệm",
          instruction: "Chọn đáp án đúng nhất.",
          passage: source.startsWith("http") ? "" : source.slice(0, 1200),
          questions: [
            { id: "ai_q1", question: "Choose the word whose underlined part is pronounced differently.", type: "single-choice", options: ["A. wanted", "B. needed", "C. played", "D. decided"], correctValue: "C. played", explanation: "played phát âm /d/, các từ còn lại có đuôi -ed phát âm /id/." },
            { id: "ai_q2", question: "The more you practice, ____ you become.", type: "single-choice", options: ["A. the confident", "B. the more confident", "C. more confident", "D. most confident"], correctValue: "B. the more confident", explanation: "Cấu trúc so sánh kép: The more..., the more..." }
          ]
        }
      ]
    };

    const apiKey = getGeminiApiKey();
    if (!apiKey) return res.json({ success: true, exam: fallbackExam });

    const result = await callGeminiChatRest({
      userMessage: `Tạo một đề thi tiếng Anh lớp 9/vào 10 từ nội dung hoặc link PDF sau. Chỉ trả về JSON hợp lệ theo schema: {"id":"...","title":"...","duration":60,"sourcePdfUrl":"...","sections":[{"id":"...","title":"...","instruction":"...","passage":"...","questions":[{"id":"...","question":"...","type":"single-choice","options":["A..."],"correctValue":"...","explanation":"..."}]}]}. Nội dung: ${source}`,
      conversationText: "",
      contextStr: "VocaFox Admin tạo đề thi tiếng Anh lớp 9.",
      systemInstruction: "Bạn là trợ lý tạo đề thi. Trả về JSON thuần, không markdown, không chú thích."
    });

    if (!result.ok || !result.text) return res.json({ success: true, exam: fallbackExam });
    const jsonText = result.text.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
    let exam = fallbackExam;
    try { exam = { ...fallbackExam, ...JSON.parse(jsonText), id: "exam_ai_" + Date.now() }; } catch { /* fallback */ }
    await logActivity(profile.id, "exam_generated", { source: source.slice(0, 200) });
    res.json({ success: true, exam });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});


// ==================== TEACHER WORKSPACE V2 ====================
function safeText(value: any, max = 1000) { return String(value || "").trim().slice(0, max); }
function normalizeMaterialType(value: any) {
  const v = safeText(value, 30);
  return ["PDF", "Word", "Slide", "Video", "Link web"].includes(v) ? v : "PDF";
}
function aiQuestionFallback(title = "Đề AI mới", duration = 45, source = "") {
  return {
    id: "teacher_ai_" + Date.now(),
    title,
    durationMinutes: duration,
    sourcePdfUrl: source.startsWith("http") ? source : "",
    questions: [
      { id: "q1", question: "Choose the word whose underlined part is pronounced differently.", type: "single-choice", options: ["A. wanted", "B. needed", "C. played", "D. decided"], correctAnswer: "C. played", explanation: "played phát âm /d/, các từ còn lại có đuôi -ed phát âm /id/.", score: 1 },
      { id: "q2", question: "The more you practice, ____ you become.", type: "single-choice", options: ["A. the confident", "B. the more confident", "C. more confident", "D. most confident"], correctAnswer: "B. the more confident", explanation: "Cấu trúc so sánh kép: The more..., the more...", score: 1 }
    ],
    sections: [{ id: "s1", title: "Trắc nghiệm", instruction: "Chọn đáp án đúng.", questions: [] }]
  };
}

function normalizeTeacherGeneratedExam(rawExam: any, title = "Bài kiểm tra mới", duration = 45, fallbackSource = "") {
  const base = rawExam && typeof rawExam === "object" ? rawExam : {};
  const fromSections = Array.isArray(base.sections) ? base.sections.flatMap((s: any) => Array.isArray(s?.questions) ? s.questions : []) : [];
  const rawQuestions = Array.isArray(base.questions) ? base.questions : fromSections;
  const questions = rawQuestions
    .filter((q: any) => q && typeof q === "object" && String(q.question || "").trim())
    .map((q: any, i: number) => {
      const opts = Array.isArray(q.options) ? q.options.map((o: any) => String(o || "").trim()).filter(Boolean) : [];
      const normalizedOptions = opts.length >= 2 ? opts.slice(0, 6).map((o: string, idx: number) => /^[A-F]\s*[.)]/i.test(o) ? o : `${String.fromCharCode(65 + idx)}. ${o}`) : ["A. True", "B. False"];
      let correct = String(q.correctAnswer ?? q.correctValue ?? q.answer ?? "").trim();
      const letter = correct.match(/^([A-F])\.?$/i)?.[1]?.toUpperCase();
      if (letter) correct = normalizedOptions.find((o: string) => o.toUpperCase().startsWith(`${letter}.`)) || correct;
      if (!normalizedOptions.includes(correct)) {
        const byText = normalizedOptions.find((o: string) => o.replace(/^[A-F]\s*[.)]\s*/i, "").trim().toLowerCase() === correct.replace(/^[A-F]\s*[.)]\s*/i, "").trim().toLowerCase());
        correct = byText || normalizedOptions[0];
      }
      return {
        id: `q${i + 1}`,
        question: String(q.question || "").trim(),
        type: "single-choice",
        options: normalizedOptions,
        correctAnswer: correct,
        correctValue: correct,
        explanation: String(q.explanation || "FoxieAI sẽ phân tích chi tiết đáp án sau khi học sinh nộp bài.").trim(),
        score: Number(q.score || 1) || 1,
      };
    });
  const finalQuestions = questions.length ? questions : aiQuestionFallback(title, duration, fallbackSource).questions;
  return {
    id: "teacher_ai_" + Date.now(),
    title: String(base.title || title || "Bài kiểm tra mới").trim(),
    durationMinutes: Number(base.durationMinutes || base.duration || duration || 45) || 45,
    duration: Number(base.durationMinutes || base.duration || duration || 45) || 45,
    sourcePdfUrl: fallbackSource.startsWith("http") ? fallbackSource : "",
    questions: finalQuestions,
    sections: [{ id: "sec_1", title: "Trắc nghiệm", instruction: "Chọn đáp án đúng nhất.", passage: "", questions: finalQuestions }],
  };
}

async function teacherOwnsClass(client: SupabaseClient, profile: any, classId: string) {
  const { data, error } = await client.from("classes").select("id,teacher_id").eq("id", classId).maybeSingle();
  if (error || !data) throw new Error("Không tìm thấy lớp.");
  if (profile.role !== "admin" && data.teacher_id !== profile.id) throw new Error("Bạn chỉ được quản lý lớp của chính mình.");
  return data;
}
async function uniqueClassCode(client: SupabaseClient) {
  for (let i = 0; i < 10; i++) {
    const code = makeClassCode();
    const { data } = await client.from("classes").select("id").eq("code", code).maybeSingle();
    if (!data) return code;
  }
  return "VF" + Date.now().toString(36).toUpperCase();
}

app.get("/api/teacher/workspace", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const [classesRes, materialsRes, examsRes, quizzesRes, testsRes] = await Promise.all([
      client.from("classes").select("*, class_members(user_id, profiles(id,name,email,study_streak,completed_units,usage_time_seconds))").eq("teacher_id", profile.id).order("created_at", { ascending: false }),
      client.from("teacher_materials").select("*").eq("teacher_id", profile.id).order("created_at", { ascending: false }),
      client.from("teacher_exams").select("*").eq("teacher_id", profile.id).order("created_at", { ascending: false }),
      client.from("teacher_quizzes").select("*").eq("teacher_id", profile.id).order("created_at", { ascending: false }),
      client.from("online_tests").select("*, classes(name)").eq("teacher_id", profile.id).order("created_at", { ascending: false }),
    ]);
    const firstError = classesRes.error || materialsRes.error || examsRes.error || quizzesRes.error || testsRes.error;
    if (firstError) throw firstError;
    res.json({ success: true, classes: classesRes.data || [], materials: materialsRes.data || [], exams: examsRes.data || [], quizzes: quizzesRes.data || [], onlineTests: testsRes.data || [] });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

// Override/extend teacher class creation with meetingUrl support. If the older route above also exists, this path is still useful for newer clients only if registered earlier; the schema supports meeting_url regardless.
app.post("/api/teacher/classes-v2", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const name = safeText(req.body.name, 160) || "Lớp tiếng Anh";
    const code = await uniqueClassCode(client);
    const { data, error } = await client.from("classes").insert({ name, teacher_id: profile.id, code, meeting_url: safeText(req.body.meetingUrl || req.body.meeting_url, 500) }).select("*").single();
    if (error) throw error;
    await logActivity(profile.id, "teacher_class_created", { classId: data.id });
    res.json({ success: true, class: data });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});

app.put("/api/teacher/classes/:classId", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    await teacherOwnsClass(client, profile, req.params.classId);
    const patch = {
      name: safeText(req.body.name, 160) || "Lớp tiếng Anh",
      meeting_url: safeText(req.body.meetingUrl || req.body.meeting_url, 500),
    };
    const { data, error } = await client.from("classes").update(patch).eq("id", req.params.classId).select("*").single();
    if (error) throw error;
    await logActivity(profile.id, "teacher_class_updated", { classId: data.id });
    res.json({ success: true, class: data });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.delete("/api/teacher/classes/:classId", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    await teacherOwnsClass(client, profile, req.params.classId);
    await client.from("class_assignments").delete().eq("class_id", req.params.classId);
    await client.from("class_messages").delete().eq("class_id", req.params.classId);
    await client.from("online_tests").delete().eq("class_id", req.params.classId).eq("teacher_id", profile.id);
    await client.from("class_members").delete().eq("class_id", req.params.classId);
    const { error } = await client.from("classes").delete().eq("id", req.params.classId).eq("teacher_id", profile.id);
    if (error) throw error;
    await logActivity(profile.id, "teacher_class_deleted", { classId: req.params.classId });
    res.json({ success: true });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.delete("/api/teacher/classes/:classId/students/:studentId", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    await teacherOwnsClass(client, profile, req.params.classId);
    const { error } = await client.from("class_members").delete().eq("class_id", req.params.classId).eq("user_id", req.params.studentId);
    if (error) throw error;
    await logActivity(profile.id, "student_removed_from_class", { classId: req.params.classId, studentId: req.params.studentId });
    res.json({ success: true });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});

app.post("/api/teacher/materials", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const title = safeText(req.body.title, 180);
    const classId = safeText(req.body.classId || req.body.class_id, 80);

    if (!title) throw new Error("Thiếu tên học liệu.");
    if (!classId) throw new Error("Chọn lớp để đăng tài nguyên cho học sinh.");

    // Kiểm tra quyền lớp trước khi lưu để tránh tạo tài nguyên không gắn với lớp nào.
    await teacherOwnsClass(client, profile, classId);

    const payload = {
      teacher_id: profile.id,
      title,
      type: normalizeMaterialType(req.body.type),
      grade: safeText(req.body.grade, 40) || "Lớp 9",
      description: safeText(req.body.description, 2000),
      file_url: safeText(req.body.fileUrl || req.body.file_url, 1000),
      web_url: safeText(req.body.webUrl || req.body.web_url, 1000),
      youtube_url: safeText(req.body.youtubeUrl || req.body.youtube_url, 1000),
      slide_pdf_url: safeText(req.body.slidePdfUrl || req.body.slide_pdf_url, 1000),
      cover_image_url: safeText(req.body.coverImageUrl || req.body.cover_image_url, 1000),
      metadata: {
        ...(req.body.metadata || {}),
        classId,
        fileName: safeText(req.body.fileName || req.body.file_name, 240),
        mimeType: safeText(req.body.mimeType || req.body.mime_type, 160),
        fileData: safeText(req.body.fileData || req.body.file_data, 20000000),
      }
    };

    const { data, error } = await client
      .from("teacher_materials")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;

    const target = payload.file_url || payload.web_url || payload.youtube_url || payload.slide_pdf_url || "";
    const { error: assignmentError } = await client.from("class_assignments").insert({
      class_id: classId,
      created_by: profile.id,
      type: "lesson",
      title,
      description: payload.description || "Tài nguyên lớp học do giáo viên đăng.",
      target,
      payload: {
        materialId: data.id,
        type: data.type,
        fileName: payload.metadata?.fileName || "",
        mimeType: payload.metadata?.mimeType || "",
        fileData: payload.metadata?.fileData || "",
        fileUrl: payload.file_url || "",
        webUrl: payload.web_url || "",
        youtubeUrl: payload.youtube_url || "",
        slidePdfUrl: payload.slide_pdf_url || "",
      }
    });

    if (assignmentError) {
      // Nếu không gắn được vào lớp, xóa luôn tài nguyên vừa tạo để giáo viên không bị thấy dữ liệu giả.
      await client.from("teacher_materials").delete().eq("id", data.id).eq("teacher_id", profile.id);
      throw assignmentError;
    }

    await logActivity(profile.id, "teacher_material_created", { materialId: data.id, type: data.type, classId });
    res.json({ success: true, material: { ...data, class_id: classId } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Không lưu được tài nguyên lớp học." });
  }
});
app.put("/api/teacher/materials/:id", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const patch: any = { updated_at: new Date().toISOString() };
    ["title", "grade", "description"].forEach(k => { if (req.body[k] !== undefined) patch[k] = safeText(req.body[k], k === "description" ? 2000 : 180); });
    if (req.body.type !== undefined) patch.type = normalizeMaterialType(req.body.type);
    if (req.body.fileUrl !== undefined || req.body.file_url !== undefined) patch.file_url = safeText(req.body.fileUrl || req.body.file_url, 1000);
    if (req.body.webUrl !== undefined || req.body.web_url !== undefined) patch.web_url = safeText(req.body.webUrl || req.body.web_url, 1000);
    if (req.body.youtubeUrl !== undefined || req.body.youtube_url !== undefined) patch.youtube_url = safeText(req.body.youtubeUrl || req.body.youtube_url, 1000);
    if (req.body.slidePdfUrl !== undefined || req.body.slide_pdf_url !== undefined) patch.slide_pdf_url = safeText(req.body.slidePdfUrl || req.body.slide_pdf_url, 1000);
    if (req.body.coverImageUrl !== undefined || req.body.cover_image_url !== undefined) patch.cover_image_url = safeText(req.body.coverImageUrl || req.body.cover_image_url, 1000);
    const { data, error } = await client.from("teacher_materials").update(patch).eq("id", req.params.id).eq("teacher_id", profile.id).select("*").single();
    if (error) throw error;
    res.json({ success: true, material: data });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});
app.delete("/api/teacher/materials/:id", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const materialId = req.params.id;

    const { data: material, error: findError } = await client
      .from("teacher_materials")
      .select("id,teacher_id,title")
      .eq("id", materialId)
      .maybeSingle();

    if (findError) throw findError;
    if (!material) throw new Error("Không tìm thấy tài nguyên để xóa.");
    if (profile.role !== "admin" && material.teacher_id !== profile.id) {
      throw new Error("Bạn chỉ được xóa tài nguyên do chính mình tạo.");
    }

    const { error: assignmentError } = await client
      .from("class_assignments")
      .delete()
      .contains("payload", { materialId });
    if (assignmentError) throw assignmentError;

    const { error } = await client
      .from("teacher_materials")
      .delete()
      .eq("id", materialId);
    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message || "Không xóa được tài nguyên." });
  }
});

app.post("/api/teacher/exams/generate", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const title = safeText(req.body.title, 180) || "Bài kiểm tra mới";
    let source = safeText(req.body.source || req.body.textContent || req.body.text_content, 30000);
    const sourceUrl = safeText(req.body.sourceUrl || req.body.source_url, 1000);
    if (sourceUrl) {
      try {
        const linkedText = await fetchTextFromPublicDocument(sourceUrl);
        source = `${source ? `${source}

` : ""}NỘI DUNG TỪ LINK ${sourceUrl}:
${linkedText}`.slice(0, 30000);
      } catch (err: any) {
        source = `${source}

LINK THAM KHẢO: ${sourceUrl}`.trim();
      }
    }
    const duration = Number(req.body.durationMinutes || req.body.duration_minutes || 45) || 45;
    const questionCount = Number(req.body.questionCount || req.body.question_count || 20) || 20;
    const fileData = safeText(req.body.fileData || req.body.file_data, 20000000);
    const mimeType = safeText(req.body.mimeType || req.body.mime_type, 120);
    const fileName = safeText(req.body.fileName || req.body.file_name, 240);
    if (!source && !fileData) throw new Error("Thiếu nội dung, file hoặc link để AI tạo đề.");

    let exam = normalizeTeacherGeneratedExam(null, title, duration, source || sourceUrl || fileName);
    if (getGeminiApiKey()) {
      const promptText = `Bạn là FoxieAI, chuyên tạo bài kiểm tra TRẮC NGHIỆM tiếng Anh cho học sinh THCS/lớp 9.
Hãy đọc tài liệu giáo viên cung cấp rồi tạo một bài kiểm tra online có thể làm trực tiếp trên web.

Tên bài: ${title}
Số câu mong muốn: ${questionCount}
Thời lượng: ${duration} phút
Nội dung/link bổ sung: ${source || "Không có"}
Tên file: ${fileName || "Không có"}

YÊU CẦU BẮT BUỘC:
- Chỉ tạo câu hỏi trắc nghiệm một đáp án đúng.
- Mỗi câu có đúng 4 lựa chọn A, B, C, D.
- correctAnswer phải trùng nguyên văn với một lựa chọn trong options, ví dụ "B. the more confident".
- Mỗi câu có explanation ngắn bằng tiếng Việt để học sinh xem sau khi nộp bài.
- Không trả markdown, không dùng code fence, không giải thích ngoài JSON.

Chỉ trả về JSON hợp lệ theo schema:
{"title":"...","durationMinutes":45,"questions":[{"id":"q1","question":"...","type":"single-choice","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":"A. ...","explanation":"...","score":1}]}`;
      const result = await callGeminiExamRest({
        promptText,
        fileData,
        mimeType,
        systemInstruction: "Bạn là AI tạo đề kiểm tra cho giáo viên. Chỉ trả về JSON thuần, hợp lệ, có đáp án và giải thích ngắn."
      });
      if (result.ok && result.text) {
        const cleaned = result.text.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
        try { exam = normalizeTeacherGeneratedExam(JSON.parse(cleaned), title, duration, source || sourceUrl || fileName); } catch {}
      }
    }
    await logActivity(profile.id, "teacher_exam_ai_generated", { source: (source || fileName).slice(0, 200) });
    res.json({ success: true, exam });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});
app.post("/api/teacher/exams", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const title = safeText(req.body.title, 180);
    if (!title) throw new Error("Thiếu tên đề thi.");
    const content = req.body.content || req.body.exam || aiQuestionFallback(title, Number(req.body.durationMinutes || 45), "");
    const questionCount = Array.isArray(content.questions) ? content.questions.length : (content.sections || []).reduce((n: number, s: any) => n + (s.questions?.length || 0), 0);
    const { data, error } = await client.from("teacher_exams").insert({ teacher_id: profile.id, title, duration_minutes: Number(req.body.durationMinutes || req.body.duration_minutes || content.durationMinutes || content.duration || 45), question_count: questionCount || Number(req.body.questionCount || 0), source_pdf_url: safeText(req.body.sourcePdfUrl || req.body.source_pdf_url, 1000), status: "ready", content }).select("*").single();
    if (error) throw error;
    await logActivity(profile.id, "teacher_exam_created", { examId: data.id });
    res.json({ success: true, exam: data });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});
app.delete("/api/teacher/exams/:id", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const examId = req.params.id;

    const { data: exam, error: findError } = await client
      .from("teacher_exams")
      .select("id,teacher_id,title")
      .eq("id", examId)
      .maybeSingle();

    if (findError) throw findError;
    if (!exam) throw new Error("Không tìm thấy đề kiểm tra để xóa.");
    if (profile.role !== "admin" && exam.teacher_id !== profile.id) {
      throw new Error("Bạn chỉ được xóa đề do chính mình tạo.");
    }

    const { data: relatedTests, error: testsError } = await client
      .from("online_tests")
      .select("id")
      .eq("exam_id", examId);
    if (testsError) throw testsError;

    const testIds = (relatedTests || []).map((t: any) => t.id);
    if (testIds.length) {
      const { error: attemptError } = await client.from("test_attempts").delete().in("test_id", testIds);
      if (attemptError) throw attemptError;
      const { error: onlineError } = await client.from("online_tests").delete().in("id", testIds);
      if (onlineError) throw onlineError;
    }

    const { error } = await client
      .from("teacher_exams")
      .delete()
      .eq("id", examId);
    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message || "Không xóa được đề kiểm tra." });
  }
});

app.post("/api/teacher/quizzes", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const title = safeText(req.body.title, 180);
    if (!title) throw new Error("Thiếu tên quiz.");
    const questionCount = Number(req.body.questionCount || req.body.question_count || 10) || 10;
    const content = req.body.content || { title, sourceType: safeText(req.body.sourceType || req.body.source_type, 50) || "AI", source: safeText(req.body.source, 30000), questions: aiQuestionFallback(title, 15, safeText(req.body.source, 30000)).questions.slice(0, Math.min(questionCount, 2)) };
    const { data, error } = await client.from("teacher_quizzes").insert({ teacher_id: profile.id, title, source_type: safeText(req.body.sourceType || req.body.source_type, 50) || "AI", source: safeText(req.body.source, 30000), question_count: questionCount, content }).select("*").single();
    if (error) throw error;
    res.json({ success: true, quiz: data });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});


app.delete("/api/teacher/quizzes/:id", async (req, res) => {
  try {
    const { profile } = await requireProfile(req); requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;
    const { error } = await client.from("teacher_quizzes").delete().eq("id", req.params.id).eq("teacher_id", profile.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});


app.delete("/api/teacher/online-tests/:id", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    requireTeacherOrAdmin(profile);

    const client = getSupabaseAdmin()!;
    const testId = req.params.id;

    const { data: test, error: findError } = await client
      .from("online_tests")
      .select("id,class_id,teacher_id,title")
      .eq("id", testId)
      .maybeSingle();

    if (findError) throw findError;
    if (!test) throw new Error("Không tìm thấy bài kiểm tra để xóa.");

    await teacherOwnsClass(client, profile, test.class_id);

    const { error: attemptError } = await client
      .from("test_attempts")
      .delete()
      .eq("test_id", testId);
    if (attemptError) throw attemptError;

    const { error } = await client
      .from("online_tests")
      .delete()
      .eq("id", testId);
    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message || "Không xóa được bài kiểm tra." });
  }
});

app.post("/api/teacher/online-tests", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    requireTeacherOrAdmin(profile);
    const client = getSupabaseAdmin()!;

    const title = safeText(req.body.title, 180);
    const classId = safeText(req.body.classId || req.body.class_id, 120);
    const examId = safeText(req.body.examId || req.body.exam_id, 120);
    if (!title) throw new Error("Thiếu tên bài kiểm tra.");
    if (!classId) throw new Error("Thiếu lớp để giao bài.");
    if (!examId) throw new Error("Thiếu đề kiểm tra để giao.");

    await teacherOwnsClass(client, profile, classId);

    const { data: exam, error: examError } = await client
      .from("teacher_exams")
      .select("id,teacher_id,title,content")
      .eq("id", examId)
      .maybeSingle();
    if (examError) throw examError;
    if (!exam) throw new Error("Không tìm thấy đề kiểm tra đã tạo trong Supabase.");
    if (profile.role !== "admin" && exam.teacher_id !== profile.id) {
      throw new Error("Bạn chỉ được giao đề do chính mình tạo.");
    }

    const openAtRaw = req.body.openAt || req.body.open_at || new Date().toISOString();
    const closeAtRaw = req.body.closeAt || req.body.close_at || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const openTime = new Date(openAtRaw).getTime();
    const closeTime = new Date(closeAtRaw).getTime();
    if (!Number.isFinite(openTime)) throw new Error("Ngày mở bài không hợp lệ.");
    if (!Number.isFinite(closeTime)) throw new Error("Ngày đóng bài không hợp lệ.");
    if (closeTime <= openTime) throw new Error("Ngày đóng phải sau ngày mở bài.");

    const payload = {
      teacher_id: profile.id,
      class_id: classId,
      exam_id: examId,
      title,
      open_at: new Date(openTime).toISOString(),
      close_at: new Date(closeTime).toISOString(),
      duration_minutes: Number(req.body.durationMinutes || req.body.duration_minutes || 45) || 45,
      shuffle_questions: !!(req.body.shuffleQuestions || req.body.shuffle_questions),
      show_score_after_submit: req.body.showScoreAfterSubmit !== false && req.body.show_score_after_submit !== false,
      one_attempt_only: req.body.oneAttemptOnly !== false && req.body.one_attempt_only !== false,
    };

    const { data, error } = await client
      .from("online_tests")
      .insert(payload)
      .select("*, classes(name)")
      .single();
    if (error) throw error;

    await logActivity(profile.id, "online_test_created", { testId: data.id, classId: data.class_id, examId });
    res.json({ success: true, onlineTest: data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Không tạo được bài kiểm tra online." });
  }
});

app.post("/api/online-tests/:testId/start", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const client = getSupabaseAdmin()!;
    const { data: test, error } = await client.from("online_tests").select("*, teacher_exams(content)").eq("id", req.params.testId).maybeSingle();
    if (error || !test) throw new Error("Không tìm thấy bài kiểm tra.");
    await requireClassAccess(client, profile, test.class_id);
    const now = Date.now();
    if (now < new Date(test.open_at).getTime()) throw new Error("Bài kiểm tra chưa mở.");
    if (now > new Date(test.close_at).getTime()) throw new Error("Bài kiểm tra đã đóng.");
    if (test.one_attempt_only) {
      const { data: existing } = await client.from("test_attempts").select("id,status").eq("test_id", test.id).eq("student_id", profile.id).maybeSingle();
      if (existing) return res.json({ success: true, attempt: existing, alreadyStarted: true });
    }
    const { data: attempt, error: attErr } = await client.from("test_attempts").insert({ test_id: test.id, student_id: profile.id, started_at: new Date().toISOString(), status: "in_progress" }).select("*").single();
    if (attErr) throw attErr;
    res.json({ success: true, attempt, exam: test.teacher_exams?.content || {} });
  } catch (error: any) { res.status(403).json({ success: false, error: error.message }); }
});
function flattenQuestions(content: any): any[] { return Array.isArray(content?.questions) ? content.questions : (content?.sections || []).flatMap((s: any) => s.questions || []); }
function gradeAnswer(q: any, answer: any) {
  const correct = q.correctAnswer ?? q.correctValue ?? q.answer;
  if (q.type === "matching") return JSON.stringify(answer || {}) === JSON.stringify(correct || {});
  return String(answer ?? "").trim().toLowerCase() === String(correct ?? "").trim().toLowerCase();
}
app.post("/api/online-tests/:testId/submit", async (req, res) => {
  try {
    const { profile } = await requireProfile(req);
    const client = getSupabaseAdmin()!;
    const { data: test, error } = await client.from("online_tests").select("*, teacher_exams(content)").eq("id", req.params.testId).maybeSingle();
    if (error || !test) throw new Error("Không tìm thấy bài kiểm tra.");
    await requireClassAccess(client, profile, test.class_id);
    const questions = flattenQuestions(test.teacher_exams?.content || {});
    const answers = req.body.answers || {};
    let total = 0, correctCount = 0, score = 0;
    const detail = questions.map((q: any) => { const ok = gradeAnswer(q, answers[q.id]); const pts = Number(q.score || 1); total += pts; if (ok) { correctCount++; score += pts; } return { questionId: q.id, correct: ok, score: ok ? pts : 0, correctAnswer: q.correctAnswer ?? q.correctValue ?? q.answer, explanation: q.explanation || "" }; });
    const percentScore = total ? Math.round((score / total) * 1000) / 10 : 0;
    const { data: attempt, error: attErr } = await client.from("test_attempts").upsert({ test_id: test.id, student_id: profile.id, answers, score: percentScore, correct_count: correctCount, total_questions: questions.length, detail, submitted_at: new Date().toISOString(), status: "submitted" }, { onConflict: "test_id,student_id" }).select("*").single();
    if (attErr) throw attErr;
    res.json({ success: true, attempt, score: test.show_score_after_submit ? percentScore : null, detail: test.show_score_after_submit ? detail : undefined });
  } catch (error: any) { res.status(400).json({ success: false, error: error.message }); }
});

// ==================== API ROUTES ====================

// Health check endpoint
app.get("/api/health", (req, res) => {
  const apiKey = getGeminiApiKey();

  res.json({
    status: "ok",
    time: new Date().toISOString(),
    cwd: process.cwd(),
    hasGeminiApiKey: Boolean(apiKey),
    geminiKeyLength: apiKey ? apiKey.length : 0,
    geminiModel: process.env.GEMINI_MODEL || "auto",
  });
});

// Endpoint 1: Practice / Question Explanation
app.post("/api/explain-question", async (req, res) => {
  try {
    const { question, options, userAnswer, correctValue, explanation, topicContext } = req.body;
    
    const client = getGeminiClient();
    if (!client) {
      return res.json({
        success: true,
        explanation: getOfflineQuestionExplanation(question, userAnswer, correctValue, explanation, topicContext)
      });
    }

    const isCorrect = String(userAnswer).trim().toLowerCase() === String(correctValue).trim().toLowerCase();

    const prompt = `
Bạn là một trợ lý FoxieAI ôn thi Tiếng Anh vào 10 chuyên nghiệp tại Việt Nam.
Hãy giải thích câu hỏi tiếng Anh sau đây bằng Tiếng Việt một cách dễ hiểu, sinh động và tràn đầy động lực cho bạn học sinh.
Hãy xưng xô là "tôi" và gọi người học là "bạn" trong lời giải thích (Tuyệt đối không xưng Thầy/Cô và không gọi là em).

THÔNG TIN CÂU HỎI:
- Chủ đề: ${topicContext || "Ngữ pháp / Từ vựng tổng hợp"}
- Câu hỏi: "${question}"
- Các lựa chọn đáp án: ${options ? options.join(", ") : "Không có (câu hỏi tự luận/sắp xếp)"}
- Câu trả lời của học sinh: "${userAnswer}"
- Đáp án đúng: "${correctValue}"
- Trạng thái: ${isCorrect ? "Bạn đã làm ĐÚNG!" : "Bạn làm CHƯA ĐÚNG."}
- Gợi ý gốc: "${explanation || "N/A"}"

Yêu cầu giải thích:
1. Nếu bạn học sinh trả lời đúng, hãy khen ngợi nhẹ nhàng và củng cố tại sao đáp án đó đúng. Nếu trả lời sai, hãy giải thích lỗi sai thường gặp ở câu này một cách bao dung, khích lệ.
2. Dịch nghĩa câu này sang Tiếng Việt.
3. Phân tích chi tiết cấu trúc ngữ pháp trọng tâm hoặc quy tắc phát âm/từ vựng áp dụng trong câu đối với kỳ thi tuyển sinh vào lớp 10.
4. Đưa ra mẹo làm bài nhanh (exam tips) cho dạng câu này để đạt điểm cao khi thi chuyển cấp.
5. Giữ độ dài khoảng 150-250 từ, trình bày đẹp bằng Markdown, có xuống dòng rõ ràng.
`;

    const systemInstruction = "Bạn là trợ lý FoxieAI ôn thi Tiếng Anh vào 10 thân thiện, viết phản hồi bằng Tiếng Việt sử dụng định dạng Markdown phong cách sư phạm chuyên nghiệp, luôn xưng hô là 'tôi' và gọi học sinh là 'bạn'.";
    
    let responseText = "";
    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let apiError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const genResponse = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.7,
            systemInstruction
          }
        });
        if (genResponse && genResponse.text) {
          responseText = genResponse.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Failed /api/explain-question model ${modelName}:`, err);
        apiError = err;
      }
    }

    if (!responseText) {
      console.error("All Gemini model attempts failed. Serving super offline explanation fallback. Last error:", apiError);
      return res.json({
        success: true,
        explanation: getOfflineQuestionExplanation(question, userAnswer, correctValue, explanation, topicContext)
      });
    }

    res.json({
      success: true,
      explanation: responseText
    });
  } catch (error: any) {
    console.error("Error generating question explanation, triggering fallback:", error);
    const { question, userAnswer, correctValue, explanation, topicContext } = req.body;
    res.json({
      success: true,
      explanation: getOfflineQuestionExplanation(question, userAnswer, correctValue, explanation, topicContext)
    });
  }
});

// Endpoint 2: FoxieAI Chatbot powered by Gemini
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { message, messages, chatHistory, activeUnit, activeExam } = req.body || {};

    const lastMessageFromMessages = Array.isArray(messages)
      ? messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || ""
      : "";

    const userMessage =
      typeof message === "string"
        ? message
        : typeof lastMessageFromMessages === "string"
          ? lastMessageFromMessages
          : "";

    if (!userMessage.trim()) {
      return res.status(400).json({
        success: false,
        error: "Thiếu nội dung câu hỏi.",
      });
    }

    let contextStr = "Người dùng đang sử dụng web VocaFox.";
    if (activeUnit) {
      contextStr += ` Người dùng hiện đang học bài: "${activeUnit.unit || activeUnit.un || ""} - ${activeUnit.title || ""} ${activeUnit.vietnameseTitle ? `(${activeUnit.vietnameseTitle})` : ""}".`;
    }
    if (activeExam) {
      contextStr += ` Người dùng đang luyện đề: "${activeExam.title || "Đề thi"}".`;
    }

    const systemInstruction = `
Bạn là FoxieAI, trợ lý AI của website VocaFox.

Nhiệm vụ:
- Trả lời được nhiều loại câu hỏi của người dùng, không chỉ riêng tiếng Anh.
- Ưu tiên hỗ trợ tiếng Anh lớp 9, luyện thi vào lớp 10, từ vựng, ngữ pháp, đọc hiểu, phát âm, bài tập, kế hoạch học tập.
- Có thể hỗ trợ câu hỏi học tập phổ thông, công nghệ, lập trình, đời sống, giải thích khái niệm, viết nội dung và lập kế hoạch.

Phong cách:
- Luôn trả lời bằng tiếng Việt, trừ khi người dùng yêu cầu ngôn ngữ khác.
- Trả lời rõ ràng, thân thiện, dễ hiểu, phù hợp học sinh và phụ huynh.
- Nếu câu hỏi đơn giản, trả lời ngắn gọn.
- Nếu là bài tập hoặc lỗi sai, giải thích từng bước.
- Ưu tiên định dạng thân thiện với điện thoại: câu ngắn, xuống dòng vừa phải, gạch đầu dòng đơn giản.
- KHÔNG dùng LaTeX hoặc ký hiệu khó đọc như $...$, \\text{}, _{...}, ^{...}.
- KHÔNG dùng dấu > để trích dẫn.
- KHÔNG dùng bảng Markdown phức tạp.
- Khi viết công thức ngữ pháp, hãy viết dạng chữ dễ đọc. Ví dụ: "S1 + wish/wishes + S2 + động từ quá khứ", không viết "$S_1 + \\text{wish(es)} + S_2 + V_2/V_{ed}$".

Nguyên tắc an toàn:
- Không bịa thông tin. Nếu không chắc, hãy nói rõ là chưa chắc và gợi ý cách kiểm tra.
- Không hỗ trợ việc nguy hiểm, vi phạm pháp luật, gian lận học tập, xâm nhập tài khoản/hệ thống, hoặc gây hại.
- Không tiết lộ API key, secrets hoặc cấu hình nhạy cảm.
`;

    const normalizedHistory = Array.isArray(messages)
      ? messages
      : Array.isArray(chatHistory)
        ? chatHistory
        : [];

    const conversationText = normalizedHistory.length > 0
      ? normalizedHistory
          .slice(-12)
          .map((m: any) => {
            const role =
              m.role === "assistant" || m.sender === "assistant" || m.sender === "ai"
                ? "FoxieAI"
                : "Người dùng";
            const content = m.content || m.text || m.message || "";
            return `${role}: ${content}`;
          })
          .join("\n")
      : `Người dùng: ${userMessage}`;

    const geminiResult = await callGeminiChatRest({
      userMessage,
      conversationText,
      systemInstruction,
      contextStr,
    });

    if (!geminiResult.ok || !geminiResult.text) {
      const offline = getOfflineResponse(userMessage);

      return res.status(geminiResult.status || 502).json({
        success: false,
        error: geminiResult.error || "Không gọi được Gemini API.",
        reply: `${offline}\n\n---\n⚠️ **Lưu ý kỹ thuật:** FoxieAI đang dùng câu trả lời dự phòng vì Gemini chưa kết nối được. Lỗi backend: ${geminiResult.error || "Không rõ lỗi"}`,
        text: offline,
        message: offline,
      });
    }

    return res.json({
      success: true,
      reply: geminiResult.text,
      text: geminiResult.text,
      message: geminiResult.text,
      model: geminiResult.model,
    });
  } catch (error: any) {
    console.error("Error in FoxieAI chat endpoint:", error);
    const fallbackMessage = typeof req.body?.message === "string" ? req.body.message : "";
    const offline = getOfflineResponse(fallbackMessage);

    return res.status(500).json({
      success: false,
      error: error?.message || "Lỗi server khi gọi FoxieAI.",
      reply: `${offline}\n\n---\n⚠️ **Lỗi server:** ${error?.message || "Không rõ lỗi"}`,
      text: offline,
      message: offline,
    });
  }
});



// ==================== EXAM PARSER HELPERS ====================

type ParsedQuestion = {
  id?: string;
  question?: string;
  type?: string;
  options?: string[];
  correctValue?: string;
  explanation?: string;
  groupHeader?: string;
};

type ParsedSection = {
  id?: string;
  title?: string;
  instruction?: string;
  passage?: string;
  questions?: ParsedQuestion[];
};

type ParsedExam = {
  id?: string;
  title?: string;
  duration?: number;
  sections?: ParsedSection[];
};

function extractJsonObject(rawText: string): any {
  let text = (rawText || "").trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z0-9_-]*\s*/i, "").replace(/```$/i, "").trim();
  }

  try {
    return JSON.parse(text);
  } catch (_) {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(text.slice(first, last + 1));
    }
    throw new Error("Gemini không trả về JSON hợp lệ.");
  }
}

function countQuestionsInExam(exam: ParsedExam): number {
  return (exam.sections || []).reduce((total, sec) => {
    return total + (Array.isArray(sec.questions) ? sec.questions.length : 0);
  }, 0);
}

function inferExpectedQuestionCount(textContent?: string): number | null {
  if (!textContent || typeof textContent !== "string") return null;

  const matches = Array.from(textContent.matchAll(/(?:Câu|Question)\s*(\d{1,3})\b/gi))
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 200);

  if (matches.length === 0) return null;
  return Math.max(...matches);
}

function normalizeSingleChoiceAnswer(question: ParsedQuestion): void {
  if (!Array.isArray(question.options) || question.options.length === 0 || !question.correctValue) return;

  const value = String(question.correctValue).trim();
  const letterOnly = value.match(/^([A-D])\.?$/i)?.[1]?.toUpperCase();
  if (letterOnly) {
    const matchedOption = question.options.find((opt) => String(opt).trim().toUpperCase().startsWith(`${letterOnly}.`));
    if (matchedOption) question.correctValue = matchedOption;
    return;
  }

  const exact = question.options.find((opt) => String(opt).trim() === value);
  if (exact) {
    question.correctValue = exact;
    return;
  }

  const byPrefix = question.options.find((opt) => {
    const optionText = String(opt).replace(/^[A-D]\s*[.)]\s*/i, "").trim().toLowerCase();
    return optionText && optionText === value.replace(/^[A-D]\s*[.)]\s*/i, "").trim().toLowerCase();
  });
  if (byPrefix) question.correctValue = byPrefix;
}

function normalizeParsedExam(rawExam: any): ParsedExam {
  const exam: ParsedExam = rawExam && typeof rawExam === "object" ? rawExam : {};

  exam.title = String(exam.title || "Đề thi trích xuất từ tài liệu").trim();
  exam.duration = Number(exam.duration || 60);
  if (!Number.isFinite(exam.duration) || exam.duration <= 0) exam.duration = 60;
  if (!Array.isArray(exam.sections)) exam.sections = [];

  let globalQuestionIndex = 1;

  exam.sections = exam.sections.map((section: ParsedSection, sectionIndex: number) => {
    const sec: ParsedSection = section && typeof section === "object" ? section : {};
    sec.id = sec.id || `sec_${sectionIndex + 1}`;
    sec.title = String(sec.title || `PHẦN ${sectionIndex + 1}`).trim();
    sec.instruction = String(sec.instruction || "").trim();
    if (sec.passage) sec.passage = String(sec.passage).trim();
    if (!Array.isArray(sec.questions)) sec.questions = [];

    sec.questions = sec.questions
      .filter((q: ParsedQuestion) => q && typeof q === "object" && String(q.question || "").trim())
      .map((q: ParsedQuestion) => {
        const question: ParsedQuestion = { ...q };
        question.id = `q${globalQuestionIndex}`;
        question.question = String(question.question || "").trim();
        question.type = ["single-choice", "rewrite", "reorder"].includes(String(question.type))
          ? String(question.type)
          : Array.isArray(question.options) && question.options.length > 0
            ? "single-choice"
            : "rewrite";

        if (question.type === "single-choice") {
          question.options = Array.isArray(question.options)
            ? question.options.map((opt) => String(opt).trim()).filter(Boolean)
            : [];
          normalizeSingleChoiceAnswer(question);
        } else {
          delete question.options;
        }

        question.correctValue = String(question.correctValue || "").trim();
        question.explanation = String(question.explanation || "Trích xuất từ tài liệu gốc. Học sinh có thể bấm giải thích sau khi làm bài để xem phân tích chi tiết.").trim();
        if (question.groupHeader) question.groupHeader = String(question.groupHeader).trim();

        globalQuestionIndex += 1;
        return question;
      });

    return sec;
  }).filter((sec: ParsedSection) => Array.isArray(sec.questions) && sec.questions.length > 0);

  exam.id = "exam_" + Date.now();
  return exam;
}

async function generateExamJsonWithGemini(client: GoogleGenAI, contentsParts: any[]): Promise<{ text: string; model: string }> {
  const modelsToTry = Array.from(new Set([
    (process.env.GEMINI_EXAM_MODEL || "").trim(),
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash-lite"
  ].filter(Boolean)));

  let lastError = "";

  for (const model of modelsToTry) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: { parts: contentsParts },
        config: {
          temperature: 0,
          topP: 0.1,
          responseMimeType: "application/json",
          maxOutputTokens: 65536,
        }
      });

      const text = response.text ? response.text.trim() : "";
      if (text) return { text, model };
      lastError = `${model} không trả về nội dung.`;
    } catch (error: any) {
      lastError = error?.message || String(error);
      console.warn(`[Exam parser] Gemini failed with ${model}:`, lastError);
    }
  }

  throw new Error(lastError || "Không gọi được Gemini để trích xuất đề thi.");
}

// Endpoint 3: Admin PDF/Exam Material AI Parser
app.post("/api/ai/parse-exam", async (req, res) => {
  try {
    const { fileData, mimeType, textContent, sourceUrl, fileName, title, duration } = req.body;
    let resolvedTextContent = typeof textContent === "string" ? textContent : "";

    if (sourceUrl && typeof sourceUrl === "string") {
      const linkedText = await fetchTextFromPublicDocument(sourceUrl);
      resolvedTextContent = `${resolvedTextContent ? `${resolvedTextContent}\n\n` : ""}NỘI DUNG LẤY TỪ LINK ${sourceUrl}:\n${linkedText}`;
    }

    if (!fileData && !resolvedTextContent) {
      return res.status(400).json({
        success: false,
        error: "Vui lòng tải lên PDF/ảnh hoặc dán nội dung đề thi trước khi trích xuất."
      });
    }

    if (fileData && typeof fileData === "string" && fileData.length > 12_000_000) {
      return res.status(413).json({
        success: false,
        error: "Tệp quá lớn. Vui lòng dùng PDF/tệp văn bản nhỏ hơn khoảng 9MB, hoặc chia đề thành nhiều phần."
      });
    }

    const client = getGeminiClient();
    if (!client) {
      return res.status(400).json({
        success: false,
        error: "⚠️ Hệ thống chưa được cấu hình GEMINI_API_KEY. Vui lòng thêm Key trong file .env rồi khởi động lại server."
      });
    }

    const expectedFromText = inferExpectedQuestionCount(resolvedTextContent);
    const contentsParts: any[] = [];

    if (fileData) {
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || "application/pdf",
          data: fileData
        }
      });
    }

    const promptText = `
Bạn là công cụ TRÍCH XUẤT ĐỀ THI, không phải công cụ sáng tác đề.
Hãy đọc kỹ tài liệu đề thi Tiếng Anh được đính kèm${fileName ? ` (tên file: ${fileName})` : ""}${resolvedTextContent ? ` và/hoặc văn bản/link bên dưới:\n\n${resolvedTextContent}` : ""}.
${title ? `Ưu tiên đặt title là: ${title}.` : ""}
${duration ? `Ưu tiên đặt duration là: ${duration}.` : ""}

MỤC TIÊU BẮT BUỘC:
- Trích xuất ĐÚNG và ĐỦ các câu hỏi có thật trong tài liệu gốc.
- Không tự tạo thêm câu hỏi, không thay câu, không sửa đáp án theo suy đoán.
- Không bỏ qua câu hỏi. Hãy quét theo thứ tự từ đầu tài liệu đến cuối tài liệu.
- Nếu có bảng đáp án ở cuối đề, dùng bảng đáp án đó để điền correctValue.
- Nếu không thấy đáp án của một câu trong tài liệu, để correctValue là chuỗi rỗng "". Tuyệt đối không đoán.
- Không viết lời giải dài trong bước này. Lời giải dài sẽ được tạo ở chức năng khác sau khi học sinh làm bài.

QUY TẮC CHUYỂN ĐỔI:
1. Câu trắc nghiệm A/B/C/D:
   - type = "single-choice".
   - options phải chứa đúng các lựa chọn nhìn thấy trong đề, giữ tiền tố "A. ...", "B. ...", "C. ...", "D. ...".
   - correctValue phải TRÙNG với một phần tử trong options nếu có đáp án. Ví dụ: "B. disappointed".
2. Câu viết lại câu:
   - type = "rewrite".
   - Không dùng options.
3. Câu sắp xếp từ:
   - type = "reorder".
   - Không dùng options.
4. Đoạn đọc hiểu:
   - Đưa đoạn văn vào trường passage của section chứa các câu hỏi liên quan.
5. Phần phát âm/trọng âm:
   - Giữ nguyên từ và làm rõ phần được gạch chân nếu đọc được, ví dụ dùng dấu ngoặc: disapp(o)inted.

ĐỊNH DẠNG JSON DUY NHẤT ĐƯỢC TRẢ VỀ:
{
  "title": "Tên đề thi lấy từ tài liệu, nếu không thấy thì ghi Đề thi trích xuất từ tài liệu",
  "duration": 60,
  "sections": [
    {
      "id": "sec_1",
      "title": "Tên phần trong đề",
      "instruction": "Hướng dẫn gốc của phần này",
      "passage": "Đoạn văn nếu có, nếu không có thì để trống",
      "questions": [
        {
          "id": "q1",
          "question": "Nguyên văn câu hỏi/câu cần hoàn thành",
          "type": "single-choice",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correctValue": "A. ...",
          "explanation": "Trích xuất từ tài liệu gốc."
        }
      ]
    }
  ]
}

KIỂM TRA CUỐI TRƯỚC KHI TRẢ JSON:
- Đếm lại tổng số câu đã đưa vào JSON.
- Nếu tài liệu có câu 1 đến câu 40 thì JSON phải có 40 câu.
- Không dùng markdown, không dùng code fence, không giải thích ngoài JSON.
`;

    contentsParts.push({ text: promptText });

    const generated = await generateExamJsonWithGemini(client, contentsParts);
    const rawExam = extractJsonObject(generated.text);
    const parsedExam = normalizeParsedExam(rawExam);
    const extractedQuestionCount = countQuestionsInExam(parsedExam);

    const minimumExpected = expectedFromText
      ? Math.max(1, Math.floor(expectedFromText * 0.9))
      : fileData
        ? 10
        : 1;

    if (extractedQuestionCount < minimumExpected) {
      return res.status(422).json({
        success: false,
        error: `AI chỉ trích xuất được ${extractedQuestionCount} câu${expectedFromText ? `/${expectedFromText} câu dự kiến` : ""}. Kết quả này có khả năng thiếu đề nên hệ thống đã chặn, không đăng đề sai. Hãy thử PDF rõ hơn, không bị scan mờ/2 cột phức tạp, hoặc copy toàn bộ nội dung đề và dán vào ô văn bản.`,
        extractedQuestionCount,
        expectedQuestionCount: expectedFromText || null,
        model: generated.model,
      });
    }

    return res.json({
      success: true,
      exam: parsedExam,
      extractedQuestionCount,
      expectedQuestionCount: expectedFromText || null,
      model: generated.model,
    });

  } catch (error: any) {
    console.error("AI Exam Parse Error: ", error);
    return res.status(500).json({
      success: false,
      error: `Không thể trích xuất đề thi này. Chi tiết: ${error?.message || "Lỗi không xác định"}`
    });
  }
});


// ==================== VITE & STATIC FILES SERVING ====================

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode with Vite Dev Server Middleware
    console.log("Setting up Vite Dev Middleware in Development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode - Serve built static bundles
    console.log("Serving static files from /dist in Production mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    app.use(express.static(distPath));
    
    // Fallback all other client requests to SPA index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Server running in ${process.env.NODE_ENV} background at: http://0.0.0.0:${PORT}`);
  });
}

setupServer();
