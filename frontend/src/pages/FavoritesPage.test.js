import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import FavoritesPage from './FavoritesPage';
import { fetchPropertyDetail } from '../api/client';

jest.mock('../api/client', () => ({
  fetchPropertyDetail: jest.fn()
}));

describe('FavoritesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('shows empty state when there are no favorites', async () => {
    render(
      <MemoryRouter initialEntries={['/favorites']}>
        <Routes>
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/you have no favorites yet/i)).toBeInTheDocument();
  });

  test('renders favorite properties and allows unfavorite', async () => {
    localStorage.setItem('favoriteProperties', JSON.stringify(['ABC123']));
    fetchPropertyDetail.mockResolvedValueOnce({
      L_ListingID: 'ABC123',
      L_Address: '100 Main St',
      L_City: 'Portland',
      L_State: 'OR',
      L_SystemPrice: 500000,
      LM_Int2_3: 1800,
      BathroomsHalf: 2,
      LM_Dec_3: 3,
      L_Photos: '[]'
    });

    render(
      <MemoryRouter initialEntries={['/favorites']}>
        <Routes>
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('100 Main St')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /remove from favorites/i }));

    expect(await screen.findByText(/you have no favorites yet/i)).toBeInTheDocument();
  });
});
