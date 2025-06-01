import type { SellerOrder, SellerOrderProduct } from "@interfaces/Orders";

const OrderClasses = {
    1: "status_pending",
    2: "status_confirmed",
    3: "status_cancelled",
    4: "status_delivered"
}

const OrderStatusText = {
    1: "Em separação",
    2: "Aguardando retirada",
    3: "Cancelado",
    4: "Entregue"
}

export default function SellerOrder(props: { fullOrder: SellerOrder, orderProduct: SellerOrderProduct }) {
    // Formatar a data do pedido (ou usar data padrão se não estiver disponível)
    const formatDate = () => {
        if (props.orderProduct.created_at) {
            const date = new Date(props.orderProduct.created_at);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month} ${hours}:${minutes}`;
        } else {
            return "Data indisponível";
        }
    };

    // Calcular o preço total
    const totalPrice = (props.orderProduct.amount * props.orderProduct.price).toFixed(2);

    return (
        <a className="order" href={`/users/@me/orders/${props.orderProduct.order_id}?product_id=${props.orderProduct.product_id}`}>
            <div className="order_part">
                <div>
                    <h2 className="order_title">Pedido #{props.orderProduct.order_id}</h2>
                    <p className="order_author">Cliente: {props.fullOrder.user.name}</p>
                </div>
                <p className="order_date">{formatDate()}</p>
            </div>
            <div className="order_part" style={{ alignItems: "flex-end" }}>
                <p className="order_price">Valor: R$ {totalPrice}</p>
                <div className={`order_status ${OrderClasses[props.orderProduct.status] || "status_processing"}`}>
                    <p>{OrderStatusText[props.orderProduct.status] || "Processando"}</p>
                </div>
            </div>
        </a>
    )
}

export {
    OrderClasses,
    OrderStatusText
}