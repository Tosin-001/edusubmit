from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_student)


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_teacher)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


class IsTeacherOrAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (u.is_teacher or u.is_admin_role))


# Backward-compatible aliases during the secondary-school pivot — remove once
# all call sites are confirmed migrated off the old names (see PROJECT_STATUS.md).
IsLecturer = IsTeacher
IsLecturerOrAdmin = IsTeacherOrAdmin
