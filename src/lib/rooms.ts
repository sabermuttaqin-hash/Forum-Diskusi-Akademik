import { 
  CourseRoom, 
  CourseMaterial, 
  Assignment, 
  Submission, 
  RoomScenarioData, 
  AcademicUser 
} from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, query, updateDoc } from 'firebase/firestore';

const LOCAL_ROOMS_KEY = 'akademik_course_rooms_v2';

export const INITIAL_SEED_ROOMS: CourseRoom[] = [
  {
    id: 'room_expedition_1',
    name: 'Kajian Wacana Kritis & Linguistik Terapan',
    section: 'Kelas Reguler A - Semester Ganjil',
    subject: 'Linguistik & Filsafat Bahasa',
    roomCode: 'EXP890',
    teacherId: 'admin_snowprince',
    teacherName: 'SnowPrince (Dosen Pengampu)',
    description: 'Ruang perkuliahan interaktif dengan model diskusi hybrid "The Expedition Choice". Mahasiswa memilih 1 dari 5 topik ekspedisi ilmiah dan berkolaborasi dalam tim zona fisik/daring.',
    bannerGradient: 'from-violet-900 via-indigo-900 to-slate-950',
    discussionScenario: 'expedition',
    members: ['admin_snowprince', 'user_student_1', 'user_student_2', 'user_student_3'],
    memberProfiles: [
      { uid: 'admin_snowprince', displayName: 'SnowPrince', attendance: 'offline', role: 'admin' },
      { uid: 'user_student_1', displayName: 'Nadia Salsabila', attendance: 'offline', role: 'student' },
      { uid: 'user_student_2', displayName: 'Bagas Aditya', attendance: 'online', role: 'student' },
      { uid: 'user_student_3', displayName: 'Farhan Maulana', attendance: 'offline', role: 'student' },
    ],
    materials: [
      {
        id: 'mat_1',
        title: 'Panduan Ekspedisi Topik: Metodologi Analisis Wacana Teun van Dijk',
        content: 'Silakan pelajari kerangka dimensi teks, kognisi sosial, dan konteks sosial. Setiap kelompok ekspedisi wajib membedah korpus berita sesuai tema yang dipilih dalam sesi voting.',
        authorName: 'SnowPrince',
        createdAt: '2026-10-28T09:00:00.000Z',
        type: 'topic',
        tags: ['VanDijk', 'CriticalDiscourse', 'Metodologi'],
      },
      {
        id: 'mat_2',
        title: 'Rubrik Evaluasi Presentasi Lintas Tema (Cross-Topic Showcase)',
        content: 'Di akhir sesi pleno, masing-masing tim mempresentasikan peta konsep (5 menit) gabungan temuan rekan di kelas dan tim online.',
        authorName: 'SnowPrince',
        createdAt: '2026-10-28T10:30:00.000Z',
        type: 'document',
        tags: ['Rubrik', 'Showcase'],
      }
    ],
    assignments: [
      {
        id: 'assign_1',
        title: 'Tugas 1: Lembar Kerja Sintesis Wacana Tim Ekspedisi',
        description: 'Unggah hasil peta konsep atau ringkasan digital analisis korpus teks kelompok Anda. Format PDF/Dokumen Ringkas.',
        dueDate: '2026-11-05T23:59:00.000Z',
        points: 100,
        createdAt: '2026-10-28T11:00:00.000Z',
        submissions: [
          {
            id: 'sub_1',
            assignmentId: 'assign_1',
            studentId: 'user_student_1',
            studentName: 'Nadia Salsabila',
            studentRole: 'student',
            content: 'Berikut tautan laporan sintesis Tema 1 (Wacana Media Digital & Algoritma Rekomendasi). Tim kami telah memetakan 3 bias representasi utama.',
            attachmentName: 'Sintesis_Tema1_WacanaDigital.pdf',
            submittedAt: '2026-10-29T02:00:00.000Z',
            score: 95,
            feedback: 'Analisis triangulasi sangat mendalam dan kolaborasi online-offline terlihat solid.',
            status: 'graded'
          }
        ]
      }
    ],
    scenarioData: {
      type: 'expedition',
      expeditionTopics: [
        {
          id: 'topic_1',
          title: 'Tema 1: Framing Politik Media & Bias Algoritma Informasi',
          description: 'Menganalisis bagaimana headline media digital membingkai persepsi publik menggunakan model kognisi sosial Teun van Dijk.',
          physicalZone: 'Meja 1 (Zona Fisik Depan Kiri)',
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: [
            { userId: 'user_student_1', userName: 'Nadia Salsabila', attendance: 'offline', joinedAt: '2026-10-29T01:00:00.000Z' },
            { userId: 'user_student_2', userName: 'Bagas Aditya', attendance: 'online', joinedAt: '2026-10-29T01:05:00.000Z' },
          ],
          teamWorksheet: 'Peta Konsep: Ditemukan framing asimetris pada pemberitaan subsidi energi dengan penekanan pada diksi krisis.',
          studyGuide: 'Kajian framing wacana meneliti bagaimana media memilih aspek-aspek tertentu dari suatu realitas dan membuatnya lebih menonjol dalam teks komunikasi. Dalam ekosistem digital saat ini, algoritma kurasi konten berbasis engagement memicu "echo chambers" dan amplifikasi sentimen polaritatif. Model kognisi sosial Teun van Dijk menjembatani teks linguistik makro/mikro dengan skemata mental pembaca.',
          learningObjectives: [
            'Membedah struktur tematik, skematik, semantik, sintaksis, dan retoris teks berita politik.',
            'Mengidentifikasi bias algoritma rekomendasi berita dan dampaknya pada persepsi pemilih muda.',
            'Menyusun peta konsep komparatif antara media arus utama dan portal agregator media sosial.'
          ],
          subTopics: [
            '1. Dimensi Teks Mikro: Pemilihan leksikon emosional dan nominalisasi kata kerja.',
            '2. Dimensi Kognisi Sosial: Konstruksi model mental wartawan dan editor.',
            '3. Dimensi Konteks Sosial: Kepemilikan konglomerasi media dan pengaruh politik lokal.'
          ],
          discussionPrompts: [
            'Bagaimana diksi yang dipilih pada judul berita clickbait memanipulasi kognisi awal pembaca sebelum mereka membaca artikel lengkap?',
            'Apakah algoritma media sosial secara netral mendistribusikan berita, atau secara inheren menguntungkan framing bernada konflik?',
            'Apa strategi counter-discourse yang efektif untuk mengedukasi masyarakat terhadap bias framing media?'
          ],
          readings: [
            { title: 'News Analysis: Case Studies of International and National News in the Press', source: 'Teun A. van Dijk (Routledge)' },
            { title: 'The Filter Bubble: What the Internet Is Hiding from You', source: 'Eli Pariser (Penguin Books)' },
            { title: 'Framing Analysis: An Approach to Discourse Analysis', source: 'Zhongdang Pan & Gerald M. Kosicki' }
          ]
        },
        {
          id: 'topic_2',
          title: 'Tema 2: Bahasa Inklusif & Representasi Gender dalam Wacana Publik',
          description: 'Eksplorasi penggunaan gender-neutral phrasing dan dekonstruksi stereotip linguistik dalam regulasi institusi.',
          physicalZone: 'Meja 2 (Zona Fisik Depan Kanan)',
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: [
            { userId: 'user_student_3', userName: 'Farhan Maulana', attendance: 'offline', joinedAt: '2026-10-29T01:10:00.000Z' },
          ],
          teamWorksheet: 'Draft: Inventarisasi 25 leksikon yang mengalami peyorasi gender dalam pidato kebijakan.',
          studyGuide: 'Bahasa bukan sekadar cerminan realitas, melainkan instrumen pembentuk relasi kuasa. Analisis Wacana Kritis Feminis (Feminist CDA) karya Michelle Lazar menunjukkan bagaimana relasi gender yang tidak setara dinaturalisasi melalui pilihan kata formal, formulir birokrasi, dan stereotip maskulinitas hegemonik di ruang publik.',
          learningObjectives: [
            'Mengidentifikasi bias gender tersembunyi (androcentric bias) dalam dokumen hukum dan tata tertib kampus.',
            'Menganalisis proses asimetri leksikal dan peyorasi kata sifat yang dilekatkan pada gender tertentu.',
            'Merumuskan pedoman panduan bahasa inklusif praktis untuk komunikasi akademik.'
          ],
          subTopics: [
            '1. Asimetri Leksikal: Pembedaan sebutan status perkawinan dalam administrasi resmi.',
            '2. Metafora Domestikasi: Cara media massa melabeli pemimpin perempuan vs pemimpin laki-laki.',
            '3. Rekayasa Kebijakan: Standardisasi terminologi non-diskriminatif dalam panduan penulisan ilmiah.'
          ],
          discussionPrompts: [
            'Sejauh mana tata bahasa Indonesia yang bersifat non-grammatical gender tetap menyimpan bias patriarkis dalam tataran semantik budaya?',
            'Bagaimana respons institusi pendidikan terhadap usulan standarisasi gaya selingkung bahasa inklusif?',
            'Apa peran representasi wacana dalam memecahkan stereotip peran profesional di dunia sains dan teknik?'
          ],
          readings: [
            { title: 'Feminist Critical Discourse Analysis: Gender, Power and Ideology in Discourse', source: 'Michelle M. Lazar (Palgrave Macmillan)' },
            { title: 'Language and Woman\'s Place: Text and Commentary', source: 'Robin Lakoff' },
            { title: 'Gender and Discourse', source: 'Ruth Wodak' }
          ]
        },
        {
          id: 'topic_3',
          title: 'Tema 3: Fenomena Alih Kode (Code-Switching) Komunitas Gen-Z',
          description: 'Kajian sosiolinguistik terhadap fenomena bahasa Jaksel dan dampaknya pada baku-mutu komunikasi resmi.',
          physicalZone: 'Meja 3 (Zona Fisik Tengah)',
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: [],
          studyGuide: 'Fenomena alih kode (code-switching) dan campur kode (code-mixing) antara Bahasa Indonesia dan Bahasa Inggris di kalangan Generasi Z mencerminkan negosiasi identitas sosial kosmopolitan. Menurut teori sosiolinguistik Shana Poplack dan Carol Myers-Scotton, fenomena ini tidak menandakan dekadensi bahasa, melainkan penguasaan kompetensi komunikatif ganda yang adaptif terhadap globalisasi.',
          learningObjectives: [
            'Membedakan batasan linguistik antara tag-switching, inter-sentential, dan intra-sentential switching.',
            'Menganalisis motivasi psikososial di balik pemilihan varian bahasa gaul perkotaan di platform digital.',
            'Mengevaluasi batas kelayakan alih kode dalam konteks forum akademik dan presentasi ilmiah.'
          ],
          subTopics: [
            '1. Matrix Language Frame Model: Struktur gramatikal dominan dalam kalimat campur kode.',
            '2. Prestige Markers: Nilai simbolik kata serapan populer dalam konstruksi citra diri digital.',
            '3. Kebijakan Bahasa Nasional: Dialektika antara pemeliharaan bahasa baku dan kedinamisan bahasa lisan.'
          ],
          discussionPrompts: [
            'Apakah fenomena alih kode mengancam kosakata baku Bahasa Indonesia atau memperkaya inventaris leksikal baru?',
            'Mengapa istilah emosi dan psikologi (misal: "overthinking", "burnout", "triggering") lebih sering diungkapkan dalam Bahasa Inggris?',
            'Bagaimana cara dosen/guru memfasilitasi diskusi yang luwes tanpa mengabaikan kaidah ketepatan ragam ilmiah?'
          ],
          readings: [
            { title: 'Duelling Languages: Grammatical Structure in Codeswitching', source: 'Carol Myers-Scotton (Oxford University Press)' },
            { title: 'Sociolinguistic Patterns', source: 'William Labov' },
            { title: 'Bilingualism and Code-Switching', source: 'Shana Poplack' }
          ]
        },
        {
          id: 'topic_4',
          title: 'Tema 4: Retorika Persuasif & Eufemisme dalam Komunikasi Krisis',
          description: 'Membedah strategi mitigasi reputasi korporat melalui pemilihan metafora dan pelunakan makna.',
          physicalZone: 'Meja 4 (Zona Fisik Belakang Kiri)',
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: [],
          studyGuide: 'Dalam situasi krisis organisasi atau bencana alam, korporasi dan pembuat kebijakan menggunakan piranti retoris berupa eufemisme, bentuk kalimat pasif (agent-deletion), dan metafora mitigatif untuk meredam kemarahan publik. Kajian ini membongkar bagaimana pilihan gramatikal menyamarkan tanggung jawab kausalitas.',
          learningObjectives: [
            'Mendeteksi eufemisme manipulatif (doublespeak) dalam rilis pers resmi mitigasi krisis.',
            'Menganalisis efek penghilangan subjek pelaku (agentless passive) dalam laporan insiden.',
            'Merancang strategi komunikasi krisis yang etis, transparan, dan dapat dipertanggungjawabkan.'
          ],
          subTopics: [
            '1. Taxonomy of Euphemisms: Penghalusan istilah risiko finansial dan kegagalan sistem.',
            '2. Agen Penghilang: Analisis klausa pasif yang meniadakan aktor penanggung jawab.',
            '3. Retorika Apologia: Analisis taktik permintaan maaf simbolik versus kompensasi substantif.'
          ],
          discussionPrompts: [
            'Di mana batas etis antara eufemisme demi menjaga ketenangan masyarakat dan penyesatan informasi?',
            'Bagaimana media publik membongkar eufemisme yang dirancang oleh juru bicara pemerintah?',
            'Apa dampak jangka panjang penggunaan bahasa manipulatif terhadap tingkat kepercayaan (public trust)?'
          ],
          readings: [
            { title: 'Discourse and Manipulation', source: 'Teun A. van Dijk' },
            { title: 'Doublespeak: From "Revenue Enhancement" to "Terminal Living"', source: 'William Lutz' },
            { title: 'Crisis Communications: A Casebook Approach', source: 'Kathleen Fearn-Banks' }
          ]
        },
        {
          id: 'topic_5',
          title: 'Tema 5: Wacana Ekologi (Ecolinguistics) & Isu Perubahan Iklim',
          description: 'Bagaimana narasi greenwashing dan keberlanjutan dikonstruksi secara semantik dalam laporan tahunan industri.',
          physicalZone: 'Meja 5 (Zona Fisik Belakang Kanan)',
          maxQuota: 8,
          offlineQuota: 4,
          onlineQuota: 4,
          selectedMembers: [],
          studyGuide: 'Ekolinguistik (Ecolinguistics) yang dipelopori Arran Stibbe menelaah bagaimana struktur bahasa memperkuat narasi eksploitasi antroposentris terhadap alam. Topik ini membedah klaim "greenwashing", framing karbon netral, dan metafora ekonomi yang memperlakukan ekosistem biosfer semata-mata sebagai komoditas sumber daya.',
          learningObjectives: [
            'Menganalisis "stories-we-live-by" dalam narasi keberlanjutan korporat energi dan manufaktur.',
            'Mengidentifikasi jurang semantik antara slogan ramah lingkungan dan aksi emisi riil.',
            'Mengembangkan kerangka bahasa ekologis (ecocentric discourse) yang memanusiakan alam.'
          ],
          subTopics: [
            '1. Greenwashing Framing: Analisis visual dan teks label "eco-friendly" dan "biodegradable".',
            '2. Nominalisasi Alam: Perubahan alam hidup menjadi abstraksi numerik karbon kredit.',
            '3. Komunikasi Iklim Efektif: Merancang narasi sains iklim yang menggugah aksi kolektif tanpa menimbulkan keputusasaan.'
          ],
          discussionPrompts: [
            'Mengapa laporan tahunan keberlanjutan (ESG reports) sering kali menggunakan istilah-istilah yang mengaburkan dampak ekologis riil?',
            'Bagaimana istilah "antropogenik" dikomunikasikan kepada masyarakat umum agar terbangun kesadaran lingkungan?',
            'Apa peran linguis dalam mendukung advokasi hukum hak-hak alam dan keadilan iklim?'
          ],
          readings: [
            { title: 'Ecolinguistics: Language, Ecology and the Stories We Live By', source: 'Arran Stibbe (Routledge)' },
            { title: 'The Ecolinguistics Reader: Language, Ecology and Environment', source: 'Alwin Fill & Peter Mühlhäusler' },
            { title: 'Green Communication and the Ecological Crisis', source: 'Richard Maxwell' }
          ]
        }
      ]
    },
    createdAt: '2026-10-28T08:00:00.000Z'
  },
  {
    id: 'room_clash_2',
    name: 'Etika AI & Masa Depan Pendidikan Bahasa',
    section: 'Debat Strategis Hybrid',
    subject: 'Kecerdasan Buatan & Pedagogi',
    roomCode: 'CLS404',
    teacherId: 'admin_snowprince',
    teacherName: 'SnowPrince (Dosen Pengampu)',
    description: 'Ruang kelas debat interaktif "The Clash Arena". Terbagi menjadi Kubu Pro dan Kubu Kontra dengan integrasi amunisi riset daring (War Room) dan podium kelas fisik.',
    bannerGradient: 'from-purple-950 via-slate-900 to-indigo-950',
    discussionScenario: 'clash',
    members: ['admin_snowprince', 'user_student_1', 'user_student_2', 'user_student_4'],
    memberProfiles: [
      { uid: 'admin_snowprince', displayName: 'SnowPrince', attendance: 'offline', role: 'admin' },
      { uid: 'user_student_1', displayName: 'Nadia Salsabila', attendance: 'offline', role: 'student' },
      { uid: 'user_student_2', displayName: 'Bagas Aditya', attendance: 'online', role: 'student' },
      { uid: 'user_student_4', displayName: 'Jessica Veranda', attendance: 'online', role: 'student' },
    ],
    materials: [
      {
        id: 'mat_clash_1',
        title: 'Mosi Debat Utama: "Penggunaan AI Generatif dalam Pembelajaran Bahasa: Membantu atau Mematikan Kreativitas?"',
        content: 'Setiap anggota tim online bertindak sebagai tim riset cepat (Fact-Checking War Room), sedangkan siswa di kelas bertindak sebagai Juru Bicara podium.',
        authorName: 'SnowPrince',
        createdAt: '2026-10-27T08:00:00.000Z',
        type: 'topic',
        tags: ['MosiDebat', 'ClashArena', 'AIEd'],
      }
    ],
    assignments: [
      {
        id: 'assign_clash_1',
        title: 'Tugas: Ringkasan Sanggahan & Argumentasi Debat',
        description: 'Tuliskan 3 argumen terkuat kubu Anda beserta sitasi rujukan empiris yang diajukan selama sesi Clash Arena.',
        dueDate: '2026-11-06T23:59:00.000Z',
        points: 100,
        createdAt: '2026-10-27T09:00:00.000Z',
        submissions: []
      }
    ],
    scenarioData: {
      type: 'clash',
      clashTopic: 'Penggunaan AI dalam Pembelajaran Bahasa: Membantu atau Mematikan Kreativitas Siswa?',
      clashQuestion: 'Apakah integrasi LLM meningkatkan kompetensi kritis atau justru menimbulkan degradasi kognitif jangka panjang?',
      clashProMembers: [
        { userId: 'user_student_1', userName: 'Nadia Salsabila', attendance: 'offline', isSpokesperson: true },
        { userId: 'user_student_2', userName: 'Bagas Aditya', attendance: 'online' },
      ],
      clashContraMembers: [
        { userId: 'user_student_4', userName: 'Jessica Veranda', attendance: 'online', isSpokesperson: false },
      ],
      clashBulletChats: [
        {
          id: 'bc_1',
          side: 'pro',
          authorName: 'Bagas Aditya (Online)',
          attendance: 'online',
          message: 'Data Riset Stanford 2024: Siswa yang menggunakan scaffolding AI menulis 40% lebih banyak draf kreatif tanpa kehilangan gaya orisinal!',
          isFactCheck: true,
          timestamp: '14:20'
        },
        {
          id: 'bc_2',
          side: 'contra',
          authorName: 'Jessica Veranda (Online)',
          attendance: 'online',
          message: 'Sanggahan: Ketergantungan prompt formulaik justru memicu konvergensi leksikal (bahasa menjadi monoton seragam).',
          isFactCheck: true,
          timestamp: '14:22'
        }
      ],
      clashVotes: {
        pro: 18,
        contra: 14,
        userVotes: {}
      },
      clashRound: 2
    },
    createdAt: '2026-10-27T07:30:00.000Z'
  },
  {
    id: 'room_buzz_3',
    name: 'Laboratorium Pedagogi & Desain Instruksional',
    section: 'Sesi Blitz Cepat 5 Menit',
    subject: 'Teknologi Pendidikan',
    roomCode: 'BUZ303',
    teacherId: 'admin_snowprince',
    teacherName: 'SnowPrince (Dosen Pengampu)',
    description: 'Model diskusi kilat "The Buzz Chamber". Diskusi 5 menit curah ide tanpa sensor (Ideation Blitz) dilanjutkan 5 menit sintesis dengan buzzer audio & lock submission.',
    bannerGradient: 'from-slate-950 via-indigo-950 to-purple-900',
    discussionScenario: 'buzz',
    members: ['admin_snowprince', 'user_student_1', 'user_student_3'],
    memberProfiles: [
      { uid: 'admin_snowprince', displayName: 'SnowPrince', attendance: 'offline', role: 'admin' },
      { uid: 'user_student_1', displayName: 'Nadia Salsabila', attendance: 'offline', role: 'student' },
      { uid: 'user_student_3', displayName: 'Farhan Maulana', attendance: 'offline', role: 'student' },
    ],
    materials: [
      {
        id: 'mat_buzz_1',
        title: 'Tema Inti Buzz: "Mendesain Model Gamifikasi Kelas Hybrid Tanpa Beban Kuota Internet"',
        content: 'Pilih salah satu dari 5 Stasiun Buzz. Berikan ide radikal di Putaran 1, lalu rangkum dalam 1 kalimat tesis di Putaran 2.',
        authorName: 'SnowPrince',
        createdAt: '2026-10-26T08:00:00.000Z',
        type: 'topic',
        tags: ['BuzzChamber', 'Gamifikasi', 'Instruksional'],
      }
    ],
    assignments: [
      {
        id: 'assign_buzz_1',
        title: 'Tugas: Sintesis 1-Halaman Solusi Buzz Station',
        description: 'Tuliskan narasi komprehensif dari 1 kesimpulan inti yang dihasilkan tim Anda di Buzz Chamber.',
        dueDate: '2026-11-04T23:59:00.000Z',
        points: 100,
        createdAt: '2026-10-26T09:00:00.000Z',
        submissions: []
      }
    ],
    scenarioData: {
      type: 'buzz',
      buzzMainTheme: 'Solusi Gamifikasi Rendah Bandwidth untuk Kelas Kolaboratif Hybrid',
      buzzPhase: 'ideation',
      buzzTimeRemaining: 240, // 4 mins
      buzzIsLocked: false,
      buzzStations: [
        {
          id: 'bz_1',
          title: 'Stasiun 1: Mekanisme Reward Poin Tanpa Server Mahal',
          subProblem: 'Bagaimana merancang sistem reward poin partisipasi yang bisa dicatat manual oleh ketua kelas dan disinkronkan berkala?',
          members: [
            { userId: 'user_student_1', userName: 'Nadia Salsabila', attendance: 'offline' }
          ],
          synthesisResult: 'Gunakan sistem ledger lencana fisik di meja kelas yang divalidasi dengan token QR offline.'
        },
        {
          id: 'bz_2',
          title: 'Stasiun 2: Kuis Kilat SMS / Webhook Berbasis Teks',
          subProblem: 'Alternatif kuis live tanpa streaming visual yang boros kuota data siswa di daerah 3T.',
          members: [
            { userId: 'user_student_3', userName: 'Farhan Maulana', attendance: 'offline' }
          ]
        },
        {
          id: 'bz_3',
          title: 'Stasiun 3: Kolaborasi Papan Kartu Estafet Digital',
          subProblem: 'Mekanisme estafet kartu argumen antara siswa offline di proyektor dan siswa online.',
          members: []
        },
        {
          id: 'bz_4',
          title: 'Stasiun 4: Peer Feedback Berbasis Emoji Reaksi Suara',
          subProblem: 'Desain respons interaktif minim beban komputasi.',
          members: []
        },
        {
          id: 'bz_5',
          title: 'Stasiun 5: Dashboard Progres Visual di Layar Kelas',
          subProblem: 'Visualisasi grafik keterlibatan siswa secara real-time yang memotivasi kompetisi sehat.',
          members: []
        }
      ],
      buzzIdeas: [
        {
          id: 'bi_1',
          stationId: 'bz_1',
          authorName: 'Nadia Salsabila',
          attendance: 'offline',
          text: 'Gunakan token stiker fisik di meja kelompok yang di-scan 1 kali oleh HP ketua meja pada akhir jam pelajaran.',
          createdAt: '14:31'
        },
        {
          id: 'bi_2',
          stationId: 'bz_1',
          authorName: 'Bagas Aditya (Online)',
          attendance: 'online',
          text: 'Integrasikan dengan bot Telegram otomatis berukuran teks ringan (<10KB).',
          createdAt: '14:32'
        }
      ]
    },
    createdAt: '2026-10-26T07:00:00.000Z'
  }
];

