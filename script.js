const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const myPokemonList = JSON.parse(localStorage.getItem('myPokemon')) || [];
const pokemonDisplay = document.getElementById('pokemonDisplay');
const myPokemonDiv = document.getElementById('myPokemonList');
const detailsDiv = document.getElementById('details');
//rimozione di cardsPerPage
let currentDetailIndex = 0;

document.getElementById('catchButton').addEventListener('click', catchPokemon);

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

let currentPokemon = {};

function displayPokemon(pokemon) {
    const imgElement = document.getElementById('pokemonSprite');
    
    imgElement.src = `./showdown/${pokemon.id}.gif`; //OPZIONE 1: VISUALIZZAZIONE POKEMON 3D
    //imgElement.src = `./animated/${pokemon.id}.gif`; //OPZIONE 2: VISUALIZZAZIONE POKEMON 2D

    imgElement.style.display = 'block';

    const nameElement = document.getElementById('pokemonName');
    nameElement.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    updateTypeIcon(pokemon.types[0].type.name);

    currentPokemon = {
        name: pokemon.name,
        id: pokemon.id,
        type: pokemon.types[0].type.name
    };
}


function updateTypeIcon(type) {
    const typeIconElement = document.getElementById('pokemonTypeIcon');

    const typeToCardMap = {
        fire: 'tipo_fuoco.png',         // Fuoco
        water: 'tipo_acqua.png',        // Acqua
        grass: 'tipo_erba.png',         // Erba
        electric: 'tipo_elettro.png',   // Elettro
        ice: 'tipo_acqua.png',          // Ghiaccio -> Acqua
        fighting: 'tipo_lotta.png',     // Lotta
        poison: 'tipo_psico.png',       // Veleno -> Psico
        ground: 'tipo_lotta.png',       // Terra -> Lotta
        flying: 'tipo_normale.png',    // Volante -> Normale
        psychic: 'tipo_psico.png',      // Psico
        bug: 'tipo_erba.png',           // Insetto -> Erba
        rock: 'tipo_lotta.png',         // Roccia -> Lotta
        ghost: 'tipo_psico.png',        // Spettro -> Psico
        dragon: 'tipo_drago.png',       // Drago
        dark: 'tipo_buio.png',          // Buio
        steel: 'tipo_acciao.png',      // Acciaio
        fairy: 'tipo_folletto.png',     // Folletto
        normal: 'tipo_normale.png'     // Normale -> Normale
    };
    
    typeIconElement.src = `icon_types/${typeToCardMap[type]}`;
}



function catchPokemon() {
    const name = currentPokemon.name;
    const id = currentPokemon.id;

    if (name && id) {
        const alreadyCaught = myPokemonList.find(p => p.id === id);
        if (!alreadyCaught) {
            myPokemonList.push({ id, name, sprite: document.getElementById('pokemonSprite').src });
            localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
            renderPaginatedPokemon(0);
        }
    }


    
    //Visualizzare di default il primo
if (myPokemonList.length > 0) {
    showDetails(myPokemonList[0].id, 0);
} else {
    detailsDiv.innerHTML = '<p>No Pokemon selected</p>';
}


    fetchRandomPokemon();
}




let currentPage = 0;

function updatePaginationButtons() {
    const previousButton = document.getElementById('previousButton');
    const nextButton = document.getElementById('nextButton');

    previousButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage >= Math.ceil(myPokemonList.length / cardsPerPage) - 1;

    // Also update navigation buttons for details
    previousButton.disabled = currentDetailIndex === 0;
    nextButton.disabled = currentDetailIndex >= myPokemonList.length - 1;
}

