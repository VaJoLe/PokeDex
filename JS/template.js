function generatePokeCard(pokemonData) {
  return /*html*/ `
    <div class="pokeCard" onclick="openInfoScreen(${pokemonData.id})">
        <div class="pokeCardHead">
            <span class="number"><b>#${pokemonData.id}</b></span>
            <span><b>${pokemonData.name}</b></span>
        </div>
        <div class="pokeCardBody bg_${pokemonData.types[0]}">
            <img src="${pokemonData.image}" alt="">
        </div>
        <div class="pokeCardFoot">
            <div class="svg-container ">
              ${srcImg(pokemonData.types.map(type => type))}
            </div>
        </div>
    </div>
        `;
}

function generateOpenInfoScreen(pokemon) {
  return /*html*/ `
    <div class="next" onclick="nextPokemon(event, ${pokemon.id})">
      <img src="img/vorwärts.jpg" alt="vorwärts">
    </div>
    <div class="infos">
      <div class="infoHead">
        <span class="number"><b>#${pokemon.id}</b></span>
        <span><b>${pokemon.name}</b></span>
      </div>
      <div class="infoImg bg_${pokemon.types[0]}">
        <img src="${pokemon.image}" alt="">
      </div>
      <div class="infoTypes">
        ${srcImg(pokemon.types.map(type => type))}
      </div>
      <div class="infoButtons">
        <button onclick='mainInfo()' class="button">Main</button>
        <button onclick='statsInfo()' class="button">Stats</button>
        <button onclick='evoInfo()' class="button">Evolution</button>
      </div>
      <div class="infoText" id="info">
      </div>
    </div>
    <div class="prev" onclick="prevPokemon(event, ${pokemon.id})">
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
          .join(', ')}</span>
      </div>
    </div>
    `;
}
