import Geolocation, {GPS_state} from "../stores/Geolocation";

function watchPosition() {
    const state = Geolocation.state.get();
    if (state === GPS_state.denied || state === GPS_state.not_available) {
        return;
    }

    if (!("geolocation" in navigator)) {
        console.log("Geolocalização não disponível no navegador, usando posição padrão");
        Geolocation.setState(GPS_state.not_available);

        return;
    }

    return navigator.geolocation.watchPosition((position) => {
        let current_location = Geolocation.position.get();
        const newPosition = [position.coords.latitude, position.coords.longitude];

        if (current_location && JSON.stringify(current_location) === JSON.stringify(newPosition)) {
            return;
        }

        console.log("Aviso: localização do dispositivo atualizada para:", newPosition);

        Geolocation.updatePosition(newPosition);

    }, (error) => {
        console.error("Erro de geolocalização:", error);
        if (error.code === error.PERMISSION_DENIED) {
            console.log("Permissão de localização negada pelo usuário");
            Geolocation.setState(GPS_state.denied);
        }
    }, {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    });
}

export default {
    watchPosition
}