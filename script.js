const LOCAL_DATA_URL = 'pokemon-data.json';
let pokemonList = [];
let currentNames = [];
let limit = 24;
let offset = 0;

document.getElementById('search').addEventListener('input', filterAndShowNames);

async function loadFunc() {
  showSpinner();
  await loadFromLocalJson();
  currentNames = pokemonList;
  hideSpinner();
  render();
}

async function loadFromLocalJson() {
  const response = await fetch(LOCAL_DATA_URL);
  const data = await response.json();
  pokemonList = data;
}

function render() {
  const content = document.getElementById('content');

  const slicedPokemon = pokemonList.slice(offset, offset + limit);
  currentNames = slicedPokemon;

  for (let i = 0; i < currentNames.length; i++) {
    content.innerHTML += generatePokeCard(currentNames[i]);
  }

  if (offset + limit < pokemonList.length) {
    document.getElementById('mainButton').innerHTML = /*html*/ `
      <button onclick="loadMorePokemon()">Load More Pokémon</button>
    `;
  } else {
    document.getElementById('mainButton').innerHTML = '';
  }
}

function filterAndShowNames() {
  const searchInput = document.getElementById('search');
  const filterWord = searchInput.value.toLowerCase();
  if (filterWord === '') {
    currentNames = pokemonList;
  } else if (filterWord.length >= 3) {
    currentNames = pokemonList.filter(pokemon =>
      pokemon.name.startsWith(filterWord)
    );
  } else {
    currentNames = pokemonList;
  }

  document.getElementById('mainButton').classList.add('d-none');

  render();
}

function openInfoScreen(index) {
  document.querySelector('body').classList.add('ovHidden');
  document.getElementById('infoScreen').classList.remove('d-none');

  document.getElementById('infoScreen').innerHTML =
    generateOpenInfoScreen(index);

  mainInfo(event, index);
}

function nextPokemon(event, index) {
  event.stopPropagation();
  index++;

  if (index == currentNames.length) {
    alert('Mehr Pokemon laden!');
  } else {
    openInfoScreen(index);
  }
}

function prevPokemon(event, index) {
  event.stopPropagation();

  if (index == 0) {
    alert('Keine Pokemon verfügbar!');
  } else {
    index--;
    openInfoScreen(index);
  }
}

function closeInfoScreen() {
  document.querySelector('body').classList.remove('ovHidden');
  document.getElementById('infoScreen').classList.add('d-none');
}

function mainInfo(event, index) {
  event.stopPropagation();

  const pokemon = pokemonList[index];

  document.getElementById('info').innerHTML = '';
  document.getElementById('info').innerHTML = generateMainInfo(pokemon);
}

function mathWeight(weight) {
  const newWeight = weight / 10;
  return newWeight.toString().replace('.', ',');
}

function mathHeight(heigth) {
  const newHeight = heigth / 10;
  return newHeight.toString().replace('.', ',');
}

function statsInfo(event, index) {
  event.stopPropagation();

  document.getElementById('info').innerHTML = '';
  const pokemon = pokemonList[index].stats;

  for (let i = 0; i < pokemon.length; i++) {
    const pokemonStat = pokemon[i];
    document.getElementById('info').innerHTML += /*html*/ `
    <div class="infoRow">
      <span class="statName"><b>${pokemonStat.stat.name}:</b></span>
      <span class="statValue">${pokemonStat.base_stat}</span>
    </div>
    `;
  }
}

async function evoInfo(event, index) {
  event.stopPropagation();

  const speciesData = await getSpeciesUrl(index);

  const evolutionData = await getEvoChain(speciesData);

  const evolutions = await getEvolutions(evolutionData.chain);

  renderEvolutions(evolutions);
}

async function getSpeciesUrl(index) {
  const pokemon = pokemonList[index];
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
