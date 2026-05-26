import { TextbookUnit } from '../types';

export const grade9Units: TextbookUnit[] = [
  {
    id: 1,
    un: "Unit 1",
    title: "Local Community",
    vietnameseTitle: "Cộng đồng Địa phương",
    overview: "Học về các hoạt động cộng đồng, các nghề thủ công truyền thống, các địa điểm nổi tiếng địa phương và vai trò của các cá nhân đóng góp cho cộng đồng.",
    vocabulary: [
      {
        word: "artisan",
        phonetic: "/ˌɑːtɪˈzæn/",
        meaning: "nghệ nhân, thợ thủ công lành nghề",
        example: "The local artisan taught us how to make traditional pottery."
      },
      {
        word: "attraction",
        phonetic: "/əˈtrækʃn/",
        meaning: "điểm thu hút du lịch",
        example: "The ancient pagoda is the main tourist attraction in our village."
      },
      {
        word: "handicraft",
        phonetic: "/ˈhændikrɑːft/",
        meaning: "sản phẩm thủ công mỹ nghệ",
        example: "They sell beautiful handicrafts made from bamboo."
      },
      {
        word: "preserve",
        phonetic: "/prɪˈzɜːv/",
        meaning: "bảo tồn, giữ gìn",
        example: "We should preserve our traditional ways of life."
      },
      {
        word: "community helper",
        phonetic: "/kəˈmjuːnəti ˈhelpə/",
        meaning: "người giúp ích cho cộng đồng (lính cứu hỏa, y sĩ, tổ dân phố...)",
        example: "Doctors, policemen, and waste collectors are all community helpers."
      },
      {
        word: "pass down",
        phonetic: "/pɑːs daʊn/",
        meaning: "truyền lại (qua các thế hệ)",
        example: "These traditional recipes were passed down from my great-grandmother."
      },
      {
        word: "look after",
        phonetic: "/lʊk ˈɑːftə/",
        meaning: "chăm sóc, trông nom",
        example: "Parents look after their children and teach them local customs."
      },
      {
        word: "set up",
        phonetic: "/set ʌp/",
        meaning: "thành lập, khởi sự",
        example: "The youth union set up a volunteer club last weekend."
      },
      {
        word: "cut down on",
        phonetic: "/kʌt daʊn ɒn/",
        meaning: "cắt giảm, giảm bớt",
        example: "We must cut down on plastic usage to keep the neighborhood clean."
      },
      {
        word: "get on with",
        phonetic: "/ɡet ɒn wɪð/",
        meaning: "ăn ý, hòa đồng, có quan hệ tốt với",
        example: "She gets on very well with her neighbors in the village."
      }
    ],
    grammar: [
      {
        title: "Cụm động từ (Phrasal Verbs)",
        content: "Cụm động từ gồm một động từ kết hợp với một hoặc hai giới từ hoặc trạng từ. Ý nghĩa của nó thường khác hoàn toàn động từ gốc ban đầu.",
        examples: [
          "find out (khám phá/tìm hiểu): We want to find out more about local history.",
          "run out of (hết/cạn kiệt): The charity ran out of school supplies for poor children.",
          "look forward to (trông chờ): Everyone looks forward to the autumn festival."
        ]
      },
      {
        title: "Câu hỏi từ nối đứng trước To-Infinitive (Question Words before To-Infinitive)",
        content: "Ta có thể dùng các từ nghi vấn (who, what, where, when, how - ngoại trừ 'why') trước động từ nguyên mẫu có 'to' (to V) để rút gọn mệnh đề phụ danh từ.",
        examples: [
          "The tourists didn't know where to buy authentic handicrafts.",
          "She asked the artisan how to weave a bamboo basket.",
          "Can you explain who to contact for community services?"
        ]
      }
    ],
    pronunciation: {
      title: "Trọng âm của Content Words và Structure Words",
      explanation: "Trong câu tiếng Anh, Content Words (Từ mang ý nghĩa chính: danh từ, động từ chính, tính từ, trạng từ) thường được nhấn trọng âm, còn Structure Words (Từ cấu trúc: giới từ, quán từ, đại từ, liên từ) thường không được nhấn.",
      examples: [
        "We 'live in a 'busy 'neighborhood. (Nhấn âm vào live, busy, neighborhood)",
        "The 'artisan is 'making 'pottery. (Nhấn vào artisan, making, pottery)"
      ]
    },
    exercises: [
      {
        id: "u1_q1",
        question: "Chọn từ có phần gạch chân phát âm khác các từ còn lại:",
        type: "single-choice",
        options: ["A. artisan", "B. attract", "C. craft", "D. garden"],
        correctValue: "B. attract",
        explanation: "Phần gạch chân 'a' trong 'attract' phát âm là /æ/, trong các từ còn lại phát âm là /ɑː/."
      },
      {
        id: "u1_q2",
        question: "Traditional crafts are _______________ from generation to generation in my village.",
        type: "single-choice",
        options: ["A. passed down", "B. set up", "C. look after", "D. cut down"],
        correctValue: "A. passed down",
        explanation: "'pass down' có nghĩa là truyền lại từ đời này sang đời khác."
      },
      {
        id: "u1_q3",
        question: "Sắp xếp lại các từ sau thành câu đúng: \"not know / how / we / did / pottery craft / make / to\" ",
        type: "reorder",
        correctValue: "We did not know how to make pottery craft",
        explanation: "Cấu trúc S + did not know + how to + V_inf. (Chúng tôi đã không biết cách làm đồ xốm thủ công)."
      },
      {
        id: "u1_q4",
        question: "Viết lại câu sử dụng từ gợi ý đứng trước To-Infinitive: \"They don't know where they should go for more information.\" (where to)",
        type: "rewrite",
        correctValue: "They don't know where to go for more information",
        explanation: "Sử dụng 'where to V' thay thế cho 'where they should V'. Kết quả: They don't know where to go for more information."
      }
    ]
  },
  {
    id: 2,
    un: "Unit 2",
    title: "City Life",
    vietnameseTitle: "Cuộc sống Thành thị",
    overview: "Khám phá đời sống ở các đô thị lớn, những vấn đề bất cập (kẹt xe, ô nhiễm, tiếng ồn) và đặc thù của những siêu đô thị đa dạng văn hóa.",
    vocabulary: [
      {
        word: "cosmopolitan",
        phonetic: "/ˌkɒzməˈpɒlɪtən/",
        meaning: "thuộc về thế giới, đa văn hóa, đa chủng tộc",
        example: "London is a highly cosmopolitan city with people from all over the world."
      },
      {
        word: "packed",
        phonetic: "/pækt/",
        meaning: "chật ních, đông nghẹt người",
        example: "The morning light railways are always packed with commuters."
      },
      {
        word: "metro",
        phonetic: "/ˈmetrəʊ/",
        meaning: "hệ thống tàu điện ngầm đô thị",
        example: "The city plan is to build two more metro lines by next year."
      },
      {
        word: "livable",
        phonetic: "/ˈlɪvəbl/",
        meaning: "đáng sống",
        example: "Da Nang is chosen as one of the most livable cities in Vietnam."
      },
      {
        word: "urban sprawl",
        phonetic: "/ˈɜːbən sprɔːl/",
        meaning: "sự đô thị hóa tự phát, sự tràn lan đô thị",
        example: "Urban sprawl destroys valuable green farmlands around major capitals."
      },
      {
        word: "bustling",
        phonetic: "/ˈbʌslɪŋ/",
        meaning: "hối hả, nhộn nhịp, hoạt động tấp nập",
        example: "The market square was bustling with activity."
      },
      {
        word: "sky-high",
        phonetic: "/skaɪ haɪ/",
        meaning: "cao chọc trời, cực kỳ đắt đỏ (về chi phí)",
        example: "Rent prices in this metropolis are sky-high."
      },
      {
        word: "get around",
        phonetic: "/ɡet əˈraʊnd/",
        meaning: "di chuyển xung quanh, đi lại",
        example: "The skytrain is the most efficient way to get around the city."
      }
    ],
    grammar: [
      {
        title: "Cấu trúc So sánh kép với Tính từ (Double Comparatives)",
        content: "Dùng để diễn tả mối tương quan song song: cái này tăng/giảm thì cái kia cũng tăng/giảm theo.\nCông thức: The + comparative adj/adv + S + V, the + comparative adj/adv + S + V.",
        examples: [
          "The bigger the city is, the more crowded it becomes. (Thành phố càng lớn thì càng trở nên đông đúc).",
          "The more modern the skytrain is, the faster people can travel. (Tàu điện càng hiện đại, người dân di chuyển càng nhanh)."
        ]
      }
    ],
    pronunciation: {
      title: "Trọng âm tương phản (Contrastive Stress)",
      explanation: "Nhấn mạnh có chủ ý vào một từ cụ thể trong câu để làm nổi bật sự so sánh hoặc tương phản với một đối tượng khác.",
      examples: [
        "I'd prefer to live in 'Ha Noi, not 'Hai Phong. (Nhấn âm mạnh hơn hẳn vào Ha Noi và Hai Phong)",
        "Is city life 'more expensive? No, it's 'much more expensive. (Nhấn vào more và much)"
      ]
    },
    exercises: [
      {
        id: "u2_q1",
        question: "The crowded metropolitan areas are always ______________ with people and traffic.",
        type: "single-choice",
        options: ["A. cosmopolitan", "B. packed", "C. livable", "D. preserved"],
        correctValue: "B. packed",
        explanation: "'packed with' có nghĩa là chật cứng, đông đúc người qua lại."
      },
      {
        id: "u2_q2",
        question: "Cú pháp đúng của So sánh kép: \"The ___________ a city is, the ____________ the living cost gets.\"",
        type: "single-choice",
        options: ["A. larger / higher", "B. more large / more high", "C. large / high", "D. largest / highest"],
        correctValue: "A. larger / higher",
        explanation: "Cả 'large' và 'high' là tính từ ngắn nên dạng so sánh là larger và higher."
      },
      {
        id: "u2_q3",
        question: "Sắp xếp từ để viết câu so sánh kép hoàn chỉnh: \"the / better / we / study / the / more / options / have / we\" ",
        type: "reorder",
        correctValue: "The better we study the more options we have",
        explanation: "Cấu trúc: The better S + V, the more noun S + have. Nghĩa: Chúng ta càng học giỏi thì chúng ta càng có nhiều cơ hội lựa chọn."
      },
      {
        id: "u2_q4",
        question: "Viết lại câu sau sử dụng So sánh kép: \"If you practice English speaking often, you will speak it fluently.\" (The more / the more)",
        type: "rewrite",
        correctValue: "The more often you practice English speaking the more fluently you will speak it",
        explanation: "Sử dụng trạng từ 'often' và 'fluently' chuyển thành so sánh kép: The more often S + V, the more fluently S + V."
      }
    ]
  },
  {
    id: 3,
    un: "Unit 3",
    title: "Healthy Living",
    vietnameseTitle: "Lối sống Lành mạnh",
    overview: "Xoay quanh việc chăm sóc sức khỏe thể chất và tinh thần của thanh thiếu niên, quản lý áp lực học tập và các xung đột tâm sinh lý tuổi dậy thì.",
    vocabulary: [
      {
        word: "balanced diet",
        phonetic: "/ˌbælənst ˈdaɪət/",
        meaning: "chế độ ăn uống cân bằng dinh dưỡng",
        example: "Eating plenty of green vegetables is key to a balanced diet."
      },
      {
        word: "anxiety",
        phonetic: "/æŋˈzaɪəti/",
        meaning: "sự lo âu, băn khoăn, hồi hộp",
        example: "Exam anxiety can keep students awake at night easily."
      },
      {
        word: "peer pressure",
        phonetic: "/ˈpɪə preʃə/",
        meaning: "áp lực từ bạn bè đồng trang lứa",
        example: "Many teenagers experience peer pressure to buy trendy gadgets."
      },
      {
        word: "prioritise",
        phonetic: "/praɪˈɒrɪtaɪz/",
        meaning: "ưu tiên điều gì",
        example: "You must prioritise sleeping at least 8 hours during tests."
      },
      {
        word: "well-being",
        phonetic: "/ˈwel biːɪŋ/",
        meaning: "tình trạng hạnh phúc, khỏe mạnh về cả thể xác lẫn tâm hồn",
        example: "A balance between schoolwork and recreation enhances your well-being."
      },
      {
        word: "optimistic",
        phonetic: "/ˌɒptɪˈmɪstɪk/",
        meaning: "lạc quan",
        example: "Try to stay optimistic even when you get a lower score than expected."
      },
      {
        word: "cope with",
        phonetic: "/kəʊp wɪð/",
        meaning: "đối phó, xử lý thành công khó khăn",
        example: "My teacher showed me how to cope with stressful schedules."
      }
    ],
    grammar: [
      {
        title: "Câu gián tiếp với Từ hỏi + Động từ nguyên mẫu (Reported Speech with Question Words + To To-Infinitive)",
        content: "Khi tường thuật lại thắc mắc, băn khoăn của ai đó, ta có thể dùng từ để hỏi đi kèm 'to + V' để làm cho câu gọn gàng hơn. (Wh-word + to V)",
        examples: [
          "Direct speech: 'I don't know what I should do,' Mary said. -> Indirect speech: Mary complained that she didn't know what to do.",
          "Direct: 'We did not know where we could ask for help,' they said. -> Indirect: They stated they did not know where to ask for help."
        ]
      }
    ],
    pronunciation: {
      title: "Nối âm và biến đổi âm trong câu nói tự nhiên",
      explanation: "Trong giao tiếp hằng ngày, các âm cuối của từ đứng trước sẽ nối liền với nguyên âm của từ đứng sau (linking sound). Các từ không quan trọng có thể biến đổi nhẹ để câu trôi chảy hơn.",
      examples: [
        "think_about_it -> /θɪŋk‿əˈbaʊt‿ɪt/",
        "take_up‿a sport -> /teɪk‿ʌp‿ə spɔːt/"
      ]
    },
    exercises: [
      {
        id: "u3_q1",
        question: "Teenagers should eat healthy foods and gym regularly to improve their physical ______________.",
        type: "single-choice",
        options: ["A. anxiety", "B. peer pressure", "C. well-being", "D. priority"],
        correctValue: "C. well-being",
        explanation: "'well-being' chỉ sức khỏe chung toàn diện và cảm giác hạnh phúc."
      },
      {
        id: "u3_q2",
        question: "Indirect transformation: \"Jack said: 'I don't know who I should talk to.'\" -> Jack said he didn't know ______________.",
        type: "single-choice",
        options: ["A. who of whom to talk", "B. who to talk to", "C. who talking to", "D. talk to whom"],
        correctValue: "B. who to talk to",
        explanation: "Thay thế mệnh đề 'who I should talk to' thành cụm 'who to talk to' mang sắc thái gọn hơn."
      },
      {
        id: "u3_q3",
        question: "Sắp xếp lại các từ sau: \"how / solve / told me / the counselor / the stress / to\" ",
        type: "reorder",
        correctValue: "The counselor told me how to solve the stress",
        explanation: "Cấu trúc: S + told me + how to + V + O. (Người cố vấn đã nói với tôi cách làm sao để giải tỏa căng thẳng)."
      },
      {
        id: "u3_q4",
        question: "Viết lại câu sau sang gián tiếp sử dụng cụm Wh-word + to-V: \"Minh asked: 'Where should I apply for this youth wellness club?'\"",
        type: "rewrite",
        correctValue: "Minh asked where to apply for this youth wellness club",
        explanation: "Minh asked + where to V-inf... chuyển đổi ngôi và thì một cách tinh gọn."
      }
    ]
  },
  {
    id: 4,
    un: "Unit 4",
    title: "Remembering the Past",
    vietnameseTitle: "Nhớ về Quá khứ",
    overview: "Học tập về văn hóa xưa cũ, các trò chơi truyền thống của trẻ em Việt Nam xưa, các tập tục lịch sử và so sánh đổi thay của khoa học công nghệ.",
    vocabulary: [
      {
        word: "preserve",
        phonetic: "/prɪˈzɜːv/",
        meaning: "lưu giữ, gìn giữ, bảo tồn",
        example: "Vocal stories help us preserve history before written writing was invented."
      },
      {
        word: "technological advancement",
        phonetic: "/ˌteknəˈlɒdʒɪkl ədˈvɑːnsmənt/",
        meaning: "sự tiến bộ, phát triển vượt bậc của khoa học công nghệ",
        example: "With technological advancement, students now read digital books easily."
      },
      {
        word: "nostalgia",
        phonetic: "/nɒˈstældʒə/",
        meaning: "nỗi nhớ nhà, lòng hoài cổ, nhớ về quá khứ",
        example: "The antique black-and-white photos filled my grandmother with nostalgia."
      },
      {
        word: "custom",
        phonetic: "/ˈkʌstəm/",
        meaning: "phong tục, tục lệ quen thuộc",
        example: "It is a tight custom in Vietnam to visit parents on the first day of Tet."
      },
      {
        word: "collect",
        phonetic: "/kəˈlekt/",
        meaning: "thu gom, góp nhặt, sưu tầm",
        example: "Years ago, we used to collect wood for cooking fire every afternoon."
      },
      {
        word: "toss",
        phonetic: "/tɒs/",
        meaning: "tung, ném nhẹ, quăng",
        example: "Kids played traditional games like tossing dry coins into a circle."
      }
    ],
    grammar: [
      {
        title: "Ước cho quá khứ (Wish for the Past)",
        content: "Dùng để diễn tả một mong muốn, một sự nuối tiếc về một sự việc không có thật trong quá khứ.\nCông thức: S + wish(es) + S + had + V3/ed (Hoặc had + not + V3/ed).",
        examples: [
          "I wish I had lived in a peaceful countryside during my childhood. (Tôi ước giá như tuổi thơ mình sống ở nông thôn thanh bình - thực tế không phải vậy).",
          "They wish they hadn't lost those valuable historical objects. (Họ ước gì đã không làm thất lạc những đồ vật lịch sử quý giá đó)."
        ]
      }
    ],
    pronunciation: {
      title: "Ngữ điệu đi xuống và đi lên ở các kiểu câu",
      explanation: "Thông thường câu khẳng định và câu hỏi Wh- kết thúc bằng ngữ điệu đi xuống. Câu hỏi Yes/No kết thúc bằng ngữ điệu đi lên.",
      examples: [
        "Where did they play? (Wh-question: ngữ điệu xuống ở cuối câu)",
        "Did you walk to school in the past? (Yes/No question: ngữ điệu nâng lên ở cuối từ 'past')"
      ]
    },
    exercises: [
      {
        id: "u4_q1",
        question: "Grandpa feels a strong wave of ______________ whenever he listens to old folk songs.",
        type: "single-choice",
        options: ["A. customization", "B. advancement", "C. nostalgia", "D. collection"],
        correctValue: "C. nostalgia",
        explanation: "'nostalgia' (lòng hoài cổ, sự nhớ thương quá khứ) phù hợp với ngữ cảnh nghe bài hát dân ca xưa."
      },
      {
        id: "u4_q2",
        question: "Cấu trúc ước cho quá khứ đúng: \"She wishes she ______________ that historic temple when she was in Hue last year.\"",
        type: "single-choice",
        options: ["A. visited", "B. had visited", "C. would visit", "D. visits"],
        correctValue: "B. had visited",
        explanation: "'wish' cho sự kiện xảy ra ở quá khứ 'last year' dùng thì Quá khứ hoàn thành (had + V3/ed)."
      },
      {
        id: "u4_q3",
        question: "Sắp xếp từ thành câu ước ở quá khứ: \"wish / they / stayed / had / longer / at / the ancient village / they\" ",
        type: "reorder",
        correctValue: "They wish they had stayed longer at the ancient village",
        explanation: "Công thức: S + wish + S + had + V3. Ý nghĩa: Họ ước gì họ đã ở lại ngôi làng cổ lâu hơn."
      },
      {
        id: "u4_q4",
        question: "Viết lại câu sử dụng cấu trúc 'wish': \"I am sorry I didn't see the traditional fire dragon dance last Tet.\" (I wish)",
        type: "rewrite",
        correctValue: "I wish I had seen the traditional fire dragon dance last Tet",
        explanation: "Sự nuối tiếc trong quá khứ 'didn't see' đổi sang dạng wish khẳng định lùi thành 'had seen'."
      }
    ]
  }
];
