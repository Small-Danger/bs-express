from django.urls import path
from . import views
from . import admin_views

urlpatterns = [
    # URLs visiteur
    path('', views.index, name='index'),
    path('api/trajets/', views.get_trajets, name='get_trajets'),
    path('api/trajet/<int:trajet_id>/', views.get_trajet_info, name='get_trajet_info'),
    path('api/reservation/creer/', views.creer_reservation, name='creer_reservation'),

    # URLs admin
    path('admin/', admin_views.DashboardAdminView.as_view(), name='admin_dashboard'),
    path('admin/trajet/creer/', admin_views.creer_trajet, name='creer_trajet'),
    path('admin/trajet/<int:trajet_id>/modifier/', admin_views.modifier_trajet, name='modifier_trajet'),
    path('admin/reservation/<int:reservation_id>/modifier/', admin_views.modifier_reservation, name='modifier_reservation'),
] 