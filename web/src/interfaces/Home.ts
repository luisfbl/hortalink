interface Home {
    role: number,
    recents: Product[] | null,
    more_orders: Product[] | null,
    recommendations: Product[] | null,
}

interface SellerHomeStats {
    monthly_revenue: string,
    total_orders: number,
    pending_orders: number,
    top_products: SellerTopProduct[],
    recent_orders: SellerRecentOrder[]
}

interface SellerTopProduct {
    id: number,
    name: string,
    photo: string,
    sold_quantity: number,
    revenue: string
}

interface SellerRecentOrder {
    id: number,
    customer_id: number,
    customer_name: string,
    customer_avatar: string | null,
    product_name: string,
    amount: number,
    created_at: string,
    status: number
}

export type {
    Home,
    SellerHomeStats,
    SellerTopProduct,
    SellerRecentOrder
}
