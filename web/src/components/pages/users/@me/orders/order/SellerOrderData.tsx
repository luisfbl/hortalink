import type { SellerOrder, SellerOrderProduct } from "@interfaces/Orders";
import { OrderStatusText } from "@components/SellerOrder";
import { useState } from "react";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import { getNextDayOfWeek } from "@utils/getNextDayOfWeek.ts";

export const UNITS = {
    0: "kg",
    1: "hg",
    2: "dag",
    3: "G",
    4: "Cg",
    5: "Mg",
    6: "U"
}

export default function SellerOrderData(props: { product: SellerOrderProduct, fullOrder: SellerOrder }) {
    const API = new APIWrapper(RequestAPIFrom.Client)

    const [modalOpen, setModalOpen] = useState(false)
    const [pickupModalOpen, setPickupModalOpen] = useState(false)
    let total = 0

    for(const product of props.fullOrder.products) {
        total += product.amount * product.price
    }

    async function confirmDelete() {
        API.deleteOrder(props.product.order_id).then(() => {
            window.location.reload()
        }).catch(e => {
            console.error(e)
            alert("Não foi possível cancelar, acesse o console para ver o erro.")
        })

        setModalOpen(false)
    }

    async function markAsPickedUp() {
        try {
            // Format date as YYYY-MM-DD HH:MM:SS for NaiveDateTime
            const now = new Date();
            const pickup_date = now.toISOString().slice(0, 19).replace('T', ' ');
            
            await API.markOrderAsPickedUp(props.product.order_id, pickup_date);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Não foi possível marcar como retirado, acesse o console para ver o erro.");
        }
        setPickupModalOpen(false);
    }

    // Calcular a data de retirada corretamente
    const pickupDate = getNextDayOfWeek(props.product.withdrawn[0].day_of_week);
    const today = new Date();
    const diffTime = pickupDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let relativeText = "";
    if (diffDays === 0) relativeText = " (hoje)";
    else if (diffDays === 1) relativeText = " (amanhã)";
    else if (diffDays > 1) relativeText = ` (daqui a ${diffDays} dias)`;
    else if (diffDays === -1) relativeText = " (ontem)";
    else if (diffDays < -1) relativeText = ` (há ${Math.abs(diffDays)} dias)`;

    return (
        <main>
            <div id="order_code">
                Código do pedido:<br />
                #{props.product.order_id}
            </div>
            <h2>Dados</h2>
            <p><span className="label_text">Status do pedido:</span> {OrderStatusText[props.product.status] || "Em processamento"}</p>
            <p>
                <span className="label_text">
                    Retirada em:
                    <a target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${props.product.withdrawn[0].latitude}%2C${props.product.withdrawn[0].longitude}`}>
                         {props.product.withdrawn[0].address}
                    </a>
                    {relativeText} ás {props.product.withdrawn[0].start_time.slice(0, 5)}
                </span>
            </p>
            <p><span className="label_text">Status da retirada:</span> {props.product.picked_up ? "Retirado" : "Não retirado"}</p>
            {props.product.picked_up && props.product.pickup_date && (
                <p><span className="label_text">Data da retirada:</span> {new Date(props.product.pickup_date).toLocaleDateString('pt-BR')} {new Date(props.product.pickup_date).toLocaleTimeString('pt-BR')}</p>
            )}
            <div className="client_card">
                <img
                    src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/avatars/${props.fullOrder.user.id}/${props.fullOrder.user.avatar}.png?size=128`}
                    width={64}
                    height={64}
                    className="client_photo"
                />
                <div className="text">
                    <h2 style={{ marginBottom: "0.5rem" }}>{props.fullOrder.user.name}</h2>
                    <a href={`/users/@me/chats/${props.fullOrder.user.id}`} className="see_profile">Entrar em contato</a>
                </div>
                <a href={`/users/${props.fullOrder.user.id}`} className="see_profile">Ver perfil</a>
            </div>
            <div className="line" />
            <h2 style={{ marginBottom: "1rem" }}>Produtos</h2>
            <div className="order_products">
                {props.fullOrder && props.fullOrder.products.map((product) => (
                    <div className="order_product" key={product.product_id}>
                        <img 
                            className="product_img"
                            width={75}
                            height={75}
                            src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/products/${product.product_id}/${product.photo.replace("/", "⁄")}.jpg?size=256`}
                        />
                        <div className="text">
                            <h2>{product.product_name}</h2>
                            <p><span className="label_text">Valor:</span> R${product.price} / {UNITS[product.unit] || "unknown"}</p>
                            <p><span className="label_text">Quantidade:</span> {product.amount}</p>
                        </div>
                        <div className="totalValue">
                            <p className="label_text" style={{ fontSize: "0.8em" }}>Valor total:</p>
                            <p style={{ fontSize: "1em", textAlign: "right" }}>R$ {product.price * (product.amount || 1)}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="order_actions">
                { props.product.status == 2 && <button className="update_button" onClick={() => setModalOpen(true)}>Cancelar pedido</button> }
                { props.product.status == 2 && !props.product.picked_up && <button className="pickup_button" onClick={() => setPickupModalOpen(true)}>Marcar como retirado</button> }
            </div>
            {
                modalOpen &&
                <section className="modal_container">
                    <section className="order_modal">
                        <div className="modal_content">
                            <section className="modal_header" onClick={() => setModalOpen(false)}>
                                <h2>Cancelar pedido</h2>
                                <img
                                    src="/assets/X.svg"
                                    width={23}
                                    height={23}
                                    alt="Imagem de um X. Clique para fechar a seção de filtros."
                                    className="close"
                                />
                            </section>
                            <p style={{ margin: "1rem auto", textAlign: "center" }}>Tem certeza que deseja cancelar o pedido?</p>
                            <div className="order_buttons">
                            <button className="order_button order_cancel" onClick={() => setModalOpen(false)}>Não</button>
                            <button className="order_button order_confirm" onClick={confirmDelete}>Sim</button>
                            </div>
                        </div>
                    </section>
                </section>
            }
            {
                pickupModalOpen &&
                <section className="modal_container">
                    <section className="order_modal">
                        <div className="modal_content">
                            <section className="modal_header" onClick={() => setPickupModalOpen(false)}>
                                <h2>Marcar como retirado</h2>
                                <img
                                    src="/assets/X.svg"
                                    width={23}
                                    height={23}
                                    alt="Imagem de um X. Clique para fechar a seção de filtros."
                                    className="close"
                                />
                            </section>
                            <p style={{ margin: "1rem auto", textAlign: "center" }}>Confirmar que o cliente retirou o pedido?</p>
                            <div className="order_buttons">
                                <button className="order_button order_cancel" onClick={() => setPickupModalOpen(false)}>Não</button>
                                <button className="order_button order_confirm" onClick={markAsPickedUp}>Sim</button>
                            </div>
                        </div>
                    </section>
                </section>
            }
        </main>
    )
}