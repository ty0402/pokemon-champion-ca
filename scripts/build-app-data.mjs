import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const dataDir = path.join(root, 'data');

const teamBuilder = JSON.parse(fs.readFileSync(path.join(dataDir, 'game8-team-builder-727.json'), 'utf8'));
const doublesPage = fs.readFileSync(path.join(dataDir, 'game8-best-pokemon.html'), 'utf8');
const movesetsIndex = fs.readFileSync(path.join(dataDir, 'game8-movesets-index.html'), 'utf8');
const rosterPage = fs.readFileSync(path.join(dataDir, 'game8-roster.html'), 'utf8');

const launchCounts = rosterPage.match(/Regular Pokemon<\/th>\s*<td[^>]*>(\d+)<\/td>[\s\S]*?Mega Pokemon<\/th>\s*<td[^>]*>(\d+)<\/td>[\s\S]*?Total<\/th>\s*<td[^>]*>(\d+)<\/td>/);
const allPokemon = teamBuilder.pokemonsArraySchema.pokemons;
const moveMap = new Map(teamBuilder.movesArraySchema.moves.map((move) => [move.id, move]));
const usedMoveIds = new Set();
const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const TOTAL_STAT_POINT_CAP = 66;

for (const pokemon of allPokemon) {
  for (const moveId of pokemon.movesArraySchema.moveIds) usedMoveIds.add(moveId);
}

