interface Order {
    id: number,
    amount: number,
    product: {
        id: number,
        name: string,
        photo: string,
        price: number
    },
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
    withdrawn: number
}

export type {
    Order,
    SellerOrder,
    SellerOrderProduct
}