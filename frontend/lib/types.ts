export type Role = "student" | "lecturer" | "admin";

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
  is_active: boolean;
  created_at: string;
}

export interface Course {
  id: number;
  course_code: string;
  course_title: string;
  lecturer: number | null;
  lecturer_name: string | null;
  semester: string | null;
  created_at: string;
}

export interface Assignment {
  id: number;
  course: number;
  course_code: string;
  lecturer: number | null;
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
  course_code: string;
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
