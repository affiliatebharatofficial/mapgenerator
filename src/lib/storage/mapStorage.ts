import type { FantasyMap } from '../../types/map';

const STORAGE_KEY = 'createfantasymap_current_map';

export function saveMapToLocalStorage(map: FantasyMap): void {
  try {
    const serialized = JSON.stringify(map);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.warn('Failed to save map to local storage:', err);
  }
}

export function loadMapFromLocalStorage(): FantasyMap | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as FantasyMap;
  } catch (err) {
    console.warn('Failed to load map from local storage:', err);
    return null;
  }
}

export function clearMapFromLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear map from local storage:', err);
  }
}
