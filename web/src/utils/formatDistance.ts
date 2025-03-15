export default function formatDistance(distance: number) {
    if (distance >= 1000) {
        return `${(distance / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
    } else {
        return `${distance.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m`;
    }
}