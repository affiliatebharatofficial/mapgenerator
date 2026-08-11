import type { FantasyMap } from '../../types/map';
import type { AgentAction, RiskLevel } from '../../types/agentTypes';

export const AgentValidation = {
  // Classify Action Risk Level according to Phase 7 prompt rules
  classifyRisk(actionType: AgentAction['type']): RiskLevel {
    // Low Risk: Immediate execution (renaming labels, style changes, color updates)
    if (['rename_river', 'rename_location', 'change_kingdom_color', 'change_map_style', 'update_lore'].includes(actionType)) {
      return 'low';
    }

    // High Impact: Always require explicit confirmation (deleting entities, bulk modifications)
    if (['delete_city', 'delete_location', 'delete_character'].includes(actionType)) {
      return 'high';
    }

    // Medium Risk: Show Action Preview (add city, move city, create kingdom, create character, create quest)
    return 'medium';
  },

  // Validate action plan before execution
  validateAction(map: FantasyMap, worldData: any, action: AgentAction): { valid: boolean; reason?: string } {
    const { type, entityId, newValues } = action;

    // 1. Move or Edit City Validation
    if (['move_city', 'rename_city', 'delete_city'].includes(type)) {
      if (!entityId) return { valid: false, reason: 'Missing city target ID.' };
      const exists = map.cities.some((c) => c.id === entityId);
      if (!exists) return { valid: false, reason: 'Target city no longer exists on this map.' };
    }

    // 2. Coordinate boundary check
    if (newValues.x !== undefined && newValues.y !== undefined) {
      if (newValues.x < 0 || newValues.x > map.width || newValues.y < 0 || newValues.y > map.height) {
        return { valid: false, reason: `Target coordinates (${newValues.x}, ${newValues.y}) are outside map dimensions.` };
      }
    }

    // 3. Edit Kingdom Validation
    if (['rename_kingdom', 'change_kingdom_color'].includes(type)) {
      if (!entityId) return { valid: false, reason: 'Missing kingdom target ID.' };
      const exists = map.kingdoms.some((k) => k.id === entityId);
      if (!exists) return { valid: false, reason: 'Target kingdom not found.' };
    }

    return { valid: true };
  },

  // Check if an action conflicts with established Canon notes
  checkCanonConflict(worldData: any, action: AgentAction): { conflicts: boolean; note?: string } {
    if (!worldData || !worldData.world) return { conflicts: false };

    const canonText = `${worldData.world.description || ''} ${worldData.lore?.map((l: any) => l.content).join(' ') || ''}`.toLowerCase();

    // Check conflict example: Changing kingdom ruler or relations when canon says war/peace
    if (action.type === 'create_quest' && action.newValues?.title?.toLowerCase().includes('peace')) {
      if (canonText.includes('eternal war') || canonText.includes('at war for 20 years')) {
        return {
          conflicts: true,
          note: 'Established canon states these realms have been at eternal war.'
        };
      }
    }

    return { conflicts: false };
  }
};
