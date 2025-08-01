'use client';

import { useState } from "react";

export default function Combine() {
  const [routes, setRoutes] = useState<any>([]);
  function onLoadHandler(geojson: any) {
    setRoutes(geojson);
  }
  return (
    <main className="min-h-screen w-full">
      <h1 className="text-2xl font-bold">combine multi runs</h1>
    </main>
  );
}
