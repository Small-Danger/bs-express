from django.db import models
from django.utils import timezone

class Trajet(models.Model):
    DIRECTION_CHOICES = [
        ('casablanca', 'Casablanca → Ouagadougou'),
        ('ouagadougou', 'Ouagadougou → Casablanca'),
    ]
    
    direction = models.CharField(max_length=20, choices=DIRECTION_CHOICES)
    date_depart = models.DateField()
    kilos_disponibles = models.IntegerField()
    prix_kg = models.DecimalField(max_digits=10, decimal_places=2)
    prix_special_23kg = models.DecimalField(max_digits=10, decimal_places=2)
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_depart']
        verbose_name = 'Trajet'
        verbose_name_plural = 'Trajets'

    def __str__(self):
        return f"{self.get_direction_display()} - {self.date_depart}"

    def get_kilos_reserves(self):
        return sum(reservation.kilos for reservation in self.reservations.filter(statut='confirmee'))

    def get_kilos_disponibles(self):
        return self.kilos_disponibles - self.get_kilos_reserves()

class Reservation(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee', 'Confirmée'),
        ('annulee', 'Annulée'),
    ]
    
    trajet = models.ForeignKey(Trajet, on_delete=models.CASCADE, related_name='reservations')
    kilos = models.FloatField()
    prix_total = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    nom = models.CharField(max_length=100, default='Anonyme')
    telephone = models.CharField(max_length=20, default='Non spécifié')
    email = models.EmailField(blank=True, null=True)
    commentaire = models.TextField(blank=True, null=True)
    date_reservation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_reservation']
        verbose_name = 'Réservation'
        verbose_name_plural = 'Réservations'

    def __str__(self):
        return f"Réservation {self.id} - {self.trajet} - {self.kilos}kg"

    def save(self, *args, **kwargs):
        # Calculer le prix total si ce n'est pas déjà fait
        if not self.prix_total:
            if self.kilos == 23:
                self.prix_total = self.trajet.prix_special_23kg
            else:
                self.prix_total = self.kilos * self.trajet.prix_kg
        super().save(*args, **kwargs)
