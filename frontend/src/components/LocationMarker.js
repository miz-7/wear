import { useMapEvents } from 'react-leaflet';

function LocationMarker({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });

  return null;
}

export default LocationMarker;
