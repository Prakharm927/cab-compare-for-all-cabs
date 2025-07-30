import React, { useState, useEffect } from 'react';
import useGoogleMaps from './hooks/useGoogleMaps';


import { FiClock, FiDollarSign, FiAward, FiNavigation, FiSearch, FiMapPin } from 'react-icons/fi';
import AutocompleteInput from './components/AutocompleteInput';


const CabList = () => {
  const [fares, setFares] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load Google Maps JavaScript API
  const { loaded: mapsLoaded, error: mapsError } = useGoogleMaps();

  useEffect(() => {
    if (mapsError) {
      setError(mapsError);
    }
  }, [mapsError]);

  

  const cabServices = [
    { name: 'Uber', baseFare: 45, perKm: 11, perMin: 0.9, deeplink: (o,d)=>`https://m.uber.com/ul/?action=setPickup&pickup=${encodeURIComponent(o)}&dropoff[formatted_address]=${encodeURIComponent(d)}` },
    { name: 'Ola', baseFare: 60, perKm: 14, perMin: 1.2, deeplink: (o,d)=>`https://book.olacabs.com/?pickup=${encodeURIComponent(o)}&drop=${encodeURIComponent(d)}` },
    { name: 'Rapido', baseFare: 20, perKm: 9, perMin: 0.5, deeplink: (o,d)=>`https://apps.rapido.bike/?pickup=${encodeURIComponent(o)}&drop=${encodeURIComponent(d)}` },
    { name: 'Namma Yatri', baseFare: 40, perKm: 10, perMin: 0.8, deeplink: (o,d)=>`https://app.nammayatri.in/?pickup=${encodeURIComponent(o)}&drop=${encodeURIComponent(d)}` },
    { name: 'BluSmart', baseFare: 50, perKm: 12, perMin: 1, deeplink: (o,d)=>`https://ride.blusmart.com/?pickup=${encodeURIComponent(o)}&drop=${encodeURIComponent(d)}` }
  ];

  const calculateFares = (distanceValue, durationValue, origin, dest) => {
    const km = distanceValue / 1000;
    const mins = durationValue / 60;

    return cabServices.map(cab => ({
      cabName: cab.name,
      fare: Math.round(cab.baseFare + (cab.perKm * km) + (cab.perMin * mins)),
      link: cab.deeplink ? cab.deeplink(origin,dest) : '#',
      estimatedTime: `${Math.ceil(mins)} mins`,
      distance: `${km.toFixed(1)} km`
    }));
  };

  const getDistanceMatrix = () => {
    if (!source || !destination) {
      setError('Please enter both locations');
      return;
    }

    setLoading(true);
    setError(null);
    setFares([]);
    setDistance(null);
    setDuration(null);

    if (!mapsLoaded) {
      setError('Google Maps JavaScript API is still loading. Please try again in a moment.');
      setLoading(false);
      return;
    }

    if (!window.google || !window.google.maps) {
      setError('Google Maps JavaScript API not loaded.');
      setLoading(false);
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
      {
        origins: [source],
        destinations: [destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        setLoading(false);
        if (status === 'OK') {
          const element = response.rows[0].elements[0];
          if (element.status === 'OK') {
            setDistance(element.distance.value);
            setDuration(element.duration.value);
            const calculatedFares = calculateFares(element.distance.value, element.duration.value, source, destination);
            setFares(calculatedFares.sort((a,b)=>a.fare-b.fare));
          } else {
            setError('Could not calculate route between these locations');
          }
        } else {
          setError('Error fetching distance data: ' + status);
        }
      }
    );
  };

  const lowestFare = fares.length > 0 ? Math.min(...fares.map(fare => fare.fare)) : null;

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', color: '#1e40af', marginBottom: '25px' }}>
        <FiMapPin style={{ marginRight: '10px' }} /> Cab Fare Comparison
      </h1>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'10px'}}>
        <input type="checkbox" id="refreshToggle" checked={autoRefresh} onChange={()=>setAutoRefresh(!autoRefresh)} style={{marginRight:'8px'}} />
        <label htmlFor="refreshToggle" style={{cursor:'pointer'}}>Auto-refresh fares every 60 s</label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Pickup Location</label>
          <AutocompleteInput
             placeholder="Enter pickup location"
             onSelect={(addr)=>setSource(addr)}
             loaded={mapsLoaded}
           />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Drop Location</label>
          <AutocompleteInput
             placeholder="Enter your drop location"
             onSelect={(addr)=>setDestination(addr)}
             loaded={mapsLoaded}
           />
        </div>
      </div>

      <button
        onClick={getDistanceMatrix}
        disabled={loading || !source || !destination || !mapsLoaded}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontWeight: '600',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Calculating...' : (<><FiSearch style={{ marginRight: '8px' }} /> Compare Fares</>)}
      </button>

      {error && <div style={{ padding: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '5px', marginBottom: '20px', border: '1px solid #fca5a5' }}>{error}</div>}

      {distance && duration && (
        <div style={{ backgroundColor: '#e0f2fe', padding: '10px', borderRadius: '5px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <div><strong>Distance:</strong> {(distance / 1000).toFixed(1)} km</div>
          <div><strong>Duration:</strong> {Math.ceil(duration / 60)} mins</div>
        </div>
      )}

      <h2 style={{ marginBottom: '15px', color: '#374151', display: 'flex', alignItems: 'center' }}>
        <FiDollarSign style={{ marginRight: '8px' }} /> Fare Results:
      </h2>

      {loading && fares.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Calculating fares...</div>
      ) : fares.length > 0 ? (
        fares.map((fare) => {
          const isBestDeal = fare.fare === lowestFare;
          return (
            <div key={fare.cabName} style={{
              backgroundColor: isBestDeal ? '#ecfdf5' : 'white',
              borderLeft: `4px solid ${isBestDeal ? '#10b981' : '#3b82f6'}`,
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ margin: 0, fontWeight: '600' }}>{fare.cabName}</h3>
                  {isBestDeal && (
                    <span style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      marginLeft: '10px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <FiAward style={{ marginRight: '5px' }} /> Best Deal
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FiDollarSign style={{ marginRight: '5px', color: '#6b7280' }} />
                    <span style={{ color: isBestDeal ? '#10b981' : '#1f2937', fontWeight: '600', fontSize: '18px' }}>₹{fare.fare}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FiClock style={{ marginRight: '5px', color: '#6b7280' }} />
                    {fare.estimatedTime}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <FiMapPin style={{ marginRight: '5px', color: '#6b7280' }} />
                    {fare.distance}
                  </span>
                </div>
              </div>
              <a
                 href={fare.link}
                 target="_blank"
                 rel="noreferrer"
                 style={{ textDecoration:'none', background:'none', border:'none', color:'#3b82f6', display:'flex', alignItems:'center', cursor:'pointer' }}
               >
                 <FiNavigation style={{ marginRight: '5px' }} /> Book
               </a>
            </div>
          );
        })
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '5px' }}>
          Enter pickup & drop locations to see results
        </div>
      )}
    </div>
  );
};

export default CabList;
