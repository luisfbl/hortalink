import { useStore } from "@nanostores/react";
import SelectionStore, { Selection } from "@stores/pages/SelectionStore.ts";
import OrdersList from "@components/pages/users/@me/orders/OrdersList.tsx";
import type {SellerOrder} from "@interfaces/Orders.ts";

export default function OrdersSection(props: { orders: SellerOrder[] }) {
    const selected = useStore(SelectionStore.sectionSelection)

    if(selected === Selection.Orders) {
        return (
            <section className="seller_products_section">
                <OrdersList orders={props.orders} />
            </section>
        )
    } else {
        return (
            <></>
        )
    }
}