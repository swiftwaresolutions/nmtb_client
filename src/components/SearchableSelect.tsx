import React, { useState, useRef, useEffect } from 'react';
import { Form } from 'react-bootstrap';

interface Option {
  value: string | number;
  label: string;
  isBlocked?: boolean;
  isStore?: boolean;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'lg';
  disabled?: boolean;
  id?: string;
  tabIndex?: number;
  onSearch?: (searchTerm: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  autoFocus?: boolean;
  onEnterWhenClosed?: () => void;
  keepSearchOnBlur?: boolean;
  searchValue?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  size,
  disabled = false,
  id,
  tabIndex,
  onSearch,
  inputRef,
  autoFocus,
  onEnterWhenClosed,
  keepSearchOnBlur = false,
  searchValue,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pendingAutoSelectRef = useRef(false);
  const userTypedRef = useRef(false);
  const handleOptionSelectStableRef = useRef<(option: Option) => void>(() => {});

  useEffect(() => {
    if (isOpen) return;
    
    // If searchValue is provided externally, use it
    if (searchValue !== undefined) {
      setSearchTerm(searchValue);
      return;
    }
    
    const selectedOption = options.find(opt => opt.value.toString() === value);
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
    } else if (!keepSearchOnBlur) {
      setSearchTerm('');
    }
  }, [value, options, isOpen, keepSearchOnBlur, searchValue]);

  useEffect(() => {
    if (isOpen && searchTerm) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [options]);

  // Keep keyboard highlight stable when option list updates (including async search results)
  useEffect(() => {
    itemRefs.current = [];

    if (!isOpen) {
      setHighlightedIndex(-1);
      pendingAutoSelectRef.current = false;
      return;
    }

    if (filteredOptions.length === 0) {
      setHighlightedIndex(-1);
      return;
    }

    // Auto-select first result when Enter was pressed before async results arrived
    if (pendingAutoSelectRef.current) {
      pendingAutoSelectRef.current = false;
      handleOptionSelectStableRef.current(filteredOptions[0]);
      return;
    }

    setHighlightedIndex((prev) => {
      if (prev < 0 || prev >= filteredOptions.length) {
        return 0;
      }
      return prev;
    });
  }, [filteredOptions, isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const selectedOption = options.find(opt => opt.value.toString() === value);
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else if (!keepSearchOnBlur) {
          setSearchTerm('');
        }
        // If keepSearchOnBlur is true, preserve the current searchTerm
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options, keepSearchOnBlur]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const dropdownHeight = 200;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    userTypedRef.current = true;
    pendingAutoSelectRef.current = false;
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredOptions(filtered);
    setHighlightedIndex(filtered.length > 0 ? 0 : -1);

    if (onSearch) {
      onSearch(term.trim());
    }
  };

  const handleOptionSelect = (option: Option) => {
    onChange(option.value.toString());
    setSearchTerm(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
    userTypedRef.current = false;
    pendingAutoSelectRef.current = false;
  };
  // Keep a stable ref so effects can always call the latest version
  handleOptionSelectStableRef.current = handleOptionSelect;

  const handleInputFocus = (e: React.FocusEvent<HTMLElement>) => {
    setIsOpen(true);
    userTypedRef.current = false;
    const selectedOption = options.find(opt => opt.value.toString() === value);
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
      // Select all text so user can immediately type a new value
      (e.target as HTMLInputElement).select();
    }
    // If no value selected, preserve whatever the user has typed (don't clear)
    setFilteredOptions(options);
    setHighlightedIndex(options.length > 0 ? 0 : -1);
  };

  const handleInputBlur = () => {
    pendingAutoSelectRef.current = false;
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
      const selectedOption = options.find(opt => opt.value.toString() === value);
      if (selectedOption) {
        setSearchTerm(selectedOption.label);
      }
      // If no value selected, preserve typed text (don't clear) - matches ProcedureBilling behavior
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        if (filteredOptions.length > 0) {
          setHighlightedIndex(e.key === 'ArrowUp' ? filteredOptions.length - 1 : 0);
        }
        e.preventDefault();
        return;
      }
      if (e.key === 'Enter' && onEnterWhenClosed) {
        e.preventDefault();
        onEnterWhenClosed();
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (filteredOptions.length === 0) {
          // Options not yet loaded (async search in flight) — queue auto-select for when results arrive
          if (searchTerm.length >= 2) {
            pendingAutoSelectRef.current = true;
          }
          return;
        }
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        } else {
          handleOptionSelect(filteredOptions[0]);
        }
        break;

      case 'Tab':
        // Only select an option if the user actively typed something;
        // otherwise just close and let the browser advance focus naturally.
        if (filteredOptions.length > 0 && userTypedRef.current) {
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          } else {
            handleOptionSelect(filteredOptions[0]);
          }
        } else {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;

      default:
        break;
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <Form.Control
        ref={inputRef}
        type="text"
        size={size}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        autoFocus={autoFocus}
        id={id}
        tabIndex={tabIndex}
        className="searchable-select-input"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
      />
      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          role="listbox"
          style={{
            position: 'absolute',
            ...(dropdownPosition === 'bottom'
              ? { top: '100%', marginTop: '2px' }
              : { bottom: '100%', marginBottom: '2px' }
            ),
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ced4da',
            borderRadius: '0.25rem',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              ref={el => { itemRefs.current[index] = el; }}
              role="option"
              aria-selected={option.value.toString() === value}
              style={{
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: size === 'sm' ? '0.875rem' : '1rem',
                backgroundColor:
                  index === highlightedIndex
                    ? option.isBlocked
                      ? '#ffe0b2'
                      : option.isStore
                      ? 'var(--color-warning)'
                      : '#d0e8ff'
                    : option.isBlocked
                    ? '#fff8e1'
                    : option.isStore
                    ? 'rgba(255, 193, 7, 0.12)'
                    : option.value.toString() === value
                    ? '#e9ecef'
                    : 'white',
                borderLeft: option.isBlocked
                  ? '3px solid #ff9800'
                  : option.isStore
                  ? '3px solid var(--color-warning)'
                  : undefined,
              }}
              onMouseDown={() => handleOptionSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseLeave={() => setHighlightedIndex(-1)}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span>{option.label}</span>
                {option.isBlocked && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#e65100',
                    backgroundColor: '#ffe0b2',
                    border: '1px solid #ff9800',
                    borderRadius: '3px',
                    padding: '1px 5px',
                    whiteSpace: 'nowrap',
                  }}>Blocked</span>
                )}
                {option.isStore && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    backgroundColor: 'var(--color-warning)',
                    border: '1px solid var(--color-warning)',
                    borderRadius: '3px',
                    padding: '1px 5px',
                    whiteSpace: 'nowrap',
                  }}>Store</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;



