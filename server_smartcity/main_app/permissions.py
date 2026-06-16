from rest_framework import permissions

class IsCitizen(permissions.BasePermission):
    def has_permission(self, request, view):
        # Citizen = pengguna yang bukan admin/staff
        return request.user and request.user.is_authenticated and not request.user.is_staff


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Disamakan dengan modelmu yang menggunakan 'reporter'
        return obj.reporter == request.user


class IsAdminStatusOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class SmartCityPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Pastikan pengguna sudah login terlebih dahulu
        if not (request.user and request.user.is_authenticated):
            return False

        # Aturan Poin 8 & 9: Create laporan HANYA boleh dilakukan oleh Citizen
        if view.action == 'create':
            return not request.user.is_staff

        return True

    def has_object_permission(self, request, view, obj):
        is_admin = request.user.is_staff
        is_owner = (obj.reporter == request.user)

        # ------------------------------------------------------------
        # Aturan Poin 4, 5, 6, 7: Batasan untuk DETAIL (Retrieve)
        # ------------------------------------------------------------
        if view.action == 'retrieve':
            # Jika status laporan DRAFT, hanya pemiliknya yang boleh melihat
            if obj.status == 'DRAFT':
                return is_owner
            # Jika status sudah bukan DRAFT, admin dan semua citizen boleh melihat
            return True

        # ------------------------------------------------------------
        # Aturan EDIT (update/partial_update) & DELETE (destroy)
        # ------------------------------------------------------------
        if view.action in ['update', 'partial_update', 'destroy']:
            # Jika dia Admin
            if is_admin:
                # Admin CUMA boleh mengubah STATUS saja (PUT/PATCH), tidak boleh DELETE
                if request.method in ['PUT', 'PATCH']:
                    return True
                return False

            # Jika dia Citizen:
            # Hanya boleh edit/delete laporan miliknya sendiri DAN status wajib masih DRAFT
            return is_owner and obj.status == 'DRAFT'

        return False


class IsOwnerAndDraftOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Jika metodenya adalah GET, HEAD, atau OPTIONS (SAFE_METHODS),
        # maka semua pengguna yang terautentikasi diizinkan melihat detail.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Untuk metode merubah/menghapus data (PUT, PATCH, DELETE):
        # Hanya diizinkan jika pengakses adalah pemilik data DAN statusnya masih 'DRAFT'
        return obj.reporter == request.user and obj.status == 'DRAFT'