import React from 'react';
import './SearchBar.css';

/**
 * SearchBar Component
 * 
 * Props:
 * - value (string): Search query text.
 * - onChange (function): text input update trigger.
 * - placeholder (string): Hint details.
 */
const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
