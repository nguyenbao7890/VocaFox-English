import { MockExam } from '../types';

export const mockExams: MockExam[] = [
  {
    id: "exam_10_01",
    title: "Đề Thi Thử Vào Lớp 10 - Đề Số 1 (Tổng hợp cơ bản đến nâng cao)",
    duration: 60, // 60 minutes
    sections: [
      {
        id: "ex1_sec1",
        title: "PHẦN 1: PHÁT ÂM & TRỌNG ÂM (PRONUNCIATION & STRESS)",
        instruction: "Chọn phương án đúng (A, B, C hoặc D) cho mỗi câu sau:",
        questions: [
          {
            id: "ex1_q1",
            question: "Chọn từ có phần gạch chân phát âm khác các từ còn lại:",
            type: "single-choice",
            options: ["A. packed", "B. finished", "C. sacred /id/", "D. mashed"],
            correctValue: "C. sacred /id/",
            explanation: "Quy tắc phát âm đuôi '-ed'. Đuôi '-ed' trong 'sacred' phát âm là /ɪd/ vì đây là tính từ đặc biệt (thiêng liêng), trong khi các động từ còn lại phát âm là /t/."
          },
          {
            id: "ex1_q2",
            question: "Chọn từ có phần gạch chân phát âm khác các từ còn lại:",
            type: "single-choice",
            options: ["A. theme", "B. though", "C. think", "D. thread"],
            correctValue: "B. though",
            explanation: "Phần gạch chân 'th' trong 'though' phát âm là /ð/ (âm hữu thanh), còn lại ('theme', 'think', 'thread') phát âm là /θ/ (vô thanh)."
          },
          {
            id: "ex1_q3",
            question: "Chọn từ có vị trí trọng âm khác với những từ còn lại:",
            type: "single-choice",
            options: ["A. artisan", "B. attraction", "C. companion", "D. depression"],
            correctValue: "A. artisan",
            explanation: "'artisan' có trọng âm rơi vào âm tiết thứ nhất /ˌɑːtɪˈzæn/ (hoặc âm thứ 3, nhưng trọng âm chính ở âm 1). Các từ còn lại 'attraction' /əˈtrækʃn/, 'companion' /kəˈpænjən/, 'depression' /dɪˈpreʃn/ đều có trọng âm rơi vào âm hai."
          }
        ]
      },
      {
        id: "ex1_sec2",
        title: "PHẦN 2: NGỮ PHÁP, TỪ VỰNG & GIAO TIẾP (GRAMMAR & VOCABULARY)",
        instruction: "Chọn phương án đúng nhất từ A, B, C hoặc D để hoàn thành các câu:",
        questions: [
          {
            id: "ex1_q4",
            question: "The village council decided to ______________ a new vocational class for young artisans last month.",
            type: "single-choice",
            options: ["A. take up", "B. set up", "C. look after", "D. pass down"],
            correctValue: "B. set up",
            explanation: "'set up' có nghĩa là thiết lập, thành lập (một lớp học nghề). 'take up': bắt đầu một thói quen; 'look after': chăm sóc; 'pass down': truyền lại."
          },
          {
            id: "ex1_q5",
            question: "The ___________ she studies for the exam, the ____________ her scores will be.",
            type: "single-choice",
            options: ["A. more hard / more high", "B. harder / highest", "C. harder / higher", "D. hardest / higher"],
            correctValue: "C. harder / higher",
            explanation: "Sử dụng cấu trúc so sánh kép: The + comparative, the + comparative. Vì 'hard' và 'high' là tính từ ngắn nên dùng 'harder' và 'higher'."
          },
          {
            id: "ex1_q6",
            question: "I wish my family _______________ to that beautiful island last summer holiday.",
            type: "single-choice",
            options: ["A. traveled", "B. would travel", "C. had traveled", "D. have traveled"],
            correctValue: "C. had traveled",
            explanation: "Câu ước cho quá khứ (do có trạng từ chỉ thời gian quá khứ 'last summer holiday'). Công thức: S + wish + S + had + V3/ed."
          },
          {
            id: "ex1_q7",
            question: "The student asked her advisor ______________ to reduce stress during preparation period.",
            type: "single-choice",
            options: ["A. how to do", "B. what to do", "C. what doing", "D. who doing"],
            correctValue: "B. what to do",
            explanation: "Sử dụng cấu trúc Wh-word + to-V. 'what to do' (làm cái gì). 'what to do to reduce stress' nghĩa là 'làm gì để giảm cân thẳng'."
          },
          {
            id: "ex1_q8",
            question: "Hoa: 'Why don't we go to the pottery village this Saturday?' – Lan: '___________'",
            type: "single-choice",
            options: ["A. That is a great idea!", "B. You are welcome.", "C. Yes, we do.", "D. It is mine."],
            correctValue: "A. That is a great idea!",
            explanation: "'Why don't we...?' là lời gợi ý. Đáp án thích hợp để phản hồi tích cực là 'That is a great idea!' (Ý kiến thật tuyệt!)."
          }
        ]
      },
      {
        id: "ex1_sec3",
        title: "PHẦN 3: ĐỌC HIỂU ĐIỀN TỪ (CLOZE TEXT)",
        instruction: "Đọc đoạn văn dưới đây và chọn đáp án thích hợp nhất điền vào chỗ trống:",
        passage: "Living in a large city has both advantages and disadvantages. On the one hand, cities offer numerous job opportunities, modern hospitals, and highly (1)______ schools. Residents can get around easily thanks to advanced (2)______ systems like the skytrain and metro lines. On the other hand, citizens often suffer from heavy traffic, continuous sound pollution, and high living costs. Many children in urban areas face peer (3)______ and academic anxiety. However, cities are still highly (4)______ because they are bustling and cosmopolitan spots that welcome diverse populations.",
        questions: [
          {
            id: "ex1_q9",
            question: "Chỗ trống (1):",
            type: "single-choice",
            options: ["A. reputation", "B. reputable", "C. companion", "D. nostalgic"],
            correctValue: "B. reputable",
            explanation: "- 'reputable' (tính từ, có tiếng tăm, có uy tín) đứng trước danh từ 'schools'. 'reputation' là danh từ."
          },
          {
            id: "ex1_q10",
            question: "Chỗ trống (2):",
            type: "single-choice",
            options: ["A. transportation", "B. vehicle", "C. travel", "D. attraction"],
            correctValue: "A. transportation",
            explanation: "- 'transportation systems' (hệ thống giao thông công cộng vận tải), phù hợp với mô tả 'skytrain' và 'metro lines'."
          },
          {
            id: "ex1_q11",
            question: "Chỗ trống (3):",
            type: "single-choice",
            options: ["A. stress", "B. worry", "C. pressure", "D. attraction"],
            correctValue: "C. pressure",
            explanation: "- 'peer pressure' là cụm danh từ ghép nghĩa là áp lực từ bạn bè đồng trang lứa học sinh lớp 9 thường gặp."
          },
          {
            id: "ex1_q12",
            question: "Chỗ trống (4):",
            type: "single-choice",
            options: ["A. livable", "B. preserved", "C. packed", "D. customed"],
            correctValue: "A. livable",
            explanation: "- 'livable' (đáng sống). Mặc dù có nhược điểm nhưng thành phố vẫn là nơi đáng sống vì sự sầm uất đa văn hóa."
          }
        ]
      },
      {
        id: "ex1_sec4",
        title: "PHẦN 4: BIẾN ĐỔI CÂU & SẮP XẾP (WRITING EXERCISE)",
        instruction: "Sử dụng các từ khóa cung cấp hoặc cấu trúc được học để viết lại, sắp xếp các câu sau đây:",
        questions: [
          {
            id: "ex1_q13",
            question: "Sắp xếp lại câu đúng ngữ pháp: \"the / we / harder / exercise / the / healthier / feel / we\"",
            type: "reorder",
            correctValue: "The harder we exercise the healthier we feel",
            explanation: "So sánh kép: The harder we exercise, the healthier we feel (Chúng ta càng rèn luyện chăm chỉ, chúng ta càng thấy khỏe mạnh)."
          },
          {
            id: "ex1_q14",
            question: "Viết lại câu sau sử dụng cấu trúc ước cho quá khứ: \"I am deeply sorry that I did not visit the local craft museum with my teacher.\" (I wish)",
            type: "rewrite",
            correctValue: "I wish I had visited the local craft museum with my teacher",
            explanation: "Chuyển câu nuối tiếc ở quá khứ 'did not visit' thành câu ước 'wish + had visited'."
          },
          {
            id: "ex1_q15",
            question: "Chuyển sang dạng gián tiếp: \"He asked the local artist: 'How can I weave this silk scarf?'\" (asked the local artist how to)",
            type: "rewrite",
            correctValue: "He asked the local artist how to weave this silk scarf",
            explanation: "Sử dụng 'Wh-word + to V' để rút gọn mệnh đề gián tiếp. 'how I can weave' chuyển thành 'how to weave'."
          }
        ]
      }
    ]
  },
  {
    id: "exam_10_02",
    title: "Đề Thi Thử Vào Lớp 10 - Đề Số 2 (Chuyên đề cấu trúc trọng điểm)",
    duration: 60,
    sections: [
      {
        id: "ex2_sec1",
        title: "PHẦN 1: PHÁT ÂM & TRỌNG ÂM (PRONUNCIATION & PHONICS)",
        instruction: "Chọn từ có cách phát âm hoặc trọng âm khác biệt rõ nhất:",
        questions: [
          {
            id: "ex2_q1",
            question: "Chọn từ có vị trí trọng âm khác các từ còn lại:",
            type: "single-choice",
            options: ["A. modernise", "B. anxiety", "C. preserve", "D. attract"],
            correctValue: "A. modernise",
            explanation: "'modernise' /ˈmɒdənaɪz/ có trọng âm rơi vào âm tiết đầu. Các từ còn lại: 'anxiety' /æŋˈzaɪəti/ (âm 2), 'preserve' /prɪˈzɜːv/ (âm 2), 'attract' /əˈtræk/ (âm 2)."
          },
          {
            id: "ex2_q2",
            question: "Chọn từ có phần gạch chân phát âm khác các từ còn lại:",
            type: "single-choice",
            options: ["A. local", "B. cosmopolitan", "C. focus", "D. open"],
            correctValue: "B. cosmopolitan",
            explanation: "'o' trong 'cosmopolitan' phát âm là /ɒ/ ngắn, trong khi 3 từ còn lại phát âm là nguyên âm đôi /əʊ/."
          }
        ]
      },
      {
        id: "ex2_sec2",
        title: "PHẦN 2: THỰC HÀNH NGỮ PHÁP (GRAMMAR IN ACTION)",
        instruction: "Chọn từ thích hợp điền vào chỗ trống để hoàn thành câu:",
        questions: [
          {
            id: "ex2_q3",
            question: "If we don't ______________ our historic houses, they will disappear over time.",
            type: "single-choice",
            options: ["A. pass down", "B. set up", "C. preserve", "D. look forward"],
            correctValue: "C. preserve",
            explanation: "'preserve' là bảo tồn, giữ gìn phong cách kiến trúc cũ khỏi xuống cấp, biến mất."
          },
          {
            id: "ex2_q4",
            question: "I have lived in this bustling area for five years, so I can easily ______________ stressful traffic.",
            type: "single-choice",
            options: ["A. get on with", "B. cope with", "C. cut down on", "D. read out"],
            correctValue: "B. cope with",
            explanation: "'cope with' nghĩa là đối diện, xử lý, đương đầu thành công với vấn đề kẹt xe căng thẳng."
          },
          {
            id: "ex2_q5",
            question: "The teacher suggested that the students ______________ on plastic waste to preserve the ecosystem.",
            type: "single-choice",
            options: ["A. cut down on", "B. to cut down", "C. cutted down", "D. cutting down"],
            correctValue: "A. cut down on",
            explanation: "Cấu trúc giả định với suggest: S + suggest + that + S + (should) + V_inf. Do đó động từ giữ nguyên mẫu 'cut down on'."
          }
        ]
      },
      {
        id: "ex2_sec3",
        title: "PHẦN 3: ĐỌC TIẾP ĐOẠN VĂN (READING COMPREHENSION)",
        instruction: "Đọc đoạn văn sau và trả lời các câu hỏi trắc nghiệm bên dưới:",
        passage: "Traditional crafts are an integral part of Vietnamese cultural heritage. In places like Bat Trang pottery village, Van Phuc silk village, or Dong Ho painting village, artisans have passed down manual techniques through generations. Originally, these crafts met the functional needs of farmers. Nowadays, they are highly appreciated as works of art. However, young generations often experience strong peer pressure to find higher-paying corporate jobs in big cities rather than learning traditional skills. To save these cultural assets, local authorities have recently set up specialized schools where young people can study how to weave, carve, and preserve ancestral trades.",
        questions: [
          {
            id: "ex2_q6",
            question: "What is the passage mainly about?",
            type: "single-choice",
            options: [
              "A. High-paying corporate jobs in the capitals.",
              "B. Historical farming techniques in Vietnamese villages.",
              "C. Traditional crafts and efforts to preserve them.",
              "D. The origin of foreign trading routes around silk villages."
            ],
            correctValue: "C. Traditional crafts and efforts to preserve them.",
            explanation: "Toàn bài nói về di sản thủ công mỹ nghệ, những thách thức thế hệ trẻ không mặn mà và giải pháp thành lập trường nghề của chính quyền địa phương."
          },
          {
            id: "ex2_q7",
            question: "Why do young people hesitate to learn traditional manual skills?",
            type: "single-choice",
            options: [
              "A. Because they suffer from heavy physical asthma.",
              "B. Because of peer pressure to find higher-paying corporate jobs in cities.",
              "C. Because there are no artisans left in Bat Trang.",
              "D. Because they don't like visiting old historical temples."
            ],
            correctValue: "B. Because of peer pressure to find higher-paying corporate jobs in cities.",
            explanation: "Như bài học nêu rõ: 'young generations often experience strong peer pressure to find higher-paying corporate jobs in big cities'."
          },
          {
            id: "ex2_q8",
            question: "How are traditional crafts viewed nowadays compared to the past?",
            type: "single-choice",
            options: [
              "A. They are feared as toxic ancient systems.",
              "B. They are ignored completely by visitors.",
              "C. They are appreciated as valuable works of art.",
              "D. They are only used for modern dynamic military vehicles."
            ],
            correctValue: "C. They are appreciated as valuable works of art.",
            explanation: "Đoạn văn viết: 'Originally, these crafts met the functional needs of farmers. Nowadays, they are highly appreciated as works of art...'"
          }
        ]
      },
      {
        id: "ex2_sec4",
        title: "PHẦN 4: THỰC HÀNH VIẾT (WRITING DISCOVERY)",
        instruction: "Hãy hoàn thiện các câu viết lại / sắp xếp dưới đây theo yêu cầu đề bài:",
        questions: [
          {
            id: "ex2_q9",
            question: "Viết lại sang câu ước: \"It is a pity that my close friend does not join the healthy diet club with me.\" (I wish my close friend)",
            type: "rewrite",
            correctValue: "I wish my close friend joined the healthy diet club with me",
            explanation: "Ước cho hiện tại trái với thực tế: đổi từ 'does not join' sang thì Quá khứ đơn 'joined'."
          },
          {
            id: "ex2_q10",
            question: "Sắp xếp lại các từ thành câu đúng hoàn chỉnh: \"don't / I / who / ask / healthy tips / for / know / to\" ",
            type: "reorder",
            correctValue: "I don't know who to ask for healthy tips",
            explanation: "Cấu trúc rút gọn: S + don't know + who + to V + O. Nghĩa: Tôi không biết hỏi ai lời khuyên về sức khỏe."
          }
        ]
      }
    ]
  }
];
