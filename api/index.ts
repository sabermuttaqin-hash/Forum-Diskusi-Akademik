import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '5mb' }));

// Initialize Gemini SDK with server-side GEMINI_API_KEY
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Health check endpoint
const handleHealth = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Ruang Diskusi Akademik API',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
};

// Summarize academic discussion
const handleSummarize = async (req: Request, res: Response) => {
  try {
    const { title, content, replies } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: 'Judul atau konten diskusi diperlukan' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        summary: `Ringkasan Akademik (Offline Mode):\nTopik "${title}" membahas premis penting mengenai: ${content?.slice(0, 180)}...\n\nPoin utama: Diskusi memuat pertukaran perspektif metodologis dan tinjauan literatur terkait.`,
        consensus: 'Perlu verifikasi data empiris lanjutan.',
        openQuestions: ['Bagaimana validitas instrumen pengukurannya?', 'Apakah temuan ini dapat digeneralisasi?'],
        keyInsights: ['Pendekatan terstruktur diperlukan', 'Rujukan primer perlu diperkuat']
      });
    }

    const formattedReplies = Array.isArray(replies) && replies.length > 0 
      ? `\nTanggapan para akademisi:\n${replies.map((r: any, idx: number) => `Tanggapan ${idx + 1} (${r.authorName || 'Anonim'}): ${r.content || ''}`).join('\n')}`
      : '\nBelum ada tanggapan.';

    const prompt = `Anda adalah asisten sintesis akademik dan peninjau sejawat (peer reviewer) profesional.
Tolong buatkan ringkasan akademik komprehensif, kritis, dan berbasis bukti dari diskusi akademik berikut:

Judul Topik: ${title}
Konten Pokok Diskusi: ${content}
${formattedReplies}

Format output dalam JSON murni (tanpa tanda backticks markdown atau penjelasan luar):
{
  "summary": "Ringkasan intisari perdebatan/permasalahan secara ilmiah (2-3 paragraf padat)",
  "consensus": "Kesimpulan sementara atau titik temu para akademisi/peneliti",
  "openQuestions": ["Pertanyaan terbuka 1", "Pertanyaan terbuka 2", "Pertanyaan terbuka 3"],
  "keyInsights": ["Wawasan kunci 1", "Wawasan kunci 2", "Wawasan kunci 3"],
  "methodologyNote": "Catatan kritis mengenai metodologi atau kerangka teori yang relevan"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        summary: text,
        consensus: 'Analisis berbasis sintesis teks.',
        openQuestions: ['Dibutuhkan eksplorasi lebih lanjut.'],
        keyInsights: ['Kajian literatur perlu diperluas.'],
      };
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Error summarizing discussion:', error);
    return res.status(500).json({
      error: 'Gagal menghasilkan ringkasan akademik dengan AI.',
      details: error?.message || String(error),
    });
  }
};

// Academic peer review & critique
const handleCritique = async (req: Request, res: Response) => {
  try {
    const { title, content, hypothesis } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Konten argumentasi/tulisan diperlukan' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        strengths: ['Identifikasi masalah menarik dan relevan.', 'Struktur logika awal terkonseptualisasi.'],
        critiques: ['Definisi operasional variabel perlu dipertegas.', 'Batasan penelitian belum disebutkan secara eksplisit.'],
        counterArguments: ['Terdapat perspektif kontras dalam teori terkini yang belum diakomodasi.'],
        recommendedTheories: ['Teori Konstruktivisme Sosial', 'Kerangka Teori Difusi Inovasi'],
        overallScore: 82,
        recommendation: 'Layak didiskusikan dengan perbaikan rujukan primer.'
      });
    }

    const prompt = `Anda bertindak sebagai Editor Jurnal Bereputasi Internasional dan Reviewer Ahli.
Lakukan peer-review akademis yang tajam, konstruktif, dan objektif terhadap naskah/argumen diskusi berikut:

Judul: ${title || 'Tanpa Judul'}
Hipotesis/Premis: ${hypothesis || 'Tidak disebutkan'}
Konten: ${content}

