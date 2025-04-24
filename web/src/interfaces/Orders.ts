interface Order {
    id: number,
    amount: number,
    withdrawn: number,
    start_time: number[],
    product: {
        id: number,
        name: string,
        photo: string,
        price: string
    },
    created_at: string,
    status: number
}

interface SellerOrder {
    user: {
        id: number,
        name: string,
        avatar: string
    },
    products: SellerOrderProduct[]
}

interface SellerOrderProduct {
    amount: number,
    order_id: number,
    photo: string,
    price: number,
    status: number,
    product_id: number,
    product_name: string,
    unit: number,
    created_at: string,
    withdrawn: {
        id: number,
        start_time: number[],
        end_time: number[],
        day_of_week: number,
        address: string,
        latitude: number,
        longitude: number
    },
}

export type {
    Order,
    SellerOrder,
    SellerOrderProduct
}