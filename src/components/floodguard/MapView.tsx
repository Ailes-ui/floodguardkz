import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CENTER, riskColor, UPDATED, type ObservationPoint } from "@/lib/floodguard/data";

const riskLabel = { normal: "Нормальный", attention: "Повышенное внимание", critical: "Критический" } as const;

export default function MapView({ points }: { points: ObservationPoint[] }) {
  return (
    <MapContainer center={CENTER} zoom={13} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((p) => {
        const c = getComputedStyle(document.documentElement).getPropertyValue(riskColor[p.risk].slice(4, -1)).trim() || "#22c55e";
        return (
          <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={11} pathOptions={{ color: c, fillColor: c, fillOpacity: 0.75, weight: 3 }}>
            <Popup>
              <div className="space-y-0.5 text-xs">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="italic opacity-70">Предлагаемая точка наблюдения</p>
                <p>Условный уровень: <b>{p.level} см</b></p>
                <p>Изменение за час: <b>+{p.delta} см</b></p>
                <p>Связь: {p.online ? "в сети" : "нет связи"}</p>
                <p>Обновлено: {UPDATED}</p>
                <p>Риск: <b>{riskLabel[p.risk]}</b></p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
