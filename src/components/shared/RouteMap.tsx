"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

interface Coord {
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  origin: Coord;
  destination: Coord;
  distanciaKm: number;
}

// Haversine formula for straight-line distance
export function calcularDistancia(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function RouteMap({ origin, destination, distanciaKm }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;

      // Fix default marker icons (webpack asset issue)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Destroy existing map before re-creating
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current!, {
        zoomControl: true,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const greenIcon = L.divIcon({
        html: `<div style="
          width:32px;height:32px;border-radius:50% 50% 50% 0;
          background:#16a34a;border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          transform:rotate(-45deg);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
        className: "",
      });

      const redIcon = L.divIcon({
        html: `<div style="
          width:32px;height:32px;border-radius:50% 50% 50% 0;
          background:#dc2626;border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          transform:rotate(-45deg);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
        className: "",
      });

      L.marker([origin.lat, origin.lng], { icon: greenIcon })
        .addTo(map)
        .bindPopup(`<b style="color:#16a34a">📍 Origem</b><br>${origin.label}`);

      L.marker([destination.lat, destination.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(`<b style="color:#dc2626">🏁 Destino</b><br>${destination.label}`);

      // Animated dashed route line
      const polyline = L.polyline(
        [[origin.lat, origin.lng], [destination.lat, destination.lng]],
        {
          color: "#1d4ed8",
          weight: 3,
          dashArray: "10 8",
          opacity: 0.85,
        }
      ).addTo(map);

      // Force layout then fit bounds
      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }, 100);
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  return (
    <div className="rounded-xl overflow-hidden border border-blue-100 shadow-md">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-white min-w-0">
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-sm"></span>
            <span className="font-medium truncate max-w-[140px]">{origin.label}</span>
          </span>
          <span className="text-blue-300 shrink-0">→</span>
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm"></span>
            <span className="font-medium truncate max-w-[140px]">{destination.label}</span>
          </span>
        </div>
        <span className="text-yellow-300 font-bold text-sm shrink-0 ml-4">
          ~{distanciaKm.toLocaleString("pt-BR")} km
        </span>
      </div>

      {/* Map container — explicit height prevents the split-tile bug */}
      <div
        ref={containerRef}
        style={{ height: "320px", width: "100%", display: "block" }}
      />
    </div>
  );
}
