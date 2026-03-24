import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'favoriteProperties';

function normalizeId(propertyId) {
  if (propertyId === undefined || propertyId === null || propertyId === '') {
    return null;
  }
  return String(propertyId);
}

function readFavoritesFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map(normalizeId)
      .filter((id) => id !== null);
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavoritesFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore storage failures and keep in-memory state.
    }
  }, [favorites]);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const addFavorite = (propertyId) => {
    const normalizedId = normalizeId(propertyId);
    if (!normalizedId) {
      return;
    }

    setFavorites((prev) => (prev.includes(normalizedId) ? prev : [...prev, normalizedId]));
  };

  const removeFavorite = (propertyId) => {
    const normalizedId = normalizeId(propertyId);
    if (!normalizedId) {
      return;
    }

    setFavorites((prev) => prev.filter((id) => id !== normalizedId));
  };

  const toggleFavorite = (propertyId) => {
    const normalizedId = normalizeId(propertyId);
    if (!normalizedId) {
      return;
    }

    setFavorites((prev) => (
      prev.includes(normalizedId)
        ? prev.filter((id) => id !== normalizedId)
        : [...prev, normalizedId]
    ));
  };

  const isFavorite = (propertyId) => {
    const normalizedId = normalizeId(propertyId);
    if (!normalizedId) {
      return false;
    }
    return favoriteSet.has(normalizedId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  };
}
