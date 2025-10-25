'use client';

import { useState, useRef, useEffect } from 'react';
import type { Country } from '@/types/pornstar';

interface CountrySelectProps {
  countries: Country[];
  value: number | undefined;
  onChange: (countryId: number | undefined) => void;
  placeholder?: string;
  className?: string;
}

export default function CountrySelect({
  countries,
  value,
  onChange,
  placeholder = 'Select a country',
  className = '',
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = countries.find((c) => c.id === value);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredCountries.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          onChange(filteredCountries[highlightedIndex].id);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
    }
  };

  const handleSelect = (countryId: number) => {
    onChange(countryId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="relative w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-left text-zinc-900 focus-within:border-zinc-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent outline-none"
            placeholder="Type to search..."
          />
        ) : (
          <div className="flex items-center justify-between">
            <span className={selectedCountry ? '' : 'text-zinc-400 dark:text-zinc-500'}>
              {selectedCountry ? selectedCountry.name : placeholder}
            </span>
            <div className="flex items-center gap-2">
              {selectedCountry && (
                <button
                  onClick={handleClear}
                  className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  ✕
                </button>
              )}
              <svg
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-700">
          {filteredCountries.length === 0 ? (
            <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">No countries found</div>
          ) : (
            <ul className="py-1">
              {filteredCountries.map((country, index) => (
                <li
                  key={country.id}
                  onClick={() => handleSelect(country.id)}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    index === highlightedIndex
                      ? 'bg-zinc-100 dark:bg-zinc-600'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-600'
                  } ${
                    country.id === value
                      ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-600 dark:text-zinc-50'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {country.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
