// Mot de passe de l'interface d'administration
const ADMIN_PASSWORD = "123456"; // À changer en production

// Données de l'application
let appData = {
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
    },
    abidjan: {
        kilos: 0,
        date: new Date(),
        whatsapp: "+212625522843",
        pricePerKg: 65,
        specialPrice23kg: 1300
    }
};

// Fonction de connexion
function login() {
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
        updateDisplay();
    } else {
        alert('Mot de passe incorrect');
    }
}

// Fonction de déconnexion
function logout() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('password').value = '';
}

// Fonction pour charger les données
function loadData() {
    const savedData = localStorage.getItem('kilosData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Mise à jour des kilos
        document.getElementById('admin-casablanca-kilos').textContent = `${data.casablanca.kilos} kg`;
        document.getElementById('admin-ouagadougou-kilos').textContent = `${data.ouagadougou.kilos} kg`;
        
        // Mise à jour des dates
        document.getElementById('admin-casablanca-date').value = new Date(data.casablanca.date).toISOString().split('T')[0];
        document.getElementById('admin-ouagadougou-date').value = new Date(data.ouagadougou.date).toISOString().split('T')[0];
        
        // Mise à jour des numéros WhatsApp
        document.getElementById('admin-casablanca-whatsapp').value = data.casablanca.whatsapp;
        document.getElementById('admin-ouagadougou-whatsapp').value = data.ouagadougou.whatsapp;
    }
    
    // Charger l'historique
    loadHistory();
}

// Fonction pour mettre à jour les kilos
function updateKilos(direction, operation) {
    const input = document.getElementById(`admin-${direction}-${operation}`);
    const kilos = parseInt(input.value);
    
    if (isNaN(kilos) || kilos <= 0) {
        alert('Veuillez entrer un nombre valide');
        return;
    }
    
    const savedData = localStorage.getItem('kilosData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const oldKilos = data[direction].kilos;
        
        // Mise à jour des kilos selon l'opération
        if (operation === 'add') {
            data[direction].kilos += kilos;
        } else {
            if (kilos > oldKilos) {
                alert('Impossible de soustraire plus de kilos que disponibles');
                return;
            }
            data[direction].kilos -= kilos;
        }
        
        // Sauvegarde des données
        localStorage.setItem('kilosData', JSON.stringify(data));
        
        // Mise à jour de l'affichage
        document.getElementById(`admin-${direction}-kilos`).textContent = `${data[direction].kilos} kg`;
        input.value = '';
        
        // Ajout dans l'historique
        addToHistory(direction, operation, kilos, oldKilos, data[direction].kilos);
    }
}

// Fonction pour mettre à jour la date
function updateDate(direction) {
    const input = document.getElementById(`admin-${direction}-date`);
    const date = new Date(input.value);
    
    if (isNaN(date.getTime())) {
        alert('Veuillez entrer une date valide');
        return;
    }
    
    const savedData = localStorage.getItem('kilosData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const oldDate = new Date(data[direction].date);
        data[direction].date = date.toISOString();
        
        // Sauvegarde des données
        localStorage.setItem('kilosData', JSON.stringify(data));
        
        // Ajout dans l'historique
        addToHistory(direction, 'date', null, oldDate, date);
        
        alert('Date mise à jour avec succès');
    }
}

// Fonction pour mettre à jour le numéro WhatsApp
function updateWhatsApp(direction) {
    const input = document.getElementById(`admin-${direction}-whatsapp`);
    const whatsapp = input.value.trim();
    
    if (!whatsapp.match(/^\+\d{10,15}$/)) {
        alert('Veuillez entrer un numéro WhatsApp valide (format: +XXXXXXXXXX)');
        return;
    }
    
    const savedData = localStorage.getItem('kilosData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const oldWhatsApp = data[direction].whatsapp;
        data[direction].whatsapp = whatsapp;
        
        // Sauvegarde des données
        localStorage.setItem('kilosData', JSON.stringify(data));
        
        // Ajout dans l'historique
        addToHistory(direction, 'whatsapp', null, oldWhatsApp, whatsapp);
        
        alert('Numéro WhatsApp mis à jour avec succès');
    }
}

// Fonction pour ajouter une entrée dans l'historique
function addToHistory(direction, operation, value, oldValue, newValue) {
    const history = JSON.parse(localStorage.getItem('kilosHistory') || '[]');
    const now = new Date();
    
    let description = '';
    switch (operation) {
        case 'add':
            description = `Ajout de ${value} kg (${oldValue} → ${newValue} kg)`;
            break;
        case 'subtract':
            description = `Soustraction de ${value} kg (${oldValue} → ${newValue} kg)`;
            break;
        case 'date':
            description = `Changement de date (${oldValue.toLocaleDateString()} → ${newValue.toLocaleDateString()})`;
            break;
        case 'whatsapp':
            description = `Changement de numéro WhatsApp (${oldValue} → ${newValue})`;
            break;
    }
    
    history.unshift({
        direction,
        operation,
        description,
        timestamp: now.toISOString()
    });
    
    // Garder seulement les 50 dernières modifications
    if (history.length > 50) {
        history.pop();
    }
    
    localStorage.setItem('kilosHistory', JSON.stringify(history));
    loadHistory();
}

