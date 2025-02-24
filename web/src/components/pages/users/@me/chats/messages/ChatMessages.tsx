import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import type { ChatMessage } from "@interfaces/Chat";
import { createRef, useEffect, useState } from "react";

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

    const sortedMessages = props.pre_rendered.sort((a, b) => a.created_at - b.created_at)
    
    const [messages, setMessages] = useState<DisplayMessage[]>(sortedMessages.map(msg => {
        return {
            content: msg.content,
            created_at: new Date(msg.created_at),
            is_author: msg.is_author,
            viewed: msg.viewed
        }
    }))

    useEffect(() => {
        const connection = new WebSocket(`${import.meta.env.PUBLIC_WS_URL}`)

        connection.addEventListener("open", () => {
            const identify = {
                opcode: 10,
                d: {
                    session_id: props.session_id
                }
            }
    
            connection.send(JSON.stringify(identify))
        })

        connection.addEventListener("message", (msg) => {
            const decoded_payload = JSON.parse(msg.data)
            const notification = decoded_payload.d as MessageNotification

            setMessages((oldMessages) => {
                const newMessage: DisplayMessage = {
                    content: notification.content,
                    created_at: new Date(notification.created_at),
                    is_author: false,
                    viewed: true
                }

                return [...oldMessages, newMessage]
            })
        })
    }, [])

    function createMessage(content: string) {
        if(!content || !content.length) {
            return
        }

        API.createChatMessage(props.chat_id, content, undefined).then(() => {
            setMessages((oldMessages) => {
                const newMessage: DisplayMessage = {
                    content: content,
                    created_at: new Date(),
                    is_author: true,
                    viewed: true
                }
    
                return [...oldMessages, newMessage]
            })
        })
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
                    <input type="text" className="message_input" ref={textInputRef} />
                    <button className="send_message" onClick={() => createMessage(textInputRef.current.value)}>
                        <img
                            src="/assets/mic_black.svg"
                            width={28}
                            height={28}
                            alt="Ícone de um avião de papel, clique para enviar a mensagem após escrever."
                        />
                    </button>
                </div>
            </div>
        </>
    )
}