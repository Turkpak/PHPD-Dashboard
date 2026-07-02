/**
 * Converts boundary files (KML, KMZ, shapefile) to GeoJSON for API upload.
 * .geojson / .json files are returned as-is. Backend expects boundary_file as GeoJSON.
 */

import { kml } from "@tmcw/togeojson";
import shp from "shpjs";
import JSZip from "jszip";

const GEOJSON_EXTENSIONS = ["geojson", "json"];

function getExtension(file) {
  const name = file.name.toLowerCase();
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop() : "";
}

export async function boundaryFileToGeojson(file) {
  const ext = getExtension(file);

  if (GEOJSON_EXTENSIONS.includes(ext)) return file;

  if (ext === "kml") {
    const text = await file.text();
    const doc = new DOMParser().parseFromString(text, "text/xml");
    const geojson = kml(doc);
    const blob = new Blob([JSON.stringify(geojson)], { type: "application/geo+json" });
    return new File([blob], "boundary.geojson", { type: "application/geo+json" });
  }

  if (ext === "kmz") {
    const buf = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const kmlEntry = Object.keys(zip.files).find((k) => k.toLowerCase().endsWith(".kml"));
    if (!kmlEntry) throw new Error("KMZ archive does not contain a .kml file");
    const kmlText = await zip.files[kmlEntry].async("string");
    const doc = new DOMParser().parseFromString(kmlText, "text/xml");
    const geojson = kml(doc);
    const blob = new Blob([JSON.stringify(geojson)], { type: "application/geo+json" });
    return new File([blob], "boundary.geojson", { type: "application/geo+json" });
  }

  if (ext === "zip" || ext === "shp") {
    const buf = await file.arrayBuffer();
    const geojson = await shp(buf);
    const data = Array.isArray(geojson)
      ? { type: "FeatureCollection", features: geojson.flatMap((l) => l.features ?? []) }
      : geojson;
    const blob = new Blob([JSON.stringify(data)], { type: "application/geo+json" });
    return new File([blob], "boundary.geojson", { type: "application/geo+json" });
  }

  throw new Error(
    `Unsupported boundary file type: .${ext}. Use .geojson, .json, .kml, .kmz, or shapefile (.zip/.shp).`
  );
}
