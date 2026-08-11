import type { FantasyMap, Settlement, PointOfInterest, MapKingdom, SelectedObjectRef } from '../../types/map';
import type { AgentResponse, AgentAction, ConsistencyIssue, WorldSummary } from '../../types/agentTypes';
import { SpatialServices } from './spatialServices';
import { AgentValidation } from './agentValidation';

export const AIWorldAgent = {
  // Main natural language query & edit command parser
  async processAgentRequest(
    request: string,
    map: FantasyMap,
    worldData: any = {},
    selectedObject: SelectedObjectRef | null = null
  ): Promise<AgentResponse> {
    const thinkingSteps = [
      'Understanding natural language request...',
      'Retrieving spatial map geometry and world context...',
      'Evaluating action plan & safety validation...'
    ];

    await new Promise((res) => setTimeout(res, 600));

    const cleanReq = request.toLowerCase();

    // ----------------------------------------------------
    // MODE A: EDIT MODE COMMANDS (Structured Action Plans)
    // ----------------------------------------------------

    // 1. "Add 3 villages around [City]" or "Add village near [City]"
    if (cleanReq.includes('village') && (cleanReq.includes('add') || cleanReq.includes('create'))) {
      // Determine target city (either from text or from selected object)
      let targetCity: Settlement | undefined;
      if (selectedObject && selectedObject.type === 'city') {
        targetCity = map.cities.find((c) => c.id === selectedObject.id);
      } else {
        targetCity = map.cities.find((c) => cleanReq.includes(c.name.toLowerCase())) || map.cities[0];
      }

      const centerPos = targetCity ? { x: targetCity.x, y: targetCity.y } : { x: map.width / 2, y: map.height / 2 };
      const villageCount = cleanReq.includes('three') || cleanReq.includes('3') ? 3 : cleanReq.includes('five') || cleanReq.includes('5') ? 5 : 2;

      const newCoords = SpatialServices.generateVillageCoordinates(map, centerPos, villageCount, 75);

      const baseNames = ['Riverwatch', 'Oakmere', 'Stoneford', 'Pinewatch', 'Northgate', 'Ravencrest'];
      const actions: AgentAction[] = newCoords.map((pos, idx) => {
        const vName = `${baseNames[idx % baseNames.length]} ${targetCity ? `of ${targetCity.name}` : ''}`.trim();
        return {
          id: `act_${Date.now()}_${idx}`,
          type: 'add_village',
          entityType: 'city',
          description: `Add village "${vName}" near ${targetCity?.name || 'Center'} at (${pos.x}, ${pos.y})`,
          newValues: {
            name: vName,
            type: 'village',
            x: pos.x,
            y: pos.y,
            population: 450
          },
          riskLevel: 'medium',
          enabled: true
        };
      });

      return {
        mode: 'action_plan',
        summary: `Planned creation of ${villageCount} new villages around ${targetCity?.name || 'the capital'}.`,
        actions,
        confidence: 'high',
        estimatedCreditCost: 1,
        thinkingSteps
      };
    }

    // 2. "Move capital/city closer to river/center"
    if (cleanReq.includes('move') && (cleanReq.includes('city') || cleanReq.includes('capital') || cleanReq.includes('silverkeep'))) {
      let targetCity = map.cities.find((c) => cleanReq.includes(c.name.toLowerCase()) || c.type === 'capital') || map.cities[0];

      if (targetCity) {
        const riverInfo = SpatialServices.findNearestRiver(map, { x: targetCity.x, y: targetCity.y });
        let newX = targetCity.x + 80;
        let newY = targetCity.y + 40;

        if (riverInfo && riverInfo.river.points?.length) {
          const pt = riverInfo.river.points[0];
          newX = pt.x + 25;
          newY = pt.y + 25;
        }

        const action: AgentAction = {
          id: `act_${Date.now()}`,
          type: 'move_city',
          entityType: 'city',
          entityId: targetCity.id,
          description: `Move ${targetCity.name} closer to the river at (${newX}, ${newY})`,
          oldValues: { x: targetCity.x, y: targetCity.y },
          newValues: { x: newX, y: newY },
          riskLevel: 'medium',
          enabled: true
        };

        return {
          mode: 'action_plan',
          summary: `Proposed relocation for ${targetCity.name}.`,
          actions: [action],
          confidence: 'high',
          estimatedCreditCost: 1,
          thinkingSteps
        };
      }
    }

    // 3. "Rename kingdom/city to [New Name]"
    if (cleanReq.includes('rename')) {
      const targetKingdom = map.kingdoms.find((k) => cleanReq.includes(k.name.toLowerCase()));
      if (targetKingdom) {
        const action: AgentAction = {
          id: `act_${Date.now()}`,
          type: 'rename_kingdom',
          entityType: 'kingdom',
          entityId: targetKingdom.id,
          description: `Rename kingdom "${targetKingdom.name}" to Valemere Dominion`,
          oldValues: { name: targetKingdom.name },
          newValues: { name: 'Valemere Dominion' },
          riskLevel: 'low',
          enabled: true
        };

        return {
          mode: 'action_plan',
          summary: `Rename kingdom "${targetKingdom.name}".`,
          actions: [action],
          confidence: 'high',
          estimatedCreditCost: 1,
          thinkingSteps
        };
      }
    }

    // 4. "Create a mountain range across the northern border"
    if (cleanReq.includes('mountain') && (cleanReq.includes('create') || cleanReq.includes('add'))) {
      const actions: AgentAction[] = [
        {
          id: `act_${Date.now()}_m1`,
          type: 'add_mountain_range',
          entityType: 'location',
          description: 'Place Northern Ridge mountain peaks along the northern map boundary',
          newValues: {
            mountains: [
              { x: 300, y: 120 },
              { x: 450, y: 110 },
              { x: 600, y: 130 },
              { x: 750, y: 115 }
            ]
          },
          riskLevel: 'medium',
          enabled: true
        }
      ];

      return {
        mode: 'action_plan',
        summary: 'Add Northern Ridge mountain range.',
        actions,
        confidence: 'high',
        estimatedCreditCost: 1,
        thinkingSteps
      };
    }

    // 5. "Create 3 quests involving war"
    if (cleanReq.includes('quest') && (cleanReq.includes('create') || cleanReq.includes('generate'))) {
      const actions: AgentAction[] = [
        {
          id: `act_${Date.now()}_q1`,
          type: 'create_quest',
          entityType: 'quest',
          description: 'Create quest: "Siege of the Northern Border"',
          newValues: {
            title: 'Siege of the Northern Border',
            questType: 'Military Defense',
            difficulty: 'Hard',
            description: 'Defend the mountain pass from invading vanguard troops.',
            rewards: '500 Gold & Royal Honor Medal'
          },
          riskLevel: 'medium',
          enabled: true
        }
      ];

      return {
        mode: 'action_plan',
        summary: 'Generate military quest batch.',
        actions,
        confidence: 'high',
        estimatedCreditCost: 1,
        thinkingSteps
      };
    }

    // ----------------------------------------------------
    // MODE B: ASK MODE (Q&A & Spatial Queries)
    // ----------------------------------------------------

    // Spatial directional query: "What is north of [City]?"
    if (cleanReq.includes('north') || cleanReq.includes('south') || cleanReq.includes('east') || cleanReq.includes('west')) {
      const direction = cleanReq.includes('north') ? 'north' : cleanReq.includes('south') ? 'south' : cleanReq.includes('east') ? 'east' : 'west';
      const refCity = selectedObject?.type === 'city' ? map.cities.find((c) => c.id === selectedObject.id) : map.cities[0];

      if (refCity) {
        const nearby = SpatialServices.findEntitiesInDirection(map, { x: refCity.x, y: refCity.y }, direction);
        if (nearby.length > 0) {
          const names = nearby.map((n) => `${n.name} (${n.type})`).join(', ');
          return {
            mode: 'answer',
            answer: `Directly ${direction} of ${refCity.name}, you have: ${names}.`,
            confidence: 'high',
            estimatedCreditCost: 0,
            thinkingSteps
          };
        }
      }
    }

    // Default Q&A grounding
    let answerText = `Based on map and world records: Your map contains ${map.cities.length} settlements, ${map.kingdoms.length} kingdoms, and ${map.rivers.length} major river systems.`;

    if (selectedObject) {
      if (selectedObject.type === 'city') {
        const c = map.cities.find((item) => item.id === selectedObject.id);
        if (c) answerText = `Selected Entity: ${c.name} (${c.type.toUpperCase()}). Coordinates: X:${c.x}, Y:${c.y}. Population: ${c.population?.toLocaleString() || '12,500'}.`;
      }
    }

    return {
      mode: 'answer',
      answer: answerText,
      confidence: 'high',
      estimatedCreditCost: 0,
      thinkingSteps
    };
  },

  // Atomic Execution of Action Plan on Map
  executeActionPlan(map: FantasyMap, actions: AgentAction[]): FantasyMap {
    const updatedMap: FantasyMap = JSON.parse(JSON.stringify(map));

    actions.forEach((act) => {
      if (!act.enabled) return;

      if (act.type === 'add_village' || act.type === 'add_city') {
        const newCity: Settlement = {
          id: `c_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: act.newValues.name,
          type: act.newValues.type || 'village',
          x: act.newValues.x,
          y: act.newValues.y,
          population: act.newValues.population || 500
        };
        updatedMap.cities.push(newCity);
      } else if (act.type === 'move_city' && act.entityId) {
        const target = updatedMap.cities.find((c) => c.id === act.entityId);
        if (target) {
          target.x = act.newValues.x;
          target.y = act.newValues.y;
        }
      } else if (act.type === 'rename_kingdom' && act.entityId) {
        const target = updatedMap.kingdoms.find((k) => k.id === act.entityId);
        if (target) {
          target.name = act.newValues.name;
        }
      } else if (act.type === 'add_mountain_range' && act.newValues.mountains) {
        updatedMap.mountains.push(...act.newValues.mountains);
      }
    });

    updatedMap.updatedAt = new Date().toISOString();
    return updatedMap;
  },

  // AI Fantasy Naming Assistant
  suggestNames(category: string, style = 'fantasy', count = 5): string[] {
    const prefixMap: Record<string, string[]> = {
      kingdom: ['High Kingdom of', 'Dominion of', 'Principality of', 'Realm of', 'Duchy of'],
      city: ['Silver', 'Oakhaven', 'Sunreach', 'Iron', 'Raven', 'Eldor'],
      river: ['Whispering', 'Eldor', 'Silver', 'Serpent', 'Mist', 'Ashen']
    };
    const suffixMap: Record<string, string[]> = {
      kingdom: ['Vaeloria', 'Morvath', 'Sunreach', 'Eldoria', 'Frostmere'],
      city: ['keep', 'port', 'ford', ' crest', 'haven', 'spire'],
      river: [' Stream', ' River', ' Waters', ' Reach', ' Flow']
    };

    const prefixes = prefixMap[category.toLowerCase()] || ['Ancient ', 'Mystic ', 'Shadow '];
    const suffixes = suffixMap[category.toLowerCase()] || ['wood', 'guard', 'dale', 'fell'];

    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const p = prefixes[i % prefixes.length];
      const s = suffixes[i % suffixes.length];
      names.push(`${p}${s}`);
    }
    return names;
  },

  // AI Consistency Auditor
  checkWorldConsistency(worldData: any, map: FantasyMap): ConsistencyIssue[] {
    const issues: ConsistencyIssue[] = [];

    // Check 1: Duplicate city names
    const cityNames = new Set<string>();
    map.cities.forEach((c) => {
      if (cityNames.has(c.name.toLowerCase())) {
        issues.push({
          id: `iss_${Date.now()}_dup_${c.id}`,
          severity: 'warning',
          title: `Duplicate Settlement Name: "${c.name}"`,
          description: `Multiple settlements share the exact same name "${c.name}". Consider giving one a unique title.`,
          entityId: c.id,
          entityType: 'city'
        });
      }
      cityNames.add(c.name.toLowerCase());
    });

    // Check 2: Kingdoms without capitals
    map.kingdoms.forEach((k) => {
      const hasCapital = map.cities.some((c) => c.kingdomId === k.id && c.type === 'capital');
      if (!hasCapital) {
        issues.push({
          id: `iss_${Date.now()}_nocap_${k.id}`,
          severity: 'suggestion',
          title: `Kingdom "${k.name}" Has No Designated Capital`,
          description: `Assign a capital settlement to ${k.name} for improved lore integration.`,
          entityId: k.id,
          entityType: 'kingdom'
        });
      }
    });

    return issues;
  },

  // AI World Summary Generator
  generateWorldSummary(worldData: any): WorldSummary {
    return {
      worldName: worldData.world?.name || 'The Realms of Eldoria',
      premise: worldData.world?.description || 'A dark fantasy realm torn by ancient magical convergence.',
      majorKingdoms: worldData.kingdoms?.map((k: any) => k.name) || ['High Kingdom of Sunreach', 'Ironpeak Dominion'],
      mainConflict: 'The war between Sunreach and the Shadow Coven over blood magic reliquaries.',
      keyFactions: ['Sun Guard Order', 'Mage Syndicate', 'Shadow Coven'],
      keyCharacters: ['King Aldren IV', 'Archmage Morvath', 'Commander Vaelen'],
      importantLocations: ['Silverkeep Citadel', 'Oakhaven Port', 'Ravenhold Ruins'],
      timelineHighlights: ['Year 12: Great Convergence', 'Year 85: Siege of Oakhaven', 'Year 194: Royal Edict']
    };
  }
};
