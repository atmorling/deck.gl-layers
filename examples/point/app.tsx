import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { StaticMap, MapContext, NavigationControl } from "react-map-gl";
import DeckGL, { GeoJsonLayer, ArcLayer, Layer } from "deck.gl/typed";
// import { GeoArrowPointLayer } from "deck.gl-geoarrow";
import { GeoArrowPointLayer } from "@geoarrow/deck.gl-layers";
// import { GeoArrowPointLayer } from "./point";
import * as arrow from "apache-arrow";
// console.log(GeoArrowPointLayer);

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson";

const GEOARROW_POINT_DATA =
  "http://localhost:8080/2019-01-01_performance_mobile_tiles_color.feather";

const INITIAL_VIEW_STATE = {
  latitude: 20,
  longitude: 0,
  zoom: 2,
  bearing: 0,
  pitch: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";
const NAV_CONTROL_STYLE = {
  position: "absolute",
  top: 10,
  left: 10,
};

function Root() {
  const onClick = (info) => {
    if (info.object) {
      // eslint-disable-next-line
      alert(
        `${info.object.properties.name} (${info.object.properties.abbrev})`
      );
    }
  };

  const [table, setTable] = useState<arrow.Table | null>(null);

  useEffect(() => {
    // declare the data fetching function
    const fetchData = async () => {
      const data = await fetch(GEOARROW_POINT_DATA);
      const buffer = await data.arrayBuffer();
      const table = arrow.tableFromIPC(buffer);
      setTable(table);
      // console.log(table);
    };

    if (!table) {
      fetchData().catch(console.error);
    }
  });

  const layers: Layer[] = [
    // new GeoJsonLayer({
    //   id: "airports",
    //   data: AIR_PORTS,
    //   // Styles
    //   filled: true,
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getPointRadius: (f) => 11 - f.properties.scalerank,
    //   getFillColor: [200, 0, 80, 180],
    //   // Interactive props
    //   pickable: true,
    //   autoHighlight: true,
    //   onClick,
    // }),
    // new ArcLayer({
    //   id: "arcs",
    //   data: AIR_PORTS,
    //   dataTransform: (d) =>
    //     d.features.filter((f) => f.properties.scalerank < 4),
    //   // Styles
    //   getSourcePosition: (f) => [-0.4531566, 51.4709959], // London
    //   getTargetPosition: (f) => f.geometry.coordinates,
    //   getSourceColor: [0, 128, 200],
    //   getTargetColor: [200, 0, 80],
    //   getWidth: 1,
    // }),
  ];

  table &&
    layers.push(
      new GeoArrowPointLayer({
        id: "geoarrow-points",
        data: table,
        getFillColor: [255, 0, 0],
        radiusMinPixels: 10,
        getPointRadius: 10,
        pointRadiusMinPixels: 0.8,
      })
    );

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      ContextProvider={MapContext.Provider}
    >
      <StaticMap mapStyle={MAP_STYLE} />
      <NavigationControl style={NAV_CONTROL_STYLE} />
    </DeckGL>
  );
}

/* global document */
const container = document.body.appendChild(document.createElement("div"));
createRoot(container).render(<Root />);
