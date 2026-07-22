import MyProfile from "@/components/profile/MyProfile";

export default function TeacherProfilePage() {
  return <MyProfile endpoint="/teachers/me/" idLabel="Staff ID" />;
}
