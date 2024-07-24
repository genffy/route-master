"use client";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MAPBOX_ACCESS_TOKEN } from '@/lib/constants';

import "./index.style.css";
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

type RouteSingle = {
  "alt": string;
  "latitude": number;
  "longitute": number;
}

export type Route = RouteSingle[]

type MapEditorProps = {
  routes: any;
}

const token = mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

function pointsEqual([aLat, aLng]: [number, number], [bLat, bLng]: [number, number]) {
  return aLat === bLat && aLng === bLng;
}

export default function MapEditor({ routes }: MapEditorProps) {
  const mapRef = useRef(null);
  const mapInstance = useRef<mapboxgl.Map>();
  const [sources, setSources] = useState<string[]>([]);
  // render multi routes
  // how to merge ?

  function addDraw(draw: MapboxDraw, routes: Route) {
    const initialRoute = {
      coordinates: [
        ...routes.map(({ latitude, longitute }) => [longitute, latitude])
      ],
      type: "LineString"
    };

    const [editId] = draw.add(initialRoute as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry>);
    return editId
  }
  function getBounds(routes: any) {
    const bounds = routes.features[0].geometry.coordinates.reduce((bounds: any, coord: any) => {
      // @ts-ignore
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds());
    return bounds;
  }
  useEffect(() => {
    // init map
    function initMap(lat: number, lng: number) {
      if (!mapRef.current) {
        return
      }
      const map = mapInstance.current = new mapboxgl.Map({
        container: 'map-content', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [lng, lat], // starting position [lng, lat]
        zoom: 16, // starting zoom
      });

      map.on("load", async () => {
        addRoutes();
      });
    }

    function addRoutes() {
      const map = mapInstance.current;
      if (!map) return;
      // add or update
      const newIds = routes.map((item: any) => `rendered-path-source-${item.properties.id}`)
      sources.forEach((id: any) => {
        if (!newIds.includes(id)) {
          if (map.getSource(id)) {
            map.removeLayer(id);
            map.removeSource(id);
          }
        }
      });
      setSources(newIds);
      routes.forEach((route: any) => {
        const { properties } = route;
        if (properties?.active) {
          const bounds = getBounds(route);
          map.fitBounds(bounds, { padding: 20 });
        }
        const id = `rendered-path-source-${properties.id}`;
        const source = map.getSource(id);
        if (source) {
          // @ts-ignore
          source.setData(route)
        } else {
          map.addSource(id, {
            type: "geojson",
            data: route,
          });
          // display the matched paths from the service
          map.addLayer({
            id: id,
            type: "line",
            source: id,
            paint: {
              'line-color': '#16a34a',
              'line-width': 3
            }
          });
        }
      })
    }
    if (mapInstance.current) {
      addRoutes();
    } else {
      // TODO: use server api to get default deo by ip
      if (!navigator.geolocation) {
        console.error(`Your browser doesn't support Geolocation`);
      }
      navigator.geolocation.getCurrentPosition(function onSuccess(position) {
        const {
          latitude,
          longitude
        } = position.coords;
        console.log(latitude, longitude)
        initMap(latitude, longitude)
      }, function onError() {
        initMap(0, 0)
      });
    }
  }, [routes]);
  return (
    <>
      <div id="map-content" ref={mapRef}></div>
    </>
  )
}
