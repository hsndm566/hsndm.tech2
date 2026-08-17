/**
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * USAGE FROM PARENT COMPONENT:
 * ======
 *
 * const mapRef = useRef<google.maps.Map | null>(null);
 *
 * <MapView
 *   initialCenter={{ lat: 40.7128, lng: -74.0060 }}
 *   initialZoom={15}
 *   onMapReady={(map) => {
 *     mapRef.current = map; // Store to control map from parent anytime, google map itself is in charge of the re-rendering, not react state.
 * </MapView>
 *
 * ======
 * Available Libraries and Core Features:
 * -------------------------------
 * 📍 MARKER (from `marker` library)
 * - Attaches to map using { map, position }
 * new google.maps.marker.AdvancedMarkerElement({
 *   map,
 *   position: { lat: 37.7749, lng: -122.4194 },
 *   title: "San Francisco",
 * });
 *
 * -------------------------------
 * 🏢 PLACES (from `places` library)
 * - Does not attach directly to map; use data with your map manually.
 * const place = new google.maps.places.Place({ id: PLACE_ID });
 * await place.fetchFields({ fields: ["displayName", "location"] });
 * map.setCenter(place.location);
 * new google.maps.marker.AdvancedMarkerElement({ map, position: place.location });
 *
 * -------------------------------
 * 🧭 GEOCODER (from `geocoding` library)
 * - Standalone service; manually apply results to map.
 * const geocoder = new google.maps.Geocoder();
 * geocoder.geocode({ address: "New York" }, (results, status) => {
 *   if (status === "OK" && results[0]) {
 *     map.setCenter(results[0].geometry.location);
 *     new google.maps.marker.AdvancedMarkerElement({
 *       map,
 *       position: results[0].geometry.location,
 *     });
 *   }
 * });
 *
 * -------------------------------
 * 📐 GEOMETRY (from `geometry` library)
 * - Pure utility functions; not attached to map.
 * const dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
 *
 * -------------------------------
 * 🛣️ ROUTES (from `routes` library)
 * - Combines DirectionsService (standalone) + DirectionsRenderer (map-attached)
 * const directionsService = new google.maps.DirectionsService();
 * const directionsRenderer = new google.maps.DirectionsRenderer({ map });
 * directionsService.route(
 *   { origin, destination, travelMode: "DRIVING" },
 *   (res, status) => status === "OK" && directionsRenderer.setDirections(res)
 * );
 *
 * -------------------------------
 * 🌦️ MAP LAYERS (attach directly to map)
 * - new google.maps.TrafficLayer().setMap(map);
 * - new google.maps.TransitLayer().setMap(map);
 * - new google.maps.BicyclingLayer().setMap(map);
 *
 * -------------------------------
 * ✅ SUMMARY
 * - “map-attached” → AdvancedMarkerElement, DirectionsRenderer, Layers.
 * - “standalone” → Geocoder, DirectionsService, DistanceMatrixService, ElevationService.
 * - “data-only” → Place, Geometry utilities.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

let mapsScriptPromise: Promise<void> | null = null;
let mapsScriptUrl = "";

export function buildMapsScriptUrl(language = "en", region = "SA") {
  return `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&loading=async&libraries=marker,places,geocoding,geometry&language=${language}&region=${region}`;
}

export function getMapFallbackMessage(language = "en") {
  return language.toLowerCase().startsWith("ar")
    ? "تعذر تحميل خريطة جدة حالياً. استخدم رابط الاتجاهات لفتحها في خرائط Google."
    : "The Jeddah map is temporarily unavailable. Use Get directions to open Google Maps.";
}

export function getJeddahDirectionsUrl() {
  return "https://www.google.com/maps/dir/?api=1&destination=Jeddah%2C%20Saudi%20Arabia";
}

function resetMapsScriptLoader() {
  mapsScriptPromise = null;
  mapsScriptUrl = "";
}

function loadMapScript(language = "en", region = "SA"): Promise<void> {
  if (window.google?.maps?.Map) return Promise.resolve();

  const scriptUrl = buildMapsScriptUrl(language, region);
  if (mapsScriptPromise && mapsScriptUrl === scriptUrl) return mapsScriptPromise;

  mapsScriptUrl = scriptUrl;
  mapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    // The supported Maps proxy authorizes the active application origin. CORS mode
    // ensures browsers attach that Origin header instead of receiving a 403 response.
    script.crossOrigin = "anonymous";
    script.dataset.mapsProxyUrl = scriptUrl;
    script.onload = () => {
      script.remove();
      if (window.google?.maps?.Map) resolve();
      else {
        resetMapsScriptLoader();
        reject(new Error("Google Maps loaded without a usable map API"));
      }
    };
    script.onerror = () => {
      script.remove();
      resetMapsScriptLoader();
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return mapsScriptPromise;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
  language?: string;
  region?: string;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
  language = "en",
  region = "SA",
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState(false);

  const init = usePersistFn(async () => {
    try {
      setMapError(false);
      await loadMapScript(language, region);
      if (!mapContainer.current || !window.google?.maps?.Map) {
        throw new Error("Map container or Google Maps API is unavailable");
      }
      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
      });
      if (onMapReady) {
        onMapReady(map.current);
      }
    } catch (error) {
      console.warn("Google Maps is unavailable; showing the directions fallback", error);
      setMapError(true);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  const retryMap = () => {
    resetMapsScriptLoader();
    void init();
  };

  return (
    <div
      ref={mapContainer}
      dir={language.toLowerCase().startsWith("ar") ? "rtl" : "ltr"}
      className={cn("relative w-full h-[500px]", className)}
      role={mapError ? "status" : undefined}
      aria-live={mapError ? "polite" : undefined}
    >
      {mapError && (
        <div className="absolute inset-0 grid place-items-center bg-slate-50 px-6 text-center text-sm text-slate-700">
          <div className="max-w-sm space-y-3">
            <p>{getMapFallbackMessage(language)}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={retryMap}
                className="rounded-lg bg-[#2563eb] px-3 py-2 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
              >
                {language.toLowerCase().startsWith("ar") ? "إعادة المحاولة" : "Try again"}
              </button>
              <a
                href={getJeddahDirectionsUrl()}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
              >
                {language.toLowerCase().startsWith("ar") ? "فتح الاتجاهات" : "Get directions"}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
