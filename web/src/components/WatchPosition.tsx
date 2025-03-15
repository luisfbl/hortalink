import geoLocation from "../utils/geoLocation";
import { useEffect } from "react";

export default function WatchPosition() {
    useEffect(() => {
        geoLocation.watchPosition()
    }, [])

    return <></>
}