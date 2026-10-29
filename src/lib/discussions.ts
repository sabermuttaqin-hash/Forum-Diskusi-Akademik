import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Discussion, Reply, Bookmark } from '../types';

export const ACADEMIC_CATEGORIES = [
  { id: 'all', name: 'Semua Bidang', description: 'Seluruh diskusi lintas disiplin', badgeColor: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'metodologi', name: 'Metodologi Penelitian', description: 'Desain kuantitatif, kualitatif, dan mixed-methods', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'statistik', name: 'Analisis Data & Statistik', description: 'Uji hipotesis, regresi, SEM, dan interpretasi output', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'skripsi-tesis', name: 'Tesis, Skripsi & Disertasi', description: 'Penyusunan bab, instrumen, dan bimbingan akademik', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'literatur-sitasi', name: 'Tinjauan Literatur & Sitasi', description: 'Sintesis jurnal, bibliometrik, dan manajemen referensi', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'review-jurnal', name: 'Review Paper & Jurnal', description: 'Diskusi naskah ilmiah dan telaah sejawat (peer review)', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'etika-filsafat', name: 'Etika & Filsafat Ilmu', description: 'Integritas akademik, epistemologi, dan regulasi riset', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export const INITIAL_SEED_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc_seed_1',
    title: 'Penerapan Metodologi Mixed Methods: Kapan Menggunakan Sequential Explanatory vs Convergent Parallel?',
    content: `Dalam merancang penelitian tentang adopsi teknologi pembelajaran cerdas di perguruan tinggi, terdapat perdebatan epistemologis antara pendekatan Sequential Explanatory (Kuantitatif dilanjutkan Kualitatif mendalam) dengan Convergent Parallel (Koleksi data kuantitatif dan kualitatif secara simultan).

Bagaimana rekan-rekan peneliti menentukan titik triangulasi data yang paling valid tanpa menimbulkan bias interpretasi data sekunder? Apakah rujukan dari John Creswell (2018) masih menjadi pedoman standar emas atau ada perkembangan paradigma baru dalam desain penelitian campuran terkini?`,
    category: 'Metodologi Penelitian',
    tags: ['MixedMethods', 'Creswell', 'Triangulasi', 'DesainPenelitian', 'Epistemologi'],
    authorId: 'admin_snowprince',
    authorName: 'SnowPrince',
    authorRole: 'admin',
    authorInstitution: 'Dewan Pengawas Riset & Etika Akademik',
    hypothesis: 'Desain Sequential Explanatory memberikan kedalaman verifikasi statistik lebih unggul dibandingkan Convergent Parallel saat menguji variabel moderasi kompleks.',
    likesCount: 38,
    repliesCount: 3,
    isPinned: true,
    isResolved: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
  },
  {
    id: 'disc_seed_2',
    title: 'Mengatasi Isu Multikolinearitas dan Heteroskedastisitas pada Model Regresi Data Panel Dinamis (GMM)',
    content: `Ketika mengestimasi model pertumbuhan ekonomi berbasis data 34 provinsi selama 10 tahun menggunakan Generalized Method of Moments (GMM Arellano-Bond), uji Sargan/Hansen mengindikasikan instrumen over-identifying restrictions berisiko lemah (weak instruments).

Bagaimana strategi optimal dalam mereduksi jumlah instrumen tanpa mengorbankan konsistensi estimator parameter bebas? Mohon masukan praktisi ekonometrika dan statistika terapan.`,
    category: 'Analisis Data & Statistik',
    tags: ['Ekonometrika', 'DataPanel', 'GMM', 'Heteroskedastisitas', 'UjiSargan'],
    authorId: 'user_lecturer_1',
    authorName: 'Dr. Sri Handayani, M.Sc.',
    authorRole: 'lecturer',
    authorInstitution: 'Universitas Gadjah Mada',
    hypothesis: 'Menggunakan orthogonal deviations mampu menstabilkan varians error term pada panel data dengan T kecil dan N besar.',
    likesCount: 29,
    repliesCount: 2,
    isPinned: false,
    isResolved: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 32).toISOString(),
  },
  {
    id: 'disc_seed_3',
    title: 'Integritas Akademik & Pedoman Etis Penggunaan Large Language Models (LLMs) dalam Sintesis Literatur',
    content: `Seiring masifnya penggunaan AI dalam akademisi, muncul dilema terkait batas etis penggunaan alat bantu generative AI untuk mensintesis tinjauan pustaka (literature review). 

Apakah para reviewer jurnal di komunitas ini menyepakati deklarasi COPE (Committee on Publication Ethics) terkait kewajiban transparansi prompt dan larangan mencantumkan model AI sebagai rekan penulis (co-author)? Bagaimana institusi Anda menyusun regulasi pemeriksaan plagiarisme AI?`,
    category: 'Etika & Filsafat Ilmu',
    tags: ['EtikaAkademik', 'GenerativeAI', 'COPE', 'Plagiarisme', 'ReviewerJurnal'],
    authorId: 'user_researcher_2',
    authorName: 'Rian Pratama, S.T., M.Kom.',
    authorRole: 'researcher',
    authorInstitution: 'Institut Teknologi Bandung',
    hypothesis: 'Transparansi metodologis memerlukan lampiran lengkap riwayat prompt query sebagai open scientific notebook.',
    likesCount: 45,
    repliesCount: 4,
    isPinned: true,
    isResolved: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
  },
  {
    id: 'disc_seed_4',
    title: 'Pedoman Penulisan Novelty dan Research Gap pada Bab 1 Tesis S2 / Disertasi S3',
    content: `Banyak mahasiswa pascasarjana kesulitan membedakan antara "Practical Gap" (kesenjangan di lapangan) dengan "Theoretical Research Gap" (kesenjangan dalam khazanah keilmuan ilmiah). 

Bagaimana formula sistematis menyusun matriks sintesis 20 jurnal internasional Q1/Q2 agar kebaruan (novelty) naskah terlihat kokoh di mata tim penguji saat ujian proposal?`,
    category: 'Tesis, Skripsi & Disertasi',
    tags: ['TesisS2', 'ResearchGap', 'Novelty', 'ProposalPenelitian', 'JurnalQ1'],
    authorId: 'user_student_1',
    authorName: 'Annisa Maharani',
    authorRole: 'student',
    authorInstitution: 'Universitas Indonesia',
    hypothesis: 'Pemetaan menggunakan Content Analysis Matrix mempercepat identifikasi kontradiksi temuan antar literatur terdahulu.',
    likesCount: 52,
    repliesCount: 5,
    isPinned: false,
    isResolved: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 64).toISOString(),
  }
];

