/**
 * Safe localStorage utilities with error handling
 */

export const storage = {
  /**
   * Safely get item from localStorage
   */
  getItem(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined' || item === 'null') {
        return null;
      }
      return item;
    } catch (error) {
      console.error(`Failed to get item "${key}" from localStorage:`, error);
      return null;
    }
  },

  /**
   * Safely set item to localStorage
   */
  setItem(key: string, value: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Failed to set item "${key}" to localStorage:`, error);
      return false;
    }
  },

  /**
   * Safely remove item from localStorage
   */
  removeItem(key: string): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item "${key}" from localStorage:`, error);
      return false;
    }
  },

  /**
   * Safely get and parse JSON from localStorage
   */
  getJSON<T>(key: string): T | null {
    const item = this.getItem(key);
    if (!item) {
      return null;
    }

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to parse JSON from localStorage key "${key}":`, error);
      this.removeItem(key); // Clean up corrupted data
      return null;
    }
  },

  /**
   * Safely set JSON to localStorage
   */
  setJSON<T>(key: string, value: T): boolean {
    try {
      const json = JSON.stringify(value);
      return this.setItem(key, json);
    } catch (error) {
      console.error(`Failed to stringify value for localStorage key "${key}":`, error);
      return false;
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  },
};
