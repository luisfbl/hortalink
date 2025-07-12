import { useState } from "react";
import type { Schedule } from '@interfaces/Schedule';

const dayNames = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];

interface Props {
    schedules: Schedule[];
}

export default function SchedulesPage({ schedules }: Props) {
    const date = new Date();
    const currentDayOfWeek = date.getDay();

    const [selectedDay, setSelectedDay] = useState(currentDayOfWeek);

    const daysArr = new Array(7).fill(0);

    // Filter schedules based on selected day
    const filteredSchedules = schedules?.filter(schedule => schedule.day_of_week === selectedDay) || [];

    return (
        <>
            <header>
                <section className="create_schedule">
                    <div className="create_schedule_header">
                        <h2>Selecionar dia da semana</h2>
                    </div>
                    <div className="create_schedule_days_selector">
                        {daysArr.map((_, day) => (
                            <button
                                key={`create_schedule_day-${day}`}
                                className={`day ${selectedDay === day ? 'selected' : ''}`}
                                onClick={() => setSelectedDay(day)}
                                aria-label={`Selecionar ${dayNames[day]}`}
                            >
                                <span className="day_short">{dayNames[day].slice(0, 3)}</span>
                                <span className="day_full">{dayNames[day]}</span>
                            </button>
                        ))}
                    </div>
                    <a className="create_schedule_button" href={`/schedules/form?day_of_week=${selectedDay}`}>
                        Criar Agendamento
                    </a>
                </section>
            </header>
            <main>
                <h2 className="title">
                    Agendamentos - {dayNames[selectedDay]}
                    {filteredSchedules.length > 0 && (
                        <span className="schedule_count">({filteredSchedules.length})</span>
                    )}
                </h2>
                <section className="schedules">
                    {filteredSchedules?.length > 0 ? (
                        filteredSchedules.map((schedule) => (
                            <div key={schedule.id} className="schedule">
                                <div className="schedule_content">
                                    <p>Horário: {schedule.start_time} - {schedule.end_time}</p>
                                    <p>Local: {schedule.address}</p>
                                </div>
                                <a 
                                    className="edit_schedule" 
                                    href={`/schedules/form?schedule=${schedule.id}&day_of_week=${schedule.day_of_week}`}
                                >
                                    <img
                                        src="/assets/pencil_green.svg"
                                        width={24}
                                        height={24}
                                        alt="Imagem de uma caneta. Clique para editar o agendamento."
                                    />
                                </a>
                            </div>
                        ))
                    ) : (
                        <div className="no_schedules">
                            <p>Nenhuma agenda para {dayNames[selectedDay]}.</p>
                            <a href={`/schedules/form?day_of_week=${selectedDay}`} className="create_first_schedule">
                                Criar primeira agenda
                            </a>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}