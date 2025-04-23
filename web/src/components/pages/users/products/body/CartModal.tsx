import { useState } from "react";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import ScheduleSelectionModal from "./ScheduleModal";
import "@styles/components/cart_modal.scss"

interface CartModalProps {
    productId: number;
    sellerId: number;
}

export default function CartModal({ productId, sellerId }: CartModalProps) {
    const [amount, setAmount] = useState(1);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const api = new APIWrapper(RequestAPIFrom.Client);

    const handleAddToCart = async () => {
        if (!selectedSchedule) {
            setShowScheduleModal(true);
            return;
        }

        try {
            setIsAdding(true);
            await api.addToCart(productId, amount, selectedSchedule);

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            alert("Esse produto já foi adicionado ao seu carrinho");
        } finally {
            setIsAdding(false);
        }
    };

    const handleScheduleSelected = (scheduleId: number) => {
        setSelectedSchedule(scheduleId);
        setShowScheduleModal(false);
        handleAddToCart();
    };

    return (
        <div className="product-cart-section">
            <h2 className="cart-heading">Adicionar ao carrinho</h2>

            <div className="cart-controls">
                <div className="quantity-selector">
                    <button
                        className="quantity-btn"
                        onClick={() => setAmount(Math.max(1, amount - 1))}
                        disabled={isAdding}
                    >
                        <img
                            src="/assets/minus.svg"
                            width={10}
                            height={10}
                            alt="Diminuir quantidade"
                        />
                    </button>
                    <span className="quantity-value">{amount}</span>
                    <button
                        className="quantity-btn"
                        onClick={() => setAmount(Math.min(20, amount + 1))}
                        disabled={isAdding}
                    >
                        <img
                            src="/assets/more.svg"
                            width={10}
                            height={10}
                            alt="Aumentar quantidade"
                        />
                    </button>
                </div>
            </div>

            <button
                className="add-to-cart-button"
                onClick={() => setShowScheduleModal(true)}
            >
                {isAdding ? "Adicionando..." : "Adicionar ao carrinho"}
            </button>

            {showScheduleModal && (
                <ScheduleSelectionModal
                    productId={productId}
                    sellerId={sellerId}
                    selected={null}
                    onClose={() => setShowScheduleModal(false)}
                    onScheduleSelected={handleScheduleSelected}
                />
            )}

            {showSuccess && (
                <div className="success-toast">
                    Produto adicionado ao carrinho!
                </div>
            )}
        </div>
    );
}