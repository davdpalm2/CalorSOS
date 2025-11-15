import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url),
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url),
    shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url),
});

export default L;
