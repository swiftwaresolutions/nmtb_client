import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { Search, XCircle } from "react-bootstrap-icons";

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
  showResultCount?: boolean;
  className?: string;
}

/**
 * Reusable search input component with clear button and result counter
 * @param searchTerm - Current search term value
 * @param onSearchChange - Callback when search term changes
 * @param placeholder - Optional placeholder text (default: "Search...")
 * @param resultCount - Number of filtered results
 * @param totalCount - Total number of items
 * @param showResultCount - Whether to show result count (default: true)
 * @param className - Optional additional CSS classes
 *
 * @example
 * <SearchInput
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   placeholder="Search tests..."
 *   resultCount={filteredTests.length}
 *   totalCount={allTests.length}
 * />
 */
const SearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  resultCount,
  totalCount,
  showResultCount = true,
  className = "",
}) => {
  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <InputGroup style={{ maxWidth: "400px" }}>
        <InputGroup.Text>
          <Search size={16} />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <InputGroup.Text
            onClick={handleClear}
            style={{ cursor: "pointer" }}
            title="Clear search"
          >
            <XCircle size={16} />
          </InputGroup.Text>
        )}
      </InputGroup>

      {showResultCount &&
        resultCount !== undefined &&
        totalCount !== undefined && (
          <small className="text-muted" style={{ fontSize: '1.0rem', opacity: 0.65, marginRight: '6px', fontWeight: 'var(--font-weight-medium)', whiteSpace: 'nowrap' }}>
            {searchTerm ? (
              <span style={{ fontWeight: '400' }}>
                Showing <strong>{resultCount}</strong> of {totalCount} results
              </span>
            ) : (
              <span style={{ fontWeight: 'var(--font-weight-normal)' }}>Total: <strong>{totalCount}</strong></span>
            )}
          </small>
        )}
    </div>
  );
};

export default SearchInput;
