from django.urls import path
from . import views

urlpatterns = [
    path('', views.main_page, name="main_page"),
    path('usuario/', views.user_page, name="user_page"),
    path('usuario/data/<str:mode>/', views.get_all_user_stats, name="all_user_stats"),
    path('juego/', views.game_page, name="game_page"),
    path('practica/<str:mode>/', views.words, name="practice"),
    path('sessions/<str:mode>/', views.sessions, name="session"),
    path('register/', views.register_view, name="register"),
    path('login/', views.login_view, name="login"),
    path('logout/', views.logout_view, name="logout")
]