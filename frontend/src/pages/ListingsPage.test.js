import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ListingsPage from './ListingsPage';
import { fetchProperties } from '../api/client';

jest.mock('../api/client', () => ({
  fetchProperties: jest.fn()
}));

jest.mock('../components/PropertyFilters', () => function MockPropertyFilters() {
  return null;
});

jest.mock('../components/Pagination', () => function MockPagination() {
  return null;
});

function CurrentLocation() {
  const location = useLocation();
  return <div data-testid="current-path">{location.pathname}</div>;
}

describe('ListingsPage navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('clicking a property card navigates to detail URL with listing id', async () => {
    fetchProperties.mockResolvedValueOnce({
      total: 1,
      results: [
        {
          L_ListingID: 'ABC123',
          L_Address: '100 Main St',
          L_City: 'Portland',
          L_State: 'OR',
          L_SystemPrice: 500000,
          LM_Int2_3: 3,
          BathroomsHalf: 2,
          LM_Dec_3: 1800,
          L_Photos: '[]'
        }
      ]
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <CurrentLocation />
        <Routes>
          <Route path="/" element={<ListingsPage />} />
          <Route path="/property/:id" element={<div>Detail Route</div>} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('100 Main St');

    await userEvent.click(screen.getByRole('button', { name: /view details for 100 main st/i }));

    expect(await screen.findByText('Detail Route')).toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/property/ABC123');
  });

  test('restores filters and page from navigation state', async () => {
    fetchProperties.mockResolvedValueOnce({ total: 0, results: [] });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/',
            state: {
              listingsState: {
                filters: { city: 'Portland', minPrice: 300000 },
                currentPage: 3
              }
            }
          }
        ]}
      >
        <Routes>
          <Route path="/" element={<ListingsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'Portland',
          minPrice: 300000,
          limit: 20,
          offset: 40
        })
      );
    });
  });
});
