import { useStore } from "@nanostores/react"
import SelectionStore, { Selection } from "@stores/pages/SelectionStore.ts";

interface SelectorProps {
    is_seller: boolean,
    me_info: boolean
}

export default function Selector({is_seller, me_info}: SelectorProps) {
    let selected = useStore(SelectionStore.sectionSelection)

    return (
        <div className="selector">
            {
                is_seller && !me_info &&
                <p className={`${selected === Selection.Products ? 'selected' : ''}`} onClick={() => { SelectionStore.sectionSelection.set(Selection.Products) }}>Produtos</p>
            }

            {
                is_seller && !me_info &&
                <p className={`${selected === Selection.Schedule ? 'selected' : ''}`} onClick={() => { SelectionStore.sectionSelection.set(Selection.Schedule) }}>Agenda</p>
            }

            <p className={`${selected === Selection.Ratings ? 'selected' : ''}`} onClick={() => { SelectionStore.sectionSelection.set(Selection.Ratings) }}>Avaliações</p>

            {
                !is_seller && me_info &&
                <p className={`${selected === Selection.Orders ? 'selected' : ''}`} onClick={() => { SelectionStore.sectionSelection.set(Selection.Orders) }}>Pedidos</p>
            }
        </div>
    )
}