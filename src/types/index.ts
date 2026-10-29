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

export interface AcademicCategory {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
}
