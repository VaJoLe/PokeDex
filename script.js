const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=24&offset=";
let pokemonList = [];
let currentNames = [];
let offset = 0; // Start-Offset bei 0 (die ersten 24 Pokémon)

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
    const pokemon = currentNames[i];
    content.innerHTML += generatePokeCard(i);
  }

  document.getElementById("mainButton").innerHTML = ` 
  <button onclick="loadMorePokemon()">Load More Pokémon</button>
  `;
}

async function getNameData() {
  const response = await fetch(BASE_URL + offset + ".json");
  const data = await response.json();

  // Pokémon-Daten laden
  for (let i = 0; i < data.results.length; i++) {
    const pokemon = data.results[i];
    await getInfoData(pokemon); // Detaildaten für jedes Pokémon laden
    pokemonList.push(pokemonData); // Pokémon zur Liste hinzufügen
  }
  currentNames = pokemonList; // Aktualisiere die aktuelle Pokémon-Liste
}

async function getInfoData(infoUrl) {
  const nextResponse = await fetch(infoUrl.url);
  pokemonData = await nextResponse.json();
}

function filterAndShowNames() {
  const searchInput = document.getElementById("search");
  const filterWord = searchInput.value.toLowerCase(); // Eingabe in Kleinbuchstaben umwandeln
  // Wenn das Suchfeld leer ist (nach Klick auf "X"), zeige alle Pokémon an
  if (filterWord === "") {
    currentNames = pokemonList; // Alle Pokémon anzeigen
  } else if (filterWord.length >= 3) {
    currentNames = pokemonList.filter(pokemon =>
      pokemon.name.startsWith(filterWord)
    ); // Suche nach Pokémon, deren Namen mit dem eingegebenen Wort beginnen
  } else {
    currentNames = pokemonList; // Weniger als 3 Zeichen, alle anzeigen
  }

  document.getElementById("mainButton").classList.add("d-none");

  render(); // Nach jedem Filtervorgang neu rendern
}

document.getElementById("search").addEventListener("input", filterAndShowNames);

function openInfoScreen(index) {
  const pokemon = currentNames[index];

  document.querySelector("body").classList.add("ovHidden");
  document.getElementById("infoScreen").classList.remove("d-none");

  document.getElementById("infoScreen").innerHTML = generateOpenInfoScreen(
    pokemon,
    index
  );

  mainInfo(event, index);
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
  event.stopPropagation(); // Verhindert, dass das Haupt-Event ausgelöst wird
  const pokemon = currentNames[index];

  // Spezies-URL, um an die Evolutionskette zu kommen
  const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`;
  const speciesResponse = await fetch(speciesUrl);
  const speciesData = await speciesResponse.json();

  // Hole die URL zur Evolutionskette
  const evolutionChainUrl = speciesData.evolution_chain.url;
  const evolutionResponse = await fetch(evolutionChainUrl);
  const evolutionData = await evolutionResponse.json();

  // Finde alle Evolutionsstufen
  const evolutions = await getEvolutions(evolutionData.chain);

  // HTML generieren und in das 'info'-Feld einfügen
  renderEvolutions(evolutions);
}

// Hilfsfunktion: Durchläuft die Evolutionskette und holt die Daten für jedes Pokémon
async function getEvolutions(evolutionChain) {
  const evolutions = [];
  let currentEvolution = evolutionChain;
  // Füge die erste Evolutionsstufe hinzu
  evolutions.push(await getPokemonData(currentEvolution.species.name));

  // Füge weitere Evolutionsstufen hinzu, wenn sie existieren
  while (currentEvolution.evolves_to.length > 0) {
    currentEvolution = currentEvolution.evolves_to[0]; // Nächste Evolution
    evolutions.push(await getPokemonData(currentEvolution.species.name));
  }

  return evolutions;
}

// Hilfsfunktion, um Pokémon-Daten basierend auf dem Namen zu laden
async function getPokemonData(pokemonName) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );
  return await response.json();
}

function renderEvolutions(evolutions) {
  let evoHtml = "";
  evolutions.forEach(evolution => {
    evoHtml += `
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
  const basePath = "svg/";

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

// Funktion zum Anzeigen des Spinners
function showSpinner() {
  document.getElementById("spinner").style.display = "block";
  document.body.classList.add("loading"); // Deaktiviere Scrollen und Klicks
}

// Funktion zum Verbergen des Spinners
function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.body.classList.remove("loading"); // Aktiviere Scrollen und Klicks
}
