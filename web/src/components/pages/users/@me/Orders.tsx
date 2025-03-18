import { useStore } from "@nanostores/react";
import SelectionStore, { Selection } from "@stores/pages/SelectionStore.ts";
import Session from "@stores/Session";

export default function Orders() {
    const session = useStore(Session)
    const selected = useStore(SelectionStore.sectionSelection)

    if(selected === Selection.Orders) {
        return (    
            <div className="orders">
                {
                    session?.orders?.map((order, i) => (
                        <div className="order" key={`order-${order.id}`}>
                            <img
                                src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/products/${order.product.id}/${order.product.photo.replace("/", "⁄")}.jpg?size=1024`}
                                width={109}
                                height={109}
                                alt="Foto do produto"
                            />
                            <div className="content">
                                <p>Ordem #{order.id}</p>
                                <p className="seller_name">Mariazinha</p>
                                <p className="status_ok">Entregue</p>
                                <p className="price">Valor total: <span className="price_value">R$ 11,00</span></p>
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    } else {
        return (
            <></>
        )
    }
}