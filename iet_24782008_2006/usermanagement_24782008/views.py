from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from django.urls import reverse_lazy


# 🔐 LOGIN
class CustomLoginView(LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True  # 🔥 kalau sudah login, tidak bisa buka login lagi

    def form_valid(self, form):
        messages.success(self.request, "Berhasil login!")
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Username atau password salah ❌")
        return super().form_invalid(form)


# 🔓 LOGOUT
class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('login')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            messages.success(request, "Berhasil logout!")
        return super().dispatch(request, *args, **kwargs)