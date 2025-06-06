from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.serializers import serialize
from .models import Trajet, Reservation
import json

def index(request):
    """Vue principale pour l'interface visiteur"""
    trajet_casablanca = Trajet.objects.filter(direction='casablanca', actif=True).order_by('-date_depart').first()
    trajet_ouagadougou = Trajet.objects.filter(direction='ouagadougou', actif=True).order_by('-date_depart').first()
    context = {
        'trajet_casablanca': trajet_casablanca,
        'trajet_ouagadougou': trajet_ouagadougou,
    }
    return render(request, 'transport/index.html', context)

@require_http_methods(["GET"])
def get_trajets(request):
    """API pour récupérer la liste des trajets actifs"""
    trajets = Trajet.objects.filter(actif=True)
    trajets_data = []
    
    for trajet in trajets:
        trajets_data.append({
            'id': trajet.id,
            'direction': trajet.direction,
            'direction_display': trajet.get_direction_display(),
            'date_depart': trajet.date_depart.isoformat(),
            'kilos_disponibles': trajet.get_kilos_disponibles(),
            'prix_kg': float(trajet.prix_kg),
            'prix_special_23kg': float(trajet.prix_special_23kg)
        })
    
    return JsonResponse(trajets_data, safe=False)

@require_http_methods(["GET"])
def get_trajet_info(request, trajet_id):
    """API pour récupérer les informations d'un trajet spécifique"""
    try:
        trajet = Trajet.objects.get(id=trajet_id, actif=True)
        data = {
            'id': trajet.id,
            'direction': trajet.direction,
            'direction_display': trajet.get_direction_display(),
            'date_depart': trajet.date_depart.isoformat(),
            'kilos_disponibles': trajet.get_kilos_disponibles(),
            'prix_kg': float(trajet.prix_kg),
            'prix_special_23kg': float(trajet.prix_special_23kg)
        }
        return JsonResponse(data)
    except Trajet.DoesNotExist:
        return JsonResponse({'error': 'Trajet non trouvé'}, status=404)

@require_http_methods(["POST"])
def creer_reservation(request):
    """API pour créer une nouvelle réservation"""
    try:
        data = json.loads(request.body)
        trajet_id = data.get('trajet_id')
        kilos = data.get('kilos')
        
        if not trajet_id or not kilos:
            return JsonResponse({'error': 'Données manquantes'}, status=400)
        
        trajet = Trajet.objects.get(id=trajet_id, actif=True)
        
        # Vérifier si les kilos sont disponibles
        if kilos > trajet.get_kilos_disponibles():
            return JsonResponse({'error': 'Kilos non disponibles'}, status=400)
        
        # Calculer le prix total
        if kilos == 23:
            prix_total = trajet.prix_special_23kg
        else:
            prix_total = kilos * trajet.prix_kg
        
        # Créer la réservation
        reservation = Reservation.objects.create(
            trajet=trajet,
            kilos=kilos,
            prix_total=prix_total,
            nom=data.get('nom', ''),
            telephone=data.get('telephone', ''),
            email=data.get('email', ''),
            commentaire=data.get('commentaire', '')
        )
        
        return JsonResponse({
            'success': True,
            'reservation_id': reservation.id,
            'prix_total': float(reservation.prix_total)
        })
        
    except Trajet.DoesNotExist:
        return JsonResponse({'error': 'Trajet non trouvé'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