export const INITIAL_SEED_REPLIES: Record<string, Reply[]> = {
  disc_seed_1: [
    {
      id: 'rep_1_1',
      discussionId: 'disc_seed_1',
      content: "Berdasarkan pengalaman membimbing riset doktoral, jika tujuan utama adalah memverifikasi generalisasi hipotesis populasi lalu menguraikan fenomena 'black box' psikologisnya, Sequential Explanatory adalah pilihan yang paling terstruktur. Pastikan kriteria seleksi informan tahap kualitatif ditarik langsung dari outlier data kuantitatif tahap pertama.",
      authorId: 'user_prof_1',
      authorName: 'Prof. Dr. Ir. Budi Rahardjo',
      authorRole: 'lecturer',
      authorInstitution: 'Universitas Indonesia',
      citations: ['Creswell & Plano Clark (2018). Designing and Conducting Mixed Methods Research.', 'Teddlie & Tashakkori (2009). Foundations of Mixed Methods Research.'],
      likesCount: 16,
      isEndorsed: true,
      createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    },
    {
      id: 'rep_1_2',
      discussionId: 'disc_seed_1',
      content: 'Kelebihan utama Convergent Parallel adalah efisiensi waktu, namun tantangannya muncul saat temuan kuantitatif bertolak belakang dengan temuan kualitatif. Di sinilah diperlukan analisis metamorfik atau joint display matrix untuk menyandingkan kedua temuan secara jujur tanpa memaksakan konvergensi semu.',
      authorId: 'admin_snowprince',
      authorName: 'SnowPrince',
      authorRole: 'admin',
      authorInstitution: 'Dewan Pengawas Riset & Etika Akademik',
      citations: ['Fetters, Curry, & Creswell (2013). Achieving integration in mixed methods designs.'],
      likesCount: 12,
      isEndorsed: true,
      createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    }
  ],
  disc_seed_3: [
    {
      id: 'rep_3_1',
      discussionId: 'disc_seed_3',
      content: 'Sebagai Managing Editor jurnal terakreditasi Sinta 2, kami telah menetapkan kebijakan bahwa AI dapat digunakan sebagai instrumen bahasa dan brainstorming, namun setiap kutipan sitasi wajib diverifikasi manual oleh penulis ke DOI aslinya. Fenomena sitasi palsu (hallucinated citations) adalah pelanggaran etika berat.',
      authorId: 'user_prof_2',
      authorName: 'Dr. Wahyudi, S.Si., M.Stat.',
      authorRole: 'lecturer',
      authorInstitution: 'Universitas Diponegoro',
      citations: ['Nature Editorial (2023). Tools such as ChatGPT threaten transparent science; here are our ground rules.', 'COPE Position Statement on Authorship (2023).'],
      likesCount: 22,
      isEndorsed: true,
      createdAt: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
    }
  ]
};

