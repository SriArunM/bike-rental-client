import { RootState } from "../../store";

export const selectLocation: (state: RootState) => {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number } | null;
    mapLoaded: boolean;
    tripTime: [Date, Date];
    destinationInfo: {
        origin: string;
        destination: string;
        distance: string;
        duration: string;
        directionResponse: any;
    };
}; 