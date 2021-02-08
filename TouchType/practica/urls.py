from django.urls import path
from . import views

urlpatterns = [
    path('juego/', views.main_page, name="main_page"),
    path('practica/<str:mode>', views.words, name="practice"),
    path('sessions/<str:mode>/', views.sessions, name="session"),
    path('register', views.register_view, name="register"),
    path('login', views.login_view, name="login"),
    path('logout', views.logout_view, name="logout")
]