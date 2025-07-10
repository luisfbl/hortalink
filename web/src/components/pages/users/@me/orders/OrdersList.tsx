import ScreenSelectorLayout from "@layouts/common/ScreenSelectorLayout";
import ScreenSelector from "@components/common/ScreenSelector";
import { useState } from "react";
import { OrderType } from "./Orders";
import OrdersLayout from "@layouts/OrdersLayout";

import type { SellerOrder as SellerOrderType, Order as CustomerOrderType } from "@interfaces/Orders";
import SellerOrder from "@components/SellerOrder";
import CustomerOrder from "@components/CustomerOrder";
import EmptyState from "@components/common/EmptyState";

type OrdersListProps = {
  orders: SellerOrderType[] | CustomerOrderType[];
  isSeller?: boolean;
};

export default function OrdersList(props: OrdersListProps) {
    const { orders, isSeller = false } = props;
    const [orderType, setOrderType] = useState<OrderType>(OrderType.Open);

    const isOpenOrder = (status: number) => status === 1 || status === 2;
    const isClosedOrder = (status: number) => status === 3 || status === 4;

    const isSellerOrders = (orders: any[]): orders is SellerOrderType[] => {
        return orders.length > 0 && 'user' in orders[0] && 'products' in orders[0];
    };

    const isCustomerOrders = (orders: any[]): orders is CustomerOrderType[] => {
        return orders.length > 0 && 'product' in orders[0] && 'amount' in orders[0];
    };

    const renderSellerOrders = (filterFn: (status: number) => boolean) => {
        if (!isSellerOrders(orders)) return null;
        
        const filteredOrders = orders.flatMap((order) => 
            order.products.filter(product => filterFn(product.status))
                .map(product => (
                    <SellerOrder 
                        key={`order-${product.order_id}-${product.product_id}`} 
                        fullOrder={order} 
                        orderProduct={product} 
                    />
                ))
        );

        return filteredOrders.length > 0 ? filteredOrders : (
            <EmptyState 
                message="Nenhum pedido encontrado" 
                icon="📦" 
                className="empty-orders" 
            />
        );
    };

    const renderCustomerOrders = (filterFn: (status: number) => boolean) => {
        if (!isCustomerOrders(orders)) return null;
        
        const filteredOrders = orders.filter(order => filterFn(order.status))
            .map(order => (
                <CustomerOrder 
                    key={`order-${order.id}-${order.product.id}`} 
                    order={order}
                />
            ));

        return filteredOrders.length > 0 ? filteredOrders : (
            <EmptyState 
                message="Nenhum pedido encontrado" 
                icon="📦" 
                className="empty-orders" 
            />
        );
    };

    if (orders.length === 0) {
        return (
            <EmptyState 
                message="Você não possui pedidos ainda" 
                icon="📦" 
                className="empty-orders" 
            />
        );
    }

    return (
        <section className="orders_list_container">
            <ScreenSelectorLayout currentPage={orderType} setCurrentPage={setOrderType}>
                <ScreenSelector pageName={OrderType.Open} text="Abertos" />
                <ScreenSelector pageName={OrderType.Closed} text="Fechados" />
            </ScreenSelectorLayout>
            
            {orderType === OrderType.Open && 
                <OrdersLayout>
                    {isSellerOrders(orders) ? 
                        renderSellerOrders(isOpenOrder) : 
                        renderCustomerOrders(isOpenOrder)}
                </OrdersLayout>
            }
            
            {orderType === OrderType.Closed && 
                <OrdersLayout>
                    {isSellerOrders(orders) ? 
                        renderSellerOrders(isClosedOrder) : 
                        renderCustomerOrders(isClosedOrder)}
                </OrdersLayout>
            }
        </section>
    );
}