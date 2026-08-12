/**
 * Utility functions for cartographic label rendering, placeholder detection,
 * and label collision management.
 */

const KNOWN_PLACEHOLDERS = new Set([
  'new region',
  'new river',
  'new settlement',
  'new city',
  'new town',
  'new village',
  'new kingdom',
  'new location',
  'new label',
  'new poi',
  'new point of interest',
  'unnamed region',
  'unnamed river',
  'unnamed settlement',
  'unnamed city',
  'unnamed kingdom',
  'unnamed location',
  'unnamed poi',
  'untitled',
  'default',
  'unknown',
  'new map',
  'placeholder'
]);

/**
 * Checks whether a label string is a valid, renderable name or a development placeholder.
 */
export function isRenderableLabel(text: string | null | undefined): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;

  const lower = trimmed.toLowerCase();
  
  // Exact match with known placeholder strings
  if (KNOWN_PLACEHOLDERS.has(lower)) return false;

  // Pattern matching for "New X 1", "New Settlement 2", "New River 3", etc.
  if (/^new\s+(region|river|settlement|city|town|village|kingdom|location|label|poi|point of interest)(\s+\d+)?$/i.test(lower)) {
    return false;
  }
  if (/^unnamed\s+(region|river|settlement|city|town|village|kingdom|location|label|poi)(\s+\d+)?$/i.test(lower)) {
    return false;
  }

  return true;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  priority: number; // Lower number = higher priority
}

/**
 * Simple 2D bounding box collision detection for labels.
 */
export function checkLabelOverlap(boxA: BoundingBox, boxB: BoundingBox): boolean {
  return !(
    boxA.x + boxA.width < boxB.x ||
    boxB.x + boxB.width < boxA.x ||
    boxA.y + boxA.height < boxB.y ||
    boxB.y + boxB.height < boxA.y
  );
}
