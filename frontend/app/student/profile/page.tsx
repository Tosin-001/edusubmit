import MyProfile from "@/components/profile/MyProfile";

export default function StudentProfilePage() {
  return <MyProfile endpoint="/students/me/" idLabel="Matric Number" />;
}
