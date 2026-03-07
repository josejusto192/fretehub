"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

interface Coord {
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  origin: Coord;
  destination: Coord;
  distanciaKm?: number;
  onRouteCalculated?: (distanciaKm: number) => void;
}

// Haversine – used as fallback if OSRM fails
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

export default function RouteMap({ origin, destination, distanciaKm: distProp, onRouteCalculated }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [distancia, setDistancia] = useState<number | null>(distProp ?? null);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [isRealRoute, setIsRealRoute] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;

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

      const map = L.map(containerRef.current!, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const makeIcon = (color: string, pulse = false) =>
        L.divIcon({
          html: `
            <div style="position:relative;width:36px;height:36px;">
              ${pulse ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:${color};opacity:0.2;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ""}
              <div style="
                width:36px;height:36px;border-radius:50% 50% 50% 0;
                background:${color};border:3px solid white;
                box-shadow:0 3px 10px rgba(0,0,0,0.3);
                transform:rotate(-45deg);
              "></div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -40],
          className: "",
        });

      L.marker([origin.lat, origin.lng], { icon: makeIcon("#16a34a", true) })
        .addTo(map)
        .bindPopup(`<b style="color:#16a34a">📍 Origem</b><br><span style="font-size:13px">${origin.label}</span>`);

      L.marker([destination.lat, destination.lng], { icon: makeIcon("#dc2626") })
        .addTo(map)
        .bindPopup(`<b style="color:#dc2626">🏁 Destino</b><br><span style="font-size:13px">${destination.label}</span>`);

      // Try OSRM for real road route
      let routeCoords: [number, number][] = [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ];

      try {
        const osrmUrl =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
          `?overview=full&geometries=geojson`;

        const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(8000) });
        const data = await res.json();

        if (data.code === "Ok" && data.routes?.[0]) {
          const route = data.routes[0];
          const km = Math.round(route.distance / 1000);
          routeCoords = (route.geometry.coordinates as [number, number][]).map(
            ([lng, lat]) => [lat, lng]
          );
          setDistancia(km);
          setIsRealRoute(true);
          onRouteCalculated?.(km);
        }
      } catch {
        // OSRM failed – fall back to straight line
        if (!distProp) {
          const km = calcularDistancia(origin.lat, origin.lng, destination.lat, destination.lng);
          setDistancia(km);
          onRouteCalculated?.(km);
        }
      } finally {
        setLoadingRoute(false);
      }

      const polyline = L.polyline(routeCoords, {
        color: "#1d4ed8",
        weight: 5,
        opacity: 0.85,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);

      setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(polyline.getBounds(), { padding: [55, 55] });
      }, 120);
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
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-white min-w-0 flex-1">
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-sm ring-2 ring-green-400/30"></span>
            <span className="font-medium truncate max-w-[130px]">{origin.label}</span>
          </span>
          <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm ring-2 ring-red-400/30"></span>
            <span className="font-medium truncate max-w-[130px]">{destination.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {loadingRoute ? (
            <span className="text-blue-300 text-xs animate-pulse">Calculando rota...</span>
          ) : (
            <div className="text-right">
              <span className="text-yellow-300 font-bold text-sm">
                ~{distancia?.toLocaleString("pt-BR")} km
              </span>
              {isRealRoute && (
                <span className="block text-blue-300 text-[10px]">via estradas</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        style={{ height: "340px", width: "100%", display: "block" }}
      />
    </div>
  );
}
