const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const myPokemonList = JSON.parse(localStorage.getItem('myPokemon')) || [];
const pokemonDisplay = document.getElementById('pokemonDisplay');
const myPokemonDiv = document.getElementById('myPokemonList');
const detailsDiv = document.getElementById('details');
const cardsPerPage = 6;

document.getElementById('catchButton').addEventListener('click', catchPokemon);

// Funzione per recuperare un Pokémon casuale
async function fetchRandomPokemon() {
    const randomId = Math.floor(Math.random() * 150) + 1;
    try {
        const response = await fetch(`${API_URL}${randomId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Pokémon');
        }
        const data = await response.json();
        displayPokemon(data);
    } catch (error) {
        console.error(error);
    }
}

// Mostra il Pokémon nella schermata centrale
let currentPokemon = {};

function displayPokemon(pokemon) {
    const imgElement = document.getElementById('pokemonSprite');
    imgElement.src = pokemon.sprites.front_default;
    imgElement.style.display = 'block';

    const nameElement = document.getElementById('pokemonName');
    nameElement.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const typeIconElement = document.getElementById('pokemonTypeIcon');
    typeIconElement.src = `path_to_icons/${pokemon.types[0].type.name}.png`;

    currentPokemon = {
        name: pokemon.name,
        id: pokemon.id,
        type: pokemon.types[0].type.name 
    };
}

// Funzione per catturare il Pokémon
function catchPokemon() {
    const name = currentPokemon.name;
    const id = currentPokemon.id;

    if (name && id) {
        const alreadyCaught = myPokemonList.find(p => p.id === id);
        if (!alreadyCaught) {
            myPokemonList.push({ id, name, sprite: document.getElementById('pokemonSprite').src });
            localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
            renderPaginatedPokemon(0);  // Rendi visibile la prima pagina dopo aver catturato
        }
    }

    fetchRandomPokemon();
}

// Mostra i Pokémon catturati nel Pokédex con la paginazione
let currentPage = 0;

function renderPaginatedPokemon(page) {
    currentPage = page;
    const startIndex = page * cardsPerPage;
    const paginatedPokemon = myPokemonList.slice(startIndex, startIndex + cardsPerPage);

    myPokemonDiv.innerHTML = '';
    paginatedPokemon.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add(
            'bg-opacity-50',
            'bg-gradient-to-br',
            'from-gray-700',
            'to-gray-900',
            'backdrop-blur-lg',
            'shadow-xl',
            'rounded-2xl',
            'w-48',
            'h-56',
            'flex',
            'flex-col',
            'items-center',
            'justify-between',
            'p-4',
            'm-4'
        );

        pokemonCard.innerHTML = `
            <img src="${pokemon.sprite}" alt="${pokemon.name}" class="w-24 h-24 object-contain mt-2">
            <p class="text-center text-lg font-semibold text-white capitalize">${pokemon.name}</p>
            <div class="flex gap-2 mt-2">
                <button onclick="showDetails(${pokemon.id})" 
                    class="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-green-600 transition">
                    Details
                </button>
                <button onclick="removePokemon(${pokemon.id})" 
                    class="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-red-600 transition">
                    Remove
                </button>
            </div>
        `;
        myPokemonDiv.appendChild(pokemonCard);
    });

    updatePaginationButtons();
}

// Funzione per aggiornare lo stato dei bottoni di navigazione
function updatePaginationButtons() {
    const previousButton = document.getElementById('previousButton');
    const nextButton = document.getElementById('nextButton');

    previousButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage >= Math.ceil(myPokemonList.length / cardsPerPage) - 1;
}

// Navigazione tra le pagine
document.getElementById('previousButton').addEventListener('click', () => {
    if (currentPage > 0) renderPaginatedPokemon(currentPage - 1);
});

document.getElementById('nextButton').addEventListener('click', () => {
    if (currentPage < Math.ceil(myPokemonList.length / cardsPerPage) - 1) {
        renderPaginatedPokemon(currentPage + 1);
    }
});

// Funzione per mostrare i dettagli del Pokémon selezionato
async function showDetails(id) {
    try {
        const response = await fetch(`${API_URL}${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Pokémon details');
        }
        const data = await response.json();
        displayDetails(data);
    } catch (error) {
        console.error(error);
    }
}

function displayDetails(pokemon) {
    detailsDiv.innerHTML = `
        <div class="card bg-base-100 shadow-lg p-4">
            <h3 class="text-lg font-bold">${pokemon.name}</h3>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="w-20 h-20 my-4">
            <p>Type: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            <p>Abilities: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
            <ul class="mt-4">
                ${pokemon.stats.map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
            </ul>
        </div>
    `;
}

function removePokemon(id) {
    const index = myPokemonList.findIndex(p => p.id === id);
    if (index > -1) {
        myPokemonList.splice(index, 1);
        localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
        renderPaginatedPokemon(currentPage);
}
}

// Funzione per eliminare tutti i Pokémon
function removeAllPokemon() {
    myPokemonList.length = 0;
    localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
    renderPaginatedPokemon(0);
}

// Funzione per ordinare i Pokémon alfabeticamente
function sortPokemonAlphabetically() {
    myPokemonList.sort((a, b) => a.name.localeCompare(b.name));
    localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
    renderPaginatedPokemon(0);
}

// Aggiunta dei bottoni extra alla UI
document.getElementById('removeAllButton').addEventListener('click', removeAllPokemon);
document.getElementById('sortButton').addEventListener('click', sortPokemonAlphabetically);

// Mostra la pagina iniziale del Pokédex
renderPaginatedPokemon(0);

// Carica un Pokémon casuale all'inizio
fetchRandomPokemon();
