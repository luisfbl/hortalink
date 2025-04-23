import type { PreviewUser } from "./User";

interface ChatPreview {
    id: number,
    user: PreviewUser,
    last_message: string,
    created_at?: number, // Timestamp of chat creation
    updated_at?: number  // Timestamp of last update (for sorting)
}

interface ChatMessage {
    is_author: boolean,
    content: string,
    created_at: number,
    viewed: boolean
}

export type {
    ChatPreview,
    ChatMessage
}