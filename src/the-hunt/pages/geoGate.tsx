import { GeofenceGate } from "../components/geoGate/geoGate";
import Header from "../components/header";

function GeoGate() {
  // const TARGET = { lat: -33.87625, lng: 151.201083 };
  // Target: { lat: -33.87625, lng: 151.201083 } = 33°52'34.5"S 151°12'03.9"E
  const HOME = { lat: -33.510910, lng: 151.333041 }
  // Home: = { lat: -33.510910, lng: 151.333041 } -33.510910, 151.333041

  
  return (
    <>
        <Header label="Go to location" />
        <div className="p-5">
          <GeofenceGate target={HOME} radiusMeters={200}>
            <p className="text-sm text-gray-700 mt-1">🎉 You made it to the correct location!</p>
          </GeofenceGate>
        </div>
    </>
  );
}

export default GeoGate;