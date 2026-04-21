import React from 'react';
import PropTypes from 'prop-types';
import { formatNumber, formatPrice } from '../utils/formatting';
import './PropertyCard.css';

function parsePhotoUrl(photosJson) {
  if (!photosJson) {
    return null;
  }

  try {
    const photos = JSON.parse(photosJson);
    return photos[0] || null;
  } catch {
    return null;
  }
}

function PropertyCard({ property, onNavigate, favorite, onToggleFavorite }) {
  const listingId = property.L_ListingID || property.ListingId;
  const photoUrl = parsePhotoUrl(property.L_Photos);

  const handleClick = () => {
    onNavigate(listingId, property);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onNavigate(listingId, property);
    }
  };

  const handleFavoriteClick = (event) => {
    event.stopPropagation();
    onToggleFavorite(listingId);
  };

  const handleFavoriteKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.stopPropagation();
    }
  };

  return (
    <div
      className="property-card"
      onClick={handleClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${property.L_Address}`}
    >
      <button
        type="button"
        className={`favorite-btn ${favorite ? 'active' : ''}`}
        onClick={handleFavoriteClick}
        onKeyDown={handleFavoriteKeyDown}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {favorite ? '❤' : '♡'}
      </button>

      <div className="property-image">
        {photoUrl ? (
          <img src={photoUrl} alt={property.L_Address} />
        ) : (
          <div className="no-image">No image available</div>
        )}
      </div>

      <div className="property-info">
        <div className="price">{formatPrice(property.L_SystemPrice)}</div>
        <div className="address">{property.L_Address}</div>
        <div className="city">{property.L_City}, {property.L_State}</div>

        <div className="property-details">
          <span>{property.LM_Dec_3} beds</span>
          <span>•</span>
          <span>{property.BathroomsHalf} baths</span>
          {property.LM_Int2_3 && (
            <>
              <span>•</span>
              <span>{formatNumber(property.LM_Int2_3)} sqft</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

PropertyCard.propTypes = {
  property: PropTypes.shape({
    ListingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    L_ListingID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    L_Address: PropTypes.string,
    L_City: PropTypes.string,
    L_State: PropTypes.string,
    L_SystemPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    LM_Int2_3: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    BathroomsHalf: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    LM_Dec_3: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    L_Photos: PropTypes.string
  }).isRequired,
  onNavigate: PropTypes.func.isRequired,
  favorite: PropTypes.bool.isRequired,
  onToggleFavorite: PropTypes.func.isRequired
};

export default PropertyCard;
