"use client";

import React, { useEffect, useRef } from 'react';
import "./MapEditor.style.css";
export type Route = {}

type MapEditorProps = {
  routes: Route[];
}

export default function MapEditor({ routes }: MapEditorProps) {
  const mapRef = useRef(null);
  useEffect(() => {
    function initMap(lat: number, lng: number) {
      if (!mapRef.current) {
        return
      }
      // FIXME
      var map = new BMapGL.Map(mapRef.current); // 创建Map实例
      // FIXME
      map.centerAndZoom(new BMapGL.Point(lng, lat), 12); // 初始化地图,设置中心点坐标和地图级别
      map.enableScrollWheelZoom(); // 开启鼠标滚轮
      let lineLayer = new BMapGL.LineLayer({
        enablePicked: true,
        autoSelect: true,
        pickWidth: 30,
        pickHeight: 30,
        selectedColor: 'yellow', // 选中项颜色
        style: { // 配置样式
          // borderMask: false,
          borderColor: 'rgba(27, 142, 236, .6)',
          borderWeight: 2,
          strokeWeight: 3,
          strokeStyle: 'dashed',
          strokeColor: ['case', ['boolean', ['feature-state', 'picked'], false], '#6704ff', ['match', ['get', 'name'], 'demo1', '#ce4848', 'demo2', '#6704ff', 'demo3', 'blue', '#6704ff']],
        }
      });
      const overlay = new BMapGL.Polyline([
        new BMapGL.Point(116.42448, 39.92922),
        new BMapGL.Point(116.31668, 39.92922),
        new BMapGL.Point(116.38021, 39.88892),
        new BMapGL.Point(116.42419, 39.90752)
      ], {
        strokeColor: '#8055e3',
        strokeWeight: 5,
        strokeOpacity: 1
      });
      map.addOverlay(overlay);
      map.addOverlay(lineLayer);
    }
    initMap()
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
      initMap()
    });
  }, [])
  console.log(routes)
  return (
    <>
      <link rel="stylesheet" type="text/css" href="https://api.map.baidu.com/res/webgl/10/bmap.css" />
      {/*eslint-disable-next-line @next/next/no-sync-scripts*/}
      <script type="text/javascript" src="https://api.map.baidu.com/getscript?type=webgl&v=1.0&ak=bmsPafLAscGa1GrwRubGzy5iSCIqYSaC&services=&t=20230706173803"></script>
      <div id="map-content" ref={mapRef}></div>
    </>
  )
}
