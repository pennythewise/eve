import { DOE_POINTS } from './demo';

// The DOE point is the nearest real collection point; the other stops are PLACEHOLDER coordinates in the Klang Valley.
const point = DOE_POINTS[0];
export const routeNodes = [
  { key: 'home', label: 'Home', sub: 'Subang Jaya', lat: 3.0790, lng: 101.5860, color: '#0A9C8A' },
  { key: 'point', label: point.name, sub: point.area, lat: point.lat, lng: point.lng, color: '#067A6D' },
  { key: 'recycler', label: 'Recycler (licensed)', sub: 'Shah Alam', lat: 3.0733, lng: 101.5185, color: '#E8A317' },
  { key: 'maker', label: 'Manufacturer (demo)', sub: 'Port Klang', lat: 3.0010, lng: 101.3900, color: '#054F49' },
];
