import APIWrapper, {RequestAPIFrom} from "@HortalinkAPIWrapper";
import React, {useEffect, useState} from "react";
import type {Cart} from "@interfaces/Product.ts";
import type {Schedule} from "@interfaces/Schedule.ts";
import {CartProduct} from "@components/pages/cart/CartProduct.tsx";
import EmptyState from "@components/common/EmptyState";

export default function CartProducts() {
    const api = new APIWrapper(RequestAPIFrom.Client);
    const [carts, setCarts] = useState<Cart[]>([]);
    const [selectedItems, setSelectedItems] = useState<{orderId: number, productId: number}[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        async function init() {
            const data = await api.getCart();
            setCarts(data);
        }

        init();
    }, []);

    const toggleItem = (orderId: number, productId: number) => {
        const isSelected = selectedItems.some(item =>
            item.orderId === orderId && item.productId === productId
        );

        if (isSelected) {
            setSelectedItems(selectedItems.filter(item =>
                !(item.orderId === orderId && item.productId === productId)
            ));
        } else {
            setSelectedItems([...selectedItems, {orderId, productId}]);
        }
    };

    const updateProductAmount = async (orderId: number, amount: number) => {
        try {
            await api.updateCartProduct(orderId, { amount });

            setCarts(prevCarts =>
                prevCarts.map(cart => ({
                    ...cart,
                    products: cart.products.map(product =>
                        product.order_id === orderId
                            ? { ...product, amount }
                            : product
                    )
                }))
            );
        } catch (error) {
            console.error("Erro ao atualizar quantidade:", error);
        }
    };

    const updateProductSchedule = async (orderId: number, schedule: Schedule) => {
        try {
            await api.updateCartProduct(orderId, { withdrawn: schedule.id });
            setCarts(prevCarts =>
                prevCarts.map(cart => ({
                    ...cart,
                    products: cart.products.map(product =>
                        product.order_id === orderId
                            ? { ...product, withdrawn: schedule.id, day_of_week: schedule.day_of_week, start_time: schedule.start_time }
                            : product
                    )
                }))
            );
        } catch (error) {
            console.error("Erro ao atualizar agendamento:", error);
        }
    };

    const finalizePurchase = async () => {
        if (selectedItems.length === 0 || isProcessing) return;

        setIsProcessing(true);

        try {
            for (const item of selectedItems) {
                await api.reserveCartProduct(item.orderId);
            }

            // Atualizar o carrinho após finalização
            const updatedCart = await api.getCart();
            setCarts(updatedCart);
            setSelectedItems([]);

            setShowSuccessModal(true);
        } catch (error) {
            console.error("Erro ao finalizar compra:", error);
            alert("Ocorreu um erro ao finalizar a compra. Por favor, tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateTotal = () => {
        let total = 0;

        carts.forEach(cart => {
            cart.products.forEach(product => {
                const isSelected = selectedItems.some(item =>
                    item.orderId === product.order_id && item.productId === product.product_id
                );

                if (isSelected) {
                    total += Number(product.price.toString().replace(",", ".")) * (product.amount || 1);
                }
            });
        });

        return total.toFixed(2);
    };

    if (carts.length === 0) {
        return (
            <EmptyState 
                message="Seu carrinho está vazio" 
                icon="🛒" 
                className="empty-cart" 
            />
        );
    }

    return (
        <>
            {
                carts.map((cart, i) => {
                    return (
                        <React.Fragment key={`cart-frag-${cart.user.id}`}>
                            { i > 0 && <div className="line" style={{ maxWidth: "340px" }} key={`cart-line-${cart.user.id}`} />}
                            <CartProduct
                                cart={cart}
                                selectedItems={selectedItems}
                                toggleItem={toggleItem}
                                updateProductAmount={updateProductAmount}
                                updateProductSchedule={updateProductSchedule}
                            />
                        </React.Fragment>
                    )
                })
            }

            {carts.length > 0 && (
                <div className="cart_summary">
                    <div className="summary_content">
                        <div className="summary_info">
                            <p>Itens selecionados: <span>{selectedItems.length}</span></p>
                            <p className="total_price">Total: <span>R$ {calculateTotal()}</span></p>
                        </div>
                        <button
                            className="checkout_button"
                            disabled={selectedItems.length === 0 || isProcessing}
                            onClick={finalizePurchase}
                        >
                            {isProcessing ? 'Processando...' : 'Finalizar Compra'}
                        </button>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="modal_container">
                    <div className="success_modal">
                        <div className="modal_content">
                            <div className="modal_header">
                                <h2>Compra finalizada com sucesso!</h2>
                                <img
                                    src="/assets/X.svg"
                                    width={23}
                                    height={23}
                                    alt="Fechar modal"
                                    className="close"
                                    onClick={() => setShowSuccessModal(false)}
                                />
                            </div>
                            <p>Seus pedidos foram registrados com sucesso!</p>
                            <p>Você pode visualizar todos os seus pedidos na seção <strong>Pedidos</strong> do seu perfil.</p>
                            <div className="modal_buttons">
                                <a href="/users/@me" className="modal_button primary">Ver meus pedidos</a>
                                <button
                                    className="modal_button secondary"
                                    onClick={() => setShowSuccessModal(false)}
                                >
                                    Continuar comprando
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}