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

  /** 常见带追加效果、可被强行加成的招式（不完整但覆盖双打高频） */
  const SHEER_FORCE_MOVES = new Set([
    'Air Slash',
    'Ancient Power',
    'Astonish',
    'Bite',
    'Body Slam',
    'Bone Club',
    'Bone Rush',
    'Bounce',
    'Brave Bird',
    'Bubble Beam',
    'Bug Buzz',
    'Charge Beam',
    'Crunch',
    'Dragon Rush',
    'Earth Power',
    'Energy Ball',
    'Extrasensory',
    'Fake Out',
    'Fiery Dance',
    'Fire Fang',
    'Fire Punch',
    'Flame Charge',
    'Flamethrower',
    'Flash Cannon',
    'Focus Blast',
    'Force Palm',
    'Heat Wave',
    'Ice Fang',
    'Ice Punch',
    'Icicle Crash',
    'Icy Wind',
    'Iron Head',
    'Iron Tail',
    'Lunge',
    'Metal Claw',
    'Muddy Water',
    'Mud Shot',
    'Mud-Slap',
    'Power-Up Punch',
    'Rock Climb',
    'Rock Slide',
    'Rock Smash',
    'Rock Tomb',
    'Rolling Kick',
    'Scald',
    'Secret Power',
    'Shadow Ball',
    'Shadow Claw',
    'Silver Wind',
    'Sky Attack',
    'Sludge Bomb',
    'Sludge Wave',
    'Smog',
    'Snarl',
    'Steel Wing',
    'Stone Edge',
    'Thunder Fang',
    'Thunder Punch',
    'Thunderbolt',
    'Tri Attack',
    'Waterfall',
    'Zen Headbutt',
    'Snarl',
    'Electro Shot',
    'Psychic Fangs',
    'Liquidation',
    'Play Rough',
    'Poison Jab',
    'Cross Poison',
    'Poison Tail',
    'Steam Eruption',
    'Hurricane',
    'Blizzard',
    'Thunder',
    'Discharge',
    'Spark',
    'Electroweb',
    'Bulldoze',
    'High Horsepower',
    'Stomping Tantrum',
    'Earthquake',
    'Drill Run',
    'Dual Wingbeat',
    'Dual Chop'
  ]);

  const RECKLESS_MOVES = new Set([
    'Brave Bird',
    'Double-Edge',
    'Flare Blitz',
    'Head Charge',
    'Head Smash',
    'High Jump Kick',
    'Jump Kick',
    'Take Down',
    'Volt Tackle',
    'Wild Charge',
    'Wood Hammer',
    'Submission',
    'Struggle'
  ]);

  const BULLETPROOF_MOVES = new Set([
    'Aura Sphere',
    'Bullet Seed',
    'Egg Bomb',
    'Focus Blast',
    'Octazooka',
    'Rock Wrecker',
    'Shadow Ball',
    'Sludge Bomb',
    'Sludge Wave',
    'Flash Cannon',
    'Magnet Bomb',
    'Syrup Bomb',
    'Acid Spray',
    'Pyro Ball',
    'Weather Ball'
  ]);

  function isBulletLikeMove(name) {
    if (BULLETPROOF_MOVES.has(name)) return true;
    return /Ball$|Bomb$| Cannon|Cannon$|Bullet Seed|Aura Sphere|Focus Blast|Shadow Ball|Sludge Bomb|Flash Cannon|Magnet Bomb|Syrup Bomb|Rock Wrecker|Octazooka|Egg Bomb/i.test(
      name
    );
  }

  const SOUND_MOVE_NAMES = new Set([
    'Hyper Voice',
    'Snarl',
    'Perish Song',
    'Boomburst',
    'Bug Buzz',
    'Clanging Scales',
    'Clangorous Soul',
    'Echoed Voice',
    'Grass Whistle',
    'Growl',
    'Heal Bell',
    'Howl',
    'Metal Sound',
    'Noble Roar',
    'Overdrive',
    'Parting Shot',
    'Roar',
    'Round',
    'Screech',
    'Sing',
    'Snore',
    'Sparkling Aria',
    'Supersonic',
    'Uproar',
    'Torch Song',
    'Alluring Voice'
  ]);

  function isSoundMove(move) {
    if (!move) return false;
    if (SOUND_MOVE_NAMES.has(move.name)) return true;
    return /Voice$|Song$|^Sing$|^Snarl$|^Roar$|^Howl$|^Screech$|^Growl$/i.test(move.name);
  }

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

  function resolveMoveType(build, move) {
    const ability = build.ability || '';
    if (ability === 'Liquid Voice' && isSoundMove(move)) return 'Water';
    return move.type;
  }

  function weatherActive(field) {
    return field && field.weather && field.weather !== 'none';
  }

  function isSnowWeather(field) {
    return field && (field.weather === 'snow' || field.weather === 'hail');
  }

  /** 计算属性时考虑预报、拟态等与场地的关系 */
  function defenderTypesForBattle(defender, field) {
    const speciesName = defender.speciesData?.name || '';
    const ab = defender.ability || '';
    if (speciesName === 'Castform' && ab === 'Forecast') {
      const w = field && field.weather;
      if (w === 'sun') return ['Fire'];
      if (w === 'rain') return ['Water'];
      if (w === 'sand') return ['Rock'];
      if (isSnowWeather(field)) return ['Ice'];
      return ['Normal'];
    }
    if (ab === 'Mimicry' && field && field.terrain && field.terrain !== 'none') {
      const map = { grassy: 'Grass', electric: 'Electric', psychic: 'Psychic', misty: 'Fairy' };
      const t = map[field.terrain];
      if (t) return [t];
    }
    return defender.speciesData.types || [];
  }

  function moldBreakerLike(attackerAbility) {
    return ['Mold Breaker', 'Teravolt', 'Turboblaze'].includes(attackerAbility);
  }

  /** 含 Scrappy；破格系无视常见「免疫类」特性 */
  function getTypeEffectivenessWithAbilities(moveType, defenderTypes, attackerAbility, defenderAbility, move) {
    const scrappy = attackerAbility === 'Scrappy' && (moveType === 'Normal' || moveType === 'Fighting');
    const te = defenderTypes.reduce((mult, type) => {
      const table = typeChart[moveType] || {};
      let m = table[type] == null ? 1 : table[type];
      if (scrappy && type === 'Ghost' && m === 0) m = 1;
      return mult * m;
    }, 1);

    const mb = moldBreakerLike(attackerAbility);
    if (!mb && moveType === 'Ground' && defenderAbility === 'Levitate') return 0;
    if (!mb && moveType === 'Electric' && ['Volt Absorb', 'Lightning Rod', 'Motor Drive'].includes(defenderAbility)) return 0;
    if (!mb && moveType === 'Water' && ['Water Absorb', 'Storm Drain', 'Dry Skin'].includes(defenderAbility)) return 0;
    if (!mb && moveType === 'Grass' && defenderAbility === 'Sap Sipper') return 0;
    if (!mb && moveType === 'Ground' && defenderAbility === 'Earth Eater') return 0;
    if (!mb && isSoundMove(move) && defenderAbility === 'Soundproof') return 0;
    if (!mb && defenderAbility === 'Bulletproof' && isBulletLikeMove(move.name)) return 0;

    return te;
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

  /** 气象球 + 皮肤类 + 液态之声已在 resolve 前处理 */
  function getEffectiveMoveTypeAndPower(move, field, attacker) {
    if (move.name === 'Weather Ball' && weatherActive(field)) {
      if (field.weather === 'sun') return { type: 'Fire', power: 100 };
      if (field.weather === 'rain') return { type: 'Water', power: 100 };
      if (field.weather === 'sand') return { type: 'Rock', power: 100 };
      if (isSnowWeather(field)) return { type: 'Ice', power: 100 };
    }

    let type = resolveMoveType(attacker, move);
    let power = move.power;
    const ab = attacker.ability || '';
    if (move.type === 'Normal' && power > 0) {
      if (ab === 'Aerilate') return { type: 'Flying', power: Math.floor(power * 1.2) };
      if (ab === 'Pixilate') return { type: 'Fairy', power: Math.floor(power * 1.2) };
      if (ab === 'Refrigerate') return { type: 'Ice', power: Math.floor(power * 1.2) };
    }
    return { type, power };
  }

  function applyTechnicianPower(attacker, move, effectivePower) {
    if (attacker.ability === 'Technician' && effectivePower > 0 && effectivePower <= 60) {
      return Math.floor(effectivePower * 1.5);
    }
    return effectivePower;
  }

  function isIronFistMove(name) {
    if (name.endsWith(' Punch') || name === 'Ice Punch' || name === 'Thunder Punch' || name === 'Fire Punch' || name === 'Drain Punch')
      return true;
    return ['Ice Hammer', 'Hammer Arm', 'Meteor Assault', 'Sky Uppercut', 'Wakeup Slap', 'Focus Punch', 'Mach Punch', 'Bullet Punch', 'Power-Up Punch', 'Shadow Punch', 'Mega Punch', 'Dizzy Punch', 'Comet Punch'].includes(
      name
    );
  }

  function isStrongJawMove(name) {
    return /Fang$|^Crunch$|Psychic Fangs|Fishious Rend|Jaw Lock|Hyper Fang|Bite$|Fire Fang|Thunder Fang|Ice Fang|Poison Fang/i.test(
      name
    );
  }

  function isMegaLauncherMove(name) {
    return name.includes('Pulse') || name === 'Aura Sphere' || name === 'Heal Pulse';
  }

  function isSharpnessMove(name) {
    return /Slash|Blade|Cut|Cleave|Razor|Scissor|Scissors|Aerial Ace|Psycho Cut|X-Scissor|Leaf Blade|Sacred Sword|Stone Axe|Ceaseless Edge|Kowtow Cleave|Air Slash|Razor Shell|Psyblade|Bitter Blade|Ivy Cudgel/i.test(
      name
    );
  }

  function getStabMultiplier(attacker, moveType) {
    const types = attacker.speciesData.types || [];
    const ab = attacker.ability || '';
    if (types.includes(moveType)) {
      if (ab === 'Adaptability') return 2;
      return 1.5;
    }
    if (ab === 'Protean' || ab === 'Libero') return 1.5;
    return 1;
  }

  function getMoveAccuracyLabel(move, field, attacker, defender) {
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

    const atkAb = attacker?.ability || '';
    const defAb = defender?.ability || '';
    if (atkAb === 'Compound Eyes') eff = Math.floor(eff * 1.3);
    if (atkAb === 'Hustle' && move.power > 0) eff = Math.floor(eff * 0.8);
    if ((w === 'sand' && defAb === 'Sand Veil') || (isSnowWeather(field) && defAb === 'Snow Cloak')) {
      eff = Math.floor(eff * 0.8);
    }

    if (eff >= 100) return eff !== acc ? `必中（${acc}%→修正）` : '必中';
    if (eff !== acc) return `${eff}%（原${acc}%）`;
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

  function getAttackerAbilityDamageMod(attacker, moveType, move, field, typeEffectiveness) {
    const ability = attacker.ability || '';
    const w = field && field.weather ? field.weather : 'none';
    let mod = 1;

    if (ability === 'Solar Power' && isSpecial(move) && w === 'sun') mod *= 1.5;
    if (ability === 'Tough Claws' && isPhysical(move) && move.isDirect) mod *= 1.3;
    if (ability === 'Sand Force' && w === 'sand' && ['Rock', 'Ground', 'Steel'].includes(moveType)) mod *= 1.3;
    if (ability === 'Fairy Aura' && moveType === 'Fairy') mod *= 1.33;
    if (ability === 'Dark Aura' && moveType === 'Dark') mod *= 1.33;
    if (ability === 'Hustle' && isPhysical(move) && move.power > 0) mod *= 1.5;
    if (ability === 'Dry Skin' && moveType === 'Water') mod *= 1.25;
    if (ability === 'Water Bubble' && moveType === 'Water') mod *= 2;
    if (ability === 'Mega Sol' && moveType === 'Fire' && w === 'sun') mod *= 1.25;
    if (ability === 'Dragonize' && moveType === 'Dragon') mod *= 1.3;
    if (ability === 'Sheer Force' && SHEER_FORCE_MOVES.has(move.name)) mod *= 1.3;
    if (ability === 'Iron Fist' && isIronFistMove(move.name)) mod *= 1.2;
    if (ability === 'Strong Jaw' && isStrongJawMove(move.name)) mod *= 1.5;
    if (ability === 'Mega Launcher' && isMegaLauncherMove(move.name)) mod *= 1.5;
    if (ability === 'Sharpness' && isSharpnessMove(move.name)) mod *= 1.5;
    if (ability === 'Reckless' && RECKLESS_MOVES.has(move.name)) mod *= 1.2;

    const overlord = Number(field?.supremeOverlordFaints);
    if (ability === 'Supreme Overlord' && overlord > 0) {
      const stacks = clamp(overlord, 0, 5);
      mod *= 1 + 0.1 * stacks;
    }

    if (ability === 'Parental Bond' && move.power > 0) mod *= 1.25;

    return mod;
  }

  function getDefenderAbilityDamageMod(defender, moveType, move, typeEffectiveness) {
    const ability = defender.ability || '';
    let mod = 1;

    if (ability === 'Thick Fat' && (moveType === 'Fire' || moveType === 'Ice')) mod *= 0.5;
    if ((ability === 'Filter' || ability === 'Solid Rock' || ability === 'Prism Armor') && typeEffectiveness > 1) mod *= 0.75;
    if (ability === 'Heatproof' && moveType === 'Fire') mod *= 0.5;
    if (ability === 'Dry Skin' && moveType === 'Fire') mod *= 1.25;
    if (ability === 'Purifying Salt' && moveType === 'Ghost') mod *= 0.5;
    if (ability === 'Water Bubble' && moveType === 'Fire') mod *= 0.5;
    if (ability === 'Ice Scales' && isSpecial(move)) mod *= 0.5;
    if (
      (ability === 'Multiscale' || ability === 'Shadow Shield') &&
      typeEffectiveness > 0 &&
      field.assumeMultiscaleTargetsFullHp !== false
    ) {
      mod *= 0.5;
    }
    if (ability === 'Fluffy') {
      if (isPhysical(move) && move.isDirect) mod *= 0.5;
      if (isPhysical(move) && moveType === 'Fire') mod *= 2;
    }

    return mod;
  }

  function applySandSpDefBoost(defenseStat, defender, field, move) {
    if (!field || field.weather !== 'sand' || isPhysical(move)) return defenseStat;
    const types = defenderTypesForBattle(defender, field);
    if (types.some((t) => ['Rock', 'Ground', 'Steel'].includes(t))) {
      return Math.floor(defenseStat * 1.5);
    }
    return defenseStat;
  }

  function applySnowIceDefBoost(defenseStat, defender, field, move) {
    if (!field || !isSnowWeather(field) || !isPhysical(move)) return defenseStat;
    const types = defenderTypesForBattle(defender, field);
    if (types.includes('Ice')) return Math.floor(defenseStat * 1.5);
    return defenseStat;
  }

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

  /**
   * @param {string} offenseSide - 'mine' 我方出手打对手 / 'opp' 对手出手打我方（决定威吓、光墙对应哪一侧）
   */
  function calcMoveDamage(attacker, defender, move, field, offenseSide = 'mine') {
    if (!move || move.power <= 0 || (!isPhysical(move) && !isSpecial(move))) {
      return {
        moveName: move ? move.name : 'Unknown',
        min: 0,
        max: 0,
        percentMin: 0,
        percentMax: 0,
        ko: '状态招式',
        typeEffectiveness: 1,
        accuracyText: getMoveAccuracyLabel(move, field, attacker, defender)
      };
    }

    const atkStats = calcStats(attacker, { level: 50 });
    const defStats = calcStats(defender, { level: 50 });
    const attackBase = isPhysical(move) ? atkStats.atk : atkStats.spa;
    let defenseBase = isPhysical(move) ? defStats.def : defStats.spd;

    let attackStage = 0;
    if (isPhysical(move)) {
      if (offenseSide === 'mine' && field.intimidated) attackStage -= 1;
      if (offenseSide === 'opp' && field.opponentIntimidated) attackStage -= 1;
    }
    const defenseStage = 0;

    let attackStat = Math.max(1, Math.floor(attackBase * stageMultiplier(attackStage)));
    const atkAb = attacker.ability || '';
    if (isPhysical(move) && (atkAb === 'Huge Power' || atkAb === 'Pure Power')) {
      attackStat = Math.floor(attackStat * 2);
    }

    let defenseStat = Math.max(1, Math.floor(defenseBase * stageMultiplier(defenseStage)));
    const defAbForStat = defender.ability || '';
    if (defAbForStat === 'Fur Coat' && isPhysical(move)) {
      defenseStat = Math.floor(defenseStat * 2);
    }

    defenseStat = applySandSpDefBoost(defenseStat, defender, field, move);
    defenseStat = applySnowIceDefBoost(defenseStat, defender, field, move);

    const screenActive =
      (offenseSide === 'mine' && field.defenderScreen) || (offenseSide === 'opp' && field.attackerScreen);
    if (screenActive) {
      defenseStat = Math.floor(defenseStat * (isSpreadHitInDoubles(move, field) ? 1.33 : 1.5));
    }

    let { type: moveType, power: effectivePower } = getEffectiveMoveTypeAndPower(move, field, attacker);
    effectivePower = applyTechnicianPower(attacker, move, effectivePower);

    const defTypes = defenderTypesForBattle(defender, field);
    const typeEffectiveness = getTypeEffectivenessWithAbilities(
      moveType,
      defTypes,
      atkAb,
      defender.ability || '',
      move
    );

    const stab = getStabMultiplier(attacker, moveType);
    const weather = getWeatherModifier(field, moveType);
    const terrainAtk = getTerrainAttackModifier(field, moveType);
    const item = getItemModifier(attacker, moveType, move);
    const atkAbility = getAttackerAbilityDamageMod(attacker, moveType, move, field, typeEffectiveness);
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

    const accuracyText = getMoveAccuracyLabel(move, field, attacker, defender);

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
