import React, { useState, useEffect, useCallback } from 'react';
import { fetchProperties } from '../api/client';
import PropertyFilters from '../components/PropertyFilters';
import './ListingsPage.css';

function ListingsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { ...filters, limit: 20, offset: 0 };
      const data = await fetchProperties(params);

      setProperties(data.results);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="listings-page">
      <h1>Property Listings</h1>

      <PropertyFilters onSearch={handleSearch} />

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading properties...</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          <p>Showing {properties.length} of {total} properties</p>

          {properties.length === 0 ? (
            <div className="no-results">
              No properties found matching your criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="property-grid">
              {properties.map(property => (
                <PropertyCard key={property.L_ListingID} property={property} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PropertyCard({ property }) {
  let photoUrl = null;
  if (property.L_Photos) {
    try {
      const photos = JSON.parse(property.L_Photos);
      photoUrl = photos[0] || null;
    } catch {
      photoUrl = null;
    }
  }

  return (
    <div className="property-card">
      <div className="property-image">
        {photoUrl ? (
          <img src={photoUrl} alt={property.L_Address} />
        ) : (
          <div className="no-image">No image available</div>
        )}
      </div>

      <div className="property-info">
        <div className="price">${property.L_SystemPrice?.toLocaleString()}</div>
        <div className="address">{property.L_Address}</div>
        <div className="city">{property.L_City}, {property.L_State}</div>

        <div className="property-details">
          <span>{property.LM_Int2_3} beds</span>
          <span>•</span>
          <span>{property.BathroomsHalf} baths</span>
          {property.LM_Dec_3 && (
            <>
              <span>•</span>
              <span>{Number(property.LM_Dec_3).toLocaleString()} sqft</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListingsPage;
