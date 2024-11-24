const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const myPokemonList = JSON.parse(localStorage.getItem('myPokemon')) || [];
const pokemonDisplay = document.getElementById('pokemonDisplay');
const myPokemonDiv = document.getElementById('myPokemonList');
const detailsDiv = document.getElementById('details');
const infoDiv = document.getElementById('info');
const movesDiv = document.getElementById('moves');
const backGroundDiv = document.getElementById('backGround');
let currentDetailIndex = 0;

document.getElementById('catchButton').addEventListener('click', () => {
    startAnimation();
  });

async function fetchRandomPokemon() {
    const randomId = Math.floor(Math.random() * 1008) + 1;
  
    try {
        const response = await fetch(`${API_URL}${randomId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Pokémon');
        }
        const data = await response.json();
  
        data.sprite = data.id > 682 
            ? data.sprites.front_default
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${data.id}.gif`;
  
        displayPokemon(data);
        return data;
  
    } catch (error) {
        console.error(error);
    }
}


const catchRates = {
    pokeball: 0.4,    
    megaball: 0.6,    
    ultraball: 0.8,   
    masterball: 1.0   
  };

let currentPokeball = 'pokeball'; //la pokeball normale predefinita

  
document.getElementById("pokeballButtons").addEventListener("click", function (e) {
    const spriteElement = document.querySelector(".ball .sprite");
    
    if (e.target.tagName === "BUTTON") {
        switch (e.target.id) {
            case "pokeBallBtn":
                currentPokeball = 'pokeball';
                spriteElement.className = "sprite pokeball";
                break;
            case "megaBallBtn":
                currentPokeball = 'megaball';
                spriteElement.className = "sprite megaball";
                break;
            case "ultraBallBtn":
                currentPokeball = 'ultraball';
                spriteElement.className = "sprite ultraball";
                break;
            case "masterBallBtn":
                currentPokeball = 'masterball';
                spriteElement.className = "sprite masterball";
                break;
        }
    }
});


function attemptCatch() {
    const catchProbability = catchRates[currentPokeball];
    const random = Math.random();
    return random <= catchProbability;
}

const pokeballButtons = document.querySelectorAll('#pokeballButtons button');
const catchButton = document.getElementById('catchButton');

// Funzione per cambiare lo stato attivo dei pulsanti
pokeballButtons.forEach(button => {
  button.addEventListener('click', function() {
    // Rimuovi la classe 'active' da tutti i pulsanti
    pokeballButtons.forEach(btn => btn.classList.remove('active'));
    
    // Aggiungi la classe 'active' al pulsante cliccato
    this.classList.add('active');
  });
});


catchButton.addEventListener('click', function() {
  // Quando si preme "Catch", i bordi sui pulsanti non devono essere influenzati
});


document.addEventListener('DOMContentLoaded', function() {
  const pokeBallBtn = document.getElementById('pokeBallBtn');
  pokeBallBtn.classList.add('active');
});

  
  

let currentPokemon = {};

function displayPokemon(pokemon) {
    const nameElement = document.getElementById('pokemonName');
    nameElement.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  
    updateTypeIcon(pokemon.types[0].type.name);
  
    document.getElementById('app').style.setProperty('--poke1', `url(${pokemon.sprite})`);
  
    currentPokemon = {
      name: pokemon.name,
      id: pokemon.id,
      type: pokemon.types[0].type.name,
      sprite: pokemon.sprites.front_default
    };
}


function updateTypeIcon(type) {
  const typeIconElement = document.getElementById('pokemonTypeIcon');

  const typeToCardMap = {
    fire: 'tipo_fuoco.png',
    water: 'tipo_acqua.png',
    grass: 'tipo_erba.png',
    electric: 'tipo_elettro.png',
    ice: 'tipo_acqua.png',
    fighting: 'tipo_lotta.png',
    poison: 'tipo_psico.png',
    ground: 'tipo_lotta.png',
    flying: 'tipo_normale.png',
    psychic: 'tipo_psico.png',
    bug: 'tipo_erba.png',
    rock: 'tipo_lotta.png',
    ghost: 'tipo_psico.png',
    dragon: 'tipo_drago.png',
    dark: 'tipo_buio.png',
    steel: 'tipo_acciaio.png',
    fairy: 'tipo_folletto.png',
    normal: 'tipo_normale.png'
  };
  
  typeIconElement.src = `icon_types/${typeToCardMap[type]}`;
}

async function catchPokemon() {
    const name = currentPokemon.name;
    const id = currentPokemon.id;
  
    if (name && id) {
        const alreadyCaught = myPokemonList.find(p => p.id === id);
        if (alreadyCaught) {
            // Se il Pokemon è già stato catturato
            alert(`${name.charAt(0).toUpperCase() + name.slice(1)} è già presente nel tuo Pokedex!`);
            // Genera un nuovo pokemon immediatamente
            fetchRandomPokemon();
            return; // Esce dalla funzione
        }

        $(".pkmn").addClass("exit");
        
        //dopo 2 secondi totali, che è la durata dell'animazione, verifica il risultato
        setTimeout(() => {
            if (attemptCatch()) {
                //cattura riuscita
                const typeElement = document.getElementById('pokemonTypeIcon');
                
                myPokemonList.push({ 
                    id, 
                    name, 
                    sprite: currentPokemon.sprite,
                    type: typeElement.src 
                });
          
                localStorage.setItem('myPokemon', JSON.stringify(myPokemonList));
                
                renderPaginatedPokemon(0);
                
                //genera nuovo pokemon dopo altri 2 secondi
                setTimeout(() => {
                    $(".pkmn").removeClass("exit");
                    fetchRandomPokemon();
                }, 2000);
            } else {
                //cattura fallita
                const capitalizedPokeball = currentPokeball.charAt(0).toUpperCase() + currentPokeball.slice(1);
                alert(`${name.charAt(0).toUpperCase() + name.slice(1)} è uscito dalla ${capitalizedPokeball}! Prova di nuovo!`);
                $(".pkmn").removeClass("exit");
                displayPokemon(currentPokemon);
            }
        }, 2000);
    }
}

const startAnimation = () => {
    catchPokemon();
};




function renderPaginatedPokemon(page) {
    currentPage = page;
    //non c'è più un limite di carte per pagina, quindi mostriamo tutti i Pokémon
    const paginatedPokemon = myPokemonList; //viene usato direttamente tutta la lista dei pokemon senza suddividerli in pagine

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
            <div class="flex justify-center items-center space-x-4">
            <p class="text-xl font-bold text-white capitalize mt-4 mb-4">${pokemon.name}</p>
            <img src="${pokemon.type}" class="w-8 h-8">
            </div>
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
        displayDetailsStats(data);
        displayDetailsInfo(data);
        displayDetailsMoves(data);
        displayCardDetails(data);
        displaySprite(data);
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

//inizializza la web app
renderPaginatedPokemon(0);
fetchRandomPokemon();





//visualizzare di default il primo
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









function displayCardDetails(pokemon){
        const typeCardElement = document.getElementById('typeCardElement');
        
        const typeToCardMap = {
            fire: 'card_background_fuoco.png',        
            water: 'card_background_acqua.png',        
            grass: 'card_background_erba.png',         
            electric: 'card_background_elettro.png',   
            ice: 'card_background_acqua.png',          
            fighting: 'card_background_lotta.png',     
            poison: 'card_background_psico.png',      
            ground: 'card_background_lotta.png',       
            flying: 'card_background_normale.png',    
            psychic: 'card_background_psico.png',      
            bug: 'card_background_erba.png',          
            rock: 'card_background_lotta.png',         
            ghost: 'card_background_psico.png',        
            dragon: 'card_background_drago.png',       
            dark: 'card_background_buio.png',          
            steel: 'card_background_acciaio.png',      
            fairy: 'card_background_folletto.png',     
            normal: 'card_background_normale.png'     
        };
            
        typeCardElement.src = `card_background/${typeToCardMap[pokemon.types[0].type.name]}`;
        }






        function displayDetailsStats(pokemon) {
            detailsDiv.innerHTML = `
                <div>
                    <h4 class="text-lg font-semibold text-gray-300 mb-2 pokemon-font">Statistiche</h4>
                    <div class="space-y-2">
                        ${pokemon.stats.map(stat => `
                            <div>
                                <div class="flex justify-between text-sm text-gray-400 pokemon-font">
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
            `;
        }
        
        function displayDetailsInfo(pokemon) {   
            const baseHP = pokemon.stats.find(stat => stat.stat.name === "hp").base_stat;
        
            infoDiv.innerHTML = `
                <div class="relative w-full h-full">
                    <!-- Header container con nome e HP -->
                    <div class="absolute top-[4%] left-5 w-full px-[20%] pokemon-font">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <!-- Nome Pokemon -->
                                <span class="text-[1.2vw] font-bold capitalize text-black text-outline-white">
                                    ${pokemon.name}
                                </span>
                            </div>
                            <!-- HP -->
                            <div class="text-[0.8vw] font-bold text-black text-outline-white">
                                HP ${baseHP}
                            </div>
                        </div>
                    </div>
        
                    <!-- Container info base -->
                    <div class="absolute bottom-[6%] right-[15%] flex flex-col items-end pokemon-font">
                        <div class="stats-container text-[0.8vw] text-black">
                            <div class="flex gap-1">
                                <span class="text-outline-white">Altezza:</span>
                                <span class="text-outline-white">${pokemon.height / 10} m</span>
                            </div>
                            <div class="flex gap-1">
                                <span class="text-outline-white">Peso:</span>
                                <span class="text-outline-white">${pokemon.weight / 10} kg</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function displayDetailsMoves(pokemon) {
            const baseAttack = pokemon.stats.find(stat => stat.stat.name === "attack").base_stat;
            const boostedAttack = Math.round(baseAttack * 1.2 / 5) * 5;
        
            movesDiv.innerHTML = `
                <div class="absolute bottom-[20%] w-full pokemon-font">
                    <!-- Abilità -->
                    <div class="text-center mb-2">
                        <span class="text-[1vw] capitalize text-red-500 font-bold text-outline-white">
                            ${pokemon.abilities[0].ability.name.replace('-', ' ')}
                        </span>
                    </div>
                    <!-- Mossa con valore -->
                    <div class="relative px-[8%]">
                        <span class="text-[1vw] capitalize text-black font-bold text-center block text-outline-white">
                            ${pokemon.moves[0].move.name.replace('-', ' ')}
                        </span>
                        <span class="text-[1vw] text-black font-bold absolute right-[8%] top-0 text-outline-white">
                            ${boostedAttack}
                        </span>
                    </div>
                </div>
            `;
        }
        
        function displaySprite(pokemon) {
            backGroundDiv.innerHTML = `
                <!-- Container sprite Pokemon -->
                <div class="absolute inset-x-[15%] top-[0%] bottom-[35%] flex items-center justify-center">
                    <img src="${pokemon.sprites.front_default}" 
                         alt="${pokemon.name}" 
                         class="w-full h-full object-contain">
                </div>
            </div>
            `;
        }
        