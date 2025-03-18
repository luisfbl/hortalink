import type { Cart } from "@interfaces/Product";
import { useState } from "react";

export default function CartProduct(props: { cart: Cart }) {
    const cart = props.cart

    return (
        <section className="seller_cart" key={`cart-${cart.user.id}`}>
            <div className="seller_infos">
                <div className="img_container">
                    <img
                        src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/avatars/${cart.user.id}/${cart.user.avatar}.png?size=128`}
                        width={44}
                        height={44}
                    />
                </div>
                <h2>{cart.user.name}</h2>
                <a className="see_profile" href={`/users/${cart.user.id}`}>Ver Perfil</a>
            </div>
            {
                cart.products.map(product => {
                    const [counter, setCounter] = useState<number>(1)
                    
                    return (
                        <div className="product" key={`cart-product-${cart.user.id}-${product.product_id}`}>
                            <div>
                                <input type="checkbox" alt="Checkbox para selecionar ou não o produto." />
                            </div>
                            <img
                                className="product_image"
                                width={92}
                                height={92}
                                src={`${import.meta.env.PUBLIC_FRONTEND_CDN_URL}/products/${product.product_id}/${product.photo.replace("/", "⁄")}.jpg?size=256`}
                            />
                            <div className="product_infos">
                                <h3>{product.product_name}</h3>
                                <p>Distância: 1,2km</p>
                                <p>Valor por {product.unit}: R$ {product.price}</p>
                                <div className="price_container">
                                    <p className="price_label">Valor total</p>
                                    <p className="price">R$ {(Number(product.price.replace(",", ".")) * counter).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="selectors">
                                <WithDrawnSelector />
                                <Counter counter={counter} setCounter={setCounter} />
                            </div>
                        </div>
                    )
                })
            }
        </section>
    )
}

function WithDrawnSelector() {
    return (
        <section className="withdrawn">
            <div>
                <p>02/06 - 08:00</p>
                <p>Agendar</p>
            </div>
            <img
                src="/assets/white_calendar.svg"
                width={20}
                height={20}

            />
        </section>
    )
}

// TODO: alter implementation to increment product count at shared store, to be easy to get selected products, withdraw and count at reserve by user.
function Counter(props: { counter: number, setCounter: React.Dispatch<React.SetStateAction<number>> }) {
    const { counter, setCounter } = props

    return (
        <div className="counter quantity">
            <button className="btn" onClick={() => setCounter(c => Math.max(c - 1, 1))}>
                <img
                    src="/assets/minus.svg"
                    width={8.7}
                    height={8.7}
                    alt="Sinal de menos. Aperte para diminuir a quantidade do produto."
                />
            </button>
            <p>{counter}</p>
            <button className="btn" onClick={() => setCounter(c => Math.min(c + 1, 20))}>
                <img
                    src="/assets/more.svg"
                    width={8.7}
                    height={8.7}
                    alt="Sinal de mais. Aperte para aumentar a quantidade do produto."
                />
            </button>
        </div>
    )
}