Kembalikan jawaban HANYA berupa JSON valid dengan skema:
{
  "strengths": ["Kekuatan 1", "Kekuatan 2", "Kekuatan 3"],
  "critiques": ["Catatan kritis / celah metodologis 1", "Celah 2", "Celah 3"],
  "counterArguments": ["Argumen tandingan atau bias potensial yang harus diantisipasi"],
  "recommendedTheories": ["Teori/Kerangka konsep rekomendasi 1", "Teori 2"],
  "overallScore": 85,
  "recommendation": "Rekomendasi tindakan ilmiah untuk peneliti"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        strengths: ['Argumen terstruktur dengan baik.'],
        critiques: ['Perlu dukungan data empiris yang lebih kuat.'],
        counterArguments: ['Pertimbangkan variabel perancu (confounding variables).'],
        recommendedTheories: ['Tinjauan literatur mutakhir'],
        overallScore: 80,
        recommendation: 'Perbaiki metodologi dan batasan analisis.',
      };
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Error generating critique:', error);
    return res.status(500).json({
      error: 'Gagal membuat peer review akademik.',
      details: error?.message || String(error),
    });
  }
};

// Academic citation & literature helper
const handleCitations = async (req: Request, res: Response) => {
  try {
    const { topic, keywords } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topik penelitian diperlukan' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        recommendedKeywords: ['academic inquiry', 'methodological rigor', 'literature review'],
        sampleCitations: [
          {
            format: 'APA 7th',
            citation: 'Creswell, J. W., & Creswell, J. D. (2018). Research design: qualitative, quantitative, and mixed methods approaches. Sage publications.',
            notes: 'Karya fundamental untuk desain metodologi campuran.'
          },
          {
            format: 'IEEE',
            citation: 'J. Smith and A. Doe, "Systematic literature review on modern data evaluation," IEEE Access, vol. 10, pp. 1200-1212, 2022.',
            notes: 'Format standar publikasi teknik.'
          }
        ],
        searchStrategies: ['Gunakan operator boolean AND / OR di Google Scholar, Scopus, dan DOAJ.'],
        conceptualFramework: 'Hubungkan variabel bebas dengan variabel terikat secara runtut.'
      });
    }

    const prompt = `Anda adalah pustakawan akademik dan spesialis bibliografi riset.
Berdasarkan topik penelitian: "${topic}" dan kata kunci: "${Array.isArray(keywords) ? keywords.join(', ') : keywords || ''}",
berikan rekomendasi literatur referensi seminal, format sitasi (APA 7th, IEEE, Chicago), dan strategi pencarian ilmiah.

Hasilkan format JSON:
{
  "recommendedKeywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4"],
  "sampleCitations": [
    {
      "format": "APA 7th",
      "citation": "Teks sitasi lengkap format APA 7",
      "notes": "Penjelasan mengapa paper/buku ini relevan sebagai rujukan utama"
    },
    {
      "format": "IEEE",
      "citation": "Teks sitasi lengkap format IEEE",
      "notes": "Relevansi teknis"
    },
    {
      "format": "Chicago",
      "citation": "Teks sitasi format Chicago",
      "notes": "Relevansi konseptual"
    }
  ],
  "searchStrategies": ["Query pencarian Scopus/ScienceDirect", "Query Google Scholar dengan operator khusus"],
  "conceptualFramework": "Saran penyusunan kerangka berpikir konseptual"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error: any) {
    console.error('Error generating citations:', error);
    return res.status(500).json({
      error: 'Gagal membuat rekomendasi sitasi.',
      details: error?.message || String(error),
    });
  }
};

// Refine text into academic scholarly tone
const handleRefine = async (req: Request, res: Response) => {
  try {
    const { text, targetTone } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Teks yang akan diperbaiki diperlukan' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        refinedText: `Berdasarkan telaah kritis, argumen yang diajukan memperlihatkan signifikansi teoretis: ${text}`,
        changes: ['Mengganti kata informal dengan terminologi ilmiah baku', 'Memperbaiki kohesi antar kalimat'],
        readabilityLevel: 'Tingkat Jurnal Akademik'
      });
    }

    const prompt = `Tingkatkan kualitas tulisan berikut menjadi ragam bahasa akademis ilmiah standar publikasi jurnal (target: ${targetTone || 'Formal Akademik Bahasa Indonesia'}).
Pertahankan substansi asli, perbaiki diksi, tingkatkan ketepatan istilah teknis, hilangkan ambiguitas, dan tingkatkan kohesi paragraf.

