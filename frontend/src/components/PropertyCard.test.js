import { render, screen, fireEvent } from '@testing-library/react';
import PropertyCard from './PropertyCard';

const baseProperty = {
  L_ListingID: 'ABC123',
  L_Address: '100 Main St',
  L_City: 'Portland',
  L_State: 'OR',
  L_SystemPrice: 500000,
  LM_Int2_3: 3,
  BathroomsHalf: 2,
  LM_Dec_3: 1800,
  L_Photos: JSON.stringify(['https://example.com/photo.jpg'])
};

describe('PropertyCard', () => {
  test('renders key property details', () => {
    render(
      <PropertyCard
        property={baseProperty}
        onNavigate={jest.fn()}
        favorite={false}
        onToggleFavorite={jest.fn()}
      />
    );

    expect(screen.getByText('100 Main St')).toBeInTheDocument();
    expect(screen.getByText('Portland, OR')).toBeInTheDocument();
    expect(screen.getByText('$500,000')).toBeInTheDocument();
    expect(screen.getByText('3 beds')).toBeInTheDocument();
    expect(screen.getByText('2 baths')).toBeInTheDocument();
    expect(screen.getByAltText('100 Main St')).toBeInTheDocument();
  });

  test('calls onNavigate when card is clicked', () => {
    const onNavigate = jest.fn();
    render(
      <PropertyCard
        property={baseProperty}
        onNavigate={onNavigate}
        favorite={false}
        onToggleFavorite={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /view details for 100 main st/i }));

    expect(onNavigate).toHaveBeenCalledWith('ABC123', baseProperty);
  });

  test('calls onNavigate on Enter key press', () => {
    const onNavigate = jest.fn();
    render(
      <PropertyCard
        property={baseProperty}
        onNavigate={onNavigate}
        favorite={false}
        onToggleFavorite={jest.fn()}
      />
    );

    fireEvent.keyDown(screen.getByRole('button', { name: /view details for 100 main st/i }), {
      key: 'Enter'
    });

    expect(onNavigate).toHaveBeenCalledWith('ABC123', baseProperty);
  });

  test('toggles favorite without triggering navigation', () => {
    const onNavigate = jest.fn();
    const onToggleFavorite = jest.fn();

    render(
      <PropertyCard
        property={baseProperty}
        onNavigate={onNavigate}
        favorite={false}
        onToggleFavorite={onToggleFavorite}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));

    expect(onToggleFavorite).toHaveBeenCalledWith('ABC123');
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test('renders fallback when photos JSON is invalid', () => {
    render(
      <PropertyCard
        property={{ ...baseProperty, L_Photos: 'not-json' }}
        onNavigate={jest.fn()}
        favorite
        onToggleFavorite={jest.fn()}
      />
    );

    expect(screen.getByText(/no image available/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
  });
});
