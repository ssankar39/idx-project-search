import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchProperties } from '../api/client';
import PropertyFilters from '../components/PropertyFilters';
import Pagination from '../components/Pagination';
import PropertyCard from '../components/PropertyCard';
import { useFavorites } from '../hooks/useFavorites';
import './ListingsPage.css';

function ListingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const listingState = location.state?.listingsState;

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(listingState?.filters || {});
  const [currentPage, setCurrentPage] = useState(listingState?.currentPage || 1);
  const [itemsPerPage] = useState(20);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentPage]);

  async function loadProperties() {
    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * itemsPerPage;
      const params = { ...filters, limit: itemsPerPage, offset };
      const data = await fetchProperties(params);

      setProperties(data.results);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handlePropertyClick = (listingId, selectedProperty) => {
    if (!listingId) {
      return;
    }

    navigate(`/property/${listingId}`, {
      state: {
        selectedProperty,
        listingsState: {
          filters,
          currentPage
        }
      }
    });
  };

  const totalPages = Math.ceil(total / itemsPerPage);

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
          <p className="results-summary">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-
            {Math.min(currentPage * itemsPerPage, total)} of {total.toLocaleString()} properties
          </p>

          {properties.length === 0 ? (
            <div className="no-results">
              No properties found matching your criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="property-grid">
              {properties.map(property => (
                <PropertyCard
                  key={property.L_ListingID || property.ListingId}
                  property={property}
                  onNavigate={handlePropertyClick}
                  favorite={isFavorite(property.L_ListingID || property.ListingId)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {properties.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ListingsPage;
