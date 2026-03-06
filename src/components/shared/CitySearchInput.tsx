"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface CityResult {
  cidade: string;
  estado: string; // UF, ex: "SP"
  lat: number;
  lng: number;
  displayName: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    state_code?: string;
  };
}

// Maps state names to UF abbreviations
const ESTADO_PARA_UF: Record<string, string> = {
  "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM",
  "Bahia": "BA", "Ceará": "CE", "Distrito Federal": "DF",
  "Espírito Santo": "ES", "Goiás": "GO", "Maranhão": "MA",
  "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG",
  "Pará": "PA", "Paraíba": "PB", "Paraná": "PR", "Pernambuco": "PE",
  "Piauí": "PI", "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS", "Rondônia": "RO", "Roraima": "RR",
  "Santa Catarina": "SC", "São Paulo": "SP", "Sergipe": "SE", "Tocantins": "TO",
};

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onSelect: (result: CityResult) => void;
  error?: string;
}

export default function CitySearchInput({ label, placeholder, value, onSelect, error }: Props) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (ex: form reset)
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: `${q}, Brasil`,
        countrycodes: "br",
        format: "json",
        addressdetails: "1",
        limit: "8",
        "accept-language": "pt-BR",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        { headers: { "User-Agent": "FreteHub/1.0" } }
      );
      const data: NominatimResult[] = await res.json();

      const cities: CityResult[] = [];
      const seen = new Set<string>();

      for (const item of data) {
        const addr = item.address;
        const cityName =
          addr.city || addr.town || addr.village || addr.municipality || addr.county;
        const stateName = addr.state || "";
        const uf = addr.state_code?.toUpperCase() || ESTADO_PARA_UF[stateName] || "";

        if (!cityName || !uf) continue;
        const key = `${cityName}-${uf}`;
        if (seen.has(key)) continue;
        seen.add(key);

        cities.push({
          cidade: cityName,
          estado: uf,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          displayName: `${cityName} — ${uf}`,
        });
      }

      setResults(cities);
      setOpen(cities.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 350);
  };

  const handleSelect = (city: CityResult) => {
    setQuery(city.displayName);
    setOpen(false);
    setResults([]);
    onSelect(city);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <p className="text-sm font-medium mb-1">{label}</p>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder || "Digite a cidade..."}
          className="pl-9"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            Buscando...
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-56 overflow-auto">
          {results.map((city, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(city)}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center gap-2"
            >
              <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
              <span>
                <span className="font-medium">{city.cidade}</span>
                <span className="text-gray-500"> — {city.estado}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
