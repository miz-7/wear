import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { MdMyLocation } from 'react-icons/md';

function CurrentLocationButton() {
  const map = useMap();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (buttonRef.current) {
      L.DomEvent.disableClickPropagation(buttonRef.current);
    }
  }, []);

  const handleLocationClick = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 15, { animate: true });
      },
      () => alert("位置情報を許可してください")
    );
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleLocationClick}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'white',
        border: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <MdMyLocation size={32} color="#4285F4" />
    </button>
  );
}

export default CurrentLocationButton;