// Fonction pour charger l'historique
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('kilosHistory') || '[]');
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    history.forEach(entry => {
        const date = new Date(entry.timestamp);
        const direction = entry.direction === 'casablanca' ? 'Casablanca → Ouagadougou' : 'Ouagadougou → Casablanca';
        
        const div = document.createElement('div');
        div.className = 'p-3 bg-gray-50 rounded-lg';
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <span class="font-medium">${direction}</span>
                    <p class="text-sm text-gray-600">${entry.description}</p>
                </div>
                <span class="text-xs text-gray-500">${date.toLocaleString()}</span>
            </div>
        `;
        
        historyList.appendChild(div);
    });
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
    const container = document.getElementById('routes-container');
    container.innerHTML = '';

    Object.entries(appData).forEach(([city, data]) => {
        const routeCard = document.createElement('div');
        routeCard.className = 'bg-white rounded-lg shadow-md p-6 mb-4';
        routeCard.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-primary">${city.charAt(0).toUpperCase() + city.slice(1)}</h3>
                <button onclick="addNewRoute()" class="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary-dark">
                    Ajouter un trajet
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Kilos disponibles</label>
                    <input type="number" id="${city}-kilos" value="${data.kilos}" 
                           class="w-full px-3 py-2 border rounded-md" min="0">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Date de départ</label>
                    <input type="date" id="${city}-date" value="${data.date.toISOString().split('T')[0]}" 
                           class="w-full px-3 py-2 border rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Prix par kilo (DH)</label>
                    <input type="number" id="${city}-price-per-kg" value="${data.pricePerKg}" 
                           class="w-full px-3 py-2 border rounded-md" min="0">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Prix spécial 23kg (DH)</label>
                    <input type="number" id="${city}-special-price" value="${data.specialPrice23kg}" 
                           class="w-full px-3 py-2 border rounded-md" min="0">
                </div>
            </div>
            <div class="mt-4 flex justify-end">
                <button onclick="saveChanges('${city}')" class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
                    Enregistrer les modifications
                </button>
                <button onclick="deleteRoute('${city}')" class="ml-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Supprimer ce trajet
                </button>
            </div>
        `;
        container.appendChild(routeCard);
    });
}

// Fonction pour sauvegarder les modifications
function saveChanges(city) {
    const kilos = parseInt(document.getElementById(`${city}-kilos`).value);
    const date = new Date(document.getElementById(`${city}-date`).value);
    const pricePerKg = parseInt(document.getElementById(`${city}-price-per-kg`).value);
    const specialPrice = parseInt(document.getElementById(`${city}-special-price`).value);

    if (isNaN(kilos) || isNaN(pricePerKg) || isNaN(specialPrice)) {
        alert('Veuillez entrer des valeurs numériques valides');
        return;
    }

    appData[city] = {
        ...appData[city],
        kilos,
        date,
        pricePerKg,
        specialPrice23kg: specialPrice
    };

    localStorage.setItem('kilosData', JSON.stringify(appData));
    alert('Modifications enregistrées avec succès');
}

// Fonction pour ajouter un nouveau trajet
function addNewRoute() {
    const cityName = prompt('Entrez le nom de la ville (en minuscules, sans accents) :');
    if (!cityName) return;

    if (appData[cityName]) {
        alert('Ce trajet existe déjà');
        return;
    }

    appData[cityName] = {
        kilos: 0,
        date: new Date(),
        whatsapp: "+212625522843",
        pricePerKg: 0,
        specialPrice23kg: 0
    };

    localStorage.setItem('kilosData', JSON.stringify(appData));
    updateDisplay();
}

// Fonction pour supprimer un trajet
function deleteRoute(city) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le trajet ${city} ?`)) {
        return;
    }

    delete appData[city];
    localStorage.setItem('kilosData', JSON.stringify(appData));
    updateDisplay();
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Charger les données depuis le localStorage si elles existent
    const savedData = localStorage.getItem('kilosData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Convertir les dates en objets Date
        Object.keys(parsedData).forEach(city => {
            parsedData[city].date = new Date(parsedData[city].date);
        });
        appData = parsedData;
    }

    updateDisplay();
}); 