import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import type { ChatMessage } from "@interfaces/Chat";
import { createRef, useEffect, useState } from "react";
import { useStore } from '@nanostores/react';
import { ChatMessagesStore, addMessage } from "@stores/pages/Chats";

interface DisplayMessage {
    content: string,
    is_author: boolean,
    created_at: Date,
    viewed: boolean
}

interface MessageNotification {
    id: number,
    author_id: number,
    chat: number,
    content: string,
    created_at: Date
}

export default function ChatMessages(props: { pre_rendered: ChatMessage[], session_id: string, chat_id: number }) {
    const API = new APIWrapper(RequestAPIFrom.Client)
    const textInputRef = createRef<HTMLInputElement>()
    const chatMessagesStore = useStore(ChatMessagesStore)

    const sortedMessages = props.pre_rendered.sort((a, b) => a.created_at - b.created_at)
    
    const [messages, setMessages] = useState<DisplayMessage[]>(sortedMessages.map(msg => {
        return {
            content: msg.content,
            created_at: new Date(msg.created_at * 1000),
            is_author: msg.is_author,
            viewed: msg.viewed
        }
    }))

    useEffect(() => {
        if (!chatMessagesStore[props.chat_id] || chatMessagesStore[props.chat_id].length === 0) {
            import('@stores/pages/Chats').then(({ setMessages: setStoreMessages }) => {
                setStoreMessages(props.chat_id, props.pre_rendered)
            })
        }
    }, [])

    useEffect(() => {
        const storeMessages = chatMessagesStore[props.chat_id] || []
        const displayMessages = storeMessages.map(msg => ({
            content: msg.content,
            created_at: new Date(msg.created_at * 1000),
            is_author: msg.is_author,
            viewed: msg.viewed
        }))
        setMessages(displayMessages)
    }, [chatMessagesStore, props.chat_id])

    function createMessage(content: string) {
        if(!content || !content.length) {
            return
        }

        API.createChatMessage(props.chat_id, content, undefined).then(() => {
            const immediateMessage: DisplayMessage = {
                content: content,
                created_at: new Date(),
                is_author: true,
                viewed: true
            }
            
            setMessages(prev => [...prev, immediateMessage])
            
            if (textInputRef.current) {
                textInputRef.current.value = ''
            }
        })
    }
    
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault()
            createMessage(textInputRef.current?.value || '')
        }
    }

    return (
        <>
            <section className="messages_container">
                {
                    messages.map((message, i) => {
                        const msg_created = `${message.created_at.getHours()}:${message.created_at.getMinutes()}`

                        return (
                            <div className={`message ${message.is_author ? "msg_author" : "msg_non_author"}`} key={`message-${i}`}>
                                <p>{message.content}</p>
                                <div className="msg_data">
                                    <p>{msg_created} {message.is_author && message.viewed && "· visto" }</p>
                                </div>
                            </div>
                        )
                    })
                }
            </section>
            <div className="message_bar">
                <div className="line" style={{ maxWidth: "400px !important", margin: "0 auto" }} />
                <div className="bar_items">
                    <input 
                        type="text" 
                        className="message_input" 
                        ref={textInputRef} 
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua mensagem..."
                    />
                    <button className="send_message" onClick={() => createMessage(textInputRef.current?.value || '')}>
                        <svg
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M2 21l21-9L2 3v7l15 2-15 2v7z"
                                fill="white"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    )
}