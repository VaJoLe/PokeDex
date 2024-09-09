const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=24&offset=";
let pokemonList = [];
let currentNames = [];
let offset = 0;

document.getElementById("search").addEventListener("input", filterAndShowNames);

async function loadFunc() {
  showSpinner();
  await getNameData();
  currentNames = pokemonList;
  hideSpinner();
  render();
}

async function render() {
  const content = document.getElementById("content");
  content.innerHTML = "";

  for (let i = 0; i < currentNames.length; i++) {
    content.innerHTML += generatePokeCard(i);
  }

  document.getElementById("mainButton").innerHTML = /*html*/ ` 
  <button onclick="loadMorePokemon()">Load More Pokémon</button>
  `;
}

async function getNameData() {
  const response = await fetch(BASE_URL + offset + ".json");
  const data = await response.json();

  for (let i = 0; i < data.results.length; i++) {
    const pokemon = data.results[i];
    const pokemonData = await getInfoData(pokemon);
    pokemonList.push(pokemonData);
  }
  currentNames = pokemonList;
}

async function getInfoData(infoUrl) {
  const nextResponse = await fetch(infoUrl.url);
  return await nextResponse.json();
}

function filterAndShowNames() {
  const searchInput = document.getElementById("search");
  const filterWord = searchInput.value.toLowerCase();
  if (filterWord === "") {
    currentNames = pokemonList;
  } else if (filterWord.length >= 3) {
    currentNames = pokemonList.filter(pokemon =>
      pokemon.name.startsWith(filterWord)
    );
  } else {
    currentNames = pokemonList;
  }

  document.getElementById("mainButton").classList.add("d-none");

  render();
}

function openInfoScreen(index) {
  document.querySelector("body").classList.add("ovHidden");
  document.getElementById("infoScreen").classList.remove("d-none");

  document.getElementById("infoScreen").innerHTML =
    generateOpenInfoScreen(index);

  mainInfo(event, index);
}

function nextPokemon(event, index) {
  event.stopPropagation();
  index++;

  if (index == currentNames.length) {
    alert("Mehr Pokemon laden!");
  } else {
    openInfoScreen(index);
  }
}

function prevPokemon(event, index) {
  event.stopPropagation();

  if (index == 0) {
    alert("Keine Pokemon verfügbar!");
  } else {
    index--;
    openInfoScreen(index);
  }
}

function closeInfoScreen() {
  document.querySelector("body").classList.remove("ovHidden");
  document.getElementById("infoScreen").classList.add("d-none");
}

function mainInfo(event, index) {
  event.stopPropagation();

  const pokemon = currentNames[index];

  document.getElementById("info").innerHTML = "";
  document.getElementById("info").innerHTML = generateMainInfo(pokemon);
}

function mathWeight(weight) {
  const newWeight = weight / 10;
  return newWeight.toString().replace(".", ",");
}

function mathHeight(heigth) {
  const newHeight = heigth / 10;
  return newHeight.toString().replace(".", ",");
}

function statsInfo(event, index) {
  event.stopPropagation();

  document.getElementById("info").innerHTML = "";
  const pokemon = currentNames[index].stats;

  for (let i = 0; i < pokemon.length; i++) {
    const pokemonStat = pokemon[i];
    document.getElementById("info").innerHTML += /*html*/ `
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
  const pokemon = currentNames[index];
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
  return await response.json();
}

function renderEvolutions(evolutions) {
  let evoHtml = "";
  evolutions.forEach(evolution => {
    evoHtml += /*html*/ `
        <div class="evolution-step">
          <img src="${evolution.sprites.other.dream_world.front_default}" alt="${evolution.name}">
          <p><b>${evolution.name}</b></p>
        </div>
      `;
  });

  document.getElementById("info").innerHTML = /*html*/ `
  <div class="evolution">${evoHtml}</div>
`;
}

function srcImg(types) {
  const basePath = "img/";

  function getSvgPath(type) {
    const className = `bg_${type}`;
    return /*html*/ `
        <div class="${className} typeBG">
          <img src="${basePath + type}.svg" alt="${type}" />
        </div>`;
  }

  return types.map(type => getSvgPath(type)).join("");
}

async function loadMorePokemon() {
  if (offset + 24 > 625) {
    alert("All 649 Pokémon have been loaded!");
    return;
  }
  offset += 24;
  if (offset >= 625) {
    offset = 625;
  }
  showSpinner();
  await getNameData();
  hideSpinner();
  render();
}

function showSpinner() {
  document.getElementById("spinner").style.display = "block";
  document.body.classList.add("loading");
}

function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.body.classList.remove("loading");
}
