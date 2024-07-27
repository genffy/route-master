'use client';

import { useState } from "react";
import { Heading } from "@radix-ui/themes";

export default function Art() {
  const [routes, setRoutes] = useState<any>([]);
  function onLoadHandler(geojson: any) {
    setRoutes(geojson);
  }
  return (
    <main className="min-h-screen w-full">
      <Heading>map art run</Heading>
    </main>
  );
}
