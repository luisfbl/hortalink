import { atom } from "nanostores";

enum GPS_state {
    loading = "Carregando...",
    updated = "Localização atualizada.",
    denied = "Permissão negada.",
    not_available = "GPS não suportado.",
}

export default {
    position: atom<number[]>(null),
    state: atom<GPS_state>(GPS_state.loading)
}

export {
    GPS_state
}