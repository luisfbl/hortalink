import { useEffect, useState } from "react";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import type { Schedule } from "@interfaces/Schedule";
import "@styles/components/schedule_modal.scss"
import {dayNumberToName} from "@utils/weekDays.ts";

interface ScheduleModalProps {
    productId: number;
    sellerId: number;
    selected: Schedule;
    onClose: () => void;
    onScheduleSelected: (schedule: Schedule | 'no-schedules') => void;
    is_seller: boolean;
}

export default function ScheduleSelectionModal({ productId, sellerId, selected, onClose, onScheduleSelected, is_seller = false }: ScheduleModalProps) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(selected);
    const api = new APIWrapper(RequestAPIFrom.Client);

    useEffect(() => {
        async function loadSchedules() {
            try {
                const sellerSchedules = await api.getSellerSchedules(sellerId, productId);
                setSchedules(sellerSchedules);
            } catch (error) {
                console.error("Failed to load schedules:", error);
            } finally {
                setLoading(false);
            }
        }

        loadSchedules();
    }, [sellerId]);

    const handleConfirm = () => {
        if (selectedSchedule !== null) {
            onScheduleSelected(selectedSchedule);
        }
    };

    const handleCreateSchedule = () => {
        onScheduleSelected('no-schedules');
    };

    return (
        <section className="modal_container">
            <div className="schedule_modal">
                <div className="modal_header">
                    <h2>Selecionar Retirada</h2>
                    <img
                        src="/assets/X.svg"
                        width={18}
                        height={18}
                        alt="Fechar"
                        className="close"
                        onClick={onClose}
                    />
                </div>

                {loading ? (
                    <p className="loading">Carregando agendamentos...</p>
                ) : schedules.length === 0 ? (
                    <div className="no_schedules_container">
                        <p className="no-schedules">Você ainda não tem agendamentos cadastrados.</p>
                        {
                            is_seller ? (
                                <button className="create_schedule_btn" onClick={handleCreateSchedule}>
                                    Criar Primeiro Agendamento
                                </button>
                            ) : <p></p>
                        }
                    </div>
                ) : (
                    <div className="schedules_list">
                        {schedules.map((schedule) => (
                            <div
                                key={`schedule-${schedule.id}`}
                                className={`schedule_item ${selectedSchedule ? (selectedSchedule.id === schedule.id ? 'selected' : '') : ''}`}
                                onClick={() => setSelectedSchedule(schedule)}
                            >
                                <div className="schedule_details">
                                    <p className="schedule_day">{dayNumberToName[schedule.day_of_week]}</p>
                                    <p className="schedule_time">{schedule.start_time} - {schedule.end_time}</p>
                                    <a className="schedule_address" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${schedule.latitude}%2C${schedule.longitude}`}>
                                        {schedule.address}
                                    </a>
                                </div>
                                <div className="schedule_select">
                                    <button className={`select_btn ${selectedSchedule ? (selectedSchedule.id === schedule.id ? 'selected' : '') : ''}`}>
                                        {selectedSchedule ? (selectedSchedule.id === schedule.id ? 'Selecionado' : 'Selecionar') : 'Selecionar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {schedules.length > 0 && (
                    <div className="buttons">
                        <button
                            className="confirm_btn"
                            onClick={handleConfirm}
                            disabled={selectedSchedule === null}
                        >
                            Confirmar
                        </button>
                        <button className="cancel_btn" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}