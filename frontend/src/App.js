import React from 'react';
import { BrowserRouter, NavLink, Routes, Route } from 'react-router-dom';
import ListingsPage from './pages/ListingsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="App">
          <nav className="app-tabs" aria-label="Primary">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `app-tab ${isActive ? 'active' : ''}`}
            >
              Listings
            </NavLink>
            <NavLink
              to="/favorites"
              className={({ isActive }) => `app-tab ${isActive ? 'active' : ''}`}
            >
              Favorites
            </NavLink>
          </nav>

          <Routes>
            <Route path="/" element={<ListingsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
