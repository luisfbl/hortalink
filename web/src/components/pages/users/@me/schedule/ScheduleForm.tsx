import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import type { Schedule } from "@interfaces/Schedule";
import { useRef, useState, useEffect } from "react";
import "@styles/layouts/schedule_form.scss";

const DAYS_OF_WEEK = [
    { value: 0, label: "Dom", name: "Domingo" },
    { value: 1, label: "Seg", name: "Segunda" },
    { value: 2, label: "Ter", name: "Terça" },
    { value: 3, label: "Qua", name: "Quarta" },
    { value: 4, label: "Qui", name: "Quinta" },
    { value: 5, label: "Sex", name: "Sexta" },
    { value: 6, label: "Sáb", name: "Sábado" }
];

export default function CreateScheduleForm(props: { sellerId: number, scheduleData?: Schedule }) {
    const API = new APIWrapper(RequestAPIFrom.Client);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(props.scheduleData?.day_of_week ?? null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const URLObject = new URL(window.location.href);
            const dayParam = URLObject.searchParams.get("day_of_week");
            if (dayParam) {
                setSelectedDay(Number(dayParam));
            }
        }
    }, []);

    function getLoc(): Promise<number[]> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject("Geolocalização não é suportada pelo seu navegador.");
                return;
            }

            setLocationStatus('loading');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    setLocationStatus('success');
                    resolve([longitude, latitude]);
                },
                (error) => {
                    setLocationStatus('error');
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            reject("Permissão negada para acessar a localização.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            reject("Informações de localização indisponíveis.");
                            break;
                        case error.TIMEOUT:
                            reject("Tempo limite excedido ao tentar obter localização.");
                            break;
                        default:
                            reject("Erro desconhecido ao obter localização.");
                            break;
                    }
                }
            );
        });
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        try {
            const form = new FormData(event.currentTarget);

            const address = form.get("address");
            const start_time = form.get("start_time")?.toString();
            const end_time = form.get("end_time")?.toString();
            const useGPS = Boolean(form.get("use_gps"));

            if (!selectedDay && selectedDay !== 0) {
                alert("Por favor, selecione um dia da semana.");
                return;
            }

            if (!address || !start_time || !end_time) {
                alert("Por favor, preencha todos os campos obrigatórios.");
                return;
            }

            const coords = (!props.scheduleData || useGPS) ? await getLoc() : null;

            const [start_hour, start_minute] = start_time.split(":");
            const [end_hour, end_minute] = end_time.split(":");

            const scheduleData = {
                address: address.toString(),
                day_of_week: selectedDay,
                end_time: [Number(end_hour), Number(end_minute), 0, 0],
                start_time: [Number(start_hour), Number(start_minute), 0, 0],
                location: coords ? {
                    longitude: coords[0],
                    latitude: coords[1]
                } : undefined
            };

            if (!props.scheduleData) {
                await API.createSchedule(props.sellerId, scheduleData);
            } else {
                await API.editSchedule(props.sellerId, props.scheduleData.id, {
                    ...scheduleData,
                    location: useGPS ? scheduleData.location : undefined
                });
            }

            window.location.href = "/schedules";
        } catch (error) {
            alert(error.toString());
        } finally {
            setIsLoading(false);
        }
    }

    const handleDaySelect = (day: number) => {
        setSelectedDay(day);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set("day_of_week", day.toString());
            window.history.pushState({}, '', url.toString());
        }
    };

    return (
        <div className="schedule_form_container">
            <div className="day_selector_card">
                <h2>Selecionar dia da semana</h2>
                <div className="days_grid">
                    {DAYS_OF_WEEK.map((day) => (
                        <button
                            key={day.value}
                            type="button"
                            className={`day_button ${selectedDay === day.value ? 'selected' : ''}`}
                            onClick={() => handleDaySelect(day.value)}
                        >
                            <span className="day_label">{day.label}</span>
                            <span className="day_name">{day.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <form className="schedule_form" onSubmit={submit}>
                <div className="form_section">
                    <h2>Local de Venda</h2>
                    <div className="input_group">
                        <label htmlFor="address">Endereço completo</label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            placeholder="Ex: Feira da 304 Sul, Brasília - DF"
                            defaultValue={props.scheduleData?.address || ""}
                            required
                        />
                        <div className="location_status">
                            {locationStatus === 'loading' && (
                                <span className="status loading">Obtendo localização...</span>
                            )}
                            {locationStatus === 'success' && (
                                <span className="status success">Localização obtida</span>
                            )}
                            {locationStatus === 'error' && (
                                <span className="status error">Erro ao obter localização</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form_section">
                    <h2>Horário de Funcionamento</h2>
                    <div className="time_inputs">
                        <div className="input_group">
                            <label htmlFor="start_time">Horário de início</label>
                            <input
                                type="time"
                                name="start_time"
                                id="start_time"
                                defaultValue={props.scheduleData?.start_time || "08:00"}
                                required
                            />
                        </div>
                        <div className="time_separator">até</div>
                        <div className="input_group">
                            <label htmlFor="end_time">Horário de fim</label>
                            <input
                                type="time"
                                name="end_time"
                                id="end_time"
                                defaultValue={props.scheduleData?.end_time || "17:00"}
                                required
                            />
                        </div>
                    </div>
                </div>


                <div className="form_section">
                    <div className="checkbox_group">
                        <input
                            type="checkbox"
                            name="use_gps"
                            id="use_gps"
                            defaultChecked={false}
                        />
                        <label htmlFor="use_gps">
                            <span className="checkbox_icon">📱</span>
                            Usar sua localização atual
                        </label>
                    </div>
                </div>

                <button
                    className="submit_button"
                    type="submit"
                    disabled={isLoading || !selectedDay && selectedDay !== 0}
                >
                    {isLoading ? (
                        <>
                            <div className="loading_spinner"></div>
                            {props.scheduleData ? "Atualizando..." : "Criando..."}
                        </>
                    ) : (
                        <>
                            {props.scheduleData ? "Atualizar Agendamento" : "Criar Agendamento"}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}