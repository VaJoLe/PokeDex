const fs = require('fs');
const fetch = require('node-fetch');

const API_URL = 'https://pokeapi.co/api/v2/pokemon?limit=1010';

async function fetchPokemonData() {
  try {
    console.log('Hole Liste aller Pokémon...');
    const response = await fetch(API_URL);
    const data = await response.json();

    const allPokemon = data.results;
    const detailedData = [];

    console.log(`Gefunden: ${allPokemon.length} Pokémon`);
    console.log('Hole Details...');

    for (let i = 0; i < allPokemon.length; i++) {
      const pokemon = allPokemon[i];
      const detailResponse = await fetch(pokemon.url);
      const detailData = await detailResponse.json();

      detailedData.push({
        id: detailData.id,
        name: detailData.name,
        image: detailData.sprites.other.dream_world.front_default,
        types: detailData.types.map(t => t.type.name),
        height: detailData.height,
        weight: detailData.weight,
        abilities: detailData.abilities,
        base_experience: detailData.base_experience,
        stats: detailData.stats
      });

      console.log(`Fertig: ${detailData.name} (${i + 1}/${allPokemon.length})`);
    }

    fs.writeFileSync('pokemon-data.json', JSON.stringify(detailedData, null, 2));
    console.log('Alle Pokémon gespeichert in pokemon-data.json');

  } catch (error) {
    console.error('Fehler beim Abrufen:', error);
  }
}

fetchPokemonData();
