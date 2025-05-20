const LOCAL_DATA_URL = 'pokemon-data.json';
let fullPokemonList = [];
let displayedPokemon = [];
let limit = 24;
let offset = 0;
let allLoaded = false;
let pokemonIdMap = {};
let currentPokemon = null;

document.getElementById('search').addEventListener('input', filterAndShowNames);

async function loadFunc() {
  showSpinner();

  const response = await fetch('pokemon-data.json');
  const allData = await response.json();

  fullPokemonList = allData;

  displayedPokemon = fullPokemonList.slice(0, limit);

  hideSpinner();
  render();

  setTimeout(() => {
    allLoaded = true;
  }, 500);
}

async function loadFromLocalJson() {
  const response = await fetch(LOCAL_DATA_URL);
  const data = await response.json();
  fullPokemonList = data;
}

function render() {
  clearContent();
  updatePokemonIdMap();
  renderPokemonCards();
  updateMainButton();
}

function clearContent() {
  document.getElementById('content').innerHTML = '';
}

function updatePokemonIdMap() {
  pokemonIdMap = {};
  displayedPokemon.forEach(pokemon => {
    pokemonIdMap[pokemon.id] = pokemon;
  });
}

function renderPokemonCards() {
  const content = document.getElementById('content');
  displayedPokemon.forEach(pokemon => {
    content.innerHTML += generatePokeCard(pokemon);
  });
}

function updateMainButton() {
  const buttonContainer = document.getElementById('mainButton');
  if (displayedPokemon.length < fullPokemonList.length) {
    buttonContainer.innerHTML = `<button onclick="loadMorePokemon()">Load More Pokémon</button>`;
  } else {
    buttonContainer.innerHTML = '';
  }
}

function filterAndShowNames() {
  const value = document.getElementById('search').value.toLowerCase();

  if (value.length >= 2) {
    const filtered = fullPokemonList.filter(pokemon =>
      pokemon.name.toLowerCase().includes(value)
    );
    renderFiltered(filtered);
  } else {
    render();
  }
}

function renderFiltered(filteredList) {
  const content = document.getElementById('content');
  content.innerHTML = '';

  pokemonIdMap = {};

  for (let i = 0; i < filteredList.length; i++) {
    const pokemon = filteredList[i];

    if (!pokemon.image) {
      console.warn(`Bild fehlt bei Pokémon mit ID ${pokemon.id}:`, pokemon);
      continue;
    }

    pokemonIdMap[pokemon.id] = pokemon;

    content.innerHTML += generatePokeCard(pokemon);
  }

  document.getElementById('mainButton').innerHTML = '';
}

function openInfoScreen(id) {
  const pokemon = pokemonIdMap[id];
  if (!pokemon) return console.error('Pokemon nicht gefunden:', id);

  currentPokemon = pokemon;

  document.querySelector('body').classList.add('ovHidden');
  document.getElementById('infoScreen').classList.remove('d-none');
  document.getElementById('infoScreen').innerHTML =
    generateOpenInfoScreen(pokemon);
  mainInfo();
}

function nextPokemon(event, id) {
  event.stopPropagation();
  const ids = Object.keys(pokemonIdMap)
    .map(Number)
    .sort((a, b) => a - b);
  const index = ids.indexOf(id);
  const nextId = ids[index + 1];
  if (nextId) openInfoScreen(nextId);
}

function prevPokemon(event, id) {
  event.stopPropagation();
  const ids = Object.keys(pokemonIdMap)
    .map(Number)
    .sort((a, b) => a - b);
  const index = ids.indexOf(id);
  const prevId = ids[index - 1];
  if (prevId) openInfoScreen(prevId);
}

function closeInfoScreen(event) {
  if (event && event.target.id !== 'infoScreen') return;

  document.getElementById('infoScreen').classList.add('d-none');
  document.querySelector('body').classList.remove('ovHidden');
}

function mainInfo() {
  if (!currentPokemon) return;
  document.getElementById('info').innerHTML = generateMainInfo(currentPokemon);
}

function mathWeight(weight) {
  const newWeight = weight / 10;
  return newWeight.toString().replace('.', ',');
}

function mathHeight(heigth) {
  const newHeight = heigth / 10;
  return newHeight.toString().replace('.', ',');
}

function statsInfo() {
  if (!currentPokemon) return;
  document.getElementById('info').innerHTML = currentPokemon.stats
    .map(
      stat => `
    <div class="infoRow">
      <span class="statName"><b>${stat.stat.name}:</b></span>
      <span class="statValue">${stat.base_stat}</span>
    </div>
  `
    )
    .join('');
}

async function evoInfo() {
  if (!currentPokemon) return;
  const speciesData = await getSpeciesUrl(currentPokemon.id);
  const evolutionData = await getEvoChain(speciesData);
  const evolutions = await getEvolutions(evolutionData.chain);
  renderEvolutions(evolutions);
}

async function getSpeciesUrl(index) {
  const pokemon = fullPokemonList[index];
  const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`;
  const speciesResponse = await fetch(speciesUrl);
  return await speciesResponse.json();
}

async function getEvoChain(speciesData) {
  const evolutionChainUrl = speciesData.evolution_chain.url;
  const evolutionResponse = await fetch(evolutionChainUrl);
  return await evolutionResponse.json();
}

async function getEvolutions(evolutionChain) {
  const evolutions = [];
  let currentEvolution = evolutionChain;

  evolutions.push(await getPokemonData(currentEvolution.species.name));

  while (currentEvolution.evolves_to.length > 0) {
    currentEvolution = currentEvolution.evolves_to[0];
    evolutions.push(await getPokemonData(currentEvolution.species.name));
  }

  return evolutions;
}

async function getPokemonData(pokemonName) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );
  const data = await response.json();

  data.image =
    data.sprites.other.dream_world.front_default || data.sprites.front_default;

  return data;
}

function renderEvolutions(evolutions) {
  let evoHtml = '';
  evolutions.forEach(evolution => {
    evoHtml += /*html*/ `
        <div class="evolution-step">
          <img src="${evolution.image}" alt="${evolution.name}">
          <p><b>${evolution.name}</b></p>
        </div>
      `;
  });

  document.getElementById('info').innerHTML = /*html*/ `
  <div class="evolution">${evoHtml}</div>
`;
}

function srcImg(types) {
  const basePath = 'img/';

  function getSvgPath(type) {
    const className = `bg_${type}`;
    return /*html*/ `
        <div class="${className} typeBG">
          <img src="${basePath + type}.svg" alt="${type}" />
        </div>`;
  }

  return types.map(type => getSvgPath(type)).join('');
}

function loadMorePokemon() {
  offset += limit;
  displayedPokemon = fullPokemonList.slice(0, offset + limit);
  render();
}

function showSpinner() {
  document.getElementById('spinner').style.display = 'block';
  document.body.classList.add('loading');
}

function hideSpinner() {
  document.getElementById('spinner').style.display = 'none';
  document.body.classList.remove('loading');
}
