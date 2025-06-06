from django.contrib import admin
from .models import Trajet, Reservation

@admin.register(Trajet)
class TrajetAdmin(admin.ModelAdmin):
    list_display = ('direction', 'date_depart', 'kilos_disponibles', 'prix_kg', 'prix_special_23kg', 'actif')
    list_filter = ('direction', 'actif')
    search_fields = ('direction',)

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('trajet', 'kilos', 'prix_total', 'statut', 'nom', 'telephone', 'date_reservation')
    list_filter = ('statut',)
    search_fields = ('nom', 'telephone', 'trajet__direction')

    def save_model(self, request, obj, form, change):
        # On récupère l'ancien statut si modification
        if change:
            old_obj = Reservation.objects.get(pk=obj.pk)
            old_statut = old_obj.statut
        else:
            old_statut = None

        super().save_model(request, obj, form, change)

        # Si la réservation vient d'être confirmée, on met à jour les kilos du trajet
        if obj.statut == 'confirmee' and (not change or old_statut != 'confirmee'):
            trajet = obj.trajet
            trajet.kilos_disponibles -= obj.kilos
            trajet.save()
