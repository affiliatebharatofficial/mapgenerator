import { PRNG } from '../prng';

/**
 * Deterministic name pools. A small generator with prefix/suffix pairs gives
 * enough variety that two worlds do not share a gazetteer, without shipping a
 * dictionary.
 */

const SETTLE_PREFIX = [
  'Ald', 'Bran', 'Cair', 'Dun', 'Eld', 'Fen', 'Gorm', 'Hal', 'Ivar', 'Kel',
  'Lorn', 'Mor', 'Nar', 'Osric', 'Pell', 'Quenn', 'Rav', 'Sil', 'Thorn', 'Ulf',
  'Vaen', 'Wyn', 'Yar', 'Zeph', 'Ash', 'Bel', 'Crag', 'Dorn', 'Esk', 'Fal'
];
const SETTLE_SUFFIX = [
  'ford', 'holm', 'wick', 'stead', 'mere', 'burgh', 'gate', 'hollow', 'reach',
  'crest', 'vale', 'fell', 'barrow', 'moor', 'haven', 'watch', 'march', 'ridge'
];
const PORT_SUFFIX = ['harbour', 'haven', 'port', 'quay', 'landing', 'strand', 'moorings'];
const HIGHLAND_SUFFIX = ['crag', 'fell', 'tor', 'peak', 'scar', 'cairn'];
const RIVER_SUFFIX = ['ford', 'bridge', 'crossing', 'mill', 'weir', 'bend'];

const REGION_PREFIX = [
  'Aldermarch', 'Brackenshire', 'Caldreth', 'Dunmoor', 'Elenmark', 'Farholt',
  'Grimwold', 'Halloway', 'Ironmarch', 'Karvenhold', 'Lowmere', 'Mournvale',
  'Northreach', 'Ostwick', 'Pelledon', 'Rhunmark', 'Sablewold', 'Tarnholt',
  'Velmoor', 'Wexhold'
];
const REGION_FORM = [
  'Kingdom of', 'Duchy of', 'Free Cities of', 'March of', 'Dominion of',
  'Barony of', 'Protectorate of', 'League of', 'Hold of'
];
const RULER_TITLE = [
  'King', 'Queen', 'Duke', 'Duchess', 'High Thane', 'Archon', 'Baron',
  'Baroness', 'Warden', 'Lord Marshal', 'Margrave', 'Prince'
];
const RULER_NAME = [
  'Aldren', 'Beatrix', 'Corvin', 'Dathra', 'Edran', 'Fenwick', 'Gwendra',
  'Halvard', 'Isolde', 'Jorund', 'Kestrel', 'Lysandra', 'Maelor', 'Nerith',
  'Ostren', 'Perrin', 'Rhoswen', 'Sigmar', 'Torvald', 'Ysolde'
];
const RULER_NUMERAL = ['', '', ' II', ' III', ' IV', ' the Elder', ' the Younger', ' the Grim'];

/** Region palette: distinguishable at low border opacity on parchment. */
export const REGION_COLORS = [
  '#c0392b', '#2980b9', '#d4af37', '#27ae60', '#8e44ad',
  '#16a085', '#e67e22', '#7f8c8d', '#b03a5b', '#4b6584'
];

export const SEA_NAMES = [
  'THE GREAT SEA', 'OCEAN OF WHISPERS', 'THE SAPPHIRE REACH',
  'THE FORBIDDEN DEEPS', 'THE CELESTIAL OCEAN', 'THE ENDLESS EXPANSE',
  'THE SUNKEN DEPTHS', 'THE MISTY OCEAN'
];

export const REALM_PREFIXES = [
  'Eldoria', 'Valoria', 'Solaria', 'Frostveil', 'Ironpeak', 'Aethelgard',
  'Mythgard', 'Silvermoon', 'Shadowfen', 'Dragonspire', 'Sunreach', 'Highpeak',
  'Stormhaven', 'Duskwood', 'Grimhold', 'Whiterock', 'Ravencrest', 'Ambervale'
];

export const REALM_TITLES = [
  'The Realms of', 'The Grand Dominion of', 'The High Kingdom of',
  'The Sovereign Empire of', 'The Lands of', 'The Chronicles of'
];

export type SettleFlavour = 'plain' | 'port' | 'river' | 'highland';

/** Hands out unique names, flavoured by the site's geography. */
export function createNamer(seed: number) {
  const prng = new PRNG(seed ^ 0x4f1bbcdc);
  const used = new Set<string>();

  const settlement = (flavour: SettleFlavour): string => {
    const tails =
      flavour === 'port' ? PORT_SUFFIX
      : flavour === 'highland' ? HIGHLAND_SUFFIX
      : flavour === 'river' ? RIVER_SUFFIX
      : SETTLE_SUFFIX;

    for (let attempt = 0; attempt < 60; attempt++) {
      const name = `${prng.pick(SETTLE_PREFIX)}${prng.pick(tails)}`;
      if (!used.has(name)) {
        used.add(name);
        return name;
      }
    }
    let n = 2;
    let base = `${prng.pick(SETTLE_PREFIX)}${prng.pick(tails)}`;
    while (used.has(`${base} ${n}`)) n++;
    used.add(`${base} ${n}`);
    return `${base} ${n}`;
  };

  const region = (): { name: string; ruler: string } => {
    let name = `${prng.pick(REGION_FORM)} ${prng.pick(REGION_PREFIX)}`;
    for (let attempt = 0; attempt < 40 && used.has(name); attempt++) {
      name = `${prng.pick(REGION_FORM)} ${prng.pick(REGION_PREFIX)}`;
    }
    used.add(name);
    return {
      name,
      ruler: `${prng.pick(RULER_TITLE)} ${prng.pick(RULER_NAME)}${prng.pick(RULER_NUMERAL)}`
    };
  };

  return { settlement, region, prng };
}
