"use client";

import dynamic from "next/dynamic";

const RouteMap = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl overflow-hidden border border-blue-100 shadow-md">
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-3 h-11 animate-pulse" />
      <div className="h-[340px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm gap-2">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Carregando mapa...
      </div>
    </div>
  ),
});

interface Props {
  origemLat: number;
  origemLng: number;
  origemLabel: string;
  destinoLat: number;
  destinoLng: number;
  destinoLabel: string;
  distanciaKm?: number;
}

export function FreteRouteMap({
  origemLat,
  origemLng,
  origemLabel,
  destinoLat,
  destinoLng,
  destinoLabel,
  distanciaKm,
}: Props) {
  return (
    <RouteMap
      origin={{ lat: origemLat, lng: origemLng, label: origemLabel }}
      destination={{ lat: destinoLat, lng: destinoLng, label: destinoLabel }}
      distanciaKm={distanciaKm}
    />
  );
}
