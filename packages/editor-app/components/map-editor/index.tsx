"use client";

import React, { useEffect, useRef } from 'react';
import "./index.style.css";
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import mapboxgl from 'mapbox-gl';
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { MAPBOX_ACCESS_TOKEN } from '@/lib/constants';

type RouteSingle = {
  "alt": string;
  "latitude": number;
  "longitute": number;
}

export type Route = RouteSingle[]

type MapEditorProps = {
  routes: Route[];
}

const token = mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

function pointsEqual([aLat, aLng]: [number, number], [bLat, bLng]: [number, number]) {
  return aLat === bLat && aLng === bLng;
}

export default function MapEditor({ routes }: MapEditorProps) {
  const mapRef = useRef([]);
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

  useEffect(() => {
    // demo from https://github.com/apexskier/mapbox-route-editor
    // geojson


    // TODO
    // const bounds = initialRoute.coordinates.reduce((bounds, coord) => {
    //   // @ts-ignore
    //   return bounds.extend(coord);
    // }, new mapboxgl.LngLatBounds());

    // init map
    function initMap(lat: number, lng: number) {
      if (!mapRef.current) {
        return
      }

      const map = new mapboxgl.Map({
        container: 'map-content', // container ID
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [lng, lat], // starting position [lng, lat]
        zoom: 9, // starting zoom
      });

      const draw = new MapboxDraw({
        controls: {
          line_string: true
        },
        displayControlsDefault: false,
        defaultMode: "draw_line_string",
        styles: [
          // Set the line style for the user-input coordinates
          {
            'id': 'gl-draw-line',
            'type': 'line',
            'filter': [
              'all',
              ['==', '$type', 'LineString'],
              ['!=', 'mode', 'static']
            ],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#438EE4',
              'line-dasharray': [0.2, 2],
              'line-width': 2,
              'line-opacity': 0.7
            }
          },
          // Style the vertex point halos
          {
            'id': 'gl-draw-polygon-and-line-vertex-halo-active',
            'type': 'circle',
            'filter': [
              'all',
              ['==', 'meta', 'vertex'],
              ['==', '$type', 'Point'],
              ['!=', 'mode', 'static']
            ],
            'paint': {
              'circle-radius': 12,
              'circle-color': '#FFF'
            }
          },
          // Style the vertex points
          {
            'id': 'gl-draw-polygon-and-line-vertex-active',
            'type': 'circle',
            'filter': [
              'all',
              ['==', 'meta', 'vertex'],
              ['==', '$type', 'Point'],
              ['!=', 'mode', 'static']
            ],
            'paint': {
              'circle-radius': 8,
              'circle-color': '#438EE4'
            }
          }
        ]
      });

      map.on("load", async () => {
        // https://docs.mapbox.com/mapbox-gl-js/api/map/#map#fitbounds
        // TODO: fitBounds with multiple routes
        // map.fitBounds(bounds, { padding: 20 });

        // add the draw tool to the map
        map.addControl(draw);

        // choose one and
        const editIds: string[] = []
        routes.forEach((route) => {
          const id = addDraw(draw, route)
          editIds.push(id)
          console.log(id)
        })

        // store the matched paths we get from the service in a mapbox source
        // map.addSource("rendered-path-source", {
        //   type: "geojson",
        //   data: {
        //     type: "FeatureCollection",
        //     features: []
        //   }
        // });

        // display the matched paths from the service
        // map.addLayer({
        //   id: "rendered-path-layer",
        //   type: "line",
        //   source: "rendered-path-source"
        // });

        // save the last displayed coords so we can tell what changes
        const [editId, ..._restIds] = editIds
        // @ts-ignore
        let lastLineCoords = draw.get(editId)?.geometry?.coordinates;

        // keep track of all matched segments between lines
        // stored by the index of the first point. if i+1 or i+2 changes, we need to
        // invalidate the segment
        // we'll be doing some slightly weird stuff by dyanmically deleting and indexing into
        // an array. If you debug, the array will be mostly empty, which can be confusing
        // when this changes, write it to the store (manually right now)
        let lineMatchLegs = new Array(lastLineCoords.length);

        // get and save a match segment from the service
        async function updateSegment(i: number, coords: { [x: string]: any; }, precision: number) {
          const queryCoords = [coords[i], coords[i + 1]]
            .map(coord => coord.join(","))
            .join(";");

          const queryRadiuses = [precision, precision].join(";");

          // TODO: Use something like RX.js to create a stream for this. This would
          // allow me to cancel requests when a new one comes in so I'm always using the
          // latest data if the user updates too fast for the network to keep up
          const req = await fetch(
            `https://api.mapbox.com/matching/v5/mapbox/walking/${queryCoords}?access_token=${token}&geometries=geojson&radiuses=${queryRadiuses}`,
            { method: "GET" }
          );
          const data = await req.json();
          lineMatchLegs[i] = data.matchings;
        }

        // push saved segments to the mapbox source
        function updateRenderedPath() {
          // maybe? improve rendering performance by update/render each segment individually
          // @ts-ignore
          map.getSource("rendered-path-source").setData({
            type: "FeatureCollection",
            features: [].concat(
              ...lineMatchLegs.filter(l => l).map(matches =>
                matches.map((match: { geometry: any; }) => ({
                  type: "Feature",
                  properties: {},
                  geometry: match.geometry
                }))
              )
            )
          });
        }

        // full reset, used on init and when we don't know what to do
        async function resetSegments(coords: any[]) {
          lineMatchLegs = new Array(coords.length);
          await Promise.all(
            coords.slice(0, -1).map((_: any, i: any) => updateSegment(i, coords, 30))
          );
          updateRenderedPath();
        }

        map.on("draw.update", async ev => {
          const newCoords = ev.features[0].geometry.coordinates;

          // doesn't account for adding or removing points
          // just resets if that hppens for now
          if (lastLineCoords.length === newCoords.length) {
            let mutatedIndexes;
            let radiuses;

            // Diff against the last version of the line and only fetch segments for
            // the point + next and previous coordinates
            const diffIndex = lastLineCoords.findIndex(
              (coord: [number, number], i: string | number) => !pointsEqual(newCoords[i], coord)
            );
            if (diffIndex < 0) {
              // just in case
              return;
            }
            mutatedIndexes = [];
            if (diffIndex > 0) {
              mutatedIndexes.push(diffIndex - 1);
            }
            mutatedIndexes.push(diffIndex);
            if (diffIndex < newCoords.length - 1) {
              mutatedIndexes.push(diffIndex + 1);
            }

            // decrease precision so we get more results. base on zoom, so you can
            // be more precise when you zoomn in
            const precision = -Math.pow(map.getZoom(), 2) * (1 / 16) + 50; // TODO: play around with this graph

            // iterate over pairs of path segments (so don't use the last point)
            // wait for all the segments to update before proceding
            await Promise.all(
              mutatedIndexes.slice(0, -1).map(async i => {
                delete lineMatchLegs[i];
                await updateSegment(i, newCoords, precision);
              })
            );
          } else {
            resetSegments(newCoords);
          }

          updateRenderedPath();

          lastLineCoords = newCoords;
        });

        map.on("draw.create", ev => {
          console.log(ev);
          console.log("Saving to server", ev.features);
          resetSegments(ev.features[0].geometry.coordinates);
          // await fetch(url, { body: ev.features, method: "PUT" })
          // handle errors
        });

        // draw.changeMode("draw_line_string", {
        //   featureId: editId,
        //   from: initialRoute.coordinates[initialRoute.coordinates.length - 1]
        // });
      });
    }
    // initMap()
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
  }, [routes])
  return (
    <>
      <div id="map-content" ref={mapRef}></div>
    </>
  )
}
