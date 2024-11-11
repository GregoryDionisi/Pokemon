const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const myPokemonList = JSON.parse(localStorage.getItem('myPokemon')) || [];
const pokemonDisplay = document.getElementById('pokemonDisplay');
const myPokemonDiv = document.getElementById('myPokemonList');
const detailsDiv = document.getElementById('details');

document.getElementById('catchButton').addEventListener('click', catchPokemon);

// Funzione per recuperare un Pokémon casuale
async function fetchRandomPokemon() {
    const randomId = Math.floor(Math.random() * 150) + 1;
    try {
        const response = await fetch(`${API_URL}${randomId}`);
        if (!response.ok) throw new Error('Failed to fetch Pokémon');
        const data = await response.json();
        displayPokemon(data);
    } catch (error) {
        console.error(error);
    }
}

// Mostra il Pokémon nella schermata centrale
function displayPokemon(pokemon) {
    const imgElement = document.getElementById('pokemonSprite');
    imgElement.src = pokemon.sprites.front_default;
    imgElement.style.display = 'block';
    imgElement.dataset.name = pokemon.name;
    imgElement.dataset.id = pokemon.id;
}

// Funzione per catturare il Pokémon
function catchPokemon() {
    const imgElement = document.getElementById('pokemonSprite');
    const name = imgElement.dataset.name;
    const id = imgElement.dataset.id;

    if (name && id && !myPokemonList.find(p => p.id === id)) {
        myPokemonList.push({ id, name, sprite: imgElement.src });
        localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
        renderMyPokemon();
    }
}

// Mostra i Pokémon catturati nel Pokédex
function renderMyPokemon() {
    myPokemonDiv.innerHTML = '';
    myPokemonList.forEach(pokemon => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add('card', 'bg-base-200', 'shadow-md', 'p-4', 'rounded-lg');
        pokemonCard.innerHTML = `
            <img src="${pokemon.sprite}" alt="${pokemon.name}" class="w-16 h-16">
            <div class="mt-2">
                <p class="font-bold">${pokemon.name}</p>
                <button onclick="showDetails(${pokemon.id})" class="btn btn-info btn-xs mt-2">Details</button>
                <button onclick="removePokemon(${pokemon.id})" class="btn btn-error btn-xs mt-2">Remove</button>
            </div>
        `;
        myPokemonDiv.appendChild(pokemonCard);
    });
}

// Mostra i dettagli del Pokémon selezionato
async function showDetails(id) {
    try {
        const response = await fetch(`${API_URL}${id}`);
        if (!response.ok) throw new Error('Failed to fetch Pokémon details');
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
        renderMyPokemon();
    }
}

// Carica un Pokémon casuale all'inizio
fetchRandomPokemon();
renderMyPokemon();
