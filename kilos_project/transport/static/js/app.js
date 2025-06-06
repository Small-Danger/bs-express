// Configuration des prix
const PRICES = {
    casablanca: {
        prix_kg: 150,
        prix_special_23kg: 3000
    },
    ouagadougou: {
        prix_kg: 150,
        prix_special_23kg: 3000
    }
};

// État de l'application
let state = {
    trajets: {
        casablanca: null,
        ouagadougou: null
    }
};

// Fonctions utilitaires
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR');
}

function formatPrice(price) {
    return price.toLocaleString('fr-FR') + ' DH';
}

// Fonctions de gestion des trajets
async function loadTrajets() {
    try {
        const response = await fetch('/api/trajets/');
        const trajets = await response.json();
        
        // Mettre à jour l'état
        trajets.forEach(trajet => {
            if (trajet.direction === 'casablanca') {
                state.trajets.casablanca = trajet;
            } else if (trajet.direction === 'ouagadougou') {
                state.trajets.ouagadougou = trajet;
            }
        });

        // Mettre à jour l'affichage
        updateDisplay();
    } catch (error) {
        console.error('Erreur lors du chargement des trajets:', error);
    }
}

function updateDisplay() {
    // Mettre à jour les dates en haut
    if (state.trajets.casablanca) {
        document.getElementById('casablanca-date-top').textContent = formatDate(state.trajets.casablanca.date_depart);
    }
    if (state.trajets.ouagadougou) {
        document.getElementById('ouagadougou-date-top').textContent = formatDate(state.trajets.ouagadougou.date_depart);
    }

    // Mettre à jour les sections de trajet
    updateTrajetSection('casablanca');
    updateTrajetSection('ouagadougou');
}

function updateTrajetSection(direction) {
    const trajet = state.trajets[direction];
    if (!trajet) return;

    // Mettre à jour les informations du trajet
    document.getElementById(`${direction}-date`).textContent = `Date de départ: ${formatDate(trajet.date_depart)}`;
    document.getElementById(`${direction}-kilos`).textContent = `${trajet.kilos_disponibles} kg disponibles`;
}

// Fonctions de gestion des prix
function calculatePrice(direction, kilos) {
    const trajet = state.trajets[direction];
    if (!trajet) return 0;

    if (kilos === 23) {
        return trajet.prix_special_23kg;
    }
    return kilos * trajet.prix_kg;
}

function updatePrice(direction) {
    const input = document.getElementById(`${direction}-input`);
    const kilos = parseInt(input.value) || 0;
    const price = calculatePrice(direction, kilos);
    document.getElementById(`${direction}-price`).querySelector('span').textContent = formatPrice(price);
}

// Fonctions de gestion des réservations
async function reserveKilos(direction) {
    const input = document.getElementById(`${direction}-input`);
    const kilos = parseInt(input.value) || 0;
    const trajet = state.trajets[direction];

    if (!trajet || kilos <= 0 || kilos > trajet.kilos_disponibles) {
        alert('Veuillez entrer un nombre de kilos valide');
        return;
    }

    try {
        const response = await fetch('/api/reservation/creer/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                trajet_id: trajet.id,
                kilos: kilos
            })
        });

        const data = await response.json();
        if (data.success) {
            // Ouvrir WhatsApp avec le message de réservation
            const message = `Bonjour, je souhaite réserver ${kilos} kg pour le trajet ${trajet.get_direction_display()} du ${formatDate(trajet.date_depart)}. Prix total: ${formatPrice(calculatePrice(direction, kilos))}.`;
            const whatsappUrl = `https://wa.me/212625522843?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            // Recharger les trajets
            await loadTrajets();
        } else {
            alert(data.error || 'Une erreur est survenue lors de la réservation');
        }
    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        alert('Une erreur est survenue lors de la réservation');
    }
}

function select23kg(direction) {
    const input = document.getElementById(`${direction}-input`);
    input.value = '23';
    updatePrice(direction);
}

// Fonctions de gestion de l'interface
function showRoute(direction) {
    // Cacher toutes les sections
    document.getElementById('casablanca-section').classList.add('hidden');
    document.getElementById('ouagadougou-section').classList.add('hidden');

    // Afficher la section sélectionnée
    document.getElementById(`${direction}-section`).classList.remove('hidden');
}

// Fonction utilitaire pour récupérer le token CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadTrajets();
}); 