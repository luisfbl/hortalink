interface Profile {
    avatar?: string,
    following: number | null,
    id: number,
    is_seller: boolean,
    name: string,
    orders_made: number | null,
    orders_received: number | null,
    roles: number[],
    followers: number | null,
    email?: string,
    email_notifications?: boolean,
    has_password?: boolean
}

export type {
    Profile
}