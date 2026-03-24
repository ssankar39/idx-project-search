import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchPropertyDetail, fetchOpenHouses } from '../api/client';
import { useFavorites } from '../hooks/useFavorites';
import './PropertyDetailPage.css';

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

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

function formatOpenHouseTime(value) {
  if (!value) {
    return '';
  }

  const asString = String(value);
  if (asString.includes(':') && !asString.includes('T')) {
    return asString;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return asString;
  }

  return parsedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function normalizePropertyData(payload) {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  if (Array.isArray(payload.results)) {
    return payload.results[0] || null;
  }

  if (payload.property) {
    return normalizePropertyData(payload.property);
  }

  if (payload.data) {
    return normalizePropertyData(payload.data);
  }

  return payload;
}

function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState(null);
  const [openHouses, setOpenHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    loadPropertyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadPropertyData() {
    try {
      setLoading(true);
      setError(null);

      const [propertyData, openHousesData] = await Promise.all([
        fetchPropertyDetail(id),
        fetchOpenHouses(id)
      ]);

      setProperty(normalizePropertyData(propertyData));
      setOpenHouses(openHousesData.openhouses || openHousesData || []);
    } catch (err) {
      setError(err.message || 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  }

  const listingState = location.state?.listingsState;
  const selectedProperty = location.state?.selectedProperty;
  const handleBack = () => {
    if (location.state?.from === 'favorites') {
      navigate('/favorites');
      return;
    }

    if (listingState) {
      navigate('/', {
        state: {
          listingsState: listingState
        }
      });
      return;
    }

    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading property details...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={handleBack} className="btn-back">
          Back to Listings
        </button>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const price = firstDefined(property.L_SystemPrice, selectedProperty?.L_SystemPrice);
  const address = firstDefined(property.L_Address, selectedProperty?.L_Address);
  const city = firstDefined(property.L_City, selectedProperty?.L_City);
  const state = firstDefined(property.L_State, selectedProperty?.L_State);
  const postalCode = firstDefined(property.L_Zip, selectedProperty?.L_Zip);
  const bedrooms = property.LM_Int2_3;
  const bathrooms = property.BathroomsHalf;
  const livingArea = property.LM_Dec_3;
  const yearBuilt = property.YearBuilt;
  const propertyType = property.L_Type_;
  const propertySubType = firstDefined(property.PropertySubTypeAdditional, property.StructureType);
  const lotSizeAcres = property.LotSizeAcres;
  const parkingTotal = property.OpenParkingSpaces;
  const description = property.L_Remarks;
  const listingId = firstDefined(property.L_ListingID, selectedProperty?.L_ListingID, selectedProperty?.ListingId);
  const standardStatus = firstDefined(property.StandardStatus, property.L_Status);
  const listingContractDate = property.ListingContractDate;
  const imageUrl = parsePhotoUrl(property);
  const favorite = isFavorite(listingId);

  const handleFavoriteClick = () => {
    toggleFavorite(listingId);
  };

  return (
    <div className="property-detail-page">
      <div className="detail-page-actions">
        <button onClick={handleBack} className="btn-back" type="button">
          Back to Listings
        </button>
        <button
          type="button"
          className={`favorite-detail-btn ${favorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {favorite ? '❤ Favorited' : '♡ Add to Favorites'}
        </button>
      </div>

      <div className="property-header">
        <h1>{price ? `$${Number(price).toLocaleString()}` : 'Price unavailable'}</h1>
        <p className="property-address">{address || 'Address unavailable'}</p>
        <p className="property-location">
          {city}, {state} {postalCode}
        </p>
      </div>

      <div className="property-image-main">
        {imageUrl ? (
          <img src={imageUrl} alt={address} />
        ) : (
          <div className="no-image">No image available</div>
        )}
      </div>

      <div className="property-content">
        <div className="property-main">
          <div className="property-stats">
            <div className="stat">
              <div className="stat-value">{bedrooms ?? 'N/A'}</div>
              <div className="stat-label">Bedrooms</div>
            </div>
            <div className="stat">
              <div className="stat-value">{bathrooms ?? 'N/A'}</div>
              <div className="stat-label">Bathrooms</div>
            </div>
            {livingArea && (
              <div className="stat">
                <div className="stat-value">{Number(livingArea).toLocaleString()}</div>
                <div className="stat-label">Sq Ft</div>
              </div>
            )}
            {yearBuilt && (
              <div className="stat">
                <div className="stat-value">{yearBuilt}</div>
                <div className="stat-label">Year Built</div>
              </div>
            )}
          </div>

          <div className="property-section">
            <h2>Property Details</h2>
            <div className="detail-grid">
              {propertyType && (
                <div className="detail-item">
                  <span className="detail-label">Property Type:</span>
                  <span className="detail-value">{propertyType}</span>
                </div>
              )}
              {propertySubType && (
                <div className="detail-item">
                  <span className="detail-label">Property Subtype:</span>
                  <span className="detail-value">{propertySubType}</span>
                </div>
              )}
              {lotSizeAcres && (
                <div className="detail-item">
                  <span className="detail-label">Lot Size:</span>
                  <span className="detail-value">{lotSizeAcres} acres</span>
                </div>
              )}
              {parkingTotal && (
                <div className="detail-item">
                  <span className="detail-label">Parking Spaces:</span>
                  <span className="detail-value">{parkingTotal}</span>
                </div>
              )}
            </div>
          </div>

          {description && (
            <div className="property-section">
              <h2>Description</h2>
              <p className="property-description">{description}</p>
            </div>
          )}
        </div>

        <div className="property-sidebar">
          <div className="open-houses-section">
            <h3>Open Houses</h3>
            {openHouses.length > 0 ? (
              <div className="open-houses-list">
                {openHouses.map((oh, index) => {
                  const openHouseDate = oh.OpenHouseDate;
                  const startTime = oh.OH_StartTime;
                  const endTime = oh.OH_EndTime;

                  return (
                    <div key={index} className="open-house-item">
                      <div className="oh-date">
                        {openHouseDate
                          ? new Date(openHouseDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Date unavailable'}
                      </div>
                      <div className="oh-time">
                        {formatOpenHouseTime(startTime)} - {formatOpenHouseTime(endTime)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-open-houses">No open houses scheduled</p>
            )}
          </div>

          <div className="listing-info-section">
            <h3>Listing Information</h3>
            <div className="listing-info">
              {listingId && (
                <div className="info-item">
                  <span className="info-label">MLS #:</span>
                  <span className="info-value">{listingId}</span>
                </div>
              )}
              {standardStatus && (
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className="info-value">{standardStatus}</span>
                </div>
              )}
              {listingContractDate && (
                <div className="info-item">
                  <span className="info-label">Listed:</span>
                  <span className="info-value">
                    {new Date(listingContractDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailPage;
