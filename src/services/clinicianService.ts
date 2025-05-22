import { config } from "../config";
import { Polygon, Point, Feature } from "geojson";
import * as turf from "@turf/turf";

interface Clinician {
    id: number;
}

interface ClinicianStatus {
    id: number;
    safety_zone?: Polygon;
    current_location?: Point;
    last_updated: Date;
    status?: "in-zone" | "out-of-zone";
    error?: string;
}

class ClinicianService {

    getClinicians = async (): Promise<Clinician[]> => {
        return Array.from({ length: 7 }, (_, i) => ({ id: i + 1 }));
    }

    getClinicianStatus = async (clinicianId: number): Promise<ClinicianStatus> => {
        try {
            const response = await fetch(`${config.BASE_URL}/clinicianstatus/${clinicianId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch clinician status for clinician ${clinicianId}: ${response.statusText}`);
            }

            const data = await response.json();

            const { features } = data;

            if (!features) {
                throw new Error(`Invalid feature data for clinician ${clinicianId}. Data: ${JSON.stringify(data)}`);
            }

            const safety_zone = features.find((feature: Feature) => feature.geometry.type === 'Polygon');
            const current_location = features.find((feature: Feature) => feature.geometry.type === 'Point');

            if (!safety_zone || !current_location) {
                throw new Error(`Invalid GeoJSON data for clinician ${clinicianId}. Data: ${JSON.stringify(data)}`);
            }

            const inSafetyZone = turf.booleanPointInPolygon(current_location.geometry as Point, safety_zone.geometry as Polygon);

            return {
                id: clinicianId,
                status: inSafetyZone ? "in-zone" : "out-of-zone",
                safety_zone: safety_zone.geometry as Polygon,
                current_location: current_location.geometry as Point,
                last_updated: new Date()
            }
        } catch (error: any) {
            return {
                id: clinicianId,
                error: `${error.message}`,
                last_updated: new Date()
            }
        }
    }
}



export { ClinicianService };