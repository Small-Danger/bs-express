// Données de l'application
let appData = {};

// Fonction pour charger les données depuis le localStorage
function loadData() {
    const savedData = localStorage.getItem('kilosData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convertir les dates en objets Date
        Object.keys(parsedData).forEach(city => {
            parsedData[city].date = new Date(parsedData[city].date);
        });
        appData = parsedData;
    } else {
        // Initialisation des données par défaut si aucune donnée n'existe
        appData = {
            casablanca: {
                kilos: 0,
                date: new Date(),
                whatsapp: "+212625522843",
                pricePerKg: 70,
                specialPrice23kg: 1400
            },
            ouagadougou: {
                kilos: 0,
                date: new Date(),
                whatsapp: "+212625522843",
                pricePerKg: 60,
                specialPrice23kg: 1265
            }
        };
        localStorage.setItem('kilosData', JSON.stringify(appData));
    }
}

// Fonction pour formater la date
function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Fonction pour mettre à jour l'affichage
function updateDisplay() {
    // Recharger les données à chaque mise à jour
    loadData();

    // Mise à jour des kilos disponibles (sur une seule ligne, bien stylé)
    document.getElementById('casablanca-kilos').innerHTML = `<span class='font-bold'>${appData.casablanca.kilos}</span> <span class='ml-1 text-xs text-gray-600 font-normal'>kilos disponibles</span>`;
    document.getElementById('ouagadougou-kilos').innerHTML = `<span class='font-bold'>${appData.ouagadougou.kilos}</span> <span class='ml-1 text-xs text-gray-600 font-normal'>kilos disponibles</span>`;

    // Mise à jour des dates dans les cards
    document.getElementById('casablanca-date').textContent = `Date de départ: ${formatDate(appData.casablanca.date)}`;
    document.getElementById('ouagadougou-date').textContent = `Date de départ: ${formatDate(appData.ouagadougou.date)}`;

    // Mise à jour des dates en haut de page
    document.getElementById('casablanca-date-top').textContent = formatDate(appData.casablanca.date);
    document.getElementById('ouagadougou-date-top').textContent = formatDate(appData.ouagadougou.date);

    // Mise à jour des boutons 23kg
    document.getElementById('casablanca-23kg').textContent = `Prendre le 23kg (${appData.casablanca.specialPrice23kg} DH)`;
    document.getElementById('ouagadougou-23kg').textContent = `Prendre le 23kg (${appData.ouagadougou.specialPrice23kg} DH)`;

    // Mise à jour des prix initiaux
    calculatePrice('casablanca');
    calculatePrice('ouagadougou');
}

// Fonction pour calculer le prix
function calculatePrice(direction) {
    const input = document.getElementById(`${direction}-input`);
    const kilos = parseInt(input.value) || 0;
    const priceElement = document.getElementById(`${direction}-price`);
    
    let totalPrice = 0;
    if (kilos === 23) {
        totalPrice = appData[direction].specialPrice23kg;
    } else {
        totalPrice = kilos * appData[direction].pricePerKg;
    }
    
    // Ajout du prix par kilo dans l'affichage
    const pricePerKg = appData[direction].pricePerKg;
    priceElement.innerHTML = `
        <div class="text-sm text-gray-600">Prix par kilo: ${pricePerKg} DH</div>
        <div class="text-lg font-semibold text-secondary">Prix total: ${totalPrice} DH</div>
    `;
}

