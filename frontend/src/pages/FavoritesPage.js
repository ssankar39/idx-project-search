import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPropertyDetail } from '../api/client';
import { useFavorites } from '../hooks/useFavorites';
import './FavoritesPage.css';

function parsePhotoUrl(property) {
  if (!property?.L_Photos) {
    return null;
  }

  try {
    const photos = JSON.parse(property.L_Photos);
    return photos[0] || null;
  } catch {
    return null;
  }
}

function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      if (favorites.length === 0) {
        setProperties([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const propertyResults = await Promise.all(
          favorites.map(async (listingId) => {
            try {
              return await fetchPropertyDetail(listingId);
            } catch {
              return null;
            }
          })
        );

        if (!isMounted) {
          return;
        }

        setProperties(propertyResults.filter(Boolean));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError('Failed to load favorite properties. Please try again.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [favorites]);

  const handlePropertyClick = (property) => {
    const listingId = property.L_ListingID || property.ListingId;
    if (!listingId) {
      return;
    }

    navigate(`/property/${listingId}`, {
      state: {
        from: 'favorites',
        selectedProperty: property
      }
    });
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <h1>Favorite Properties</h1>
        <div className="loading">Loading favorites...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-page">
        <h1>Favorite Properties</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1>Favorite Properties</h1>

      {favorites.length === 0 ? (
        <div className="no-results">You have no favorites yet. Save properties from the listings page.</div>
      ) : (
        <>
          <p className="results-summary">Showing {properties.length} favorite properties</p>
          <div className="property-grid">
            {properties.map((property) => {
              const listingId = property.L_ListingID || property.ListingId;
              const photoUrl = parsePhotoUrl(property);
              const favorite = isFavorite(listingId);

              return (
                <div
                  key={listingId}
                  className="property-card"
                  onClick={() => handlePropertyClick(property)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handlePropertyClick(property);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${property.L_Address || 'property'}`}
                >
                  <button
                    type="button"
                    className={`favorite-btn ${favorite ? 'active' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(listingId);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.stopPropagation();
                      }
                    }}
                    aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favorite ? '❤' : '♡'}
                  </button>

                  <div className="property-image">
                    {photoUrl ? (
                      <img src={photoUrl} alt={property.L_Address || 'Property photo'} />
                    ) : (
                      <div className="no-image">No image available</div>
                    )}
                  </div>

                  <div className="property-info">
                    <div className="price">${property.L_SystemPrice?.toLocaleString()}</div>
                    <div className="address">{property.L_Address}</div>
                    <div className="city">{property.L_City}, {property.L_State}</div>

                    <div className="property-details">
                      <span>{property.LM_Dec_3} beds</span>
                      <span>•</span>
                      <span>{property.BathroomsHalf} baths</span>
                      {property.LM_Int2_3 && (
                        <>
                          <span>•</span>
                          <span>{Number(property.LM_Int2_3).toLocaleString()} sqft</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default FavoritesPage;
