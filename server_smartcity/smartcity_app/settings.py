from pathlib import Path

# --- BASE DIRECTORY ---
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SECURITY ---
SECRET_KEY = 'django-insecure-*_sk&o06jrba8y)o9v_gjg1$o1%@0f85*n1l3+o*m#k3$g)5_z'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    # 1. Aplikasi Kustom
    'usermanagement_24782008',
    'main_app',
    'dashboard_24782008',  # ✅ TAMBAHKAN INI
    'about',
    'contacts',
    'rest_framework',
    'corsheaders',

    # 2. Aplikasi Bawaan Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # ... app bawaan django dan rest_framework lainnya ...
    'rest_framework_simplejwt',  # <--- Tambahkan baris ini
    # ... app buatanmu (misal: laporan, dll) ...
]


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # WAJIB DI PALING ATAS
    'django.middleware.common.CommonMiddleware', # PENTING SEBELUM MIDDLEWARE LAINNYA
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'smartcity_app.urls'

# --- TEMPLATES ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], 
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'smartcity_app.wsgi.application'

# --- DATABASE ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'db_mhs11',
        'USER': 'user_mhs11',
        'PASSWORD': 'mhs11',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# --- AUTHENTICATION ---
AUTH_USER_MODEL = 'usermanagement_24782008.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- INTERNATIONALIZATION ---
LANGUAGE_CODE = 'id'
TIME_ZONE = 'Asia/Jakarta'
USE_I18N = True
USE_TZ = True

# --- STATIC FILES ---
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- AUTH REDIRECT ---
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'report_list'
LOGOUT_REDIRECT_URL = 'login'

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        # 1. Taruh BrowsableAPIRenderer di paling atas agar tombolnya muncul kembali
        'rest_framework.renderers.BrowsableAPIRenderer',
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication'
    )
}

CORS_ALLOW_ALL_ORIGINS = True

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),  # Mengatur token aktif selama 1 hari
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',), # Format di header: Bearer <token>
}

