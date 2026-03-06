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

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current!);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      const greenIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
      });

      const redIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
      });

      L.marker([origin.lat, origin.lng], { icon: greenIcon })
        .addTo(map)
        .bindPopup(`<b>Origem</b><br>${origin.label}`)
        .openPopup();

      L.marker([destination.lat, destination.lng], { icon: redIcon })
        .addTo(map)
        .bindPopup(`<b>Destino</b><br>${destination.label}`);

      // Draw dashed line between points
      const polyline = L.polyline(
        [[origin.lat, origin.lng], [destination.lat, destination.lng]],
        { color: "#1e3a8a", weight: 3, dashArray: "8 6", opacity: 0.8 }
      ).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [origin.lat, origin.lng, destination.lat, destination.lng, origin.label, destination.label]);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-blue-50 px-4 py-2 flex items-center justify-between text-sm">
        <span className="text-gray-600">
          <span className="font-medium text-green-600">● Origem:</span> {origin.label}
          <span className="mx-3 text-gray-400">→</span>
          <span className="font-medium text-red-600">● Destino:</span> {destination.label}
        </span>
        <span className="font-semibold text-blue-900">
          ~{distanciaKm.toLocaleString("pt-BR")} km
        </span>
      </div>
      <div ref={containerRef} style={{ height: "300px", width: "100%" }} />
    </div>
  );
}
