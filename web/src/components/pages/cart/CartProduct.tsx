import type { Cart } from "@interfaces/Product";
import { useState, useEffect, useRef } from "react";
import {UNITS} from "@components/pages/users/@me/orders/order/SellerOrderData.tsx";
import ScheduleSelectionModal from "@components/pages/users/products/body/ScheduleModal.tsx";
import React from "react";
import type {Schedule} from "@interfaces/Schedule.ts";

export function CartProduct(props: {
    cart: Cart,
    selectedItems: {orderId: number, productId: number}[],
    toggleItem: (orderId: number, productId: number) => void,
    updateProductAmount: (orderId: number, amount: number) => Promise<void>,
    updateProductSchedule: (orderId: number, schedule: Schedule) => Promise<void>,
}) {
    const { cart, selectedItems, toggleItem, updateProductAmount, updateProductSchedule } = props;

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
                    const [counter, setCounter] = useState<number>(product.amount || 1);
                    const timerRef = useRef<NodeJS.Timeout | null>(null);
                    const isSelected = selectedItems.some(item =>
                        item.orderId === product.order_id && item.productId === product.product_id
                    );

                    const handleCounterChange = (newValue: number) => {
                        setCounter(newValue);

                        if (timerRef.current) {
                            clearTimeout(timerRef.current);
                        }

                        timerRef.current = setTimeout(() => {
                            updateProductAmount(product.order_id, newValue);
                        }, 2000);
                    };

                    useEffect(() => {
                        return () => {
                            if (timerRef.current) {
                                clearTimeout(timerRef.current);
                            }
                        };
                    }, []);

                    return (
                        <div className="product" key={`cart-product-${product.product_id}-${product.order_id}`}>
                            <div>
                                <input
                                    type="checkbox"
                                    alt="Checkbox para selecionar ou não o produto."
                                    checked={isSelected}
                                    onChange={() => toggleItem(product.order_id, product.product_id)}
                                />
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
                                <p>R$ {product.price}/{UNITS[product.unit].toLowerCase()}</p>
                                <div className="price_container">
                                    <p className="price_label">Valor total</p>
                                    <p className="price">R$ {(Number(product.price.toString().replace(",", ".")) * counter).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="selectors">
                                <WithDrawnSelector
                                    product={product}
                                    sellerId={cart.user.id}
                                    onScheduleSelected={(schedule) =>
                                        updateProductSchedule(product.order_id, schedule)
                                    }
                                />
                                <Counter
                                    counter={counter}
                                    setCounter={handleCounterChange}
                                />
                            </div>
                        </div>
                    )
                })
            }
        </section>
    )
}

function WithDrawnSelector({ product, sellerId, onScheduleSelected }) {
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState({
        id: product.withdrawn,
        address: "",
        start_time: product.start_time,
        end_time: "",
        day_of_week: product.day_of_week,
        longitude: 1,
        latitude: 1
    });

    const getNextDayOfWeek = (dayNumber: number) => {
        if (!dayNumber) return null;

        const today = new Date();
        const todayDayNumber = today.getDay() || 7;
        const daysToAdd = (dayNumber + 7 - todayDayNumber) % 7;

        const daysToAddFinal = daysToAdd === 0 ? 7 : daysToAdd;

        const nextDate = new Date();
        nextDate.setDate(today.getDate() + daysToAddFinal);

        const day = String(nextDate.getDate()).padStart(2, '0');
        const month = String(nextDate.getMonth() + 1).padStart(2, '0');

        return `${day}/${month}`;
    };

    const handleScheduleSelected = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setShowScheduleModal(false);

        onScheduleSelected(schedule);
    };

    const scheduleDate = getNextDayOfWeek(selectedSchedule.day_of_week);
    const scheduleTime = selectedSchedule.start_time ? selectedSchedule.start_time.slice(0, 5) : null;

    return (
        <>
            <section className="withdrawn" onClick={() => setShowScheduleModal(true)}>
                <div>
                    {selectedSchedule.id ? (
                        <p>{scheduleDate} - {scheduleTime}</p>
                    ) : (
                        <p>Selecionar data</p>
                    )}
                    <p>Agendar</p>
                </div>
                <img
                    src="/assets/white_calendar.svg"
                    width={20}
                    height={20}
                />
            </section>

            {showScheduleModal && (
                <ScheduleSelectionModal
                    selected={selectedSchedule}
                    productId={product.product_id}
                    sellerId={sellerId}
                    onClose={() => setShowScheduleModal(false)}
                    onScheduleSelected={handleScheduleSelected}
                />
            )}
        </>
    )
}

function Counter(props: { counter: number, setCounter: (value: number) => void }) {
    const { counter, setCounter } = props;

    return (
        <div className="counter quantity">
            <button className="btn" onClick={() => setCounter(Math.max(counter - 1, 1))}>
                <img
                    src="/assets/minus.svg"
                    width={8.7}
                    height={8.7}
                    alt="Sinal de menos. Aperte para diminuir a quantidade do produto."
                />
            </button>
            <p>{counter}</p>
            <button className="btn" onClick={() => setCounter(Math.min(counter + 1, 20))}>
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