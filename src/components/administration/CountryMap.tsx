import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const GEO_URL = "/data/countries-110m.json";

const markers = [
  { name: "United States", coordinates: [-97, 38] as [number, number] },
  { name: "France", coordinates: [2.2137, 46.2276] as [number, number] },
];

interface CountryMapProps {
  mapColor?: string;
}

export default function CountryMap({ mapColor }: CountryMapProps) {
  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 100 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={mapColor || "#D0D5DD"}
              stroke="none"
              style={{
                default: { outline: "none" },
                hover: { fill: "#465fff", outline: "none" },
                pressed: { outline: "none" },
              }}
            />
          ))
        }
      </Geographies>
      {markers.map((marker) => (
        <Marker key={marker.name} coordinates={marker.coordinates}>
          <circle r={4} fill="#465FFF" stroke="#fff" strokeWidth={1} />
        </Marker>
      ))}
    </ComposableMap>
  );
}