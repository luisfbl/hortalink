import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper"
import type { SellerOrder } from "@interfaces/Orders"
import Session from "@stores/Session"
import { useEffect, useState } from "react"

export default function CreateChatOptions() {
    const API = new APIWrapper(RequestAPIFrom.Client)
    const [orders, setOrders] = useState<SellerOrder[]>([])

    useEffect(() => {
        async function run() {
            let session = Session.get()
            let Unbinder: () => void;

            if(session === null) {
                session = await new Promise((resolve, reject) => {
                    Unbinder = Session.listen((v) => {
                        resolve(v)
                    })
                })

                Unbinder() // remove o listen
            }

            if(session.profile.is_seller) {
                const newOrders = await API.getOrdersFromClient()
                setOrders(newOrders)   
            }
        }

        run()
    }, [])

    return (
        <>
            <h2 style={{ marginBottom: "1rem" }}>Pedidos recentes</h2>
            <div className="users_container">
                {
                    orders &&
                    orders.map((order) => (
                        <div className="user_preview">
                            {order.user.avatar ? (
                                <img
                                    className="user_image"
                                    src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/avatars/${order.user.id}/${order.user.avatar}.png?size=128`}
                                    width={52}
                                    height={52}
                                />
                            ) : (
                                <img
                                    className="user_image"
                                    src="/assets/default-picture.svg"
                                    width={52}
                                    height={52}
                                />
                            )}
                            <div className="side">
                                <h2>{order.user.name}</h2>
                                <p>Usuário</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}