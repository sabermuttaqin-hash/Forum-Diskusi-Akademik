export type AcademicRole = 'admin' | 'lecturer' | 'researcher' | 'student';

export interface AcademicUser {
  uid: string;
  displayName: string;
  email: string;
  role: AcademicRole;
  institution: string;
  faculty: string;
  bio: string;
  reputation: number;
  photoURL?: string;
  isAdmin: boolean;
  createdAt: string;
  enrolledRooms?: string[]; // IDs of joined rooms
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorRole: AcademicRole | string;
  authorInstitution: string;
  hypothesis?: string;
  likesCount: number;
  repliesCount: number;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Reply {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: AcademicRole | string;
  authorInstitution: string;
  citations?: string[];
  likesCount: number;
  isEndorsed: boolean;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  discussionId: string;
  title: string;
  category: string;
  savedAt: string;
}

export type ScenarioType = 'expedition' | 'clash' | 'buzz';

export interface CourseMaterial {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  type: 'topic' | 'document' | 'announcement';
  tags?: string[];
  resources?: { title: string; url?: string }[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentRole: string;
  content: string;
  attachmentName?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  createdAt: string;
  submissions: Submission[];
}

export interface ExpeditionTopic {
  id: string;
  title: string;
  description: string;
  physicalZone: string; // e.g. "Meja 1 Zona Fisik"
  maxQuota: number;
  offlineQuota: number;
  onlineQuota: number;
  selectedMembers: Array<{
    userId: string;
    userName: string;
    attendance: 'offline' | 'online';
    joinedAt: string;
  }>;
  teamWorksheet?: string;
  studyGuide?: string;
  learningObjectives?: string[];
  subTopics?: string[];
  discussionPrompts?: string[];
  readings?: Array<{ title: string; source: string; notes?: string }>;
}

export interface ClashBulletChat {
  id: string;
  side: 'pro' | 'contra';
  authorName: string;
  attendance: 'online' | 'offline';
  message: string;
  isFactCheck?: boolean;
  timestamp: string;
}

export interface BuzzIdea {
  id: string;
  stationId: string;
  authorName: string;
  attendance: 'online' | 'offline';
  text: string;
  createdAt: string;
}

export interface BuzzStation {
  id: string;
  title: string;
  subProblem: string;
  members: Array<{
    userId: string;
    userName: string;
    attendance: 'online' | 'offline';
  }>;
  synthesisResult?: string;
}

export interface RoomScenarioData {
  type: ScenarioType;
  // Expedition State
  expeditionTopics?: ExpeditionTopic[];
  
  // Clash State
  clashTopic?: string;
  clashQuestion?: string;
  clashProMembers?: Array<{ userId: string; userName: string; attendance: 'offline' | 'online'; isSpokesperson?: boolean }>;
  clashContraMembers?: Array<{ userId: string; userName: string; attendance: 'offline' | 'online'; isSpokesperson?: boolean }>;
  clashBulletChats?: ClashBulletChat[];
  clashVotes?: {
    pro: number;
    contra: number;
    userVotes?: Record<string, 'pro' | 'contra'>;
  };
  clashRound?: number;

  // Buzz State
  buzzMainTheme?: string;
  buzzStations?: BuzzStation[];
  buzzIdeas?: BuzzIdea[];
  buzzPhase?: 'ideation' | 'synthesis' | 'showcase' | 'idle';
  buzzTimeRemaining?: number; // in seconds
  buzzIsLocked?: boolean;
}

export interface CourseRoom {
  id: string;
  name: string;
  section: string;
  subject: string;
  roomCode: string; // 6-digit or formatted code e.g. "EXP890"
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  description: string;
  bannerGradient: string;
  discussionScenario: ScenarioType;
  members: string[]; // User IDs who joined
  memberProfiles?: Array<{
    uid: string;
    displayName: string;
    attendance: 'offline' | 'online';
    role: string;
  }>;
  materials: CourseMaterial[];
  assignments: Assignment[];
  scenarioData: RoomScenarioData;
  createdAt: string;
}
