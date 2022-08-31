import React, { useEffect, useRef, useState, useMemo } from "react";
import { render } from "react-dom";
import { MVTLayer } from "deck.gl";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { GoogleMapsOverlay as DeckOverlay } from "@deck.gl/google-maps";

const Newyork_Zoning =
  "https://testing-api.zoneomics.com/tiles/zones?x={x}&y={y}&z={z}&city_id=265";

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const GOOGLE_MAP_ID = "road";

const renderMap = (status) => {
  if (status === Status.LOADING) return <h3>{status} ..</h3>;
  if (status === Status.FAILURE) return <h3>{status} ...</h3>;
  return null;
};

function MyMapComponent({ center, zoom }) {
  const ref = useRef();
  const [map, setMap] = useState(null);
  let zones = [];
  const getZoneBasedColor = (zone_code) => {
    const randomBetween = (min = 0, max = 255) =>
      min + Math.floor(Math.random() * (max - min + 1));
    const r = randomBetween();
    const g = randomBetween();
    const b = randomBetween();
    const index = zones.find((zone) => zone.code === zone_code);
    if (index) {
      return index.color;
    } else {
      const color = [r, g, b, 255];
      zones.push({ code: zone_code, color: color });
      return color;
    }
  };
  const overlay = useMemo(
    () =>
      new DeckOverlay({
        layers: [
          new MVTLayer({
            data: Newyork_Zoning,
            minZoom: 9,
            maxZoom: 21,
            getLineColor: [255, 255, 255],
            getFillColor: (f, g) => {
              return getZoneBasedColor(f.properties.z);
            },
            lineWidthMinPixels: 1,
            opacity: 0.6,
          }),
        ],
      }),
    []
  );

  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
      overlay.setMap(map);
    }
  }, [map, center, zoom, overlay]);

  useEffect(() => {
    const map = new window.google.maps.Map(ref.current, {
      mapId: GOOGLE_MAP_ID,
    });
    setMap(map);
  }, []);
  return (
    <>
      <div ref={ref} id='map' style={{ height: "100vh", width: "100wh" }} />
    </>
  );
}

function Root() {
  const center = { lat: 40.7127753, lng: -74.0059728 };
  const zoom = 15;

  return (
    <>
      <Wrapper apiKey={GOOGLE_MAPS_API_KEY} render={renderMap}>
        <MyMapComponent center={center} zoom={zoom} />
      </Wrapper>
    </>
  );
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement("div")));
