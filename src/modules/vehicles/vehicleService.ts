import type { RegionId, Vehicle } from "@/types";

export function createVehicle(index: number, regionId: RegionId): Vehicle {
  return {
    id: `vehicle_${regionId}_${index}`,
    codeName: `Viatura Sertão-${String(index).padStart(2, "0")}`,
    regionId,
    status: "operacional",
    fuel: 100,
  };
}

export function consumeFuel(vehicle: Vehicle, amount: number): Vehicle {
  const fuel = Math.max(0, vehicle.fuel - amount);
  return { ...vehicle, fuel, status: fuel === 0 ? "indisponivel" : vehicle.status };
}
