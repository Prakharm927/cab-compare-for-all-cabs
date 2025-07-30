import React, { useEffect, useRef, useState } from 'react';

/**
 * A lightweight wrapper around the Google Places Autocomplete widget.
 *
 * Props:
 *  - placeholder: string shown in the input
 *  - onSelect(address, place): callback when a place is selected from suggestions
 *  - disabled: boolean
 */
export default function AutocompleteInput({ placeholder, onSelect, disabled = false, loaded = true }) {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!loaded || !window.google || !window.google.maps || !window.google.maps.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      // formatted_address is more user friendly; if absent use input value
      const address = place.formatted_address || place.name || value;
      setValue(address);
      if (onSelect) onSelect(address, place);
    });
  }, [loaded]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}
    />
  );
}
