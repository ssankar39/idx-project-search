import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import PropertyDetailPage from './PropertyDetailPage';
import { fetchPropertyDetail, fetchOpenHouses } from '../api/client';

jest.mock('../api/client', () => ({
  fetchPropertyDetail: jest.fn(),
  fetchOpenHouses: jest.fn()
}));

function LocationStateViewer() {
  const location = useLocation();
  return (
    <>
      <div data-testid="current-path">{location.pathname}</div>
      <div data-testid="current-state">{JSON.stringify(location.state || {})}</div>
    </>
  );
}

describe('PropertyDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('shows loading then renders detail fields and open house data', async () => {
    fetchPropertyDetail.mockResolvedValueOnce({
      L_ListingID: 'ABC123',
      L_SystemPrice: 500000,
      L_Address: '100 Main St',
      L_City: 'Portland',
      L_State: 'OR',
      L_Zip: '97201',
      LM_Int2_3: 1800,
      BathroomsHalf: 2,
      LM_Dec_3: 3,
      YearBuilt: 2001,
      L_Remarks: 'Beautiful home with updates.',
      L_Photos: '["https://example.com/home.jpg"]'
    });

    fetchOpenHouses.mockResolvedValueOnce({
      openhouses: [
        {
          OpenHouseDate: '2026-03-20',
          OH_StartTime: '10:00 AM',
          OH_EndTime: '1:00 PM'
        }
      ]
    });

    render(
      <MemoryRouter initialEntries={['/property/ABC123']}>
        <Routes>
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading property details/i)).toBeInTheDocument();

    expect(await screen.findByText('$500,000')).toBeInTheDocument();
    expect(screen.getByText('100 Main St')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '100 Main St' })).toBeInTheDocument();
    expect(screen.getByText('Bedrooms')).toBeInTheDocument();
    expect(screen.getByText('Bathrooms')).toBeInTheDocument();
    expect(screen.getByText('Sq Ft')).toBeInTheDocument();
    expect(screen.getByText('Year Built')).toBeInTheDocument();
    expect(screen.getByText('Beautiful home with updates.')).toBeInTheDocument();
    expect(screen.getByText('Open Houses')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM - 1:00 PM')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to listings/i })).toBeInTheDocument();
  });

  test('shows fallback text when no open houses are scheduled', async () => {
    fetchPropertyDetail.mockResolvedValueOnce({
      L_ListingID: 'ABC123',
      L_SystemPrice: 500000,
      L_Address: '100 Main St'
    });
    fetchOpenHouses.mockResolvedValueOnce({ openhouses: [] });

    render(
      <MemoryRouter initialEntries={['/property/ABC123']}>
        <Routes>
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/no open houses scheduled/i)).toBeInTheDocument();
  });

  test('shows error state for invalid property id', async () => {
    fetchPropertyDetail.mockRejectedValueOnce(new Error('Property not found'));
    fetchOpenHouses.mockRejectedValueOnce(new Error('Property not found'));

    render(
      <MemoryRouter initialEntries={['/property/invalid-id']}>
        <Routes>
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/property not found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to listings/i })).toBeInTheDocument();
  });

  test('back button returns to listings and preserves listing state', async () => {
    fetchPropertyDetail.mockResolvedValueOnce({
      L_ListingID: 'ABC123',
      L_SystemPrice: 500000,
      L_Address: '100 Main St'
    });
    fetchOpenHouses.mockResolvedValueOnce({ openhouses: [] });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/property/ABC123',
            state: {
              listingsState: {
                filters: { city: 'Portland' },
                currentPage: 2
              }
            }
          }
        ]}
      >
        <Routes>
          <Route path="/" element={<LocationStateViewer />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('$500,000');
    await userEvent.click(screen.getByRole('button', { name: /back to listings/i }));

    expect(await screen.findByTestId('current-path')).toHaveTextContent('/');

    await waitFor(() => {
      expect(screen.getByTestId('current-state')).toHaveTextContent('Portland');
    });
    expect(screen.getByTestId('current-state')).toHaveTextContent('currentPage');
    expect(screen.getByTestId('current-state')).toHaveTextContent('2');
  });

  test('favorite button loads from storage and toggles', async () => {
    localStorage.setItem('favoriteProperties', JSON.stringify(['ABC123']));

    fetchPropertyDetail.mockResolvedValueOnce({
      L_ListingID: 'ABC123',
      L_SystemPrice: 500000,
      L_Address: '100 Main St'
    });
    fetchOpenHouses.mockResolvedValueOnce({ openhouses: [] });

    render(
      <MemoryRouter initialEntries={['/property/ABC123']}>
        <Routes>
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('$500,000');

    const activeButton = screen.getByRole('button', { name: /remove from favorites/i });
    expect(activeButton).toHaveTextContent(/favorited/i);

    await userEvent.click(activeButton);
    expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('favoriteProperties'))).toEqual([]);
  });
});
