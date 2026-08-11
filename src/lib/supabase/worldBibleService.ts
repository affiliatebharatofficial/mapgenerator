import type {
  EntityRelationship,
  WorldCulture,
  WorldReligion,
  WorldLanguage,
  WorldCreature,
  WorldItem,
  LoreDocument,
  WorldConsistencyIssue,
  CanonStatus
} from '../../types/worldBible';

const RELATIONS_KEY = 'createfantasymap_world_relations';
const LORE_KEY = 'createfantasymap_world_lore';

export const WorldBibleService = {
  // ----------------------------------------------------
  // 1. RELATIONSHIPS ENGINE
  // ----------------------------------------------------
  getRelationships(worldId: string): EntityRelationship[] {
    const data = localStorage.getItem(RELATIONS_KEY);
    const list: EntityRelationship[] = data ? JSON.parse(data) : [];
    return list.filter((r) => r.worldId === worldId);
  },

  addRelationship(rel: Omit<EntityRelationship, 'id'>): EntityRelationship {
    const data = localStorage.getItem(RELATIONS_KEY);
    const list: EntityRelationship[] = data ? JSON.parse(data) : [];
    const newRecord: EntityRelationship = {
      ...rel,
      id: `rel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    list.push(newRecord);
    localStorage.setItem(RELATIONS_KEY, JSON.stringify(list));
    return newRecord;
  },

  // ----------------------------------------------------
  // 2. LORE DOCUMENTS & MENTIONS
  // ----------------------------------------------------
  getLoreDocuments(worldId: string): LoreDocument[] {
    const data = localStorage.getItem(LORE_KEY);
    const list: LoreDocument[] = data ? JSON.parse(data) : [];
    return list.filter((l) => l.worldId === worldId);
  },

  saveLoreDocument(doc: Omit<LoreDocument, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): LoreDocument {
    const data = localStorage.getItem(LORE_KEY);
    const list: LoreDocument[] = data ? JSON.parse(data) : [];
    const now = new Date().toISOString();

    const record: LoreDocument = {
      ...doc,
      id: doc.id || `lore_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    const idx = list.findIndex((l) => l.id === record.id);
    if (idx >= 0) list[idx] = record;
    else list.unshift(record);

    localStorage.setItem(LORE_KEY, JSON.stringify(list));
    return record;
  },

  // ----------------------------------------------------
  // 3. KNOWLEDGE GRAPH BUILDER
  // ----------------------------------------------------
  getKnowledgeGraphData(worldId: string) {
    const rels = this.getRelationships(worldId);
    const nodesMap = new Map<string, { id: string; label: string; type: string }>();
    const edges: { from: string; to: string; label: string }[] = [];

    rels.forEach((r) => {
      nodesMap.set(r.sourceEntityId, { id: r.sourceEntityId, label: r.sourceEntityId, type: r.sourceEntityType });
      nodesMap.set(r.targetEntityId, { id: r.targetEntityId, label: r.targetEntityId, type: r.targetEntityType });
      edges.push({
        from: r.sourceEntityId,
        to: r.targetEntityId,
        label: r.relationshipType.replace('_', ' ')
      });
    });

    return { nodes: Array.from(nodesMap.values()), edges };
  },

  // ----------------------------------------------------
  // 4. AUTOMATED CONSISTENCY AUDIT ENGINE
  // ----------------------------------------------------
  runConsistencyAudit(worldId: string, worldData?: any): WorldConsistencyIssue[] {
    const issues: WorldConsistencyIssue[] = [];

    // Sample checks
    if (worldData?.cities) {
      worldData.cities.forEach((c: any) => {
        if (!c.kingdomId && worldData.kingdoms?.length > 0) {
          issues.push({
            id: `iss_city_${c.id}`,
            worldId,
            severity: 'warning',
            category: 'politics',
            title: `City without Kingdom Affiliation (${c.name})`,
            description: `City "${c.name}" is not currently assigned to any sovereign kingdom territory.`,
            evidence: [`City ID: ${c.id}`],
            suggestedFix: 'Assign city to a kingdom or declare as an independent city-state.',
            reviewed: false
          });
        }
      });
    }

    return issues;
  }
};
