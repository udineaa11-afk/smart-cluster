"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapBlock {
  id: string;
  name: string;
  description?: string | null;
  polygon: string;
  color: string;
  blockType: string;
}

interface PetMarker {
  id: string;
  name: string;
  petType?: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  status: string;
  color?: string | null;
}

const petTypeEmoji: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  bird: "🐦",
  fish: "🐟",
  rabbit: "🐰",
  other: "🐾",
};

interface MapViewProps {
  blocks?: MapBlock[];
  pets?: PetMarker[];
  center?: [number, number];
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  drawMode?: boolean;
  drawnPoints?: [number, number][];
  onPointAdd?: (lat: number, lng: number) => void;
}

export default function MapView({
  blocks = [],
  pets = [],
  center = [-6.2088, 106.8456],
  zoom = 15,
  onMapClick,
  drawMode = false,
  drawnPoints = [],
  onPointAdd,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(center, zoom);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    if (drawMode && onPointAdd) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onPointAdd(e.latlng.lat, e.latlng.lng);
      });
    } else if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const layers: L.Layer[] = [];

    blocks.forEach((block) => {
      try {
        const coords = JSON.parse(block.polygon) as [number, number][];
        const polygon = L.polygon(coords, {
          color: block.color,
          fillColor: block.color,
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(map);

        polygon.bindPopup(
          `<strong>${block.name}</strong>${block.description ? `<br/>${block.description}` : ""}<br/><em>${block.blockType}</em>`
        );

        layers.push(polygon);
      } catch {
        // skip invalid polygon data
      }
    });

    pets.forEach((pet) => {
      const emoji = petTypeEmoji[pet.petType || "cat"] || "🐾";
      const petIcon = L.divIcon({
        html: `<div style="background:${pet.status === "owned" ? "#10B981" : pet.status === "colony" ? "#F59E0B" : "#6B7280"};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([pet.latitude, pet.longitude], {
        icon: petIcon,
      }).addTo(map);

      marker.bindPopup(
        `<strong>${pet.name}</strong>${pet.description ? `<br/>${pet.description}` : ""}${pet.color ? `<br/>Warna: ${pet.color}` : ""}<br/>Status: ${pet.status}`
      );

      layers.push(marker);
    });

    if (drawnPoints.length > 0) {
      const polyline = L.polyline(drawnPoints, {
        color: "#3B82F6",
        weight: 3,
        dashArray: "5, 10",
      }).addTo(map);
      layers.push(polyline);

      drawnPoints.forEach((point) => {
        const circleMarker = L.circleMarker(point, {
          radius: 5,
          color: "#3B82F6",
          fillColor: "#3B82F6",
          fillOpacity: 1,
        }).addTo(map);
        layers.push(circleMarker);
      });
    }

    return () => {
      layers.forEach((layer) => map.removeLayer(layer));
    };
  }, [blocks, pets, drawnPoints]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg"
      style={{ minHeight: "400px" }}
    />
  );
}
