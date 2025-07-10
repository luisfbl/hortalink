import type { SellerOrder, SellerOrderProduct } from "@interfaces/Orders";
import { getNextDayOfWeek } from "@utils/getNextDayOfWeek.ts";

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

    // Calcular e formatar a data de retirada
    const formatPickupDate = () => {
        if (props.orderProduct.withdrawn && props.orderProduct.withdrawn[0]) {
            const pickupDate = getNextDayOfWeek(props.orderProduct.withdrawn[0].day_of_week);
            if (pickupDate) {
                const day = String(pickupDate.getDate()).padStart(2, '0');
                const month = String(pickupDate.getMonth() + 1).padStart(2, '0');
                const startTime = props.orderProduct.withdrawn[0].start_time.slice(0, 5);
                return `${day}/${month} ${startTime}`;
            }
        }
        return "Data de retirada indisponível";
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
                <div>
                    <p className="order_date">Pedido: {formatDate()}</p>
                    <p className="order_pickup_date">Retirada: {formatPickupDate()}</p>
                    {props.orderProduct.picked_up && <p className="order_picked_up">✓ Retirado</p>}
                </div>
            </div>
            <div className="order_part" style={{ alignItems: "flex-end" }}>
                <div>
                    <p className="order_price">Valor: R$ {totalPrice}</p>
                    {props.orderProduct.picked_up && <p className="pickup_status picked_up">Retirado</p>}
                    {!props.orderProduct.picked_up && props.orderProduct.status === 2 && <p className="pickup_status not_picked_up">Não retirado</p>}
                </div>
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