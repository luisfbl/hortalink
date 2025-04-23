import ScreenSelectorLayout from "@layouts/common/ScreenSelectorLayout";
import ScreenSelector from "@components/common/ScreenSelector";
import { useEffect, useState } from "react";
import { OrderType } from "./Orders";
import OrdersLayout from "@layouts/OrdersLayout";

import type { SellerOrderProduct, SellerOrder as SellerOrderType } from "@interfaces/Orders";
import SellerOrder from "@components/SellerOrder";
import CustomerOrder from "@components/CustomerOrder.tsx";

export default function OrdersList(props: { orders: SellerOrderType[] }) {
    const orders = props.orders;
    const [orderType, setOrderType] = useState<OrderType>(OrderType.Open)

    return (
        <section className="orders_list_container">
            <ScreenSelectorLayout currentPage={orderType} setCurrentPage={setOrderType}>
                <ScreenSelector pageName={OrderType.Open} text="Abertos" />
                <ScreenSelector pageName={OrderType.Closed} text="Fechados" />
            </ScreenSelectorLayout>
            {orderType === OrderType.Open && 
                <OrdersLayout>
                    {
                        orders.map((order) => {
                            return (
                                <>
                                    {
                                        <CustomerOrder order={order} key={`product-${order.user.id}-${order.products.id}`} />
                                    }
                                </>
                            )
                        })
                    }
                </OrdersLayout>
            }
        </section>
    )
}