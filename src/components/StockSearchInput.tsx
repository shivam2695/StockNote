import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Loader2, Globe } from 'lucide-react';
import { marketService, SearchResult } from '../services/marketService';

interface StockSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function StockSearchInput({
  value,
  onChange,
  onSelect,
  placeholder = "Search stocks...",
  className = "",
  disabled = false
}: StockSearchInputProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for symbols
  const searchSymbols = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await marketService.searchSymbols(query);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Show popular suggestions
  const showPopularSuggestions = () => {
    const popularUS = marketService.getPopularUSStocks().slice(0, 5);
    const popularIndian = marketService.getPopularIndianStocks().slice(0, 5);
    
    const suggestions: SearchResult[] = [
      ...popularUS.map(symbol => ({
        symbol,
        description: `${symbol} - US Stock`,
        displayName: `${symbol} (US)`,
        type: 'US Equity',
        exchange: 'NASDAQ/NYSE'
      })),
      ...popularIndian.map(symbol => ({
        symbol,
        description: `${symbol.replace('.NS', '')} - Indian Stock`,
        displayName: `${symbol.replace('.NS', '')} (NSE)`,
        type: 'Indian Equity',
        exchange: 'NSE'
      }))
    ];
    
    setSearchResults(suggestions);
    setShowSuggestions(true);
    setShowDropdown(true);
    setSelectedIndex(-1);
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (newValue.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      setShowSuggestions(false);
      return;
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchSymbols(newValue);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle selection
  const handleSelect = (result: SearchResult) => {
    onChange(result.symbol);
    setShowDropdown(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onSelect) {
      onSelect(result);
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (value.trim().length === 0) {
      showPopularSuggestions();
    } else if (searchResults.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
          disabled={disabled}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {showSuggestions && (
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Globe className="w-3 h-3" />
                <span>Popular Stocks</span>
              </div>
            </div>
          )}
          
          {searchResults.map((result, index) => (
            <button
              key={`${result.symbol}-${index}`}
              type="button"
              onClick={() => handleSelect(result)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {result.symbol.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{result.symbol}</span>
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    {result.exchange && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {result.exchange}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{result.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}