export const roomsService = {
  getRooms(): CourseRoom[] {
    const raw = localStorage.getItem(LOCAL_ROOMS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse cached rooms', e);
      }
    }
    return INITIAL_SEED_ROOMS;
  },

  saveRooms(rooms: CourseRoom[]) {
    localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
  },

  subscribeRooms(userId: string, onUpdate: (rooms: CourseRoom[]) => void) {
    // Immediate return from cache
    const current = this.getRooms();
    onUpdate(current);

    // Try listening to Firestore
    try {
      const q = query(collection(db, 'rooms'));
      return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: CourseRoom[] = [];
          snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as CourseRoom));
          this.saveRooms(list);
          onUpdate(list);
        } else {
          onUpdate(this.getRooms());
        }
      }, (err) => {
        console.warn('Firestore rooms snapshot notice, using local cache:', err);
        onUpdate(this.getRooms());
      });
    } catch (e) {
      onUpdate(this.getRooms());
      return () => {};
    }
  },

  getRoomById(id: string): CourseRoom | undefined {
    const rooms = this.getRooms();
    return rooms.find((r) => r.id === id);
  },

  createRoom(roomData: Omit<CourseRoom, 'id' | 'createdAt' | 'members' | 'memberProfiles' | 'materials' | 'assignments'>): CourseRoom {
    const id = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRoom: CourseRoom = {
      ...roomData,
      id,
      createdAt: new Date().toISOString(),
      members: [roomData.teacherId],
      memberProfiles: [
        { uid: roomData.teacherId, displayName: roomData.teacherName, attendance: 'offline', role: 'admin' }
      ],
      materials: [
        {
          id: `mat_${Date.now()}`,
          title: `Selamat Datang di ${roomData.name}`,
          content: roomData.description,
          authorName: roomData.teacherName,
          createdAt: new Date().toISOString(),
          type: 'announcement',
          tags: ['Pengumuman', 'Silabus']
        }
      ],
      assignments: [
        {
          id: `assign_${Date.now()}`,
          title: 'Tugas Pendahuluan: Review & Lembar Kerja Kolaborasi',
          description: 'Unggah hasil eksplorasi awal atau ringkasan diskusi Anda bersama kelompok room ini.',
          dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          points: 100,
          createdAt: new Date().toISOString(),
          submissions: []
        }
      ]
    };

    const rooms = this.getRooms();
    const updated = [newRoom, ...rooms];
    this.saveRooms(updated);

    try {
      setDoc(doc(db, 'rooms', id), newRoom).catch(() => {});
    } catch {}

    return newRoom;
  },

  joinRoomByCode(code: string, user: AcademicUser, attendance: 'offline' | 'online' = 'offline'): { success: boolean; room?: CourseRoom; message?: string } {
    const cleanCode = code.trim().toUpperCase();
    const rooms = this.getRooms();
    const targetRoomIndex = rooms.findIndex((r) => r.roomCode.toUpperCase() === cleanCode);

    if (targetRoomIndex === -1) {
      return { success: false, message: `Kode room "${code}" tidak ditemukan. Pastikan kode benar (contoh: EXP890, CLS404, BUZ303).` };
    }

    const room = rooms[targetRoomIndex];
    if (!room.members.includes(user.uid)) {
      room.members.push(user.uid);
      if (!room.memberProfiles) room.memberProfiles = [];
      room.memberProfiles.push({
        uid: user.uid,
        displayName: user.displayName,
        attendance,
        role: user.role
      });

      rooms[targetRoomIndex] = room;
      this.saveRooms(rooms);

      try {
        updateDoc(doc(db, 'rooms', room.id), {
          members: room.members,
          memberProfiles: room.memberProfiles
        }).catch(() => {});
      } catch {}
    }

    return { success: true, room };
  },

  inviteMemberDirect(roomId: string, nameOrEmail: string, attendance: 'offline' | 'online' = 'online'): { success: boolean; message: string } {
    const rooms = this.getRooms();
    const targetIdx = rooms.findIndex(r => r.id === roomId);
    if (targetIdx === -1) return { success: false, message: 'Room tidak ditemukan' };

    const room = rooms[targetIdx];
    const dummyUid = `user_inv_${Date.now()}`;
    room.members.push(dummyUid);
    if (!room.memberProfiles) room.memberProfiles = [];
    room.memberProfiles.push({
      uid: dummyUid,
      displayName: nameOrEmail.split('@')[0],
      attendance,
      role: 'student'
    });

    rooms[targetIdx] = room;
    this.saveRooms(rooms);
    return { success: true, message: `Berhasil menambahkan ${nameOrEmail} ke dalam kelas!` };
  },

  addMaterial(roomId: string, material: Omit<CourseMaterial, 'id' | 'createdAt'>) {
    const rooms = this.getRooms();
    const idx = rooms.findIndex(r => r.id === roomId);
    if (idx === -1) return;

    const newMat: CourseMaterial = {
      ...material,
      id: `mat_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    rooms[idx].materials.unshift(newMat);
    this.saveRooms(rooms);

    try {
      updateDoc(doc(db, 'rooms', roomId), { materials: rooms[idx].materials }).catch(() => {});
    } catch {}
    return newMat;
  },

  submitAssignment(roomId: string, assignmentId: string, submission: Omit<Submission, 'id' | 'submittedAt' | 'status'>) {
    const rooms = this.getRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx === -1) return;

    const room = rooms[rIdx];
    const aIdx = room.assignments.findIndex(a => a.id === assignmentId);
    if (aIdx === -1) return;

    const newSub: Submission = {
      ...submission,
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };

    // Remove previous submission by same student if any
    room.assignments[aIdx].submissions = [
      ...room.assignments[aIdx].submissions.filter(s => s.studentId !== submission.studentId),
      newSub
    ];

    rooms[rIdx] = room;
    this.saveRooms(rooms);

    try {
      updateDoc(doc(db, 'rooms', roomId), { assignments: room.assignments }).catch(() => {});
    } catch {}
    return newSub;
  },

  editMaterial(roomId: string, materialId: string, updatedData: Partial<CourseMaterial>) {
    const rooms = this.getRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx === -1) return;

    const mIdx = rooms[rIdx].materials.findIndex(m => m.id === materialId);
    if (mIdx === -1) return;

    rooms[rIdx].materials[mIdx] = {
      ...rooms[rIdx].materials[mIdx],
      ...updatedData
    };

    this.saveRooms(rooms);
    try {
      updateDoc(doc(db, 'rooms', roomId), { materials: rooms[rIdx].materials }).catch(() => {});
    } catch {}
    return rooms[rIdx].materials[mIdx];
  },

  deleteMaterial(roomId: string, materialId: string) {
    const rooms = this.getRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx === -1) return;

    rooms[rIdx].materials = rooms[rIdx].materials.filter(m => m.id !== materialId);
    this.saveRooms(rooms);
    try {
      updateDoc(doc(db, 'rooms', roomId), { materials: rooms[rIdx].materials }).catch(() => {});
    } catch {}
  },

  updateRoom(roomId: string, data: Partial<CourseRoom>): CourseRoom | undefined {
    const rooms = this.getRooms();
    const idx = rooms.findIndex(r => r.id === roomId);
    if (idx === -1) return undefined;

    rooms[idx] = {
      ...rooms[idx],
      ...data
    };
    this.saveRooms(rooms);

    try {
      updateDoc(doc(db, 'rooms', roomId), data).catch(() => {});
    } catch {}
    return rooms[idx];
  },

  cancelTopicSelection(roomId: string, userId: string) {
    const rooms = this.getRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx === -1) return;

    const scenario = { ...rooms[rIdx].scenarioData };
    if (scenario.expeditionTopics) {
      scenario.expeditionTopics = scenario.expeditionTopics.map(t => ({
        ...t,
        selectedMembers: t.selectedMembers.filter(m => m.userId !== userId)
      }));
    }
    if (scenario.clashProMembers) {
      scenario.clashProMembers = scenario.clashProMembers.filter(m => m.userId !== userId);
    }
    if (scenario.clashContraMembers) {
      scenario.clashContraMembers = scenario.clashContraMembers.filter(m => m.userId !== userId);
    }
    if (scenario.buzzStations) {
      scenario.buzzStations = scenario.buzzStations.map(s => ({
        ...s,
        members: s.members.filter(m => m.userId !== userId)
      }));
    }

    this.updateScenarioData(roomId, scenario);
  },

  removeMemberFromTopic(roomId: string, topicId: string, userId: string) {
    const rooms = this.getRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx === -1) return;

    const scenario = { ...rooms[rIdx].scenarioData };
    if (scenario.expeditionTopics) {
      scenario.expeditionTopics = scenario.expeditionTopics.map(t => {
        if (t.id === topicId) {
          return {
            ...t,
            selectedMembers: t.selectedMembers.filter(m => m.userId !== userId)
          };
        }
        return t;
      });
    }

    this.updateScenarioData(roomId, scenario);
  },

  updateTopicCapacity(roomId: string, topicId: string, maxQuota: number, offlineQuota: number, onlineQuota: number) {
    const rooms = this.getRooms();
    const rIdx = rooms.findIndex(r => r.id === roomId);
    if (rIdx === -1) return;

    const scenario = rooms[rIdx].scenarioData;
    if (!scenario.expeditionTopics) return;

    const tIdx = scenario.expeditionTopics.findIndex(t => t.id === topicId);
    if (tIdx === -1) return;

    scenario.expeditionTopics[tIdx] = {
      ...scenario.expeditionTopics[tIdx],
      maxQuota,
      offlineQuota,
      onlineQuota
    };

    this.updateScenarioData(roomId, scenario);
  },

  updateScenarioData(roomId: string, scenarioData: RoomScenarioData) {
    const rooms = this.getRooms();
    const idx = rooms.findIndex(r => r.id === roomId);
    if (idx === -1) return;

    rooms[idx].scenarioData = scenarioData;
    this.saveRooms(rooms);

    try {
      updateDoc(doc(db, 'rooms', roomId), { scenarioData }).catch(() => {});
    } catch {}
  }
};
