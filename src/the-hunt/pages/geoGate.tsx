import { GeofenceGate } from "../components/geoGate/geoGate";
import Header from "../components/header";

function GeoGate() {
  const TARGET = { lat: -33.87625, lng: 151.201083 };

  return (
    <>
        <Header label="Go to location" />
        <div className="p-5">
          <GeofenceGate target={TARGET} radiusMeters={200}>
            <p className="text-sm text-gray-700 mt-1">🎉 You made it to the correct location!</p>
          </GeofenceGate>
        </div>
    </>
  );
}

export default GeoGate;