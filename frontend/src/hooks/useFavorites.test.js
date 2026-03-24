import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFavorites } from './useFavorites';

function FavoritesHarness({ propertyId = 'ABC123' }) {
  const { favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite } = useFavorites();

  return (
    <div>
      <div data-testid="favorites-count">{favorites.length}</div>
      <div data-testid="is-favorite">{String(isFavorite(propertyId))}</div>
      <button type="button" onClick={() => addFavorite(propertyId)}>Add</button>
      <button type="button" onClick={() => removeFavorite(propertyId)}>Remove</button>
      <button type="button" onClick={() => toggleFavorite(propertyId)}>Toggle</button>
    </div>
  );
}

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('loads favorites from localStorage', () => {
    localStorage.setItem('favoriteProperties', JSON.stringify(['ABC123']));

    render(<FavoritesHarness propertyId="ABC123" />);

    expect(screen.getByTestId('favorites-count')).toHaveTextContent('1');
    expect(screen.getByTestId('is-favorite')).toHaveTextContent('true');
  });

  test('adds and removes favorites without duplicates', async () => {
    render(<FavoritesHarness propertyId="ABC123" />);

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByTestId('favorites-count')).toHaveTextContent('1');
    expect(JSON.parse(localStorage.getItem('favoriteProperties'))).toEqual(['ABC123']);

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(screen.getByTestId('favorites-count')).toHaveTextContent('0');
    expect(screen.getByTestId('is-favorite')).toHaveTextContent('false');
  });

  test('toggles favorite state and ignores malformed stored JSON', async () => {
    localStorage.setItem('favoriteProperties', '{bad json');

    render(<FavoritesHarness propertyId="123" />);

    expect(screen.getByTestId('favorites-count')).toHaveTextContent('0');

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('is-favorite')).toHaveTextContent('true');

    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByTestId('is-favorite')).toHaveTextContent('false');
  });
});
