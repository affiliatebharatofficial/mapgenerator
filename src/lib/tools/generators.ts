const NAME_PREFIXES = ['Val', 'Eld', 'Aer', 'Kael', 'Drak', 'Thal', 'Syl', 'Mor', 'Grim', 'Bael', 'Cor', 'Raven', 'Iron', 'Shadow', 'Frost', 'Storm'];
const NAME_SUFFIXES = ['dor', 'gard', 'helm', 'reach', 'hold', 'spire', 'wood', 'haven', 'crest', 'fall', 'ford', 'vale', ' peak', 'mere', 'stone', 'gate'];
const TITLE_EPITHETS = ['the Undaunted', 'the Shadowweaver', 'the Ironclad', 'the Stormbringer', 'the Wise', 'the Red', 'the Exile', 'the Silver Hand'];

export const FreeToolsEngine = {
  generateFantasyNames(count = 5): string[] {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      const p = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
      const s = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
      results.push(`${p}${s}`);
    }
    return results;
  },

  generateKingdomNames(count = 5): { name: string; description: string }[] {
    const prefixes = ['High Kingdom of ', 'Realm of ', 'Empire of ', 'Dominion of ', 'Grand Duchy of '];
    return this.generateFantasyNames(count).map((name) => {
      const p = prefixes[Math.floor(Math.random() * prefixes.length)];
      return {
        name: `${p}${name}`,
        description: `A powerful feudal realm governed by ancient nobility and defended by ironclad knights.`
      };
    });
  },

  generateCityNames(count = 5): { name: string; type: string }[] {
    const types = ['Capital City', 'Port Haven', 'Fortress Citadel', 'Trade Hub', 'Magical City'];
    return this.generateFantasyNames(count).map((name) => ({
      name,
      type: types[Math.floor(Math.random() * types.length)]
    }));
  },

  generateCharacterNames(count = 5): { name: string; title: string }[] {
    const firsts = ['Aldren', 'Lyra', 'Kaelen', 'Vael', 'Aethelgard', 'Seraphina', 'Dareth', 'Thorne', 'Evelyn', 'Morrigan'];
    const lasts = ['Blackwood', 'Stormbringer', 'Silvervein', 'Ironheart', 'Shadowmantle', 'Frostguard', 'Wyrmslayer'];

    const results = [];
    for (let i = 0; i < count; i++) {
      const fn = firsts[Math.floor(Math.random() * firsts.length)];
      const ln = lasts[Math.floor(Math.random() * lasts.length)];
      const title = TITLE_EPITHETS[Math.floor(Math.random() * TITLE_EPITHETS.length)];
      results.push({ name: `${fn} ${ln}`, title });
    }
    return results;
  },

  generateFactionNames(count = 5): { name: string; type: string }[] {
    const types = ['Merchant Guild', 'Assassin Order', 'Mage Council', 'Rebel Alliance', 'Royal House'];
    const prefixes = ['The Order of ', 'The Brotherhood of ', 'The Syndicate of ', 'The House of '];
    return this.generateFantasyNames(count).map((name) => ({
      name: `${prefixes[Math.floor(Math.random() * prefixes.length)]}${name}`,
      type: types[Math.floor(Math.random() * types.length)]
    }));
  },

  generateLocationNames(count = 5): { name: string; type: string; secret: string }[] {
    const types = ['Ancient Temple', 'Ruined Citadel', 'Dragon Lair', 'Cursed Dungeon', 'Shadow Mine'];
    const secrets = [
      'Houses a sealed elemental artifact',
      'Guarded by spectral warriors',
      'Contains hidden underground escape tunnels',
      'Conceals a forgotten royal tomb'
    ];
    return this.generateFantasyNames(count).map((name) => ({
      name: `${types[Math.floor(Math.random() * types.length)]} of ${name}`,
      type: types[Math.floor(Math.random() * types.length)],
      secret: secrets[Math.floor(Math.random() * secrets.length)]
    }));
  },

  generateQuests(count = 3): { title: string; hook: string; objective: string; reward: string }[] {
    const verbs = ['Recover the Lost', 'Defend the Siege of', 'Investigate the Curse of', 'Escape the Catacombs of'];
    return this.generateFantasyNames(count).map((name) => ({
      title: `${verbs[Math.floor(Math.random() * verbs.length)]} ${name}`,
      hook: `Local villagers report strange occurrences after midnight near the old ruins.`,
      objective: `Explore the ruins, neutralize the hostile threat, and retrieve the relic.`,
      reward: `500 Gold Pieces + Enchanted Ring of Protection`
    }));
  }
};
