function generatePokeCard(index) {
  const pokemonData = currentNames[index];
  return /*html*/ `
    <div class="pokeCard" onclick="openInfoScreen(${index})">
        <div class="pokeCardHead">
            <span class="number"><b>#${pokemonData.id}</b></span>
            <span><b>${pokemonData.name}</b></span>
        </div>
        <div class="pokeCardBody bg_${pokemonData.types[0].type.name}">
            <img src="${
              pokemonData.sprites.other.dream_world.front_default
            }" alt="">
        </div>
        <div class="pokeCardFoot">
            <div class="svg-container ">
              ${srcImg(pokemonData.types.map(type => type.type.name))}
            </div>
        </div>
    </div>
        `;
}

function generateOpenInfoScreen(index) {
  const pokemon = currentNames[index];
  return /*html*/ `
    <div class="next" onclick="nextPokemon(event, ${index})">
      <img src="img/vorwärts.jpg" alt="vorwärts">
    </div>
    <div class="infos">
      <div class="infoHead">
        <span class="number"><b>#${pokemon.id}</b></span>
        <span><b>${pokemon.name}</b></span>
      </div>
      <div class="infoImg bg_${pokemon.types[0].type.name}"img>
        <img src="${pokemon.sprites.other.dream_world.front_default}" alt="">
      </div>
      <div class="infoTypes"type>
        ${srcImg(pokemon.types.map(type => type.type.name))}
      </div>
      <div class="infoButtons"buttons>
        <button onclick="mainInfo(event, ${index})" class="button" id="button mainButton">Main</button>
        <button onclick="statsInfo(event, ${index})" class="button" id="button">Stats</button>
        <button onclick="evoInfo(event, ${index})" class="button" id="button">Evolution</button>
      </div>
      <div class="infoText" id="info">
      </div>
    </div>
    <div class="prev" onclick="prevPokemon(event, ${index})">
      <img src="img/zurück.jpg" alt="zurück">
    </div>
        `;
}

function generateMainInfo(pokemon) {
  return /*html*/ `
    <div>
      <div class="infoRow">
        <span class="statName"><b>Name:</b></span> 
        <span class="statValue">${pokemon.name}</span>
      </div>
      <div class="infoRow">
        <span class="statName"><b>EP:</b></span>
        <span class="statValue">${pokemon.base_experience}</span>
      </div>
      <div class="infoRow">
        <span class="statName"><b>Gewicht:</b></span>
        <span class="statValue">${mathWeight(pokemon.weight)}kg</span>
      </div>
      <div class="infoRow">
        <span class="statName"><b>Größe:</b></span>
        <span class="statValue">${mathHeight(pokemon.height)}m</span>
      </div>
      <div class="infoRow">
        <span class="statName"><b>Fähigkeiten:</b></span> 
        <span class="statValue">${pokemon.abilities
          .map(ability => ability.ability.name)
          .join(", ")}</span>
      </div>
    </div>
    `;
}
