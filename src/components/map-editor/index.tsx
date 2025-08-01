import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import "./index.style.css";

import { useEffect, useRef, useState } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";

import type { ExtendFeatureCollection } from './types';

type MapEditorProps = {
  routes: ExtendFeatureCollection[];
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZ2VuZmZ5IiwiYSI6ImNsazZyeWwxYTAxbDEzZm53NjhyZzcxdmwifQ.cNtI7_hIAzXjZkVuMIKw7Q';

export default function MapEditor({ routes }: MapEditorProps) {
  const mapRef = useRef(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [center, setCenter] = useState<LngLatLike>([0, 0]);

  function getBounds(routes: any) {
    const bounds = routes.features[0].geometry.coordinates.reduce((bounds: any, coord: any) => {
      // @ts-ignore
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds());
    return bounds;
  }

  useEffect(() => {
    if (!mapRef.current) {
      return
    }
    // if (mapInstance.current) {
    //   return initMap();
    // }
    const map = mapInstance.current = new mapboxgl.Map({
      container: 'map-content', // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center, // starting position [lng, lat]
      zoom: 16, // starting zoom
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      // defaultMode: 'draw_polygon'
      defaultMode: 'simple_select'
      // defaultMode: 'draw_line_string'
    });

    map.on("load", () => {
      map.addControl(draw, 'top-left');
      map.on('draw.create', updateArea);
      map.on('draw.delete', updateArea);
      map.on('draw.update', updateArea);

      function updateArea(e: any) {
        const data = draw.getAll();
        if (data.features.length > 0) {
          console.log(data)
        } else {
          if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
        }
      }
      initMap();
    });

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
      routes.forEach((route: ExtendFeatureCollection) => {
        const { properties, features } = route;
        if (properties?.active) {
          const bounds = getBounds(route);
          map.fitBounds(bounds, { padding: 20 });
        }
        const id = `rendered-path-source-${properties?.id}`;
        const source = map.getSource(id);
        if (source) {
          // @ts-ignore
          source.setData(route)
        } else {
          map.addSource(id, {
            type: "geojson",
            data: route,
          });
          map.addLayer({
            id: `${id}-outline`,
            type: "line",
            layout: {},
            source: id,
            paint: {
              'line-color': '#16a34a',
              'line-width': 3
            }
          });
        }
        if (draw !== undefined) {
          console.log('draw', draw)
          features.forEach((feature, idx) => {
            feature.id = `rendered-draw-source-${properties?.id}-${idx}`;
            console.log('feature', feature, draw);
            draw.add(feature);
          })
        }
      })
    }

    function initMap() {
      // initPolygon();
      addRoutes();
    }
  }, [routes, center]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error(`Your browser doesn't support Geolocation`);
    }
    navigator.geolocation.getCurrentPosition(function onSuccess(position) {
      const {
        latitude,
        longitude
      } = position.coords;
      setCenter([longitude, latitude])
    }, function onError() {
      setCenter([0, 0])
    });
  }, [])
  return <>
    <div id="map-content" ref={mapRef}></div>
  </>;
}