const legalMoves = [...usedMoveIds]
  .map((id) => moveMap.get(id))
  .filter(Boolean)
  .map((move) => ({
    id: move.id,
    name: move.name,
    type: move.typeName,
    category: move.category,
    power: Number(move.power) || 0,
    accuracy: Number(move.accuracy) || 0,
    range: move.range || '',
    priority: Number(move.priority) || 0,
    isDirect: String(move.isDirect).toLowerCase() === 'true'
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const species = allPokemon
  .map((pokemon) => ({
    id: pokemon.id,
    name: pokemon.name,
    imageUrl: pokemon.imageUrl,
    url: pokemon.url,
    types: [pokemon.type1, pokemon.type2].filter(Boolean),
    abilities: [pokemon.ability1, pokemon.ability2, pokemon.ability3].filter(Boolean),
    base: {
      hp: Number(pokemon.hp),
      atk: Number(pokemon.atk),
      def: Number(pokemon.def),
      spa: Number(pokemon.spa),
      spd: Number(pokemon.spd),
      spe: Number(pokemon.spe)
    },
    megaFormId: pokemon.megaFormId,
    moveIds: pokemon.movesArraySchema.moveIds.filter((id) => usedMoveIds.has(id))
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const natures = teamBuilder.naturesArraySchema.natures.map((nature) => ({
  id: nature.id,
  name: nature.name,
  increasedStat: nature.increasedStat,
  decreasedStat: nature.decreasedStat
}));

const items = teamBuilder.itemsArraySchema.items
  .map((item) => ({
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const doublesTierRanks = {
  S: ['Incineroar', 'Kingambit'],
  'A+': ['Garchomp', 'Espathra', 'Dragonite', 'Glimmora', 'Torkoal'],
  A: ['Primarina', 'Farigiraf', 'Whimsicott', 'Pelipper', 'Sneasler', 'Tyranitar']
};

const topMeta = Object.entries(doublesTierRanks).flatMap(([rank, names]) => names.map((name) => ({ rank, name })));

function extractMovesetLabels(speciesName) {
  const labels = [];
  const pattern = new RegExp(`>([^<]*${speciesName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]*)<\\/a>`, 'g');
  for (const match of movesetsIndex.matchAll(pattern)) {
    const label = match[1].trim();
    if (!label || label === speciesName || labels.includes(label)) continue;
    if (label.includes('Stats, Moves, and How to Get Fast')) continue;
    labels.push(label);
  }
  return labels.slice(0, 6);
}

const MEGA_SPECIES_TO_STONE = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'mega-species-to-stone.json'), 'utf8')
);

function megaFormToBaseSpecies(megaName) {
  if (megaName === 'Mega Charizard X' || megaName === 'Mega Charizard Y') return 'Charizard';
  if (megaName === 'Mega Floette') return 'Eternal Flower Floette';
  if (megaName.startsWith('Mega ')) return megaName.slice(5);
  return megaName;
}

function megasForBase(baseName) {
  const out = [];
  for (const [mega, stone] of Object.entries(MEGA_SPECIES_TO_STONE)) {
    if (megaFormToBaseSpecies(mega) === baseName) out.push({ mega, stone });
  }
  return out;
}

const metaSets = [
  {
    species: 'Incineroar',
    rank: 'S',
    sourceName: 'Incineroar',
    note: 'Game8 当前双打环境的总轴心，Fake Out、Parting Shot、Snarl 与 Intimidate 的压缩度依然最强。',
    archetypes: extractMovesetLabels('Incineroar'),
    sets: [
      { name: 'Bulky Support Incineroar', item: 'Sitrus Berry', ability: 'Intimidate', nature: 'Careful', statPoints: { hp: 32, atk: 8, def: 10, spa: 0, spd: 16, spe: 0 }, moves: ['Fake Out', 'Flare Blitz', 'Parting Shot', 'Snarl'] },
      { name: 'Shuca Pivot Incineroar', item: 'Shuca Berry', ability: 'Intimidate', nature: 'Careful', statPoints: { hp: 28, atk: 10, def: 10, spa: 0, spd: 14, spe: 2 }, moves: ['Fake Out', 'Flare Blitz', 'Parting Shot', 'Taunt'] },
      { name: 'Offensive Utility Incineroar', item: 'Sitrus Berry', ability: 'Intimidate', nature: 'Adamant', statPoints: { hp: 12, atk: 32, def: 4, spa: 0, spd: 8, spe: 4 }, moves: ['Fake Out', 'Flare Blitz', 'Throat Chop', 'Parting Shot'] }
    ]
  },
  {
    species: 'Sneasler',
    rank: 'A',
    sourceName: 'Sneasler',
    note: 'Sneasler 是 Game8 现双打 S 档高速打点，Dire Claw 与 Unburden 让它既能开局抢节奏，也能残局收割。',
    archetypes: extractMovesetLabels('Sneasler'),
    sets: [
      { name: 'Standard Unburden Sneasler', item: 'White Herb', ability: 'Unburden', nature: 'Adamant', statPoints: { hp: 2, atk: 32, def: 2, spa: 0, spd: 0, spe: 32 }, moves: ['Dire Claw', 'Close Combat', 'Fake Out', 'Protect'] },
      { name: 'Focus Sash Sneasler', item: 'Focus Sash', ability: 'Unburden', nature: 'Jolly', statPoints: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Dire Claw', 'Close Combat', 'Fake Out', 'Throat Chop'] },
      { name: 'Coaching Sneasler', item: 'Sitrus Berry', ability: 'Unburden', nature: 'Adamant', statPoints: { hp: 32, atk: 32, def: 2, spa: 0, spd: 0, spe: 2 }, moves: ['Dire Claw', 'Close Combat', 'Coaching', 'Protect'] }
    ]
  },
  {
    species: 'Garchomp',
    rank: 'S',
    sourceName: 'Garchomp',
    note: 'Garchomp 依旧是双打范围压制的速度基准，Game8 同时把标准进攻、围巾和太阳队搭档都列为主流模板。',
    archetypes: extractMovesetLabels('Garchomp'),
    sets: [
      { name: 'Standard Offensive Garchomp', item: 'Lum Berry', ability: 'Rough Skin', nature: 'Jolly', statPoints: { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Earthquake', 'Dragon Claw', 'Rock Slide', 'Protect'] },
      { name: 'Doubles Choice Scarf Garchomp', item: 'Choice Scarf', ability: 'Rough Skin', nature: 'Jolly', statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Earthquake', 'Dragon Claw', 'Rock Slide', 'Poison Jab'] },
      { name: 'Sun Team Garchomp', item: 'Soft Sand', ability: 'Rough Skin', nature: 'Adamant', statPoints: { hp: 12, atk: 32, def: 2, spa: 0, spd: 0, spe: 24 }, moves: ['Earthquake', 'Dragon Claw', 'Rock Slide', 'Swords Dance'] }
    ]
  },
  {
    species: 'Kingambit',
    rank: 'S',
    sourceName: 'Kingambit',
    note: 'Kingambit 是当前最稳的残局威胁之一，既能吃威吓反打，也能靠高耐久维持中盘存在感。',
    archetypes: extractMovesetLabels('Kingambit'),
    sets: [
      { name: 'Standard Bulky Kingambit', item: 'Sitrus Berry', ability: 'Defiant', nature: 'Adamant', statPoints: { hp: 24, atk: 32, def: 0, spa: 0, spd: 12, spe: 0 }, moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Low Kick'] },
      { name: 'Black Glasses Kingambit', item: 'Black Glasses', ability: 'Defiant', nature: 'Adamant', statPoints: { hp: 16, atk: 32, def: 8, spa: 0, spd: 8, spe: 0 }, moves: ['Kowtow Cleave', 'Sucker Punch', 'Swords Dance', 'Protect'] },
      { name: 'Offensive Kingambit', item: 'Lum Berry', ability: 'Supreme Overlord', nature: 'Adamant', statPoints: { hp: 8, atk: 32, def: 4, spa: 0, spd: 8, spe: 12 }, moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Protect'] }
    ]
  },
  {
    species: 'Sinistcha',
    rank: 'A+',
    sourceName: 'Sinistcha',
    note: 'Sinistcha 目前是最稳定的 Trick Room/Rage Powder 组件之一，能同时担任转场、回血和反空间。',
    archetypes: extractMovesetLabels('Sinistcha'),
    sets: [
      { name: 'Bulky Support Sinistcha', item: 'Mental Herb', ability: 'Hospitality', nature: 'Calm', statPoints: { hp: 32, atk: 0, def: 17, spa: 0, spd: 17, spe: 0 }, moves: ['Matcha Gotcha', 'Trick Room', 'Rage Powder', 'Imprison'] },
      { name: 'Bulky Special Attacker Sinistcha', item: 'Leftovers', ability: 'Hospitality', nature: 'Modest', statPoints: { hp: 20, atk: 0, def: 8, spa: 24, spd: 12, spe: 0 }, moves: ['Matcha Gotcha', 'Shadow Ball', 'Rage Powder', 'Protect'] },
      { name: 'Strength Sap Sinistcha', item: 'Sitrus Berry', ability: 'Hospitality', nature: 'Bold', statPoints: { hp: 32, atk: 0, def: 20, spa: 8, spd: 8, spe: 0 }, moves: ['Matcha Gotcha', 'Rage Powder', 'Strength Sap', 'Protect'] }
    ]
  },
  {
    species: 'Whimsicott',
    rank: 'A',
    sourceName: 'Whimsicott',
    note: 'Whimsicott 仍然是顺风与节奏控制最稳定的先发位，Prankster 支持能让高爆发队更容易过线。',
    archetypes: extractMovesetLabels('Whimsicott'),
    sets: [
      { name: 'Prankster Support Whimsicott', item: 'Focus Sash', ability: 'Prankster', nature: 'Timid', statPoints: { hp: 2, atk: 0, def: 2, spa: 24, spd: 0, spe: 32 }, moves: ['Moonblast', 'Tailwind', 'Encore', 'Protect'] },
      { name: 'Covert Cloak Whimsicott', item: 'Mental Herb', ability: 'Prankster', nature: 'Timid', statPoints: { hp: 20, atk: 0, def: 8, spa: 0, spd: 0, spe: 32 }, moves: ['Moonblast', 'Tailwind', 'Taunt', 'Helping Hand'] },
      { name: 'Mental Herb Whimsicott', item: 'Mental Herb', ability: 'Prankster', nature: 'Timid', statPoints: { hp: 18, atk: 0, def: 10, spa: 0, spd: 4, spe: 32 }, moves: ['Tailwind', 'Encore', 'Taunt', 'Protect'] }
    ]
  },
  {
    species: 'Mega Charizard Y',
    rank: 'A+',
    sourceName: 'Charizard',
    note: 'Charizard 相关晴天体系依然是 A+ 档强攻代表，Mega Charizard Y 在顺风或伪空间里都能制造强压。',
    archetypes: extractMovesetLabels('Charizard'),
    sets: [
      { name: 'Mega Charizard Y Drought Wallbreaker', item: 'Charizardite Y', ability: 'Drought', nature: 'Timid', statPoints: { hp: 2, atk: 0, def: 2, spa: 32, spd: 0, spe: 32 }, moves: ['Heat Wave', 'Air Slash', 'Solar Beam', 'Protect'] },
      { name: 'Sun Team Mega Charizard Y', item: 'Charizardite Y', ability: 'Drought', nature: 'Modest', statPoints: { hp: 10, atk: 0, def: 2, spa: 32, spd: 0, spe: 24 }, moves: ['Heat Wave', 'Overheat', 'Solar Beam', 'Protect'] },
      { name: 'Roost Mega Charizard Y', item: 'Charizardite Y', ability: 'Drought', nature: 'Timid', statPoints: { hp: 12, atk: 0, def: 2, spa: 28, spd: 8, spe: 24 }, moves: ['Heat Wave', 'Air Slash', 'Solar Beam', 'Roost'] }
    ]
  },
  {
    species: 'Mega Gengar',
    rank: 'A+',
    sourceName: 'Gengar',
    note: 'Mega Gengar 依靠 Shadow Tag 让残局交换空间极小，Perish Trap 和进攻型都在当前资料里保持高存在感。',
    archetypes: extractMovesetLabels('Gengar'),
    sets: [
      { name: 'Perish Trap Mega Gengar', item: 'Gengarite', ability: 'Shadow Tag', nature: 'Timid', statPoints: { hp: 12, atk: 0, def: 8, spa: 20, spd: 0, spe: 32 }, moves: ['Shadow Ball', 'Protect', 'Perish Song', 'Disable'] },
      { name: 'Offensive Mega Gengar', item: 'Gengarite', ability: 'Shadow Tag', nature: 'Timid', statPoints: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }, moves: ['Shadow Ball', 'Sludge Bomb', 'Protect', 'Will-O-Wisp'] },
      { name: 'Control Mega Gengar', item: 'Gengarite', ability: 'Shadow Tag', nature: 'Timid', statPoints: { hp: 8, atk: 0, def: 4, spa: 28, spd: 0, spe: 28 }, moves: ['Shadow Ball', 'Will-O-Wisp', 'Disable', 'Protect'] }
    ]
  },
  {
    species: 'Mega Floette',
    rank: 'A+',
    sourceName: 'Eternal Flower Floette',
    note: 'Eternal Flower Floette 在 Game8 当前双打 A+ 列表里是最容易被低估的 Fairy 核心，主要靠 Fairy Aura 放大队伍压制。',
    archetypes: extractMovesetLabels('Eternal Flower Floette'),
    sets: [
      { name: 'Mega Aura Cannon Floette', item: 'Floettite', ability: 'Fairy Aura', nature: 'Timid', statPoints: { hp: 8, atk: 0, def: 4, spa: 32, spd: 0, spe: 28 }, moves: ['Moonblast', 'Protect', 'Alluring Voice', 'Synthesis'] },
      { name: 'Bulky Aura Floette', item: 'Floettite', ability: 'Fairy Aura', nature: 'Calm', statPoints: { hp: 24, atk: 0, def: 6, spa: 20, spd: 14, spe: 0 }, moves: ['Moonblast', 'Helping Hand', 'Protect', 'Synthesis'] }
    ]
  },
  {
    species: 'Tyranitar',
    rank: 'A+',
    sourceName: 'Tyranitar',
    note: '常规 Tyranitar 在当前资料里仍有很稳的 Bulky Offense 与 Dragon Dance 两类模板，是天气对抗和中速压制的代表。',
    archetypes: extractMovesetLabels('Tyranitar'),
    sets: [
      { name: 'Bulky Offense Tyranitar', item: 'Sitrus Berry', ability: 'Sand Stream', nature: 'Adamant', statPoints: { hp: 20, atk: 32, def: 6, spa: 0, spd: 12, spe: 0 }, moves: ['Rock Slide', 'Crunch', 'Low Kick', 'Ice Punch'] },
      { name: 'Dragon Dance Tyranitar', item: 'Lum Berry', ability: 'Sand Stream', nature: 'Jolly', statPoints: { hp: 8, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Rock Slide', 'Crunch', 'Dragon Dance', 'Protect'] }
    ]
  },
  {
    species: 'Wash Rotom',
    rank: 'A+',
    sourceName: 'Wash Rotom',
    note: 'Wash Rotom 在当前双打榜里属于高稳定中转位，既能进雨队，也能在晴队镜像里提供可靠水电压制与灼伤。',
    archetypes: extractMovesetLabels('Wash Rotom'),
    sets: [
      { name: 'Doubles Bulky Wash Rotom', item: 'Sitrus Berry', ability: 'Levitate', nature: 'Calm', statPoints: { hp: 28, atk: 0, def: 10, spa: 14, spd: 12, spe: 0 }, moves: ['Hydro Pump', 'Thunderbolt', 'Will-O-Wisp', 'Protect'] },
      { name: 'Sun Team Wash Rotom', item: 'Leftovers', ability: 'Levitate', nature: 'Bold', statPoints: { hp: 32, atk: 0, def: 16, spa: 8, spd: 8, spe: 0 }, moves: ['Hydro Pump', 'Thunderbolt', 'Volt Switch', 'Will-O-Wisp'] }
    ]
  },
  {
    species: 'Pelipper',
    rank: 'A',
    sourceName: 'Pelipper',
    note: 'Pelipper 依然是雨天起手的最稳解之一，Drizzle、Tailwind 和 Wide Guard 让它在支援位里独一档。',
    archetypes: extractMovesetLabels('Pelipper'),
    sets: [
      { name: 'Rain Setter Pelipper', item: 'Focus Sash', ability: 'Drizzle', nature: 'Bold', statPoints: { hp: 24, atk: 0, def: 14, spa: 8, spd: 8, spe: 10 }, moves: ['Hurricane', 'Weather Ball', 'Tailwind', 'Wide Guard'] },
      { name: 'Bulky Utility Pelipper', item: 'Leftovers', ability: 'Drizzle', nature: 'Calm', statPoints: { hp: 32, atk: 0, def: 6, spa: 12, spd: 12, spe: 0 }, moves: ['Hurricane', 'Hydro Pump', 'Tailwind', 'Protect'] }
    ]
  },
  {
    species: 'Archaludon',
    rank: 'A',
    sourceName: 'Archaludon',
    note: 'Archaludon 在雨队和常规中速队里都很强，Game8 目前给出了雨核特攻、铺钉和厚攻三类模板。',
    archetypes: extractMovesetLabels('Archaludon'),
    sets: [
      { name: 'Rain Special Attacker Archaludon', item: 'Sitrus Berry', ability: 'Stamina', nature: 'Modest', statPoints: { hp: 24, atk: 0, def: 8, spa: 32, spd: 8, spe: 0 }, moves: ['Electro Shot', 'Draco Meteor', 'Flash Cannon', 'Aura Sphere'] },
      { name: 'Bulky Offense Archaludon', item: 'Leftovers', ability: 'Stamina', nature: 'Modest', statPoints: { hp: 28, atk: 0, def: 8, spa: 24, spd: 12, spe: 0 }, moves: ['Electro Shot', 'Flash Cannon', 'Aura Sphere', 'Protect'] }
    ]
  },
  {
    species: 'Dragonite',
    rank: 'A+',
    sourceName: 'Dragonite',
    note: 'Dragonite 在当前 A 档里靠 Extreme Speed、Multiscale 和高覆盖维持很强的残局与转场质量。',
    archetypes: extractMovesetLabels('Dragonite'),
    sets: [
      { name: 'Standard Physical Dragonite', item: 'Lum Berry', ability: 'Multiscale', nature: 'Adamant', statPoints: { hp: 20, atk: 32, def: 4, spa: 0, spd: 8, spe: 10 }, moves: ['Extreme Speed', 'Dragon Claw', 'Low Kick', 'Protect'] },
      { name: 'Dragon Dance Dragonite', item: 'Lum Berry', ability: 'Multiscale', nature: 'Jolly', statPoints: { hp: 8, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Extreme Speed', 'Dragon Claw', 'Dragon Dance', 'Protect'] }
    ]
  },
  {
    species: 'Primarina',
    rank: 'A',
    sourceName: 'Primarina',
    note: 'Primarina 是当前慢速特攻核里很稳的一只，Game8 现有 build 重点强调高耐久特攻和对恶龙系的高压对位。',
    archetypes: extractMovesetLabels('Primarina'),
    sets: [
      { name: 'Bulky Special Attacker Primarina', item: 'Fairy Feather', ability: 'Liquid Voice', nature: 'Modest', statPoints: { hp: 24, atk: 0, def: 8, spa: 32, spd: 8, spe: 0 }, moves: ['Hyper Voice', 'Moonblast', 'Hydro Pump', 'Protect'] },
      { name: 'Bulky Primarina', item: 'Sitrus Berry', ability: 'Torrent', nature: 'Modest', statPoints: { hp: 28, atk: 0, def: 8, spa: 28, spd: 12, spe: 0 }, moves: ['Moonblast', 'Hydro Pump', 'Ice Beam', 'Hyper Voice'] }
    ]
  },
  {
    species: 'Hatterene',
    rank: 'A',
    sourceName: 'Hatterene',
    note: 'Hatterene 是最经典的反控空间手，Magic Bounce 带来的对位价值让它在慢速队里一直稳定。',
    archetypes: extractMovesetLabels('Hatterene'),
    sets: [
      { name: 'Trick Room Lead Hatterene', item: 'Mental Herb', ability: 'Magic Bounce', nature: 'Quiet', statPoints: { hp: 24, atk: 0, def: 6, spa: 32, spd: 8, spe: 0 }, moves: ['Dazzling Gleam', 'Psychic', 'Trick Room', 'Protect'] },
      { name: 'Full Support Hatterene', item: 'Babiri Berry', ability: 'Magic Bounce', nature: 'Quiet', statPoints: { hp: 32, atk: 0, def: 8, spa: 24, spd: 8, spe: 0 }, moves: ['Dazzling Gleam', 'Psychic', 'Trick Room', 'Helping Hand'] }
    ]
  },
  {
    species: 'Glimmora',
    rank: 'A+',
    sourceName: 'Glimmora',
    note: 'Glimmora 在当前环境里的价值主要来自速攻特攻与铺场双模，能为很多快攻队提供额外残局压力。',
    archetypes: extractMovesetLabels('Glimmora'),
    sets: [
      { name: 'Entry Hazard Glimmora', item: 'Focus Sash', ability: 'Toxic Debris', nature: 'Timid', statPoints: { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }, moves: ['Mortal Spin', 'Power Gem', 'Earth Power', 'Stealth Rock'] },
      { name: 'Offensive Glimmora', item: 'Poison Barb', ability: 'Toxic Debris', nature: 'Timid', statPoints: { hp: 4, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }, moves: ['Power Gem', 'Earth Power', 'Sludge Bomb', 'Protect'] }
    ]
  },
  {
    species: 'Torkoal',
    rank: 'A+',
    sourceName: 'Torkoal',
    note: 'Torkoal 仍是伪空间和晴天核的基础件，Eruption 与天气控制让它在面对中速队时非常直接。',
    archetypes: extractMovesetLabels('Torkoal'),
    sets: [
      { name: 'Eruption Torkoal', item: 'Charcoal', ability: 'Drought', nature: 'Quiet', statPoints: { hp: 24, atk: 0, def: 12, spa: 32, spd: 8, spe: 0 }, moves: ['Eruption', 'Heat Wave', 'Earth Power', 'Protect'] },
      { name: 'Utility Torkoal', item: 'Sitrus Berry', ability: 'Drought', nature: 'Quiet', statPoints: { hp: 32, atk: 0, def: 16, spa: 20, spd: 12, spe: 0 }, moves: ['Heat Wave', 'Earth Power', 'Yawn', 'Protect'] }
    ]
  },
  {
    species: 'Farigiraf',
    rank: 'A',
    sourceName: 'Farigiraf',
    note: 'Farigiraf 的 Armor Tail 在当前先制密度很高的环境里很有对位价值，也是很稳的第二空间手。',
    archetypes: extractMovesetLabels('Farigiraf'),
    sets: [
      { name: 'Armor Tail Trick Room Farigiraf', item: 'Sitrus Berry', ability: 'Armor Tail', nature: 'Quiet', statPoints: { hp: 28, atk: 0, def: 10, spa: 24, spd: 12, spe: 0 }, moves: ['Psychic', 'Hyper Voice', 'Trick Room', 'Protect'] },
      { name: 'Support Farigiraf', item: 'Mental Herb', ability: 'Armor Tail', nature: 'Calm', statPoints: { hp: 32, atk: 0, def: 12, spa: 8, spd: 20, spe: 0 }, moves: ['Hyper Voice', 'Helping Hand', 'Trick Room', 'Protect'] }
    ]
  },
  {
    species: 'Espathra',
    rank: 'A+',
    sourceName: 'Espathra',
    note: 'Espathra 在速度滚雪球与特耐突破上都很有威胁，面对缺少恶系压制的队伍会非常难挡。',
    archetypes: extractMovesetLabels('Espathra'),
    sets: [
      { name: 'Speed Boost Espathra', item: 'Focus Sash', ability: 'Speed Boost', nature: 'Timid', statPoints: { hp: 4, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }, moves: ['Lumina Crash', 'Dazzling Gleam', 'Protect', 'Calm Mind'] },
      { name: 'Bulky Calm Mind Espathra', item: 'Leftovers', ability: 'Speed Boost', nature: 'Timid', statPoints: { hp: 20, atk: 0, def: 8, spa: 20, spd: 8, spe: 20 }, moves: ['Lumina Crash', 'Dazzling Gleam', 'Protect', 'Roost'] }
    ]
  },
  {
    species: 'Excadrill',
    rank: 'A-',
    sourceName: 'Excadrill',
    note: '扩展热门池：来自当前 Best Teams 与 build 索引，高频出现在沙暴和中速进攻队。',
    archetypes: extractMovesetLabels('Excadrill'),
    sets: [
      { name: 'Sand Offense Excadrill', item: 'Focus Sash', ability: 'Sand Rush', nature: 'Jolly', statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Earthquake', 'Iron Head', 'Rock Slide', 'Protect'] }
    ]
  },
  {
    species: 'Froslass',
    rank: 'A-',
    sourceName: 'Froslass',
    note: '扩展热门池：以高速干扰和冰系压制为主，适合补当前环境里的快控位。',
    archetypes: extractMovesetLabels('Froslass'),
    sets: [
      { name: 'Fast Utility Froslass', item: 'Focus Sash', ability: 'Cursed Body', nature: 'Timid', statPoints: { hp: 0, atk: 0, def: 4, spa: 28, spd: 0, spe: 32 }, moves: ['Icy Wind', 'Shadow Ball', 'Will-O-Wisp', 'Protect'] }
    ]
  },
  {
    species: 'Hippowdon',
    rank: 'A-',
    sourceName: 'Hippowdon',
    note: '扩展热门池：常作为天气和耐久地面位，在对抗晴队和物攻队时很稳定。',
    archetypes: extractMovesetLabels('Hippowdon'),
    sets: [
      { name: 'Bulky Sand Hippowdon', item: 'Sitrus Berry', ability: 'Sand Stream', nature: 'Impish', statPoints: { hp: 32, atk: 12, def: 20, spa: 0, spd: 8, spe: 0 }, moves: ['Earthquake', 'Rock Slide', 'Yawn', 'Protect'] }
    ]
  },
  {
    species: 'Meowscarada',
    rank: 'A-',
    sourceName: 'Meowscarada',
    note: '扩展热门池：高速草恶打点常被拿来补地面和水系对位，并带动 U-turn 转场。',
    archetypes: extractMovesetLabels('Meowscarada'),
    sets: [
      { name: 'Fast Pivot Meowscarada', item: 'Focus Sash', ability: 'Protean', nature: 'Jolly', statPoints: { hp: 0, atk: 32, def: 2, spa: 0, spd: 0, spe: 32 }, moves: ['Flower Trick', 'Knock Off', 'Triple Axel', 'U-turn'] }
    ]
  },
  {
    species: 'Frost Rotom',
    rank: 'A-',
    sourceName: 'Frost Rotom',
    note: '扩展热门池：在当前冰电覆盖比较稀缺的环境里，Frost Rotom 能补龙地飞的对位。',
    archetypes: extractMovesetLabels('Frost Rotom'),
    sets: [
      { name: 'Bulky Frost Rotom', item: 'Sitrus Berry', ability: 'Levitate', nature: 'Modest', statPoints: { hp: 28, atk: 0, def: 8, spa: 24, spd: 8, spe: 8 }, moves: ['Blizzard', 'Thunderbolt', 'Will-O-Wisp', 'Volt Switch'] }
    ]
  },
  {
    species: 'Basculegion (Male)',
    rank: 'A-',
    sourceName: 'Basculegion (Male)',
    note: '扩展热门池：水鬼双属性和先制水流喷射让它在雨队和收残局里都很有威胁。',
    archetypes: extractMovesetLabels('Basculegion (Male)'),
    sets: [
      { name: 'Swift Swim Basculegion', item: 'Focus Sash', ability: 'Swift Swim', nature: 'Adamant', statPoints: { hp: 0, atk: 32, def: 1, spa: 0, spd: 1, spe: 32 }, moves: ['Wave Crash', 'Last Respects', 'Ice Fang', 'Aqua Jet'] }
    ]
  },
  {
    species: 'Hydreigon',
    rank: 'A-',
    sourceName: 'Hydreigon',
    note: '扩展热门池：三首恶龙依旧是稳定的中速特攻龙，适合搭配顺风或转场核心。',
    archetypes: extractMovesetLabels('Hydreigon'),
    sets: [
      { name: 'Tailwind Hydreigon', item: 'Sitrus Berry', ability: 'Levitate', nature: 'Timid', statPoints: { hp: 20, atk: 0, def: 4, spa: 32, spd: 4, spe: 24 }, moves: ['Draco Meteor', 'Dark Pulse', 'Tailwind', 'Protect'] }
    ]
  },
  {
    species: 'Aerodactyl',
    rank: 'A-',
    sourceName: 'Aerodactyl',
    note: '扩展热门池：化石翼龙的价值主要在超高速控速与范围岩崩压场。',
    archetypes: extractMovesetLabels('Aerodactyl'),
    sets: [
      { name: 'Fast Tailwind Aerodactyl', item: 'Focus Sash', ability: 'Pressure', nature: 'Jolly', statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Rock Slide', 'Tailwind', 'Taunt', 'Protect'] }
    ]
  },
  {
    species: 'Delphox',
    rank: 'B+',
    sourceName: 'Delphox',
    note: '扩展热门池：妖火红狐更多作为晴天与特攻控场补位，在对慢速钢草时很好用。',
    archetypes: extractMovesetLabels('Delphox'),
    sets: [
      { name: 'Sun Pressure Delphox', item: 'Charcoal', ability: 'Blaze', nature: 'Timid', statPoints: { hp: 8, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }, moves: ['Heat Wave', 'Psychic', 'Will-O-Wisp', 'Protect'] }
    ]
  },
  {
    species: 'Hawlucha',
    rank: 'B+',
    sourceName: 'Hawlucha',
    note: '扩展热门池：摔角鹰人属于高上限快攻位，适合打穿当前常见的恶钢和草系结构。',
    archetypes: extractMovesetLabels('Hawlucha'),
    sets: [
      { name: 'Unburden Hawlucha', item: 'White Herb', ability: 'Unburden', nature: 'Jolly', statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Close Combat', 'Acrobatics', 'Coaching', 'Protect'] }
    ]
  },
  {
    species: 'Greninja',
    rank: 'B+',
    sourceName: 'Greninja',
    note: '扩展热门池：甲贺忍蛙更像高机动特攻手，适合抓住天气队和龙地核心的薄弱面。',
    archetypes: extractMovesetLabels('Greninja'),
    sets: [
      { name: 'Protean Greninja', item: 'Focus Sash', ability: 'Protean', nature: 'Timid', statPoints: { hp: 0, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }, moves: ['Hydro Pump', 'Ice Beam', 'Dark Pulse', 'Protect'] }
    ]
  },
  {
    species: 'Starmie',
    rank: 'B+',
    sourceName: 'Starmie',
    note: '扩展热门池：宝石海星提供高速水超覆盖与一定工具性，是当前速度压制位的备选。',
    archetypes: extractMovesetLabels('Starmie'),
    sets: [
      { name: 'Fast Utility Starmie', item: 'Mystic Water', ability: 'Natural Cure', nature: 'Timid', statPoints: { hp: 0, atk: 0, def: 4, spa: 28, spd: 0, spe: 32 }, moves: ['Hydro Pump', 'Psychic', 'Ice Beam', 'Protect'] }
    ]
  },
  {
    species: 'Meganium',
    rank: 'B+',
    sourceName: 'Meganium',
    note: '扩展热门池：大竺葵更多是耐久支援草位，适合补水地面对位并提供辅助手段。',
    archetypes: extractMovesetLabels('Meganium'),
    sets: [
      { name: 'Support Meganium', item: 'Leftovers', ability: 'Overgrow', nature: 'Calm', statPoints: { hp: 32, atk: 0, def: 12, spa: 8, spd: 20, spe: 0 }, moves: ['Giga Drain', 'Helping Hand', 'Light Screen', 'Protect'] }
    ]
  },
  {
    species: 'Weavile',
    rank: 'B+',
    sourceName: 'Weavile',
    note: '扩展热门池：玛狃拉仍是超高速冰恶压制位，对龙和超能系的对位很直接。',
    archetypes: extractMovesetLabels('Weavile'),
    sets: [
      { name: 'Fast Pressure Weavile', item: 'Focus Sash', ability: 'Pressure', nature: 'Jolly', statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Triple Axel', 'Knock Off', 'Ice Shard', 'Protect'] }
    ]
  },
  {
    species: 'Orthworm',
    rank: 'B+',
    sourceName: 'Orthworm',
    note: '扩展热门池：土龙节节主要靠 Earth Eater 与耐久打功能位，偏向中速站场工具人。',
    archetypes: extractMovesetLabels('Orthworm'),
    sets: [
      { name: 'Shed Tail Orthworm', item: 'Leftovers', ability: 'Earth Eater', nature: 'Careful', statPoints: { hp: 32, atk: 8, def: 18, spa: 0, spd: 18, spe: 0 }, moves: ['Shed Tail', 'Body Press', 'Iron Head', 'Protect'] }
    ]
  },
  {
    species: 'Politoed',
    rank: 'B+',
    sourceName: 'Politoed',
    note: '扩展热门池：Politoed 是雨队的另一种开雨思路，更偏辅助与节奏而不是直接输出。',
    archetypes: extractMovesetLabels('Politoed'),
    sets: [
      { name: 'Support Politoed', item: 'Sitrus Berry', ability: 'Drizzle', nature: 'Calm', statPoints: { hp: 32, atk: 0, def: 10, spa: 8, spd: 18, spe: 0 }, moves: ['Weather Ball', 'Encore', 'Helping Hand', 'Protect'] }
    ]
  },
  {
    species: 'Corviknight',
    rank: 'B+',
    sourceName: 'Corviknight',
    note: '扩展热门池：钢铠鸦在当前环境里更多承担抗性支点和顺风中转位。',
    archetypes: extractMovesetLabels('Corviknight'),
    sets: [
      { name: 'Bulky Tailwind Corviknight', item: 'Leftovers', ability: 'Mirror Armor', nature: 'Impish', statPoints: { hp: 32, atk: 12, def: 20, spa: 0, spd: 12, spe: 0 }, moves: ['Brave Bird', 'Tailwind', 'Roost', 'Body Press'] }
    ]
  },
  {
    species: 'Dragapult',
    rank: 'B+',
    sourceName: 'Dragapult',
    note: '扩展热门池：多龙巴鲁托虽然更偏快攻，但在当前环境里仍能靠先手和转场制造压力。',
    archetypes: extractMovesetLabels('Dragapult'),
    sets: [
      { name: 'Fast Pivot Dragapult', item: 'Focus Sash', ability: 'Clear Body', nature: 'Jolly', statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Dragon Darts', 'Phantom Force', 'U-turn', 'Protect'] }
    ]
  },
  {
    species: 'Clefable',
    rank: 'B+',
    sourceName: 'Clefable',
    note: '扩展热门池：皮可西主要是耐久妖精支援位，适合补跟随与辅助输出。',
    archetypes: extractMovesetLabels('Clefable'),
    sets: [
      { name: 'Support Clefable', item: 'Sitrus Berry', ability: 'Magic Guard', nature: 'Calm', statPoints: { hp: 32, atk: 0, def: 12, spa: 8, spd: 20, spe: 0 }, moves: ['Follow Me', 'Moonblast', 'Helping Hand', 'Protect'] }
    ]
  },
  {
    species: 'Kangaskhan',
    rank: 'B+',
    sourceName: 'Kangaskhan',
    note: '扩展热门池：袋兽在当前环境里还是典型的 Fake Out + 高压普攻位。',
    archetypes: extractMovesetLabels('Kangaskhan'),
    sets: [
      { name: 'Mega Kangaskhan', item: 'Kangaskhanite', ability: 'Scrappy', nature: 'Jolly', statPoints: { hp: 12, atk: 32, def: 4, spa: 0, spd: 0, spe: 32 }, moves: ['Fake Out', 'Double-Edge', 'Sucker Punch', 'Protect'] }
    ]
  },
  {
    species: 'Mega Charizard X',
    rank: 'Mega',
    sourceName: 'Charizard',
    note: '热门扩展（Mega 体系）：Mega Charizard X 在当前 Mega 环境中是常见的中高速物攻核心。',
    archetypes: extractMovesetLabels('Charizard'),
    sets: [
      { name: 'Dragon Dance Mega Charizard X', item: 'Charizardite X', ability: 'Tough Claws', nature: 'Jolly', statPoints: { hp: 8, atk: 32, def: 0, spa: 0, spd: 0, spe: 24 }, moves: ['Flare Blitz', 'Dragon Claw', 'Dragon Dance', 'Protect'] }
    ]
  },
  {
    species: 'Mega Garchomp',
    rank: 'Mega',
    sourceName: 'Garchomp',
    note: '热门扩展（Mega 体系）：Mega Garchomp 是常见的地龙高压输出位，常作为中速推进核心。',
    archetypes: extractMovesetLabels('Garchomp'),
    sets: [
      { name: 'Standard Mega Garchomp', item: 'Garchompite', ability: 'Sand Force', nature: 'Jolly', statPoints: { hp: 12, atk: 32, def: 0, spa: 0, spd: 0, spe: 20 }, moves: ['Earthquake', 'Dragon Claw', 'Rock Slide', 'Protect'] }
    ]
  },
  {
    species: 'Mega Tyranitar',
    rank: 'Mega',
    sourceName: 'Tyranitar',
    note: '热门扩展（Mega 体系）：Mega Tyranitar 仍是稳定的中盘压制点，沙暴队和常规队都能携带。',
    archetypes: extractMovesetLabels('Tyranitar'),
    sets: [
      { name: 'Dragon Dance Mega Tyranitar', item: 'Tyranitarite', ability: 'Sand Stream', nature: 'Adamant', statPoints: { hp: 16, atk: 32, def: 4, spa: 0, spd: 8, spe: 4 }, moves: ['Rock Slide', 'Crunch', 'Dragon Dance', 'Protect'] }
    ]
  },
  {
    species: 'Mega Scizor',
    rank: 'Mega',
    sourceName: 'Scizor',
    note: '热门扩展（Mega 体系）：Mega Scizor 凭借 Technician 加成和优先级压制，是高频后排收割位。',
    archetypes: extractMovesetLabels('Scizor'),
    sets: [
      { name: 'Bulky Offense Mega Scizor', item: 'Scizorite', ability: 'Technician', nature: 'Adamant', statPoints: { hp: 20, atk: 32, def: 12, spa: 0, spd: 8, spe: 0 }, moves: ['Bullet Punch', 'Knock Off', 'Close Combat', 'Protect'] }
    ]
  },
  {
    species: 'Mega Gardevoir',
    rank: 'Mega',
    sourceName: 'Gardevoir',
    note: '热门扩展（Mega 体系）：Mega Gardevoir 以 Pixilate 高强度语音输出和控场能力见长。',
    archetypes: extractMovesetLabels('Gardevoir'),
    sets: [
      { name: 'Pixilate Mega Gardevoir', item: 'Gardevoirite', ability: 'Pixilate', nature: 'Timid', statPoints: { hp: 8, atk: 0, def: 4, spa: 32, spd: 0, spe: 24 }, moves: ['Hyper Voice', 'Moonblast', 'Calm Mind', 'Protect'] }
    ]
  },
  {
    species: 'Mega Gyarados',
    rank: 'Mega',
    sourceName: 'Gyarados',
    note: '热门扩展（Mega 体系）：Mega Gyarados 兼具 Dragon Dance 破局能力与优良耐性，是常见的进攻终结点。',
    archetypes: extractMovesetLabels('Gyarados'),
    sets: [
      { name: 'Dragon Dance Mega Gyarados', item: 'Gyaradosite', ability: 'Mold Breaker', nature: 'Jolly', statPoints: { hp: 12, atk: 32, def: 4, spa: 0, spd: 0, spe: 20 }, moves: ['Aqua Tail', 'Crunch', 'Dragon Dance', 'Protect'] }
    ]
  },
  {
    species: 'Mega Venusaur',
    rank: 'Mega',
    sourceName: 'Venusaur',
    note: '热门扩展（Mega 体系）：Mega Venusaur 是高耐久草毒核心，常用于对抗水地与持续消耗局。',
    archetypes: extractMovesetLabels('Venusaur'),
    sets: [
      { name: 'Bulky Mega Venusaur', item: 'Venusaurite', ability: 'Thick Fat', nature: 'Calm', statPoints: { hp: 32, atk: 0, def: 12, spa: 16, spd: 20, spe: 0 }, moves: ['Giga Drain', 'Earth Power', 'Leech Seed', 'Protect'] }
    ]
  },
  {
    species: 'Mega Medicham',
    rank: 'Mega',
    sourceName: 'Medicham',
    note: '热门扩展（Mega 体系）：Mega Medicham 借助 Pure Power 的爆发打点，常用于快速撕开防线。',
    archetypes: extractMovesetLabels('Medicham'),
    sets: [
      { name: 'Fast Mega Medicham', item: 'Medichamite', ability: 'Pure Power', nature: 'Jolly', statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 }, moves: ['Fake Out', 'High Jump Kick', 'Ice Punch', 'Protect'] }
    ]
  },
  {
    species: 'Mega Pinsir',
    rank: 'Mega',
    sourceName: 'Pinsir',
    note: '热门扩展（Mega 体系）：Mega Pinsir 依靠 Aerilate 的先制压制和高物攻，常用于残局收割。',
    archetypes: extractMovesetLabels('Pinsir'),
    sets: [
      { name: 'Aerilate Mega Pinsir', item: 'Pinsirite', ability: 'Aerilate', nature: 'Jolly', statPoints: { hp: 8, atk: 32, def: 0, spa: 0, spd: 0, spe: 24 }, moves: ['Quick Attack', 'Close Combat', 'Bug Bite', 'Protect'] }
    ]
  },
  {
    species: 'Mega Meganium',
    rank: 'Mega',
    sourceName: 'Meganium',
    note: '热门扩展（Mega 体系）：Mega Meganium 在当前队伍样本中常作为草系范围压制与场地协同位。',
    archetypes: extractMovesetLabels('Meganium'),
    sets: [
      { name: 'Doubles Mega Meganium', item: 'Meganiumite', ability: 'Mega Sol', nature: 'Modest', statPoints: { hp: 28, atk: 0, def: 0, spa: 32, spd: 0, spe: 6 }, moves: ['Giga Drain', 'Dazzling Gleam', 'Weather Ball', 'Protect'] }
    ]
  }
];

const speciesByNameMap = new Map(species.map((s) => [s.name, s]));

for (const meta of metaSets) {
  if (meta.species.startsWith('Mega ')) continue;
  const pairs = megasForBase(meta.species);
  for (const { mega, stone } of pairs) {
    if (meta.sets.some((s) => s.item === stone)) continue;
    const tpl = meta.sets[0];
    const megaSp = speciesByNameMap.get(mega);
    meta.sets.push({
      name: `${tpl.name}（Mega石 · ${stone}）`,
      item: stone,
      ability: megaSp?.abilities?.[0] || tpl.ability,
      nature: tpl.nature,
      statPoints: { ...tpl.statPoints },
      moves: [...tpl.moves]
    });
  }
}

function statPointTotal(statPoints) {
  return STAT_KEYS.reduce((sum, key) => sum + (Number(statPoints?.[key]) || 0), 0);
}

function normalizeStatPointsToCap(raw) {
  const points = Object.fromEntries(STAT_KEYS.map((key) => [key, Math.max(0, Math.min(32, Number(raw?.[key]) || 0))]));
  let total = statPointTotal(points);
  if (total === TOTAL_STAT_POINT_CAP) return points;

  if (total > TOTAL_STAT_POINT_CAP) {
    let overflow = total - TOTAL_STAT_POINT_CAP;
    const reduceOrder = [...STAT_KEYS].sort((a, b) => points[b] - points[a]);
    for (const key of reduceOrder) {
      if (overflow <= 0) break;
      const cut = Math.min(points[key], overflow);
      points[key] -= cut;
      overflow -= cut;
    }
    total = statPointTotal(points);
  }

  if (total < TOTAL_STAT_POINT_CAP) {
    let need = TOTAL_STAT_POINT_CAP - total;
    const addOrder = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    let cursor = 0;
    while (need > 0) {
      const key = addOrder[cursor % addOrder.length];
      if (points[key] < 32) {
        points[key] += 1;
        need -= 1;
      }
      cursor += 1;
      if (cursor > 5000) break;
    }
  }

  return points;
}

for (const meta of metaSets) {
  for (const set of meta.sets) {
    set.statPoints = normalizeStatPointsToCap(set.statPoints);
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  megaSpeciesToStone: MEGA_SPECIES_TO_STONE,
  source: {
    teamBuilderMapping: 727,
    rosterArticle: 501889,
    doublesTierArticle: 593883,
    movesetsIndexArticle: 592129,
    launchRoster: launchCounts
      ? { regular: Number(launchCounts[1]), mega: Number(launchCounts[2]), total: Number(launchCounts[3]) }
      : null,
    inferredNote: 'Game8 roster article lists 269 launch-available Pokemon; the builder schema exposes 276 selectable entries including alternate forms and Mega entries used by the team builder.'
  },
  statPointCap: 32,
  statPointTotalCap: TOTAL_STAT_POINT_CAP,
  topMeta,
  species,
  moves: legalMoves,
  items,
  natures,
  metaSets
};

const speciesNames = new Set(species.map((entry) => entry.name));
const itemNames = new Set(items.map((entry) => entry.name));
const moveNames = new Set(legalMoves.map((entry) => entry.name));
const natureNames = new Set(natures.map((entry) => entry.name));

for (const meta of metaSets) {
  if (!speciesNames.has(meta.species)) throw new Error(`Unknown species: ${meta.species}`);
  for (const set of meta.sets) {
    if (!itemNames.has(set.item)) throw new Error(`Unknown item: ${meta.species} -> ${set.item}`);
    if (!natureNames.has(set.nature)) throw new Error(`Unknown nature: ${meta.species} -> ${set.nature}`);
    for (const move of set.moves) {
      if (!moveNames.has(move)) throw new Error(`Unknown move: ${meta.species} -> ${move}`);
    }
    if (statPointTotal(set.statPoints) !== TOTAL_STAT_POINT_CAP) {
      throw new Error(`Invalid stat total: ${meta.species} -> ${set.name} (${statPointTotal(set.statPoints)})`);
    }
  }
}

fs.writeFileSync(path.join(dataDir, 'app-data.js'), `window.APP_DATA = ${JSON.stringify(payload, null, 2)};\n`);
console.log(`species=${species.length} moves=${legalMoves.length} items=${items.length} meta=${metaSets.length}`);
