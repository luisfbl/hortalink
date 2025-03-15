import { useEffect } from 'react';
import Session from "@stores/Session";
import geoLocation from "../utils/geoLocation";

export default function SessionInitializer({ userData }) {
    useEffect(() => {
        if (userData) {
            Session.set(userData);
        }

        geoLocation.watchPosition();
    }, [userData]);

    return null;
}
