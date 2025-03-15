import Geolocation, {GPS_state} from "../stores/Geolocation";

function watchPosition() {
    const state = Geolocation.state.get();
    if (state === GPS_state.denied || state === GPS_state.not_available) {
        return
    }

    if ("geolocation" in navigator) {
        return navigator.geolocation.watchPosition((position) => {
            let current_location = Geolocation.position.get();

            if (current_location && JSON.stringify(current_location) ===
                JSON.stringify([position.coords.latitude, position.coords.longitude])) {
                return
            }

            console.log("Aviso: localização do dispositivo atualizada")

            Geolocation.position.set([position.coords.latitude, position.coords.longitude])
            Geolocation.state.set(GPS_state.updated)

        }, (error) => {
            if (error.code === error.PERMISSION_DENIED) {
                Geolocation.state.set(GPS_state.denied)
            }
        }, {
            enableHighAccuracy: true
        })
    } else {
        Geolocation.state.set(GPS_state.not_available)
    }
}

export default {
    watchPosition
}