"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import L from "leaflet";
const icon = L.icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwNjU5ZmUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1idXMtZnJvbnQtaWNvbiBsdWNpZGUtYnVzLWZyb250Ij48cGF0aCBkPSJNNCA2IDIgNyIvPjxwYXRoIGQ9Ik0xMCA2aDQiLz48cGF0aCBkPSJtMjIgNy0yLTEiLz48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHg9IjQiIHk9IjMiIHJ4PSIyIi8+PHBhdGggZD0iTTQgMTFoMTYiLz48cGF0aCBkPSJNOCAxNWguMDEiLz48cGF0aCBkPSJNMTYgMTVoLjAxIi8+PHBhdGggZD0iTTYgMTl2MiIvPjxwYXRoIGQ9Ik0xOCAyMXYtMiIvPjwvc3ZnPg==",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Vehicle = {
  vehicle_id: string;
  latitude: number;
  longitude: number;
  route_id: string;
  delay_seconds: number;
  weather: string;
};

export default function LiveMap() {
  const [vehicles, setVehicles] = useState<Map<string, Vehicle>>(new Map());

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from("vehicle_positions")
        .select("*");
      if (data) {
        const initialVehicles = new Map(data.map((v) => [v.vehicle_id, v]));
        setVehicles(initialVehicles);
      }
    };
    fetchInitialData();

    const channel = supabase
      .channel("vehicle_positions_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicle_positions" },
        (payload: any) => {
          console.log("Realtime update received!", payload);
          const newVehicle = payload.new as Vehicle;

          // --- THIS IS THE FIX ---
          setVehicles((prevVehicles) => {
            const newMap = new Map(prevVehicles); // Create a new Map instance
            newMap.set(newVehicle.vehicle_id, newVehicle); // Set the new data on the copy
            return newMap; // Return the new map to trigger a re-render
          });
          // -----------------------
        }
      )
      .subscribe();

    // It's good practice to return a cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <MapContainer
      center={[42.9715, -85.6698]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {Array.from(vehicles.values()).map((vehicle) => (
        <Marker
          key={vehicle.vehicle_id}
          position={[vehicle.latitude, vehicle.longitude]}
          icon={icon}
        >
          <Popup>
            <b>Vehicle ID:</b> {vehicle.vehicle_id}
            <br />
            <b>Route:</b> {vehicle.route_id}
            <br />
            <b>Weather:</b> {vehicle.weather}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