// Local storage key for fallback offline/synchronous cache
const LOCAL_DISCUSSIONS_KEY = 'ruang_diskusi_items_cache';
const LOCAL_REPLIES_KEY = 'ruang_diskusi_replies_cache';

export const discussionsService = {
  // Subscribe to discussions from Firestore, with seed fallback
  subscribeDiscussions(onUpdate: (discussions: Discussion[]) => void) {
    try {
      const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'), limit(50));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Discussion[] = [];
            snapshot.forEach((d) => list.push({ ...d.data(), id: d.id } as Discussion));
            onUpdate(list);
            localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(list));
          } else {
            // Seed initial if empty
            this.seedIfEmpty();
            const cached = this.getLocalDiscussions();
            onUpdate(cached);
          }
        },
        (error) => {
          console.warn('Firestore snapshot notice, using local cache:', error);
          const cached = this.getLocalDiscussions();
          onUpdate(cached);
        }
      );
    } catch (e) {
      console.warn('Failed subscribing to discussions:', e);
      const cached = this.getLocalDiscussions();
      onUpdate(cached);
      return () => {};
    }
  },

  getLocalDiscussions(): Discussion[] {
    const raw = localStorage.getItem(LOCAL_DISCUSSIONS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing local discussions', e);
      }
    }
    return INITIAL_SEED_DISCUSSIONS;
  },

  getLocalReplies(discussionId: string): Reply[] {
    const raw = localStorage.getItem(`${LOCAL_REPLIES_KEY}_${discussionId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing local replies', e);
      }
    }
    return INITIAL_SEED_REPLIES[discussionId] || [];
  },

  async seedIfEmpty() {
    try {
      for (const disc of INITIAL_SEED_DISCUSSIONS) {
        await setDoc(doc(db, 'discussions', disc.id), disc, { merge: true });
        const replies = INITIAL_SEED_REPLIES[disc.id] || [];
        for (const rep of replies) {
          await setDoc(doc(db, 'discussions', disc.id, 'replies', rep.id), rep, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Seeding note:', e);
    }
  },

  async createDiscussion(disc: Omit<Discussion, 'id' | 'createdAt' | 'likesCount' | 'repliesCount' | 'isPinned' | 'isResolved'>): Promise<Discussion> {
    const id = `disc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDiscussion: Discussion = {
      ...disc,
      id,
      likesCount: 0,
      repliesCount: 0,
      isPinned: false,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };

    // Update local cache first
    const current = this.getLocalDiscussions();
    const updated = [newDiscussion, ...current];
    localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'discussions', id), newDiscussion);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `discussions/${id}`);
    }

    return newDiscussion;
  },

  async toggleLike(discussionId: string, currentCount: number): Promise<number> {
    const newCount = currentCount + 1;
    // Update local
    const current = this.getLocalDiscussions();
    const updated = current.map(d => d.id === discussionId ? { ...d, likesCount: newCount } : d);
    localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, 'discussions', discussionId), {
        likesCount: increment(1),
      });
    } catch (e) {
      console.warn('Like sync notice:', e);
    }
    return newCount;
  },

  async togglePin(discussionId: string, currentPin: boolean): Promise<boolean> {
    const newStatus = !currentPin;
    const current = this.getLocalDiscussions();
    const updated = current.map(d => d.id === discussionId ? { ...d, isPinned: newStatus } : d);
    localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, 'discussions', discussionId), {
        isPinned: newStatus,
      });
    } catch (e) {
      console.warn('Pin sync notice:', e);
    }
    return newStatus;
  },

  async toggleResolve(discussionId: string, currentResolved: boolean): Promise<boolean> {
    const newStatus = !currentResolved;
    const current = this.getLocalDiscussions();
    const updated = current.map(d => d.id === discussionId ? { ...d, isResolved: newStatus } : d);
    localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, 'discussions', discussionId), {
        isResolved: newStatus,
      });
    } catch (e) {
      console.warn('Resolve sync notice:', e);
    }
    return newStatus;
  },

  async deleteDiscussion(discussionId: string): Promise<void> {
    const current = this.getLocalDiscussions();
    const updated = current.filter(d => d.id !== discussionId);
    localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, 'discussions', discussionId));
    } catch (e) {
      console.warn('Delete sync notice:', e);
    }
  },

  // Replies management
  subscribeReplies(discussionId: string, onUpdate: (replies: Reply[]) => void) {
    try {
      const q = query(collection(db, 'discussions', discussionId, 'replies'), orderBy('createdAt', 'asc'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Reply[] = [];
            snapshot.forEach((r) => list.push({ ...r.data(), id: r.id } as Reply));
            onUpdate(list);
            localStorage.setItem(`${LOCAL_REPLIES_KEY}_${discussionId}`, JSON.stringify(list));
          } else {
            const cached = this.getLocalReplies(discussionId);
            onUpdate(cached);
          }
        },
        (error) => {
          console.warn('Replies snapshot notice:', error);
          const cached = this.getLocalReplies(discussionId);
          onUpdate(cached);
        }
      );
    } catch (e) {
      const cached = this.getLocalReplies(discussionId);
      onUpdate(cached);
      return () => {};
    }
  },

  async addReply(discussionId: string, reply: Omit<Reply, 'id' | 'createdAt' | 'likesCount' | 'isEndorsed'>): Promise<Reply> {
    const id = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReply: Reply = {
      ...reply,
      id,
      likesCount: 0,
      isEndorsed: false,
      createdAt: new Date().toISOString(),
    };

    // Update local cache
    const currentReplies = this.getLocalReplies(discussionId);
    const updatedReplies = [...currentReplies, newReply];
    localStorage.setItem(`${LOCAL_REPLIES_KEY}_${discussionId}`, JSON.stringify(updatedReplies));

    // Also increment repliesCount on discussion locally
    const currentDiscs = this.getLocalDiscussions();
    const updatedDiscs = currentDiscs.map(d => d.id === discussionId ? { ...d, repliesCount: (d.repliesCount || 0) + 1 } : d);
    localStorage.setItem(LOCAL_DISCUSSIONS_KEY, JSON.stringify(updatedDiscs));

    try {
      await setDoc(doc(db, 'discussions', discussionId, 'replies', id), newReply);
      await updateDoc(doc(db, 'discussions', discussionId), {
        repliesCount: increment(1),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `discussions/${discussionId}/replies/${id}`);
    }

    return newReply;
  },

  async toggleEndorseReply(discussionId: string, replyId: string, currentEndorsed: boolean): Promise<boolean> {
    const newStatus = !currentEndorsed;
    const current = this.getLocalReplies(discussionId);
    const updated = current.map(r => r.id === replyId ? { ...r, isEndorsed: newStatus } : r);
    localStorage.setItem(`${LOCAL_REPLIES_KEY}_${discussionId}`, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, 'discussions', discussionId, 'replies', replyId), {
        isEndorsed: newStatus,
      });
    } catch (e) {
      console.warn('Endorse sync notice:', e);
    }
    return newStatus;
  },

  // Per-user bookmarks
  async toggleBookmark(userId: string, discussion: Discussion): Promise<boolean> {
    const key = `user_bookmarks_${userId}`;
    const raw = localStorage.getItem(key);
    let bookmarks: Bookmark[] = raw ? JSON.parse(raw) : [];

    const exists = bookmarks.some(b => b.discussionId === discussion.id);
    let isSavedNow = false;

    if (exists) {
      bookmarks = bookmarks.filter(b => b.discussionId !== discussion.id);
      isSavedNow = false;
      try {
        await deleteDoc(doc(db, 'users', userId, 'bookmarks', discussion.id));
      } catch (e) {
        console.warn('Bookmark remove sync notice:', e);
      }
    } else {
      const newBm: Bookmark = {
        id: discussion.id,
        discussionId: discussion.id,
        title: discussion.title,
        category: discussion.category,
        savedAt: new Date().toISOString(),
      };
      bookmarks.push(newBm);
      isSavedNow = true;
      try {
        await setDoc(doc(db, 'users', userId, 'bookmarks', discussion.id), newBm);
      } catch (e) {
        console.warn('Bookmark add sync notice:', e);
      }
    }

    localStorage.setItem(key, JSON.stringify(bookmarks));
    return isSavedNow;
  },

  getUserBookmarks(userId: string): Bookmark[] {
    const key = `user_bookmarks_${userId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }
};
