import React, { useEffect } from 'react';
import { useStore } from "@nanostores/react";
import type { ChatPreview } from "@interfaces/Chat";
import APIWrapper, { RequestAPIFrom } from '@HortalinkAPIWrapper';
import { ChatsStore, updateChats } from "@stores/pages/Chats";

function ChatsContainer(props: { chats: ChatPreview[] }) {
    const chats = useStore(ChatsStore);
    const API = new APIWrapper(RequestAPIFrom.Client);

    useEffect(() => {
        // Initialize store with props if the store is empty
        if (chats.length === 0 && props.chats.length > 0) {
            updateChats(props.chats);
        }

        // Fetch latest chats from API
        async function fetchChats() {
            try {
                const latestChats = await API.getChats(undefined);
                if (latestChats) {
                    updateChats(latestChats);
                }
            } catch (error) {
                console.error("Failed to fetch chats:", error);
            }
        }

        fetchChats();
    }, [props.chats]);

    return (
        <section className="chats_container">
            {chats.length === 0 ? (
                <div className="empty-chats">
                    <p>Você não tem conversas no momento</p>
                </div>
            ) : (
                chats.map((chat, i) => (
                    <DisplayChatPreview preview={chat} key={i} />
                ))
            )}
        </section>
    );
}

function formatTime(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const currentDate = new Date();
    
    if (date.toDateString() === currentDate.toDateString()) {
        // Today, just show the time
        return `${date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`;
    } else if (
        date.getDate() === currentDate.getDate() - 1 && 
        date.getMonth() === currentDate.getMonth() && 
        date.getFullYear() === currentDate.getFullYear()
    ) {
        // Yesterday
        return `Ontem`;
    } else {
        // Other days
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }
}

function DisplayChatPreview(props: { preview: ChatPreview }) {
    // Assuming chat might have a created_at or updated_at timestamp
    // If not available in your data structure, you can show static time or last message time
    const chatTime = props.preview.created_at ? formatTime(props.preview.created_at) : "19:59";
    
    return (
        <a className="chat_preview" href={`/users/@me/chats/${props.preview.id}`}>
            <img 
                className="user_image"
                src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/avatars/${props.preview.user.id}/${props.preview.user.avatar}.png?size=128`}
                alt={`Foto de perfil de ${props.preview.user.name}`}
                width="52"
                height="52"
            />
            <div className="side">
                <div className="preview_upside">
                    <h2>{props.preview.user.name}</h2>
                    <p>{chatTime}</p>
                </div>
                <div className="preview_downside">
                    <p>{props.preview.last_message?.length >= 30 ? props.preview.last_message.slice(0, 30) + "..." : props.preview.last_message}</p>
                </div>
            </div>
        </a>
    );
}

export default ChatsContainer;