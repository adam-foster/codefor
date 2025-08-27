import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// --- Types

type GeoStatus =
  | { kind: "idle" }
  | { kind: "requesting" }
  | { kind: "inside"; distanceMeters: number }
  | { kind: "outside"; distanceMeters: number }
  | { kind: "error"; message: string };

type GateProps = {
  target: { lat: number; lng: number };
  radiusMeters: number; // geofence radius
  children: React.ReactNode; // content to render when inside
  storageKey?: string; // override localStorage key
};

// --- Helpers

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Haversine distance in meters
function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371_000; // meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export const STORAGE_KEY = "geofence-gate-v1" as const;

export function GeofenceGate({ target, radiusMeters, children, storageKey = STORAGE_KEY }: GateProps) {
  const [status, setStatus] = useState<GeoStatus>({ kind: "idle" });
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  // Try to hydrate prior decision (useful if the user already granted permission and hasn't moved far)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const data = JSON.parse(raw) as { ts: number; lat: number; lng: number; distance: number; inside: boolean } | null;
      if (!data) return;
      setLastCheckedAt(data.ts);
      setStatus(data.inside ? { kind: "inside", distanceMeters: data.distance } : { kind: "outside", distanceMeters: data.distance });
    } catch {}
  }, [storageKey]);

  const checkNow = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus({ kind: "error", message: "Geolocation is not available in this browser." });
      return;
    }

    setStatus({ kind: "requesting" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const dist = haversineMeters(coords, target);
        const inside = dist <= radiusMeters;
        setStatus(inside ? { kind: "inside", distanceMeters: dist } : { kind: "outside", distanceMeters: dist });
        setLastCheckedAt(Date.now());
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ ts: Date.now(), lat: coords.lat, lng: coords.lng, distance: dist, inside })
          );
        } catch {}
      },
      (err) => {
        let message = "";
        if (err.code === err.PERMISSION_DENIED) message = "Permission denied. Please allow location access.";
        else if (err.code === err.POSITION_UNAVAILABLE) message = "Location unavailable. Move to an open area or try again.";
        else if (err.code === err.TIMEOUT) message = "Timed out. Try again.";
        else message = err.message || "Unknown error.";
        setStatus({ kind: "error", message });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
    );
  }, [radiusMeters, target, storageKey]);

  const distanceLabel = useMemo(() => {
    if (status.kind !== "inside" && status.kind !== "outside") return null;
    const m = Math.round(status.distanceMeters);
    if (m < 1000) return `${m} m`;
    return `${(m / 1000).toFixed(2)} km`;
  }, [status]);

  if (status.kind === "inside") {
    return (
      <div className="w-full">
        {children}
        <div className="flex items-center justify-center gap-3 mt-5">
            <button
            onClick={() => {
                try { localStorage.removeItem(storageKey); } catch {}
                setStatus({ kind: "idle" });
                setLastCheckedAt(null);
            }}
            className="px-4 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200"
            >
            ↻ Reset
            </button>
            <Link to="/" className="px-3 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200">Continue →</Link>
        </div>
        <p className="mt-3 text-xs text-center text-gray-500">You were within the allowed area ({distanceLabel} from target).</p>
      </div>
    );
  }

  return (
    <div className="w-full text-gray-900">
      <p className="text-sm text-gray-700 mb-4">We need to confirm your current location is Dancers' Alley!</p>
      {status.kind === "outside" && (
        <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 p-2 text-sm">
          You're currently (~{distanceLabel} away).
        </div>
      )}

      {status.kind === "error" && (
        <div className="mb-3 rounded-xl border border-red-300 bg-red-50 p-2 text-sm text-red-800">
          {status.message}
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={checkNow}
          disabled={status.kind === "requesting"}
          className="px-4 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200 disabled:opacity-60"
        >
          {status.kind === "requesting" ? "Checking…" : "🧭 Check my location"}
        </button>
        <button
          onClick={() => {
            try { localStorage.removeItem(storageKey); } catch {}
            setStatus({ kind: "idle" });
            setLastCheckedAt(null);
          }}
          className="px-4 py-2 rounded-xl text-sm border border-gray-400 hover:bg-gray-200"
        >
          ↻ Reset
        </button>
    </div>

      {lastCheckedAt && (
        <p className="mt-2 text-xs text-center text-gray-500">Last checked: {new Date(lastCheckedAt).toLocaleString()}</p>
      )}
    </div>
  );
}

