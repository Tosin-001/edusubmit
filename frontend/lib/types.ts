export type Role = "student" | "teacher" | "admin";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  role: Role;
  full_name: string;
}

export interface UserProfile {
  id: number;
  role: Role;
  full_name: string;
  email: string;
  matric_number: string | null;
  staff_id: string | null;
  department: string | null;
  school_class: number | null;
  school_class_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string | null;
  is_archived: boolean;
  created_at: string;
}

export interface SchoolClass {
  id: number;
  name: string;
  is_archived: boolean;
  created_at: string;
}

export interface TeacherAssignment {
  id: number;
  teacher: number;
  teacher_name: string;
  subject: number;
  subject_name: string;
  school_class: number;
  class_name: string;
  created_at: string;
}

export interface Assignment {
  id: number;
  teacher_assignment: number | null;
  subject_name: string | null;
  class_name: string | null;
  title: string;
  description: string;
  due_date: string | null;
  max_score: number;
  allowed_file_types: string;
  max_file_size_mb: number;
  is_archived: boolean;
  is_past_due: boolean;
  submission_count: number;
  created_at: string;
}

export type SubmissionStatus =
  | "submitted"
  | "under_review"
  | "reviewed"
  | "approved"
  | "rejected";

export interface Submission {
  id: number;
  assignment: number;
  assignment_title: string;
  subject_name?: string | null;
  class_name?: string | null;
  student?: number;
  student_name?: string;
  matric_number?: string;
  file?: string;
  file_name: string;
  file_size_kb?: number;
  status: SubmissionStatus;
  grade: number | null;
  feedback: string | null;
  review_notes?: string | null;
  reviewed_by?: number | null;
  reviewed_by_name?: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface ActivityLog {
  id: number;
  user: number | null;
  user_name: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  timestamp: string;
}
