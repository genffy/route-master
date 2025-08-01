'use client';

import { useState } from "react";

export default function Art() {
  const [routes, setRoutes] = useState<any>([]);
  function onLoadHandler(geojson: any) {
    setRoutes(geojson);
  }
  return (
    <main className="min-h-screen w-full">
      <h1 className="text-2xl font-bold">map art run</h1>
    </main>
  );
}
