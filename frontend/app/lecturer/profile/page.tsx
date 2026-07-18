import MyProfile from "@/components/profile/MyProfile";

export default function LecturerProfilePage() {
  return <MyProfile endpoint="/lecturers/me/" idLabel="Staff ID" />;
}
