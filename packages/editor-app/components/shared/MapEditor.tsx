"use client";

import { useEffect, useRef } from 'react';
import "./MapEditor.style.css";
type Route = {}

type MapEditorProps = {
  routes: Route[];
}

export default function MapEditor({ routes }: MapEditorProps) {
  const mapRef = useRef(null);
  console.log(mapRef)
  useEffect(() => {
    function initMap() {
      if (!mapRef.current) {
        return
      }
      // FIXME
      // @ts-ignore
      var map = new BMapGL.Map(mapRef.current); // 创建Map实例
      // FIXME
      // @ts-ignore
      map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 12); // 初始化地图,设置中心点坐标和地图级别
      map.enableScrollWheelZoom(); // 开启鼠标滚轮
    }
    initMap()
  }, [])

  return (
    <>
      <link rel="stylesheet" type="text/css" href="https://api.map.baidu.com/res/webgl/10/bmap.css" />
      {/*eslint-disable-next-line @next/next/no-sync-scripts*/}
      <script type="text/javascript" src="https://api.map.baidu.com/getscript?type=webgl&v=1.0&ak=bmsPafLAscGa1GrwRubGzy5iSCIqYSaC&services=&t=20230706173803"></script>
      <div id="map-content" ref={mapRef}></div>
    </>
  )
}
