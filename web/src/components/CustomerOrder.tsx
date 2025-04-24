import {OrderClasses, OrderStatusText} from "./SellerOrder";
import {useEffect, useState} from "react";
import type {Order, SellerOrder} from "@interfaces/Orders.ts";
import {getNextDayOfWeek} from "@utils/getNextDayOfWeek.ts";

export default function CustomerOrder(props: { order: Order }) {
    const { order } = props;
    const [orderDate, setOrderDate] = useState<string>("");
    const [urgencyClass, setUrgencyClass] = useState<string>("");
    let targetWeekday = getNextDayOfWeek(order.withdrawn)
    let currentWeekday = new Date(order.created_at)
    const diff = targetWeekday.getDay() - currentWeekday.getDay();
    currentWeekday.setDate(currentWeekday.getDate() + diff)

    useEffect(() => {
        const date = currentWeekday;
        const day = date.getDate();
        const month = date.getMonth();
        const hours = order.start_time[0]
        const minutes = order.start_time[1]

        let urgency = "";
        if (hours < 1) urgency = "very_urgent";
        else if (hours < 4) urgency = "urgent";
        else if (hours < 24) urgency = "warning";
        else urgency = "normal";

        setUrgencyClass(urgency);

        setOrderDate(`${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    }, []);

    const totalPrice = order.amount * (Number(order.product.price) || 0);

    return (
        <a className={`order ${urgencyClass}`} href={`/users/@me/orders/${order.id}?product_id=${order.product.id}`}>
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