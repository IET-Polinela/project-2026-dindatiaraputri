from django.shortcuts import render

# Hanya fungsi di sini
def about_page(request):
    return render(request, 'contacts/contacts.html')