Teks asal:
"${text}"

Hasilkan JSON:
{
  "refinedText": "Versi teks yang telah dipoles dengan bahasa ilmiah berwibawa",
  "changes": ["Penjelasan perbaikan 1", "Penjelasan perbaikan 2", "Penjelasan perbaikan 3"],
  "academicVocabulary": ["Istilah ilmiah 1", "Istilah ilmiah 2"],
  "readabilityLevel": "Tingkat Jurnal Terakreditasi / Tesis"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error: any) {
    console.error('Error refining text:', error);
    return res.status(500).json({
      error: 'Gagal memoles teks akademis.',
      details: error?.message || String(error),
    });
  }
};

// Title and thesis research topic suggestions
const handleTitleSuggestions = async (req: Request, res: Response) => {
  try {
    const { field, problemDescription } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        titles: [
          {
            title: `Analisis Efektivitas Pendekatan Komparatif dalam ${field || 'Kajian Akademik'}`,
            methodology: 'Mixed Methods (Kualitatif & Kuantitatif)',
            significance: 'Memberikan kontribusi baru pada literatur empiris.',
            variables: ['Variabel Bebas: Pendekatan Komparatif', 'Variabel Terikat: Efektivitas Pembelajaran']
          }
        ]
      });
    }

    const prompt = `Berikan 5 usulan judul penelitian / skripsi / tesis bernilai akademis tinggi dan orisinal untuk bidang: "${field || 'Ilmu Terapan/Sosial/Sains'}" dengan latar belakang masalah: "${problemDescription || 'Eksplorasi kontemporer'}".

Hasilkan format JSON:
{
  "titles": [
    {
      "title": "Judul lengkap yang lugas, spesifik, dan memuat variabel penelitian",
      "methodology": "Pendekatan metodologi yang disarankan (Kuantitatif Korelasional / R&D / Studi Kasus / Fenomenologi / dll)",
      "significance": "Urgensi dan kontribusi orisinalitas riset",
      "variables": ["Variabel X", "Variabel Y", "Variabel Moderator jika ada"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error: any) {
    console.error('Error suggesting titles:', error);
    return res.status(500).json({
      error: 'Gagal menghasilkan judul penelitian.',
      details: error?.message || String(error),
    });
  }
};

// General academic assistant consultation
const handleAssist = async (req: Request, res: Response) => {
  try {
    const { query, context } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Pertanyaan akademik diperlukan' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        reply: `Analisis konsultasi akademis untuk "${query}": Dalam kajian ilmiah, disarankan menyusun instrumen pengumpulan data yang tervalidasi dan melakukan uji reliabilitas sebelum menyimpulkan korelasi.`
      });
    }

    const prompt = `Anda adalah "Prof. Arga", Asisten Kecerdasan Buatan untuk Ruang Diskusi Akademik.
Anda ahli dalam metodologi penelitian, statistika terapan, filsafat ilmu, penulisan sitasi, dan tinjauan pustaka kritis.
Berikan jawaban akademis yang mendalam, terstruktur, santun, dan dapat dipertanggungjawabkan secara ilmiah.

Konteks Diskusi: ${context || 'Umum'}
Pertanyaan Akademisi: ${query}

Jawab dengan penjelasan terstruktur, sertakan rujukan metodologis atau panduan praktis jika relevan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      reply: response.text || 'Tidak dapat menghasilkan respons saat ini.',
    });
  } catch (error: any) {
    console.error('Error assisting query:', error);
    return res.status(500).json({
      error: 'Gagal memproses konsultasi akademik.',
      details: error?.message || String(error),
    });
  }
};

// Register routes under both /api/... and direct path
const router = express.Router();
router.get('/health', handleHealth);
router.post('/gemini/summarize', handleSummarize);
router.post('/gemini/critique', handleCritique);
router.post('/gemini/citations', handleCitations);
router.post('/gemini/refine', handleRefine);
router.post('/gemini/title-suggestions', handleTitleSuggestions);
router.post('/gemini/assist', handleAssist);

// Mount router on root and /api for both local vite dev and vercel serverless
app.use('/api', router);
app.use(router);

// Export default app without app.listen as strictly required
export default app;
