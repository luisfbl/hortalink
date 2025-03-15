import type { Profile } from "@interfaces/Profile";

interface User {
    orders: any[],
    reviews: any[],
    profile: Profile
}

interface PreviewUser {
    id: number,
    name: string,
    avatar?: string,
    followers: number,
    orders_received: number
}

export type {
    User,
    PreviewUser
}