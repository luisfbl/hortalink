import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import type { Schedule } from "@interfaces/Schedule";
import { useRef, useState, useEffect } from "react";
import "@styles/layouts/schedule_form.scss";

interface AddressSearchResult {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        road?: string;
        city?: string;
        state?: string;
        country?: string;
    };
}

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
    const [addressQuery, setAddressQuery] = useState(props.scheduleData?.address || "");
    const [addressResults, setAddressResults] = useState<AddressSearchResult[]>([]);
    const [showAddressResults, setShowAddressResults] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<{lat: number, lon: number} | null>(null);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [locationMethod, setLocationMethod] = useState<'gps' | 'address' | null>('address'); // Default to address mode

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

    async function searchAddresses(query: string) {
        if (query.length < 3) {
            setAddressResults([]);
            setShowAddressResults(false);
            return;
        }

        console.log('Iniciando busca para:', query);
        setIsSearchingAddress(true);
        setShowAddressResults(true);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)}&` +
                `format=json&` +
                `addressdetails=1&` +
                `limit=5&` +
                `countrycodes=br&` +
                `accept-language=pt-BR`
            );
            
            if (response.ok) {
                const results: AddressSearchResult[] = await response.json();
                console.log('Resultados encontrados:', results);
                setAddressResults(results);
                setShowAddressResults(true);
            } else {
                console.error('Erro na resposta da API:', response.status);
                setAddressResults([]);
            }
        } catch (error) {
            console.error("Erro ao buscar endereços:", error);
            setAddressResults([]);
        } finally {
            setIsSearchingAddress(false);
        }
    }

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        
        if (addressQuery && addressQuery.length >= 3 && !selectedCoords) {
            if (locationMethod !== 'address' && locationMethod !== 'gps') {
                setLocationMethod('address');
            }
            
            if (locationMethod === 'address' || locationMethod === null) {
                timeout = setTimeout(() => searchAddresses(addressQuery), 600);
            }
        } else if (addressQuery.length === 0) {
            setAddressResults([]);
            setShowAddressResults(false);
            setSelectedCoords(null);
            setLocationStatus('idle');
        }
        
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [addressQuery, locationMethod, selectedCoords]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.address_search_container')) {
                setShowAddressResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddressSelect = (result: AddressSearchResult) => {
        console.log('Endereço selecionado:', result.display_name);
        console.log('Coordenadas:', { lat: result.lat, lon: result.lon });
        setAddressQuery(result.display_name);
        setSelectedCoords({ lat: parseFloat(result.lat), lon: parseFloat(result.lon) });
        setShowAddressResults(false);
        setAddressResults([]);
        setLocationStatus('success');

        const input = document.getElementById('address') as HTMLInputElement;
        if (input) {
            input.blur();
        }
    };

    const handleLocationMethodChange = (method: 'gps' | 'address') => {
        setLocationMethod(method);
        setLocationStatus('idle');
        setSelectedCoords(null);
        
        if (method === 'address' && addressQuery.length >= 3) {
            searchAddresses(addressQuery);
        }
    };

    const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddressQuery(value);
        
        if (selectedCoords) {
            setSelectedCoords(null);
            setLocationStatus('idle');
        }

        if (value.length > 0 && locationMethod !== 'address') {
            setLocationMethod('address');
        }
        
        if (!value) {
            setAddressResults([]);
            setShowAddressResults(false);
            setSelectedCoords(null);
            setLocationStatus('idle');
        }
    };

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        try {
            const form = new FormData(event.currentTarget);

            const address = addressQuery;
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

            let coords = null;
            
            if (locationMethod === 'gps' || (!props.scheduleData && locationMethod === null)) {
                coords = await getLoc();
            } else if (locationMethod === 'address' && selectedCoords) {
                coords = [selectedCoords.lon, selectedCoords.lat];
            } else if (locationMethod === 'address' && !selectedCoords) {
                alert("Por favor, selecione um endereço da lista ou use o GPS.");
                return;
            }

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
                    
                    <div className="location_method_selector">
                        <div className="method_options">
                            <button
                                type="button"
                                className={`method_button ${locationMethod === 'address' ? 'active' : ''}`}
                                onClick={() => handleLocationMethodChange('address')}
                            >
                                🗺️ Buscar endereço
                            </button>
                            <button
                                type="button"
                                className={`method_button ${locationMethod === 'gps' ? 'active' : ''}`}
                                onClick={() => handleLocationMethodChange('gps')}
                            >
                                📱 Usar GPS
                            </button>
                        </div>
                    </div>

                    <div className="input_group address_search_container">
                        <label htmlFor="address">Endereço completo</label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            placeholder="Ex: Feira da 304 Sul, Brasília - DF"
                            value={addressQuery}
                            onChange={handleAddressInputChange}
                            onFocus={() => {
                                if (addressQuery.length >= 3 && addressResults.length > 0 && !selectedCoords) {
                                    setShowAddressResults(true);
                                }
                            }}
                            required
                        />
                        
                        {showAddressResults && locationMethod === 'address' && (
                            <div className="address_results">
                                {isSearchingAddress ? (
                                    <div className="search_loading">Buscando endereços...</div>
                                ) : addressResults.length > 0 ? (
                                    addressResults.map((result) => (
                                        <div
                                            key={result.place_id}
                                            className="address_result_item"
                                            onClick={() => handleAddressSelect(result)}
                                        >
                                            <span className="address_name">{result.display_name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no_results">Nenhum endereço encontrado</div>
                                )}
                            </div>
                        )}
                        
                        <div className="location_status">
                            {locationStatus === 'loading' && (
                                <span className="status loading">
                                    {locationMethod === 'gps' ? 'Obtendo localização GPS...' : 'Processando endereço...'}
                                </span>
                            )}
                            {locationStatus === 'success' && (
                                <span className="status success">
                                    {locationMethod === 'gps' ? 'Localização GPS obtida' : 
                                     selectedCoords ? `Endereço selecionado ✓` : 'Endereço selecionado'}
                                </span>
                            )}
                            {locationStatus === 'error' && (
                                <span className="status error">
                                    {locationMethod === 'gps' ? 'Erro ao obter GPS' : 'Erro ao processar endereço'}
                                </span>
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