// Fonction pour sélectionner 23kg
function select23kg(direction) {
    const input = document.getElementById(`${direction}-input`);
    input.value = 23;
    calculatePrice(direction);
    // Envoyer directement vers WhatsApp sans vérifier la disponibilité
    // Calcul du prix
    let price = appData[direction].specialPrice23kg;
    const message = `Bonjour, je souhaite réserver 23 kg pour le trajet ${direction === 'casablanca' ? 'Casablanca → Ouagadougou' : 'Ouagadougou → Casablanca'} du ${formatDate(appData[direction].date)}.\n\nPrix spécial 23kg: ${price} DH\n\nMoyens de paiement acceptés:\n- CIH Bank\n- Orange Money\n- Wave`;
    const whatsappUrl = `https://wa.me/212625522843?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Fonction pour réserver des kilos
function reserveKilos(direction) {
    const input = document.getElementById(`${direction}-input`);
    const kilos = parseInt(input.value);

    if (!kilos || kilos <= 0) {
        alert('Veuillez entrer un nombre de kilos valide');
        return;
    }

    if (kilos > appData[direction].kilos) {
        // Proposer la réservation pour la prochaine date
        const nextDate = appData[direction].nextDate;
        if (nextDate) {
            const formattedNextDate = formatDate(new Date(nextDate));
            if (confirm(`Il n'y a pas assez de kilos disponibles pour cette date. Voulez-vous réserver pour la prochaine date (${formattedNextDate}) ?`)) {
                // Préparer le message WhatsApp pour la prochaine date
                let price = 0;
                if (kilos === 23) {
                    price = appData[direction].specialPrice23kg;
                } else {
                    price = kilos * appData[direction].pricePerKg;
                }
                const message = `Bonjour, je souhaite réserver ${kilos} kg pour le trajet ${direction === 'casablanca' ? 'Casablanca → Ouagadougou' : 'Ouagadougou → Casablanca'} pour la prochaine date (${formattedNextDate}).\n\nPrix par kilo: ${appData[direction].pricePerKg} DH\nPrix total: ${price} DH\n\nMoyens de paiement acceptés:\n- CIH Bank\n- Orange Money\n- Wave`;
                const whatsappUrl = `https://wa.me/212625522843?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }
        } else {
            alert('Désolé, il n\'y a pas assez de kilos disponibles et aucune prochaine date n\'est encore programmée.');
        }
        return;
    }

    // Calcul du prix
    let price = 0;
    if (kilos === 23) {
        price = appData[direction].specialPrice23kg;
    } else {
        price = kilos * appData[direction].pricePerKg;
    }

    // Préparation du message WhatsApp
    const message = `Bonjour, je souhaite réserver ${kilos} kg pour le trajet ${direction === 'casablanca' ? 'Casablanca → Ouagadougou' : 'Ouagadougou → Casablanca'} du ${formatDate(appData[direction].date)}.\n\nPrix par kilo: ${appData[direction].pricePerKg} DH\nPrix total: ${price} DH\n\nMoyens de paiement acceptés:\n- CIH Bank\n- Orange Money\n- Wave`;
    const whatsappUrl = `https://wa.me/212625522843?text=${encodeURIComponent(message)}`;

    // Ouverture de WhatsApp
    window.open(whatsappUrl, '_blank');
}

// Écouter les changements dans le localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'kilosData') {
        updateDisplay();
    }
});

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateDisplay();

    // Ajouter des écouteurs d'événements pour les champs de saisie
    document.getElementById('casablanca-input').addEventListener('input', () => calculatePrice('casablanca'));
    document.getElementById('ouagadougou-input').addEventListener('input', () => calculatePrice('ouagadougou'));
});

// Fonction pour afficher le trajet sélectionné
function showRoute(route) {
    // Cacher toutes les sections
    document.getElementById('casablanca-section').classList.add('hidden');
    document.getElementById('ouagadougou-section').classList.add('hidden');
    
    // Afficher la section sélectionnée
    const selectedSection = document.getElementById(`${route}-section`);
    selectedSection.classList.remove('hidden');
    
    // Ajouter une classe pour l'animation
    selectedSection.classList.add('animate__animated', 'animate__fadeInUp');
    
    // Faire défiler jusqu'à la section sélectionnée (offset pour header/padding)
    const yOffset = -24; // Ajuste ce décalage si besoin (en px)
    const y = selectedSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
} 