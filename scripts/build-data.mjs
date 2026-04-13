import fs from 'fs';
import path from 'path';

const root = '/Users/taoye/Documents/Playground/pokemon-personality-team';
const dataDir = path.join(root, 'data');

const rosterHtml = fs.readFileSync(path.join(dataDir, 'game8-roster.html'), 'utf8');
const movesHtml = fs.readFileSync(path.join(dataDir, 'game8-moves.html'), 'utf8');
const tierHtml = fs.readFileSync(path.join(dataDir, 'game8-best-pokemon.html'), 'utf8');

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function extractRosterNames(html) {
  const regex = /data-track-nier-value='([^']+)' href='\/games\/Pokemon-Champions\/archives\/[0-9]+'/g;
  const names = new Set();
  let match;
  while ((match = regex.exec(html))) {
    const value = match[1].trim();
    if (!value) continue;
    if (/list|guides|builder|calculator|ranked|pokemon champions/i.test(value)) continue;
    names.add(value);
  }
  return [...names];
}

function extractMoveNames(html) {
  const regex = /<a class='a-link' href=https:\/\/game8\.co\/games\/Pokemon-Champions\/archives\/[0-9]+>([^<]+)<\/a>/g;
  const names = new Set();
  let match;
  while ((match = regex.exec(html))) {
    const value = match[1].trim();
    if (!value) continue;
    if (!/^[A-Z0-9][A-Za-z0-9'\- :.]+$/.test(value)) continue;
    if (value.includes('Pokemon Champions')) continue;
    names.add(value);
  }
  return [...names];
}

function extractTopMeta(html) {
  const section = html.match(/S Rank Pokemon Explanation([\s\S]*?)<h2 class='a-header--2' id='hl_4'>A Rank Pokemon Explanation/);
  const block = section ? section[1] : html;
  const regex = /<h3 class='a-header--3'[^>]*>([^<]+)<\/h3>/g;
  const names = [];
  let match;
  while ((match = regex.exec(block))) {
    names.push(match[1].trim());
  }
  return names;
}

const rosterNames = extractRosterNames(rosterHtml);
const moveNames = extractMoveNames(movesHtml);
const topMeta = extractTopMeta(tierHtml);

const pokemonList = JSON.parse(fs.readFileSync(path.join(dataDir, 'pokeapi-pokemon-list.json'), 'utf8'));
const moveList = JSON.parse(fs.readFileSync(path.join(dataDir, 'pokeapi-move-list.json'), 'utf8'));

const pokemonByNorm = new Map();
for (const item of pokemonList.results) {
  pokemonByNorm.set(normalize(item.name), item.name);
}
const moveByNorm = new Map();
for (const item of moveList.results) {
  moveByNorm.set(normalize(item.name), item.name);
}

const manualPokemonMap = {
  washrotom: 'rotom-wash',
  heatrotom: 'rotom-heat',
  frostmowrotom: 'rotom-frost',
  mowrotom: 'rotom-mow',
  fanrotom: 'rotom-fan',
  eternalflowerfloette: 'floette-eternal',
  charizardx: 'charizard-mega-x',
  charizardy: 'charizard-mega-y',
  gengarmega: 'gengar-mega',
  venusaurmega: 'venusaur-mega',
  blastoisemega: 'blastoise-mega',
  salamencemega: 'salamence-mega',
  tyranitarmega: 'tyranitar-mega',
  gardevoirmega: 'gardevoir-mega',
  lucariomega: 'lucario-mega',
  kangaskhanmega: 'kangaskhan-mega',
  mawilemega: 'mawile-mega',
  metagrossmega: 'metagross-mega',
  mewtwomegax: 'mewtwo-mega-x',
  mewtwomegay: 'mewtwo-mega-y',
  ampharosmega: 'ampharos-mega',
  blazikenmega: 'blaziken-mega',
  sceptilemega: 'sceptile-mega',
  swampertmega: 'swampert-mega',
  sableyemega: 'sableye-mega',
  altariamega: 'altaria-mega',
  gallademega: 'gallade-mega',
  absolmega: 'absol-mega',
  glaliemega: 'glalie-mega',
  lopunnymega: 'lopunny-mega',
  sharpedomega: 'sharpedo-mega',
  cameruptmega: 'camerupt-mega',
  banettemega: 'banette-mega',
  aggronmega: 'aggron-mega',
  aerodactylmega: 'aerodactyl-mega',
  houndoommega: 'houndoom-mega',
  medichammega: 'medicham-mega',
  scizormega: 'scizor-mega',
  pinsirmega: 'pinsir-mega',
  gyaradosmega: 'gyarados-mega',
  heracrossmega: 'heracross-mega',
  alakazammega: 'alakazam-mega',
  slowbromega: 'slowbro-mega',
  latiasmega: 'latias-mega',
  latiosmega: 'latios-mega',
  rayquazamega: 'rayquaza-mega',
  steelixmega: 'steelix-mega',
  pidgeotmega: 'pidgeot-mega',
  audinomega: 'audino-mega',
  beedrillmega: 'beedrill-mega'
};

const manualMoveMap = {
  uturn: 'u-turn',
  willowisp: 'will-o-wisp',
  highspeedstar: 'swift',
  doubleslap: 'double-slap',
  ancientpower: 'ancient-power',
  selfdestruct: 'self-destruct',
  softboiled: 'soft-boiled',
  vicegrip: 'vise-grip',
  dynamicpunch: 'dynamic-punch',
  dragonbreath: 'dragon-breath',
  sandattack: 'sand-attack',
  thunderpunch: 'thunder-punch',
  firepunch: 'fire-punch',
  icepunch: 'ice-punch'
};

function mapPokemonName(name) {
  const norm = normalize(name);
  return manualPokemonMap[norm] || pokemonByNorm.get(norm) || null;
}

function mapMoveName(name) {
  const norm = normalize(name);
  return manualMoveMap[norm] || moveByNorm.get(norm) || null;
}

const matchedRoster = [];
const unmatchedRoster = [];
for (const name of rosterNames) {
  const mapped = mapPokemonName(name);
  if (mapped) matchedRoster.push({ display: name, api: mapped });
  else unmatchedRoster.push(name);
}

const matchedMoves = [];
const unmatchedMoves = [];
for (const name of moveNames) {
  const mapped = mapMoveName(name);
  if (mapped) matchedMoves.push({ display: name, api: mapped });
  else unmatchedMoves.push(name);
}

const svMoveSet = new Set(matchedMoves.map((m) => m.api));
const rosterMap = new Map(matchedRoster.map((m) => [m.api, m.display]));

const generated = {
  generatedAt: new Date().toISOString(),
  sourceNotes: {
    rosterSource: 'Game8 Pokemon Champions roster page',
    moveSource: 'Game8 Pokemon Champions move list page',
    statSource: 'PokeAPI /pokemon endpoint with Scarlet-Violet learnsets filtered by Champions move pool',
    topMetaSource: 'Game8 Doubles tier list page'
  },
  counts: {
    rosterPageNames: rosterNames.length,
    matchedRoster: matchedRoster.length,
    movePageNames: moveNames.length,
    matchedMoves: matchedMoves.length
  },
  unmatchedRoster,
  unmatchedMoves,
  topMeta,
  pokemonManifest: matchedRoster,
  legalMoves: matchedMoves
};

fs.writeFileSync(path.join(dataDir, 'generated-data.json'), JSON.stringify(generated, null, 2));
console.log(JSON.stringify(generated.counts, null, 2));
console.log('unmatched roster', unmatchedRoster.length);
console.log('unmatched moves', unmatchedMoves.length);
