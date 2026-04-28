from django.shortcuts import redirect

class ErrorToHomeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        # Jika terjadi error apa pun di server, lari ke halaman home
        return redirect('report_list') # Sesuai dengan LOGIN_REDIRECT_URL kamu