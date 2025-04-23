import type { SellerOrder, SellerOrderProduct } from "@interfaces/Orders";
import { OrderStatusText } from "@components/SellerOrder";
import { useState } from "react";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";

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

    return (
        <main>
            <div id="order_code">
                Código do pedido:<br />
                #{props.product.order_id}
            </div>
            <h2>Dados</h2>
            <p><span className="label_text">Status do pedido:</span> {OrderStatusText[props.product.status] || "Em processamento"}</p>
            <p><span className="label_text">Retirada:</span> </p>
            <p className="label_text">Cliente:</p>
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
            <div className="line" />
            <h2>Resumo</h2>
            <p><span className="label_text">Qt Produtos:</span> {props.fullOrder.products.length}</p>
            <p><span className="label_text">Total:</span> <span className="price">R$ {total}</span></p>
            { props.product.status == 2 && <button className="update_button" onClick={() => setModalOpen(true)}>Cancelar pedido</button> }
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
        </main>
    )
}