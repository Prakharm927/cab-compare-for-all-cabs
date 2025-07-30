import { useState, useEffect } from 'react';

// Reads API key from environment variable. Define REACT_APP_GOOGLE_MAPS_API_KEY in your .env file.
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

function loadGoogleMapsScript(onLoad, onError) {
  if (typeof window === 'undefined') return;

  // If Google Maps API is already loaded, call onLoad immediately
  if (window.google && window.google.maps) {
    onLoad();
    return;
  }

  // Check if the script tag is already present
  let script = document.querySelector('script[data-google-maps]');

  if (!script) {
    // Create the script tag if it does not exist
    script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-google-maps', 'true');
    document.head.appendChild(script);
  }

  // Attach load and error listeners only once
  script.addEventListener('load', onLoad, { once: true });
  script.addEventListener('error', onError, { once: true });
}

export default function useGoogleMaps() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is missing. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file.');
      return;
    }

    loadGoogleMapsScript(
      () => setLoaded(true),
      () => setError('Failed to load Google Maps JavaScript API')
    );

    // Cleanup function to remove event listeners if component unmounts
    return () => {
      const script = document.querySelector('script[data-google-maps]');
      if (script) {
        script.removeEventListener('load', () => setLoaded(true));
        script.removeEventListener('error', () => setError('Failed to load Google Maps JavaScript API'));
      }
    };
  }, []);

  return { loaded, error };
}
