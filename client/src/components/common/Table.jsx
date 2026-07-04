import React from 'react';
import './Table.css';

/**
 * Reusable Table Component
 * 
 * Props:
 * - headers (string[]): Array of header title strings.
 * - children (React.ReactNode): Table rows (`<tr>` elements containing `<td>`).
 * - isEmpty (boolean): Toggles display of empty state message.
 * - isLoading (boolean): Toggles loading skeleton overlay.
 */
const Table = ({ headers = [], children, isEmpty = false, isLoading = false }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} scope="col">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="table-loading">Loading records...</td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="table-empty">No records found.</td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
