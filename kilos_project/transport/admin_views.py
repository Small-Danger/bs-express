from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from .models import Trajet, Reservation
import json
from django.views import View
from django.utils.decorators import method_decorator

@method_decorator(login_required, name='dispatch')
class DashboardAdminView(View):
    def get(self, request):
        trajets = Trajet.objects.all().order_by('-date_creation')
        reservations = Reservation.objects.all().order_by('-date_reservation')
        total_trajets = trajets.count()
        total_reservations = reservations.count()
        reservations_en_attente = reservations.filter(statut='en_attente').count()
        context = {
            'trajets': trajets,
            'reservations': reservations,
            'total_trajets': total_trajets,
            'total_reservations': total_reservations,
            'reservations_en_attente': reservations_en_attente
        }
        return render(request, 'transport/admin/dashboard.html', context)

@login_required
@require_http_methods(["POST"])
def creer_trajet(request):
    """API pour créer un nouveau trajet"""
    try:
        data = json.loads(request.body)
        
        trajet = Trajet.objects.create(
            direction=data['direction'],
            date_depart=data['date_depart'],
            kilos_disponibles=data['kilos_disponibles'],
            prix_kg=data['prix_kg'],
            prix_special_23kg=data['prix_special_23kg'],
            actif=data.get('actif', True)
        )
        
        return JsonResponse({
            'success': True,
            'trajet': {
                'id': trajet.id,
                'direction': trajet.direction,
                'direction_display': trajet.get_direction_display(),
                'date_depart': trajet.date_depart.isoformat(),
                'kilos_disponibles': trajet.kilos_disponibles,
                'prix_kg': float(trajet.prix_kg),
                'prix_special_23kg': float(trajet.prix_special_23kg),
                'actif': trajet.actif
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@login_required
@require_http_methods(["POST"])
def modifier_trajet(request, trajet_id):
    """API pour modifier un trajet existant"""
    try:
        trajet = Trajet.objects.get(id=trajet_id)
        data = json.loads(request.body)
        
        # Mettre à jour les champs
        trajet.date_depart = data.get('date_depart', trajet.date_depart)
        trajet.kilos_disponibles = data.get('kilos_disponibles', trajet.kilos_disponibles)
        trajet.prix_kg = data.get('prix_kg', trajet.prix_kg)
        trajet.prix_special_23kg = data.get('prix_special_23kg', trajet.prix_special_23kg)
        trajet.actif = data.get('actif', trajet.actif)
        
        trajet.save()
        
        return JsonResponse({
            'success': True,
            'trajet': {
                'id': trajet.id,
                'direction': trajet.direction,
                'direction_display': trajet.get_direction_display(),
                'date_depart': trajet.date_depart.isoformat(),
                'kilos_disponibles': trajet.kilos_disponibles,
                'prix_kg': float(trajet.prix_kg),
                'prix_special_23kg': float(trajet.prix_special_23kg),
                'actif': trajet.actif
            }
        })
    except Trajet.DoesNotExist:
        return JsonResponse({'error': 'Trajet non trouvé'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@login_required
@require_http_methods(["POST"])
def modifier_reservation(request, reservation_id):
    """API pour modifier le statut d'une réservation"""
    try:
        reservation = Reservation.objects.get(id=reservation_id)
        data = json.loads(request.body)
        nouveau_statut = data.get('statut')
        
        if nouveau_statut not in dict(Reservation.STATUT_CHOICES):
            return JsonResponse({'error': 'Statut invalide'}, status=400)
        
        reservation.statut = nouveau_statut
        reservation.save()
        
        return JsonResponse({
            'success': True,
            'reservation': {
                'id': reservation.id,
                'statut': reservation.statut,
                'statut_display': reservation.get_statut_display()
            }
        })
    except Reservation.DoesNotExist:
        return JsonResponse({'error': 'Réservation non trouvée'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400) 