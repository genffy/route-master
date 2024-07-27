"use client";

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import "./index.style.css";

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MAPBOX_ACCESS_TOKEN } from '@/lib/constants';

import type { ExtendFeatureCollection } from './types';

type MapEditorProps = {
  routes: ExtendFeatureCollection[];
}

const token = mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

function pointsEqual([aLat, aLng]: [number, number], [bLat, bLng]: [number, number]) {
  return aLat === bLat && aLng === bLng;
}

export default function MapEditor({ routes }: MapEditorProps) {
  const mapRef = useRef(null);
  const mapInstance = useRef<mapboxgl.Map>();
  const [sources, setSources] = useState<string[]>([]);
  const [roundedArea, setRoundedArea] = useState();

  function getBounds(routes: any) {
    const bounds = routes.features[0].geometry.coordinates.reduce((bounds: any, coord: any) => {
      // @ts-ignore
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds());
    return bounds;
  }

  function initDraw() {
    if (!mapInstance.current) return
    const map = mapInstance.current;
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon'
    });
    map.addControl(draw, 'top-left');

    map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea);

    function updateArea(e) {
      const data = draw.getAll();
      if (data.features.length > 0) {
        console.log(data)
      } else {
        if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
      }
    }
    // 清空现有的绘制数据
    // draw.deleteAll();

    // // 添加 GPX 数据到 mapbox-gl-draw
    // routes.forEach((route: any) => {
    //   route.features.forEach((feature: any) => {
    //     draw.add(feature);
    //   });
    // })
  }

  useEffect(() => {
    // init map
    function initMap(lat: number, lng: number) {
      if (!mapRef.current) {
        return
      }
      const map = mapInstance.current = new mapboxgl.Map({
        container: 'map-content', // container ID
        // style: 'mapbox://styles/mapbox/streets-v12', // style URL
        // center: [lng, lat], // starting position [lng, lat]
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-68.137343, 45.137451],
        zoom: 16, // starting zoom
      });

      map.on("load", () => {
        // addRoutes();
        map.addSource('maine', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              // These coordinates outline Maine.
              coordinates: [
                [
                  [-67.13734, 45.13745],
                  [-66.96466, 44.8097],
                  [-68.03252, 44.3252],
                  [-69.06, 43.98],
                  [-70.11617, 43.68405],
                  [-70.64573, 43.09008],
                  [-70.75102, 43.08003],
                  [-70.79761, 43.21973],
                  [-70.98176, 43.36789],
                  [-70.94416, 43.46633],
                  [-71.08482, 45.30524],
                  [-70.66002, 45.46022],
                  [-70.30495, 45.91479],
                  [-70.00014, 46.69317],
                  [-69.23708, 47.44777],
                  [-68.90478, 47.18479],
                  [-68.2343, 47.35462],
                  [-67.79035, 47.06624],
                  [-67.79141, 45.70258],
                  [-67.13734, 45.13745]
                ]
              ]
            }
          }
        });

        map.addLayer({
          id: 'maine',
          type: 'fill',
          source: 'maine',
          layout: {},
          paint: {
            'fill-color': '#0080ff',
            'fill-opacity': 0.5
          }
        });

        map.addLayer({
          id: 'outline',
          type: 'line',
          source: 'maine',
          layout: {},
          paint: {
            'line-color': '#000',
            'line-width': 3
          }
        });
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
      // addRoutes();
    } else {
      initMap(31.266184495845565, 121.48002838061575);
      // // TODO: use server api to get default deo by ip
      // if (!navigator.geolocation) {
      //   console.error(`Your browser doesn't support Geolocation`);
      // }
      // navigator.geolocation.getCurrentPosition(function onSuccess(position) {
      //   const {
      //     latitude,
      //     longitude
      //   } = position.coords;
      //   initMap(latitude, longitude)
      // }, function onError() {
      //   initMap(0, 0)
      // });
    }
  }, [routes]);
  return <div id="map-content" ref={mapRef}></div>;
}
