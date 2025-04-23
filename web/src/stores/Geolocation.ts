import { atom } from "nanostores";

enum GPS_state {
    loading = "Carregando...",
    updated = "Localização atualizada.",
    denied = "Permissão negada.",
    not_available = "GPS não suportado.",
}

const position = atom<number[]>(null);
const state = atom<GPS_state>(GPS_state.loading);
const updateInProgress = atom<boolean>(false);

const updatePosition = (newPosition: number[]) => {
    position.set(newPosition);
    state.set(GPS_state.updated);
};

const setState = (newState: GPS_state) => {
    state.set(newState);
};

const setUpdateInProgress = (inProgress: boolean) => {
    updateInProgress.set(inProgress);
};

export default {
    position,
    state,
    updateInProgress,
    updatePosition,
    setState,
    setUpdateInProgress
}

export {
    GPS_state
}