async function showDetails(id, index = null) {
    if (index !== null) {
        currentDetailIndex = index;
    } else {
        currentDetailIndex = myPokemonList.findIndex(p => p.id === id);
    }
    
    try {
        const response = await fetch(`${API_URL}${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Pokémon details');
        }
        const data = await response.json();
        displayDetails(data);
        updatePaginationButtons();
    } catch (error) {
        console.error(error);
    }
}

function showNextPokemon() {
    if (currentDetailIndex < myPokemonList.length - 1) {
        currentDetailIndex++;
        const nextPokemon = myPokemonList[currentDetailIndex];
        showDetails(nextPokemon.id, currentDetailIndex);
    }
}

function showPreviousPokemon() {
    if (currentDetailIndex > 0) {
        currentDetailIndex--;
        const previousPokemon = myPokemonList[currentDetailIndex];
        showDetails(previousPokemon.id, currentDetailIndex);
    }
}

document.getElementById('previousButton').addEventListener('click', showPreviousPokemon);
document.getElementById('nextButton').addEventListener('click', showNextPokemon);


function removePokemon(id) {
    const index = myPokemonList.findIndex(p => p.id === id);
    if (index > -1) {
        myPokemonList.splice(index, 1);
        localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
        
        // Update currentDetailIndex if necessary
        if (currentDetailIndex >= myPokemonList.length) {
            currentDetailIndex = Math.max(0, myPokemonList.length - 1);
        }
        
        // Show details of another Pokemon if available
        if (myPokemonList.length > 0) {
            showDetails(myPokemonList[currentDetailIndex].id, currentDetailIndex);
        } else {
            detailsDiv.innerHTML = '<p>No Pokemon selected</p>';
        }
        
        renderPaginatedPokemon(currentPage);
    }
}

function removeAllPokemon() {
    myPokemonList.length = 0;
    localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
    detailsDiv.innerHTML = '<p>No Pokemon selected</p>';
    currentDetailIndex = 0;
    renderPaginatedPokemon(0);
}

function sortPokemonAlphabetically() {
    myPokemonList.sort((a, b) => a.name.localeCompare(b.name));
    localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
    
    // After sorting, maintain the current Pokemon in view but update its index
    if (myPokemonList.length > 0) {
        const currentId = myPokemonList[currentDetailIndex]?.id;
        if (currentId) {
            currentDetailIndex = myPokemonList.findIndex(p => p.id === currentId);
            showDetails(currentId, currentDetailIndex);
        }
    }
    
    renderPaginatedPokemon(0);
}

document.getElementById('removeAllButton').addEventListener('click', removeAllPokemon);
document.getElementById('sortButton').addEventListener('click', sortPokemonAlphabetically);

// Initialize the app
renderPaginatedPokemon(0);
fetchRandomPokemon();






//Visualizzare di default il primo
if (myPokemonList.length > 0) {
    showDetails(myPokemonList[0].id, 0);
} else {
    detailsDiv.innerHTML = '<p>No Pokemon selected</p>';
}






// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        showPreviousPokemon();
    } else if (e.key === 'ArrowRight') {
        showNextPokemon();
    }
});


function displayDetails(pokemon) {   //OPZIONE 1 PER LA VISUALIZZAZIONE DEI DETTAGLI
    detailsDiv.innerHTML = `
        <div class="card bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl p-6 rounded-xl border border-gray-700 
                    transform transition-all duration-300 hover:scale-[1.02]">
            <div class="flex justify-between items-center mb-4">
                <span class="text-sm text-gray-400">Pokemon ${currentDetailIndex + 1} of ${myPokemonList.length}</span>
                <span class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">#${pokemon.id}</span>
            </div>
            
            <div class="flex items-center gap-4 mb-6">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" 
                     class="w-32 h-32 object-contain rounded-xl bg-gray-800/50 p-2 hover:scale-110 transition-transform duration-300">
                <div>
                    <h3 class="text-2xl font-bold capitalize mb-2 text-white">${pokemon.name}</h3>
                    <div class="flex gap-2">
                        ${pokemon.types.map(type => `
                            <span class="px-3 py-1 rounded-full text-sm capitalize bg-${type.type.name}/20 text-${type.type.name}-400">
                                ${type.type.name}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gray-800/30 p-4 rounded-lg">
                    <h4 class="text-gray-400 text-sm mb-2">Height</h4>
                    <p class="text-white font-semibold">${pokemon.height / 10} m</p>
                </div>
                <div class="bg-gray-800/30 p-4 rounded-lg">
                    <h4 class="text-gray-400 text-sm mb-2">Weight</h4>
                    <p class="text-white font-semibold">${pokemon.weight / 10} kg</p>
                </div>
            </div>

            <div class="mb-6">
                <h4 class="text-gray-400 mb-3">Abilities</h4>
                <div class="flex flex-wrap gap-2">
                    ${pokemon.abilities.map(ability => `
                        <span class="px-3 py-1 bg-gray-700/50 rounded-full text-sm capitalize">
                            ${ability.ability.name.replace('-', ' ')}
                        </span>
                    `).join('')}
                </div>
            </div>

            <div>
                <h4 class="text-gray-400 mb-3">Stats</h4>
                <div class="space-y-3">
                    ${pokemon.stats.map(stat => `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-400 capitalize">${stat.stat.name.replace('-', ' ')}</span>
                                <span class="text-white">${stat.base_stat}</span>
                            </div>
                            <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-blue-500 rounded-full" 
                                     style="width: ${(stat.base_stat / 255) * 100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderPaginatedPokemon(page) {
    currentPage = page;
    //Non c'è più un limite di carte per pagina, quindi mostriamo tutti i Pokémon
    const paginatedPokemon = myPokemonList; //Viene usato direttamente tutta la lista dei pokemon senza suddividerli in pagine

    myPokemonDiv.innerHTML = '';
    paginatedPokemon.forEach((pokemon, index) => {
        const pokemonCard = document.createElement('div');
        pokemonCard.classList.add(
            'bg-gradient-to-br',
            'from-gray-800',
            'to-gray-900',
            'backdrop-blur-lg',
            'shadow-xl',
            'rounded-xl',
            'w-full',
            'max-w-xs',
            'flex',
            'flex-col',
            'items-center',
            'p-4',
            'border',
            'border-gray-700',
            'hover:border-blue-500/50',
            'transform',
            'transition-all',
            'duration-300',
            'hover:scale-105',
            'hover:shadow-blue-500/10',
            'hover:shadow-lg',
            'animate-fade-in'
        );
        pokemonCard.style.animationDelay = `${index * 100}ms`;

        pokemonCard.innerHTML = `
            <div class="relative w-full">
                <span class="absolute top-0 right-0 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    #${pokemon.id}
                </span>
                <img src="${pokemon.sprite}" alt="${pokemon.name}" 
                     class="w-32 h-32 object-contain mx-auto transition-transform duration-300 hover:scale-110">
            </div>
            <p class="text-xl font-bold text-white capitalize mt-4 mb-6">${pokemon.name}</p>
            <div class="flex gap-2 w-full justify-center">
                <button onclick="showDetails(${pokemon.id})" 
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 
                           transition-colors duration-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                    </svg>
                    Details
                </button>
                <button onclick="removePokemon(${pokemon.id})" 
                    class="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 
                           transition-colors duration-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Remove
                </button>
            </div>
        `;
        myPokemonDiv.appendChild(pokemonCard);
    });

    updatePaginationButtons();
}


// Aggiorna lo stile dei bottoni di navigazione
function updatePaginationButtons() {
    const previousButton = document.getElementById('previousButton');
    const nextButton = document.getElementById('nextButton');

    const baseClasses = 'px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2';
    const enabledClasses = 'bg-blue-500 text-white hover:bg-blue-600';
    const disabledClasses = 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50';

    previousButton.className = `${baseClasses} ${currentDetailIndex === 0 ? disabledClasses : enabledClasses}`;
    nextButton.className = `${baseClasses} ${currentDetailIndex >= myPokemonList.length - 1 ? disabledClasses : enabledClasses}`;

    previousButton.disabled = currentDetailIndex === 0;
    nextButton.disabled = currentDetailIndex >= myPokemonList.length - 1;

    // Aggiorna icone dei bottoni
    previousButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Previous
    `;

    nextButton.innerHTML = `
        Next
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
    `;
}

// Aggiorna lo stile dei bottoni di utility
document.getElementById('removeAllButton').className = 
    'bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2';
document.getElementById('sortButton').className = 
    'bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300 flex items-center gap-2';

// Aggiorna lo stile del bottone Catch
document.getElementById('catchButton').className = 
    'btn bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20';



function displayDetails(pokemon) {   //OPZIONE 2 PER LA VISUALIZZAZIONE DEI DETTAGLI
        detailsDiv.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">Pokemon ${currentDetailIndex + 1} di ${myPokemonList.length}</span>
                    <span class="text-sm px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg">#${pokemon.id}</span>
                </div>
    
                <h3 class="text-2xl font-bold capitalize">${pokemon.name}</h3>
    
                <div class="flex gap-4">
                    <img src="${pokemon.sprites.front_default}" 
                         alt="${pokemon.name}" 
                         class="w-32 h-32 object-cover rounded-lg bg-gray-700 p-2">
                    <div>
                        <h4 class="text-lg font-semibold text-gray-300">Informazioni</h4>
                        <p class="text-sm">Tipo: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
                        <p class="text-sm">Altezza: ${pokemon.height / 10} m</p>
                        <p class="text-sm">Peso: ${pokemon.weight / 10} kg</p>
                    </div>
                </div>
    
                <div>
                    <h4 class="text-lg font-semibold text-gray-300 mb-2">Abilità</h4>
                    <div class="flex flex-wrap gap-2">
                        ${pokemon.abilities.map(ability => `
                            <span class="px-3 py-1 bg-gray-700 rounded-full text-sm capitalize">
                                ${ability.ability.name.replace('-', ' ')}
                            </span>
                        `).join('')}
                    </div>
                </div>
    
                <div>
                    <h4 class="text-lg font-semibold text-gray-300 mb-2">Statistiche</h4>
                    <div class="space-y-2">
                        ${pokemon.stats.map(stat => `
                            <div>
                                <div class="flex justify-between text-sm text-gray-400">
                                    <span>${stat.stat.name.replace('-', ' ')}</span>
                                    <span>${stat.base_stat}</span>
                                </div>
                                <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div class="h-full bg-blue-500 rounded-full" 
                                         style="width: ${(stat.base_stat / 255) * 100}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    