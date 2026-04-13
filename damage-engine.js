(function () {
  const typeChart = {
    Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
    Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
    Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
    Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
    Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
    Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5, Ice: 0.5 },
    Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
    Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
    Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
    Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
    Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
    Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
    Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
    Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
    Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
    Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
    Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
    Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 }
  };

  const statMap = {
    HP: 'hp',
    Attack: 'atk',
    Defense: 'def',
    SpAtk: 'spa',
    SpDef: 'spd',
    Speed: 'spe'
  };

  function statPointToEv(points) {
    return Math.min(252, (Number(points) || 0) * 8);
  }

  function natureMultiplier(nature, stat) {
    if (!nature) return 1;
    if (statMap[nature.increasedStat] === stat) return 1.1;
    if (statMap[nature.decreasedStat] === stat) return 0.9;
    return 1;
  }

  function calcHP(base, statPoints, level) {
    const ev = statPointToEv(statPoints);
    return Math.floor(((2 * base + 31 + Math.floor(ev / 4)) * level) / 100) + level + 10;
  }

  function calcOther(base, statPoints, level, nature, stat) {
    const ev = statPointToEv(statPoints);
    const raw = Math.floor(((2 * base + 31 + Math.floor(ev / 4)) * level) / 100) + 5;
    return Math.floor(raw * natureMultiplier(nature, stat));
  }

  function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
  }

  function stageMultiplier(stage) {
    return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
  }

  function getTypeEffectiveness(moveType, defenderTypes) {
    return defenderTypes.reduce((multiplier, type) => {
      const table = typeChart[moveType] || {};
      return multiplier * (table[type] == null ? 1 : table[type]);
    }, 1);
  }

  function isPhysical(move) {
    return move.category === 'Physical';
  }

  function isSpecial(move) {
    return move.category === 'Special';
  }

  function isSoundMove(move) {
    return ['Hyper Voice', 'Snarl', 'Perish Song'].includes(move.name);
  }

  function resolveMoveType(build, move) {
    const ability = build.ability || '';
    if (ability === 'Liquid Voice' && isSoundMove(move)) return 'Water';
    return move.type;
  }

  function getItemModifier(build, moveType, move) {
    const item = build.item || '';
    if (item === 'Life Orb' && move.power > 0) return 1.3;
    if (item === 'Choice Specs' && isSpecial(move)) return 1.5;
    if (item === 'Choice Band' && isPhysical(move)) return 1.5;
    if (item === 'Black Glasses' && moveType === 'Dark') return 1.2;
    if (item === 'Charcoal' && moveType === 'Fire') return 1.2;
    if (item === 'Mystic Water' && moveType === 'Water') return 1.2;
    if (item === 'Miracle Seed' && moveType === 'Grass') return 1.2;
    if (item === 'Magnet' && moveType === 'Electric') return 1.2;
    if (item === 'Soft Sand' && moveType === 'Ground') return 1.2;
    if (item === 'Fairy Feather' && moveType === 'Fairy') return 1.2;
    if (item === 'Sharp Beak' && moveType === 'Flying') return 1.2;
    if (item === 'Dragon Fang' && moveType === 'Dragon') return 1.2;
    if (item === 'Metal Coat' && moveType === 'Steel') return 1.2;
    if (item === 'Twisted Spoon' && moveType === 'Psychic') return 1.2;
    if (item === 'Black Belt' && moveType === 'Fighting') return 1.2;
    if (item === 'Poison Barb' && moveType === 'Poison') return 1.2;
    if (item === 'Spell Tag' && moveType === 'Ghost') return 1.2;
    if (item === 'Hard Stone' && moveType === 'Rock') return 1.2;
    if (item === 'Never-Melt Ice' && moveType === 'Ice') return 1.2;
    if (item === 'Silver Powder' && moveType === 'Bug') return 1.2;
    if (item === 'Silk Scarf' && moveType === 'Normal') return 1.2;
    return 1;
  }

  function weatherActive(field) {
    return field && field.weather && field.weather !== 'none';
  }

  function isSnowWeather(field) {
    return field && (field.weather === 'snow' || field.weather === 'hail');
  }

  /** 气象球：随当前天气改属性与威力 */
  function getEffectiveMoveTypeAndPower(move, field, attacker) {
    if (move.name === 'Weather Ball' && weatherActive(field)) {
      if (field.weather === 'sun') return { type: 'Fire', power: 100 };
      if (field.weather === 'rain') return { type: 'Water', power: 100 };
      if (field.weather === 'sand') return { type: 'Rock', power: 100 };
      if (isSnowWeather(field)) return { type: 'Ice', power: 100 };
    }
    return { type: resolveMoveType(attacker, move), power: move.power };
  }

  /** 显示用：考虑天气对个别招式命中率的影响（含变化类，供面板小字） */
  function getMoveAccuracyLabel(move, field) {
    if (!move) return '';
    const accRaw = move.accuracy;
    if (accRaw === 0 || accRaw === undefined || accRaw === null) return '必中';
    let acc = Number(accRaw);
    if (Number.isNaN(acc)) return '';
    const w = field && field.weather ? field.weather : 'none';
    let eff = acc;
    if (move.name === 'Blizzard' && isSnowWeather(field)) eff = 100;
    if (move.name === 'Thunder' && w === 'rain') eff = 100;
    if (move.name === 'Hurricane' && w === 'rain') eff = 100;
    if (move.name === 'Hurricane' && w === 'sun') eff = 50;
    if (eff >= 100) return eff !== acc ? `必中（${acc}%→天气）` : '必中';
    if (eff !== acc) return `${eff}%（原${acc}%，天气）`;
    return `${acc}%`;
  }

  function getWeatherModifier(field, moveType) {
    if (!field || !weatherActive(field)) return 1;
    if (field.weather === 'sun') {
      if (moveType === 'Fire') return 1.5;
      if (moveType === 'Water') return 0.5;
    }
    if (field.weather === 'rain') {
      if (moveType === 'Water') return 1.5;
      if (moveType === 'Fire') return 0.5;
    }
    return 1;
  }

  function getTerrainAttackModifier(field, moveType) {
    if (!field || !field.terrain || field.terrain === 'none') return 1;
    if (field.terrain === 'grassy' && moveType === 'Grass') return 1.3;
    if (field.terrain === 'electric' && moveType === 'Electric') return 1.3;
    if (field.terrain === 'psychic' && moveType === 'Psychic') return 1.3;
    if (field.terrain === 'misty' && moveType === 'Dragon') return 0.5;
    return 1;
  }

  function getAttackerAbilityDamageMod(attacker, moveType, move, field) {
    const ability = attacker.ability || '';
    const w = field && field.weather ? field.weather : 'none';
    if (ability === 'Solar Power' && isSpecial(move) && w === 'sun') return 1.5;
    if (ability === 'Tough Claws' && isPhysical(move) && move.isDirect) return 1.3;
    if (ability === 'Sand Force' && w === 'sand' && ['Rock', 'Ground', 'Steel'].includes(moveType)) return 1.3;
    if (ability === 'Fairy Aura' && moveType === 'Fairy') return 1.33;
    if (ability === 'Dark Aura' && moveType === 'Dark') return 1.33;
    return 1;
  }

  function getDefenderAbilityDamageMod(defender, moveType, move, typeEffectiveness) {
    const ability = defender.ability || '';
    if (ability === 'Thick Fat' && (moveType === 'Fire' || moveType === 'Ice')) return 0.5;
    if ((ability === 'Filter' || ability === 'Solid Rock') && typeEffectiveness > 1) return 0.75;
    if (ability === 'Heatproof' && moveType === 'Fire') return 0.5;
    if (ability === 'Dry Skin' && moveType === 'Fire') return 1.25;
    if (ability === 'Fluffy') {
      let m = 1;
      if (isPhysical(move) && move.isDirect) m *= 0.5;
      if (isPhysical(move) && moveType === 'Fire') m *= 2;
      return m;
    }
    return 1;
  }

  /** 沙暴下岩石/地面/钢 特防 ×1.5（仅对特殊伤害生效） */
  function applySandSpDefBoost(defenseStat, defender, field, move) {
    if (!field || field.weather !== 'sand' || isPhysical(move)) return defenseStat;
    const types = defender.speciesData.types || [];
    if (types.some((t) => ['Rock', 'Ground', 'Steel'].includes(t))) {
      return Math.floor(defenseStat * 1.5);
    }
    return defenseStat;
  }

  /** 第九世代起：雪天下冰系物防 ×1.5（仅物理伤害） */
  function applySnowIceDefBoost(defenseStat, defender, field, move) {
    if (!field || !isSnowWeather(field) || !isPhysical(move)) return defenseStat;
    const types = defender.speciesData.types || [];
    if (types.includes('Ice')) return Math.floor(defenseStat * 1.5);
    return defenseStat;
  }

  /** 双打中命中多个目标时单体伤害 ×0.75（与数据里 range 文案对齐） */
  function isSpreadHitInDoubles(move, field) {
    if (!field || !field.spreadDamage) return false;
    const r = move.range || '';
    return (
      r === 'All Opponents' ||
      r === 'Whole Field' ||
      r === 'All Adjacent Foes' ||
      r === 'All Adjacent' ||
      r === 'All Other Pokemon'
    );
  }

  function getSpreadModifier(move, field) {
    return isSpreadHitInDoubles(move, field) ? 0.75 : 1;
  }

  function calcStats(build, context) {
    const level = context.level || 50;
    const species = build.speciesData;
    const nature = build.natureData;
    return {
      hp: calcHP(species.base.hp, build.statPoints.hp, level),
      atk: calcOther(species.base.atk, build.statPoints.atk, level, nature, 'atk'),
      def: calcOther(species.base.def, build.statPoints.def, level, nature, 'def'),
      spa: calcOther(species.base.spa, build.statPoints.spa, level, nature, 'spa'),
      spd: calcOther(species.base.spd, build.statPoints.spd, level, nature, 'spd'),
      spe: calcOther(species.base.spe, build.statPoints.spe, level, nature, 'spe')
    };
  }

  function calcSpeed(build, field, side) {
    const stats = calcStats(build, { level: 50 });
    let speed = stats.spe;
    const ability = build.ability || '';
    const w = field && field.weather ? field.weather : 'none';
    const tr = field && field.terrain ? field.terrain : 'none';
    if (ability === 'Chlorophyll' && w === 'sun') speed *= 2;
    if (ability === 'Swift Swim' && w === 'rain') speed *= 2;
    if (ability === 'Sand Rush' && w === 'sand') speed *= 2;
    if (ability === 'Slush Rush' && isSnowWeather(field)) speed *= 2;
    if (ability === 'Surge Surfer' && tr === 'electric') speed *= 2;
    if (build.item === 'Choice Scarf') speed = Math.floor(speed * 1.5);
    if (field[side === 'attacker' ? 'attackerTailwind' : 'defenderTailwind']) speed *= 2;
    return Math.floor(speed);
  }

  function calcMoveDamage(attacker, defender, move, field) {
    if (!move || move.power <= 0 || (!isPhysical(move) && !isSpecial(move))) {
      return {
        moveName: move ? move.name : 'Unknown',
        min: 0,
        max: 0,
        percentMin: 0,
        percentMax: 0,
        ko: '状态招式',
        typeEffectiveness: 1,
        accuracyText: getMoveAccuracyLabel(move, field)
      };
    }

    const atkStats = calcStats(attacker, { level: 50 });
    const defStats = calcStats(defender, { level: 50 });
    const attackBase = isPhysical(move) ? atkStats.atk : atkStats.spa;
    let defenseBase = isPhysical(move) ? defStats.def : defStats.spd;

    let attackStage = 0;
    if (field.intimidated && isPhysical(move)) attackStage -= 1;
    const defenseStage = 0;

    let attackStat = Math.max(1, Math.floor(attackBase * stageMultiplier(attackStage)));
    let defenseStat = Math.max(1, Math.floor(defenseBase * stageMultiplier(defenseStage)));
    defenseStat = applySandSpDefBoost(defenseStat, defender, field, move);
    defenseStat = applySnowIceDefBoost(defenseStat, defender, field, move);

    if (field.defenderScreen) {
      defenseStat = Math.floor(defenseStat * (isSpreadHitInDoubles(move, field) ? 1.33 : 1.5));
    }

    const { type: moveType, power: effectivePower } = getEffectiveMoveTypeAndPower(move, field, attacker);
    const typeEffectiveness = getTypeEffectiveness(moveType, defender.speciesData.types);
    const stab = attacker.speciesData.types.includes(moveType) ? 1.5 : 1;
    const weather = getWeatherModifier(field, moveType);
    const terrainAtk = getTerrainAttackModifier(field, moveType);
    const item = getItemModifier(attacker, moveType, move);
    const atkAbility = getAttackerAbilityDamageMod(attacker, moveType, move, field);
    const spreadMod = getSpreadModifier(move, field);
    const defAbility = getDefenderAbilityDamageMod(defender, moveType, move, typeEffectiveness);
    const baseDamage = Math.floor(Math.floor(((22 * effectivePower * attackStat) / defenseStat) / 50) + 2);
    const modifier = stab * typeEffectiveness * weather * terrainAtk * item * atkAbility * spreadMod * defAbility;
    const min = typeEffectiveness === 0 ? 0 : Math.max(1, Math.floor(baseDamage * modifier * 0.85));
    const max = typeEffectiveness === 0 ? 0 : Math.max(1, Math.floor(baseDamage * modifier));
    const percentMin = defender.speciesData ? (min / defStats.hp) * 100 : 0;
    const percentMax = defender.speciesData ? (max / defStats.hp) * 100 : 0;

    let ko = '低于二确';
    if (typeEffectiveness === 0) ko = '对目标无效';
    else if (percentMin >= 100) ko = '稳定一确';
    else if (percentMax >= 100) ko = '有概率一确';
    else if (percentMin * 2 >= 100) ko = '稳定二确';
    else if (percentMax * 2 >= 100) ko = '高概率二确';

    const accuracyText = getMoveAccuracyLabel(move, field);

    return {
      moveName: move.name,
      min,
      max,
      percentMin,
      percentMax,
      ko,
      typeEffectiveness,
      category: move.category,
      type: moveType,
      accuracyText
    };
  }

  window.ChampionsDamageEngine = {
    clamp,
    calcStats,
    calcSpeed,
    calcMoveDamage,
    getTypeEffectiveness
  };
})();
