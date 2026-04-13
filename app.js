(function () {
  const data = window.APP_DATA;
  const engine = window.ChampionsDamageEngine;

  const speciesByName = new Map(data.species.map((entry) => [entry.name, entry]));
  const movesById = new Map(data.moves.map((entry) => [entry.id, entry]));
  const movesByName = new Map(data.moves.map((entry) => [entry.name, entry]));

  /** 非「变化/功能」分类但有双打控场价值的招式（如击掌） */
  const DOUBLES_UTILITY_MOVE_NAMES = new Set([
    'Fake Out',
    'Follow Me',
    'Rage Powder',
    'Helping Hand',
    'Tailwind',
    'Trick Room',
    'Wide Guard',
    'Quick Guard',
    'Ally Switch',
    'Coaching',
    'Life Dew',
    'Decorate'
  ]);

  function isUtilityOrStatusMove(move) {
    if (!move) return false;
    if (move.category === 'Status' || move.power <= 0) return true;
    return DOUBLES_UTILITY_MOVE_NAMES.has(move.name);
  }
  const naturesByName = new Map(data.natures.map((entry) => [entry.name, entry]));
  const items = data.items;
  const maxStatPoints = data.statPointCap;

  const megaStoneItemNames = new Set(
    items.filter((item) => /ite(\s[XY])?$/.test(item.name)).map((item) => item.name)
  );

  const MEGA_SPECIES_TO_STONE = {
    'Mega Abomasnow': 'Abomasite',
    'Mega Absol': 'Absolite',
    'Mega Aerodactyl': 'Aerodactylite',
    'Mega Aggron': 'Aggronite',
    'Mega Alakazam': 'Alakazite',
    'Mega Altaria': 'Altarianite',
    'Mega Ampharos': 'Ampharosite',
    'Mega Audino': 'Audinite',
    'Mega Banette': 'Banettite',
    'Mega Beedrill': 'Beedrillite',
    'Mega Blastoise': 'Blastoisinite',
    'Mega Camerupt': 'Cameruptite',
    'Mega Chandelure': 'Chandelurite',
    'Mega Charizard X': 'Charizardite X',
    'Mega Charizard Y': 'Charizardite Y',
    'Mega Chesnaught': 'Chesnaughtite',
    'Mega Chimecho': 'Chimechite',
    'Mega Clefable': 'Clefablite',
    'Mega Crabominable': 'Crabominite',
    'Mega Delphox': 'Delphoxite',
    'Mega Dragonite': 'Dragoninite',
    'Mega Drampa': 'Drampanite',
    'Mega Emboar': 'Emboarite',
    'Mega Excadrill': 'Excadrite',
    'Mega Feraligatr': 'Feraligite',
    'Mega Floette': 'Floettite',
    'Mega Froslass': 'Froslassite',
    'Mega Gallade': 'Galladite',
    'Mega Garchomp': 'Garchompite',
    'Mega Gardevoir': 'Gardevoirite',
    'Mega Gengar': 'Gengarite',
    'Mega Glalie': 'Glalitite',
    'Mega Glimmora': 'Glimmoranite',
    'Mega Golurk': 'Golurkite',
    'Mega Greninja': 'Greninjite',
    'Mega Gyarados': 'Gyaradosite',
    'Mega Hawlucha': 'Hawluchanite',
    'Mega Heracross': 'Heracronite',
    'Mega Houndoom': 'Houndoominite',
    'Mega Kangaskhan': 'Kangaskhanite',
    'Mega Lopunny': 'Lopunnite',
    'Mega Lucario': 'Lucarionite',
    'Mega Manectric': 'Manectite',
    'Mega Medicham': 'Medichamite',
    'Mega Meganium': 'Meganiumite',
    'Mega Meowstic (Female)': 'Meowsticite',
    'Mega Meowstic (Male)': 'Meowsticite',
    'Mega Pidgeot': 'Pidgeotite',
    'Mega Pinsir': 'Pinsirite',
    'Mega Sableye': 'Sablenite',
    'Mega Scizor': 'Scizorite',
    'Mega Scovillain': 'Scovillainite',
    'Mega Sharpedo': 'Sharpedonite',
    'Mega Skarmory': 'Skarmorite',
    'Mega Slowbro': 'Slowbronite',
    'Mega Starmie': 'Starminite',
    'Mega Steelix': 'Steelixite',
    'Mega Tyranitar': 'Tyranitarite',
    'Mega Venusaur': 'Venusaurite',
    'Mega Victreebel': 'Victreebelite'
  };

  function firstNonMegaItemName() {
    return items.find((item) => !megaStoneItemNames.has(item.name))?.name || items[0]?.name || '';
  }

  function itemsForSpeciesDropdown(speciesName, currentItem) {
    const stoneName = MEGA_SPECIES_TO_STONE[speciesName];
    const nonMega = items.filter((item) => !megaStoneItemNames.has(item.name));
    let list = nonMega;
    if (stoneName) {
      const stone = items.find((item) => item.name === stoneName);
      if (stone) list = [stone, ...nonMega];
    }
    if (currentItem && !list.some((item) => item.name === currentItem)) {
      const extra = items.find((item) => item.name === currentItem);
      if (extra) list = [extra, ...list];
    }
    return list;
  }

  const typeColors = {
    Normal: '#d5d8e4', Fire: '#ff9b68', Water: '#71b7ff', Electric: '#ffd166', Grass: '#80d18a', Ice: '#93e4ef',
    Fighting: '#f37b67', Poison: '#bf8bf4', Ground: '#d7b478', Flying: '#9cc8ff', Psychic: '#ff81af', Bug: '#9dce5d',
    Rock: '#d7bf72', Ghost: '#9a8ff5', Dragon: '#7f98ff', Dark: '#9b8a7e', Steel: '#9db7c7', Fairy: '#ffb4e0'
  };

  const zhMaps = window.ZH_MAPS || {};
  const speciesZh = zhMaps.speciesZh || {};
  const itemZh = zhMaps.itemZh || {};
  const abilityZh = zhMaps.abilityZh || {};

  const natureZh = {
    Hardy: '勤奋',
    Lonely: '怕寂寞',
    Brave: '勇敢',
    Adamant: '固执',
    Naughty: '顽皮',
    Bold: '大胆',
    Docile: '坦率',
    Relaxed: '悠闲',
    Impish: '淘气',
    Lax: '乐天',
    Timid: '胆小',
    Hasty: '急躁',
    Serious: '认真',
    Jolly: '爽朗',
    Naive: '天真',
    Modest: '内敛',
    Mild: '慢吞吞',
    Quiet: '冷静',
    Bashful: '害羞',
    Rash: '马虎',
    Calm: '沉着',
    Gentle: '温顺',
    Sassy: '自大',
    Careful: '慎重',
    Quirky: '浮躁'
  };

  const moveZh = zhMaps.moveZh || {};

  const state = {
    selectedSlot: 0,
    selectedMeta: 0,
    selectedSet: 0,
    metaFilter: '',
    metaExpanded: false,
    field: {
      weather: 'none',
      terrain: 'none',
      attackerBoost: 0,
      defenderBoost: 0,
      attackerTailwind: false,
      defenderTailwind: false,
      trickRoom: false,
      intimidated: false,
      spreadDamage: true,
      defenderScreen: false
    },
    /** null = 对手性格沿用右侧模板；否则为手动选择的性格 */
    defenderSpeedNatureOverride: null,
    /** null = 对手 Spe 点数沿用右侧模板；否则为速度区滑条值 */
    defenderSpeOverride: null,
    team: []
  };

  const sampleMetaNames = ['Garchomp', 'Whimsicott', 'Mega Charizard Y', 'Incineroar', 'Sinistcha', 'Kingambit'];

  function getSpecies(name) {
    return speciesByName.get(name) || data.species[0];
  }

  function getNature(name) {
    return naturesByName.get(name) || data.natures[0];
  }

  function getSpeciesMoves(speciesName) {
    const species = getSpecies(speciesName);
    return species.moveIds.map((id) => movesById.get(id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  }

  function getDefaultMoves(speciesName) {
    return getSpeciesMoves(speciesName).slice(0, 4).map((move) => move.name);
  }

  function createBuild(speciesName) {
    const species = getSpecies(speciesName);
    const nature = getNature('Timid');
    const stone = MEGA_SPECIES_TO_STONE[species.name];
    return {
      species: species.name,
      item: stone || firstNonMegaItemName(),
      ability: species.abilities[0] || '',
      nature: nature.name,
      statPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      moves: getDefaultMoves(species.name)
    };
  }

  function buildFromMeta(metaIndex, setIndex) {
    const meta = data.metaSets[metaIndex];
    const set = meta.sets[setIndex];
    return {
      species: meta.species,
      item: set.item,
      ability: set.ability,
      nature: set.nature,
      statPoints: { ...set.statPoints },
      moves: [...set.moves]
    };
  }

  function hydrateBuild(build) {
    return {
      ...build,
      speciesData: getSpecies(build.species),
      natureData: getNature(build.nature),
      field: state.field
    };
  }

  function ensureValidBuild(build) {
    const species = getSpecies(build.species);
    if (!species.abilities.includes(build.ability)) build.ability = species.abilities[0] || '';
    if (!naturesByName.has(build.nature)) build.nature = 'Timid';
    const allowedItems = new Set(itemsForSpeciesDropdown(build.species, build.item).map((item) => item.name));
    if (!allowedItems.has(build.item)) {
      build.item = MEGA_SPECIES_TO_STONE[species.name] || firstNonMegaItemName();
    }
    const moveNames = new Set(getSpeciesMoves(build.species).map((move) => move.name));
    build.moves = build.moves.map((name, index) => {
      if (moveNames.has(name)) return name;
      return getSpeciesMoves(build.species)[index]?.name || getSpeciesMoves(build.species)[0]?.name || '';
    });
  }

  function loadSampleTeam() {
    state.team = sampleMetaNames.map((name) => {
      const metaIndex = data.metaSets.findIndex((entry) => entry.species === name);
      return metaIndex >= 0 ? buildFromMeta(metaIndex, 0) : createBuild(name);
    });
    while (state.team.length < 6) state.team.push(createBuild(data.species[state.team.length].name));
  }

  function resetTeam() {
    state.team = Array.from({ length: 6 }, (_, index) => createBuild(data.species[index].name));
  }

  function renderTypeChips(types) {
    return types.map((type) => `<span class="type-chip" style="background:${(typeColors[type] || '#fff')}22; color:${typeColors[type] || '#fff'};">${type}</span>`).join('');
  }

  function renderSpeciesOptions(current) {
    return data.species.map((species) => `<option value="${species.name}" ${species.name === current ? 'selected' : ''}>${localLabel(species.name, speciesZh)}</option>`).join('');
  }

  function renderNatureOptions(current) {
    return data.natures.map((nature) => `<option value="${nature.name}" ${nature.name === current ? 'selected' : ''}>${localLabel(nature.name, natureZh)}</option>`).join('');
  }

  function renderAbilityOptions(speciesName, current) {
    return getSpecies(speciesName).abilities.map((ability) => `<option value="${ability}" ${ability === current ? 'selected' : ''}>${localLabel(ability, abilityZh)}</option>`).join('');
  }

  function renderItemOptions(speciesName, current) {
    return itemsForSpeciesDropdown(speciesName, current)
      .map((item) => `<option value="${item.name}" ${item.name === current ? 'selected' : ''}>${localLabel(item.name, itemZh)}</option>`)
      .join('');
  }

  function renderMoveOptions(speciesName, current) {
    return getSpeciesMoves(speciesName).map((move) => `<option value="${move.name}" ${move.name === current ? 'selected' : ''}>${localLabel(move.name, moveZh)}</option>`).join('');
  }

  function getUsageLabel(metaIndex) {
    const meta = data.metaSets[metaIndex];
    return `${meta.rank} Tier · Meta #${metaIndex + 1}`;
  }

  function localLabel(name, map) {
    return map[name] || name;
  }

  function translateSetName(name) {
    return name
      .replace('Bulky Support', '耐久辅助')
      .replace('Bulky Special Attacker', '耐久特攻')
      .replace('Bulky Utility', '耐久工具位')
      .replace('Bulky Offense', '耐久进攻')
      .replace('Special Attacker', '特攻')
      .replace('Support', '辅助')
      .replace('Offensive', '进攻')
      .replace('Standard', '标准')
      .replace('Focus Sash', '气腰')
      .replace('Dragon Dance', '龙舞')
      .replace('Trick Room Lead', '空间首发')
      .replace('Rain Setter', '开雨位')
      .replace('Rain Special Attacker', '雨天特攻')
      .replace('Sun Team', '晴天队')
      .replace('Perish Trap', '灭歌踩影')
      .replace('Control', '控场')
      .replace('Utility', '工具位')
      .replace('Prankster', '恶作剧之心')
      .replace('Doubles ', '双打')
      .replace('Mega ', 'Mega ')
      .trim();
  }

  function translateMoves(names) {
    return names.map((name) => localLabel(name, moveZh)).join(' / ');
  }

  function getFilteredMetaIndexes() {
    const keyword = state.metaFilter.trim().toLowerCase();
    return data.metaSets
      .map((meta, index) => ({ meta, index }))
      .filter(({ meta }) => {
        if (!keyword) return true;
        return [meta.species, speciesZh[meta.species], meta.rank, meta.sourceName, ...(meta.archetypes || []).map((name) => translateSetName(name)), ...(meta.archetypes || [])]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword));
      })
      .map(({ index }) => index);
  }

  function renderTeam() {
    const slotPicker = document.getElementById('slotPicker');
    const teamEditor = document.getElementById('teamEditor');
    const teamList = document.getElementById('teamList');
    slotPicker.innerHTML = state.team.map((build, index) => `
      <button type="button" class="slot-pill ${index === state.selectedSlot ? 'active' : ''}" data-slot-head="${index}">
        槽位 ${index + 1}
      </button>
    `).join('');

    const activeBuild = state.team[state.selectedSlot];
    ensureValidBuild(activeBuild);
    const activeSpecies = getSpecies(activeBuild.species);
    const activeStats = engine.calcStats(hydrateBuild(activeBuild), { level: 50 });

    teamEditor.innerHTML = `
      <div class="slot-head" style="cursor:default;">
        <div class="avatar"><img src="${activeSpecies.imageUrl}" alt="${activeSpecies.name}" loading="lazy" /></div>
        <div>
          <p class="slot-title">当前编辑：${state.selectedSlot + 1}. ${localLabel(activeSpecies.name, speciesZh)}</p>
          <p class="slot-subtitle">这里就是我方宝可梦的选择区，先选物种，再改点数和招式。</p>
          <div class="chip-row">${renderTypeChips(activeSpecies.types)}</div>
        </div>
      </div>
      <div class="field-grid">
        <label>宝可梦
          <select data-slot="${state.selectedSlot}" data-field="species">${renderSpeciesOptions(activeBuild.species)}</select>
        </label>
        <label>性格
          <select data-slot="${state.selectedSlot}" data-field="nature">${renderNatureOptions(activeBuild.nature)}</select>
        </label>
        <label>特性
          <select data-slot="${state.selectedSlot}" data-field="ability">${renderAbilityOptions(activeBuild.species, activeBuild.ability)}</select>
        </label>
        <label>道具
          <select data-slot="${state.selectedSlot}" data-field="item">${renderItemOptions(activeBuild.species, activeBuild.item)}</select>
        </label>
      </div>
      <div class="field-grid six">
        ${['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map((stat) => `
          <label>${stat.toUpperCase()} 点数
            <input type="number" min="0" max="${maxStatPoints}" step="1" value="${activeBuild.statPoints[stat]}" data-slot="${state.selectedSlot}" data-field="stat-${stat}" />
          </label>
        `).join('')}
      </div>
      <div class="field-grid">
        ${[0, 1, 2, 3].map((moveIndex) => `
          <label>招式 ${moveIndex + 1}
            <select data-slot="${state.selectedSlot}" data-field="move-${moveIndex}">${renderMoveOptions(activeBuild.species, activeBuild.moves[moveIndex])}</select>
          </label>
        `).join('')}
      </div>
      <p class="small-text">Lv.50 实数：HP ${activeStats.hp} / Atk ${activeStats.atk} / Def ${activeStats.def} / SpA ${activeStats.spa} / SpD ${activeStats.spd} / Spe ${activeStats.spe}</p>
      <p class="small-text">当前配置：${localLabel(activeBuild.item, itemZh)} / ${localLabel(activeBuild.ability, abilityZh)} / ${localLabel(activeBuild.nature, natureZh)}</p>
    `;

    teamList.innerHTML = state.team.map((build, index) => {
      ensureValidBuild(build);
      const species = getSpecies(build.species);
      return `
        <article class="slot-card ${index === state.selectedSlot ? 'active' : ''}">
          <div class="slot-head" data-slot-head="${index}">
            <div class="avatar"><img src="${species.imageUrl}" alt="${species.name}" loading="lazy" /></div>
            <div>
              <p class="slot-title">${index + 1}. ${localLabel(species.name, speciesZh)}</p>
              <p class="slot-subtitle">${localLabel(build.item, itemZh)} / ${localLabel(build.ability, abilityZh)} / ${localLabel(build.nature, natureZh)}</p>
              <div class="chip-row">${renderTypeChips(species.types)}</div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    document.querySelectorAll('[data-slot-head]').forEach((node) => {
      node.addEventListener('click', () => {
        state.selectedSlot = Number(node.dataset.slotHead);
        renderAll();
      });
    });

    teamEditor.querySelectorAll('select, input').forEach((node) => {
      node.addEventListener('change', handleBuildChange);
    });
  }

  function handleBuildChange(event) {
    const slot = Number(event.target.dataset.slot);
    const field = event.target.dataset.field;
    const build = state.team[slot];
    if (field === 'species') {
      build.species = event.target.value;
      build.ability = getSpecies(build.species).abilities[0] || '';
      build.moves = getDefaultMoves(build.species);
      const stone = MEGA_SPECIES_TO_STONE[build.species];
      if (stone) build.item = stone;
      else if (megaStoneItemNames.has(build.item)) build.item = firstNonMegaItemName();
    } else if (field === 'nature' || field === 'ability' || field === 'item') {
      build[field] = event.target.value;
    } else if (field.startsWith('stat-')) {
      const stat = field.split('-')[1];
      build.statPoints[stat] = engine.clamp(Number(event.target.value) || 0, 0, maxStatPoints);
    } else if (field.startsWith('move-')) {
      build.moves[Number(field.split('-')[1])] = event.target.value;
    }
    ensureValidBuild(build);
    renderAll();
  }

  function renderMeta() {
    const metaList = document.getElementById('metaList');
    const metaMoreWrap = document.getElementById('metaMoreWrap');
    const filteredIndexes = getFilteredMetaIndexes();
    if (!filteredIndexes.includes(state.selectedMeta)) {
      state.selectedMeta = filteredIndexes[0] ?? 0;
      state.selectedSet = 0;
    }

    if (!filteredIndexes.length) {
      metaList.innerHTML = '<article class="meta-info-card"><p class="small-title">没有匹配结果</p><p class="small-text">换个宝可梦名字、Rank 或 archetype 关键词试试看。</p></article>';
      metaMoreWrap.innerHTML = '';
      return;
    }

    const visibleIndexes = state.metaExpanded ? filteredIndexes : filteredIndexes.slice(0, 5);
    metaList.innerHTML = visibleIndexes.map((index) => {
      const meta = data.metaSets[index];
      const species = getSpecies(meta.species);
      const isSelected = index === state.selectedMeta;
      return `
        <article class="meta-card ${isSelected ? 'active' : ''}" data-meta="${index}">
          <div class="meta-top">
            <div class="avatar small"><img src="${species.imageUrl}" alt="${species.name}" loading="lazy" /></div>
            <div>
              <strong>${localLabel(species.name, speciesZh)}</strong>
              <p class="small-text">${getUsageLabel(index)} · 常见 ${meta.sets.length} 套</p>
            </div>
          </div>
          <div class="chip-row">${renderTypeChips(species.types)}</div>
          ${isSelected ? `
            <div class="section" style="margin-top:12px;">
              <p class="small-title">常见配置</p>
              <p class="small-text">${meta.note}</p>
              <div class="set-list" style="margin-top:10px;">
                ${meta.sets.map((set, setIndex) => `
                  <article class="set-card ${setIndex === state.selectedSet ? 'active' : ''}" data-set="${setIndex}">
                    <strong>${translateSetName(set.name)}</strong>
                    <p class="small-text">${localLabel(set.item, itemZh)} / ${localLabel(set.ability, abilityZh)} / ${localLabel(set.nature, natureZh)}</p>
                    <p class="small-text">点数：${Object.entries(set.statPoints).filter(([, value]) => value > 0).map(([key, value]) => `${key.toUpperCase()} ${value}`).join(' / ') || '默认'}</p>
                    <p class="small-text">招式：${translateMoves(set.moves)}</p>
                  </article>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </article>
      `;
    }).join('');

    if (filteredIndexes.length > 5) {
      metaMoreWrap.innerHTML = `<button id="toggleMetaBtn" class="btn-secondary" type="button">${state.metaExpanded ? '收起其余热门宝可梦' : `展开其余 ${filteredIndexes.length - 5} 只热门宝可梦`}</button>`;
      document.getElementById('toggleMetaBtn').addEventListener('click', () => {
        state.metaExpanded = !state.metaExpanded;
        renderAll();
      });
    } else {
      metaMoreWrap.innerHTML = '';
    }

    metaList.querySelectorAll('[data-meta]').forEach((node) => {
      node.addEventListener('click', () => {
        state.selectedMeta = Number(node.dataset.meta);
        state.selectedSet = 0;
        state.defenderSpeedNatureOverride = null;
        state.defenderSpeOverride = null;
        renderAll();
      });
    });

    metaList.querySelectorAll('[data-set]').forEach((node) => {
      node.addEventListener('click', (event) => {
        event.stopPropagation();
        state.selectedSet = Number(node.dataset.set);
        state.defenderSpeedNatureOverride = null;
        state.defenderSpeOverride = null;
        renderAll();
      });
    });
  }

  function renderSummary() {
    const summary = document.getElementById('datasetSummary');
    const updated =
      data.generatedAt != null
        ? new Date(data.generatedAt).toLocaleString('zh-CN', { dateStyle: 'medium', timeStyle: 'short' })
        : '—';
    summary.innerHTML = `
      <span class="pill">赛制：Pokémon Champions 双打</span>
      <span class="pill">数据更新：${updated}</span>
    `;
  }

  function relationText(attackerSpeed, defenderSpeed) {
    if (state.field.trickRoom) {
      if (attackerSpeed < defenderSpeed) return '戏法空间下我方先动';
      if (attackerSpeed > defenderSpeed) return '戏法空间下对手先动';
      return '戏法空间下同速';
    }
    if (attackerSpeed > defenderSpeed) return '常规情况下我方先手';
    if (attackerSpeed < defenderSpeed) return '常规情况下对手先手';
    return '双方同速';
  }

  /** 从热门模板汇总「变化/功能」向招式，不做伤害计算 */
  function getOpponentUtilityHintLine(metaIndex) {
    const meta = data.metaSets[metaIndex];
    const moveCounter = new Map();
    let totalSets = 0;
    for (const set of meta.sets) {
      totalSets += 1;
      for (const moveName of set.moves || []) {
        moveCounter.set(moveName, (moveCounter.get(moveName) || 0) + 1);
      }
    }
    const rows = [];
    for (const [moveName, count] of moveCounter.entries()) {
      const m = movesByName.get(moveName);
      if (!m || !isUtilityOrStatusMove(m)) continue;
      const freq = totalSets > 0 ? count / totalSets : 0;
      rows.push({ moveName, freq });
    }
    rows.sort((a, b) => b.freq - a.freq || a.moveName.localeCompare(b.moveName));
    const top = rows.slice(0, 5);
    if (!top.length) return '';
    return top
      .map(({ moveName, freq }) => {
        const zh = localLabel(moveName, moveZh);
        const pct = Math.round(freq * 100);
        return pct >= 35 ? `${zh}（约${pct}%套）` : zh;
      })
      .join(' · ');
  }

  function mergeOppWorkbench(oppRaw) {
    const nature = state.defenderSpeedNatureOverride ?? oppRaw.nature;
    const spe =
      state.defenderSpeOverride != null
        ? engine.clamp(Number(state.defenderSpeOverride), 0, maxStatPoints)
        : oppRaw.statPoints.spe;
    return { ...oppRaw, nature, statPoints: { ...oppRaw.statPoints, spe } };
  }

  function getWorkbenchBuilds() {
    const myBuild = hydrateBuild(state.team[state.selectedSlot]);
    const oppRaw = buildFromMeta(state.selectedMeta, state.selectedSet);
    const oppBuild = hydrateBuild(mergeOppWorkbench(oppRaw));
    return { myBuild, oppBuild, oppRaw };
  }

  function paintDamagePanel(myBuild, oppBuild) {
    const myResults = myBuild.moves.map((name) => engine.calcMoveDamage(myBuild, oppBuild, movesByName.get(name), state.field));
    const oppResults = oppBuild.moves.map((name) => engine.calcMoveDamage(oppBuild, myBuild, movesByName.get(name), state.field));
    const bestMove = myResults.filter((row) => row.max > 0).sort((a, b) => b.percentMax - a.percentMax)[0];
    const dangerMove = oppResults.filter((row) => row.max > 0).sort((a, b) => b.percentMax - a.percentMax)[0];
    const utilityHint = getOpponentUtilityHintLine(state.selectedMeta);

    document.getElementById('damagePanel').innerHTML = `
      <section class="damage-section">
        <div class="section-kicker">我方打对手</div>
        <p class="small-text">${bestMove ? `最高压制：${localLabel(bestMove.moveName, moveZh)} · ${bestMove.ko}` : '当前 4 招都以功能为主。'}</p>
        ${myResults.map(renderDamageRow).join('')}
      </section>
      <section class="damage-section">
        <div class="section-kicker">对手打我方</div>
        <p class="small-text">${dangerMove ? `最危险：${localLabel(dangerMove.moveName, moveZh)} · ${dangerMove.ko}` : '当前对手主要为功能压制。'}</p>
        ${oppResults.map(renderDamageRow).join('')}
      </section>
      <section class="damage-section damage-hint-block">
        <div class="section-kicker">热门变化 / 功能招</div>
        <p class="key-setup-line">汇总右侧该精灵各常见模板中的变化类与击掌等控场招，仅供意识参考。</p>
        <p class="key-setup-line">${utilityHint || '当前模板以输出为主，无突出共识功能招。'}</p>
      </section>
    `;
  }

  function refreshWorkbenchCalcs() {
    if (!getFilteredMetaIndexes().length) return;
    const { myBuild, oppBuild } = getWorkbenchBuilds();
    const mySpeed = engine.calcSpeed(myBuild, state.field, 'attacker');
    const oppSpeed = engine.calcSpeed(oppBuild, state.field, 'defender');
    const relation = relationText(mySpeed, oppSpeed);
    const myEl = document.getElementById('wbMySpeed');
    if (!myEl) return;
    myEl.textContent = String(mySpeed);
    document.getElementById('wbOppSpeed').textContent = String(oppSpeed);
    document.getElementById('wbRelation').textContent = relation;
    const tpl = buildFromMeta(state.selectedMeta, state.selectedSet);
    const effSpe = state.defenderSpeOverride != null ? state.defenderSpeOverride : tpl.statPoints.spe;
    const ra = document.getElementById('wbAttackerSpeReadout');
    const rd = document.getElementById('wbDefenderSpeReadout');
    if (ra) ra.textContent = String(state.team[state.selectedSlot].statPoints.spe);
    if (rd) rd.textContent = String(effSpe);
    paintDamagePanel(myBuild, oppBuild);
    const speInput = document.querySelector(`input[data-slot="${state.selectedSlot}"][data-field="stat-spe"]`);
    if (speInput) speInput.value = String(state.team[state.selectedSlot].statPoints.spe);
  }

  function renderWorkbench() {
    if (!getFilteredMetaIndexes().length) {
      document.getElementById('matchupTitle').textContent = '等待选择热门对手';
      document.getElementById('matchupSubtitle').textContent = '当前筛选没有匹配结果。';
      document.getElementById('speedWorkbench').innerHTML = '<div class="info-row"><strong>提示</strong><span>清空右侧筛选后继续查看速度线。</span></div>';
      document.getElementById('damagePanel').innerHTML = '<p class="small-text">清空右侧筛选后继续查看伤害计算。</p>';
      return;
    }

    const { myBuild, oppBuild, oppRaw } = getWorkbenchBuilds();
    const mySpeed = engine.calcSpeed(myBuild, state.field, 'attacker');
    const oppSpeed = engine.calcSpeed(oppBuild, state.field, 'defender');
    const relation = relationText(mySpeed, oppSpeed);

    document.getElementById('matchupTitle').textContent = `${localLabel(myBuild.speciesData.name, speciesZh)} vs ${localLabel(oppBuild.speciesData.name, speciesZh)}`;
    const setName = translateSetName(data.metaSets[state.selectedMeta].sets[state.selectedSet].name);
    const oppTouched = state.defenderSpeedNatureOverride != null || state.defenderSpeOverride != null;
    document.getElementById('matchupSubtitle').textContent = `当前对手模板：${setName}${oppTouched ? ' · 对手在速度区已微调' : ''}`;

    const mySpe = state.team[state.selectedSlot].statPoints.spe;
    const effSpe = state.defenderSpeOverride != null ? state.defenderSpeOverride : oppRaw.statPoints.spe;
    const effNature = state.defenderSpeedNatureOverride ?? oppRaw.nature;
    const natureOpts = data.natures
      .map((n) => `<option value="${n.name}" ${n.name === effNature ? 'selected' : ''}>${localLabel(n.name, natureZh)}</option>`)
      .join('');

    document.getElementById('speedWorkbench').innerHTML = `
      <div class="wb-priority-bar"><strong>先手</strong>：<span id="wbRelation">${relation}</span></div>
      <div class="speed-workbench-grid">
        <div class="speed-workbench-card">
          <span class="small-text">我方有效速度</span>
          <p class="wb-speed-num" id="wbMySpeed">${mySpeed}</p>
          <div class="wb-chip-slot chip-row">
            ${state.field.attackerTailwind ? '<span class="tag-chip good">顺风</span>' : ''}
          </div>
          <div class="wb-nature-block">
            <span class="wb-field-label">性格</span>
            <div class="wb-nature-static" title="在左侧「我的队伍」中修改">${localLabel(myBuild.nature, natureZh)}（队伍编辑）</div>
          </div>
          <div class="speed-slider-row">
            <label>Spe 0–${maxStatPoints}</label>
            <input type="range" class="wb-spe-range" id="wbAttackerSpe" min="0" max="${maxStatPoints}" step="1" value="${mySpe}" />
            <span class="wb-spe-readout" id="wbAttackerSpeReadout">${mySpe}</span>
          </div>
        </div>
        <div class="speed-workbench-card">
          <span class="small-text">对手有效速度</span>
          <p class="wb-speed-num" id="wbOppSpeed">${oppSpeed}</p>
          <div class="wb-chip-slot chip-row">
            ${state.field.defenderTailwind ? '<span class="tag-chip warn">顺风</span>' : ''}
          </div>
          <div class="wb-nature-block">
            <span class="wb-field-label">性格（默认右侧模板）</span>
            <select id="wbDefenderNature" class="wb-nature-select">${natureOpts}</select>
          </div>
          <div class="speed-slider-row">
            <label>Spe 0–${maxStatPoints}</label>
            <input type="range" class="wb-spe-range" id="wbDefenderSpe" min="0" max="${maxStatPoints}" step="1" value="${effSpe}" />
            <span class="wb-spe-readout" id="wbDefenderSpeReadout">${effSpe}</span>
          </div>
        </div>
      </div>
    `;

    const sw = document.getElementById('speedWorkbench');
    sw.oninput = (e) => {
      if (e.target.id === 'wbAttackerSpe') {
        const v = engine.clamp(Number(e.target.value), 0, maxStatPoints);
        state.team[state.selectedSlot].statPoints.spe = v;
        ensureValidBuild(state.team[state.selectedSlot]);
        refreshWorkbenchCalcs();
      } else if (e.target.id === 'wbDefenderSpe') {
        const tpl = buildFromMeta(state.selectedMeta, state.selectedSet);
        const v = engine.clamp(Number(e.target.value), 0, maxStatPoints);
        state.defenderSpeOverride = v === tpl.statPoints.spe ? null : v;
        refreshWorkbenchCalcs();
      }
    };
    sw.onchange = (e) => {
      if (e.target.id === 'wbDefenderNature') {
        const tpl = buildFromMeta(state.selectedMeta, state.selectedSet);
        state.defenderSpeedNatureOverride = e.target.value === tpl.nature ? null : e.target.value;
        renderAll();
      }
    };

    paintDamagePanel(myBuild, oppBuild);
  }

  function renderDamageRow(result) {
    const effectText = result.typeEffectiveness === 0 ? '无效' : result.typeEffectiveness > 1 ? `${result.typeEffectiveness}x 克制` : result.typeEffectiveness < 1 ? `${result.typeEffectiveness}x 抵抗` : '等倍';
    const barWidth = Math.min(100, result.percentMax || 0);
    return `
      <article class="damage-row">
        <div class="damage-head">
          <strong>${localLabel(result.moveName, moveZh)}</strong>
          <span>${result.ko}</span>
        </div>
        <p class="small-text">${result.min}-${result.max} (${result.percentMin.toFixed(1)}% - ${result.percentMax.toFixed(1)}%) · ${effectText}</p>
        <div class="bar"><span style="width:${barWidth}%"></span></div>
      </article>
    `;
  }

  function bindFieldControls() {
    document.querySelectorAll('[data-field-control]').forEach((node) => {
      node.addEventListener('change', () => {
        const key = node.dataset.fieldControl;
        state.field[key] = node.type === 'checkbox' ? node.checked : (key.includes('Boost') ? Number(node.value) : node.value);
        renderAll();
      });
    });
  }

  function syncFieldControls() {
    document.querySelectorAll('[data-field-control]').forEach((node) => {
      const key = node.dataset.fieldControl;
      if (node.type === 'checkbox') node.checked = Boolean(state.field[key]);
      else node.value = String(state.field[key]);
    });
  }

  function renderAll() {
    renderSummary();
    renderTeam();
    renderMeta();
    syncFieldControls();
    renderWorkbench();
  }

  document.getElementById('loadSampleBtn').addEventListener('click', () => {
    loadSampleTeam();
    state.selectedSlot = 0;
    renderAll();
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    resetTeam();
    state.selectedSlot = 0;
    renderAll();
  });

  document.getElementById('metaFilterInput').addEventListener('input', (event) => {
    state.metaFilter = event.target.value;
    renderAll();
  });

  bindFieldControls();
  loadSampleTeam();
  renderAll();
})();
