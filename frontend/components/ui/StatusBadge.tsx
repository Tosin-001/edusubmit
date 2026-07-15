import type { SubmissionStatus } from "@/lib/types";

const LABELS: Record<SubmissionStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  reviewed: "Reviewed",
  approved: "Approved",
  rejected: "Rejected",
};

export default function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={`badge text-white badge-status-${status}`}>{LABELS[status]}</span>
  );
}
