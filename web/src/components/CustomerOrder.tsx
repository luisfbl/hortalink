import {OrderClasses, OrderStatusText} from "./SellerOrder";
import {useEffect, useState} from "react";
import type {Order, SellerOrder} from "@interfaces/Orders.ts";

export default function CustomerOrder(props: { order: Order }) {
    const { order } = props;
    const [orderDate, setOrderDate] = useState<string>("");

    useEffect(() => {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        setOrderDate(`${day}/${month} ${hours}:${minutes}`);
    }, []);

    const totalPrice = order.amount * (order.product.price || 0);

    return (
        <a className="order" href={`/users/@me/orders/${order.id}?product_id=${order.product.id}`}>
            <div className="order_part">
                <div>
                    <h2 className="order_title">Pedido #{order.id}</h2>
                    <p className="order_author">Produto: {order.product.name}</p>
                </div>
                <p className="order_date">{orderDate}</p>
            </div>
            <div className="order_part" style={{ alignItems: "flex-end" }}>
                <p className="order_price">Valor: R$ {totalPrice.toFixed(2)}</p>
                <div className={`order_status ${OrderClasses[order.status] || "status_processing"}`}>
                    <p>{OrderStatusText[order.status] || "Processando"}</p>
                </div>
            </div>
        </a>
    )
}