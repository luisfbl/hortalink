import type { Product } from "./Product";
import type { Profile } from "./Profile";

interface SellerProfile extends Profile {
    is_seller: boolean,
    followers: number,
    orders_received: number
}

interface Seller {
    profile: SellerProfile
    products: Product[]
}

export type {
    Seller,
    SellerProfile
}