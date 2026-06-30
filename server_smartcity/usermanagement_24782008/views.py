from django.views import View
from django.contrib.auth import logout
from django.contrib import messages
from django.shortcuts import redirect
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy

# 🔓 LOGOUT VIEW
class CustomLogoutView(View):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            logout(request)
            messages.success(request, "Anda telah logout.")
        return redirect("login")
    
    # Bagian ini yang perlu Anda tambahkan untuk mengatasi error 405
    def post(self, request, *args, **kwargs):
        return self.get(request, *args, **kwargs)

class CustomLoginView(LoginView):
    template_name = 'usermanagement_24782008/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('report_list')

    def form_valid(self, form):
        messages.success(self.request, "Selamat datang kembali!")
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Username atau password salah. Coba lagi ya.")
        return super().form_invalid(form)