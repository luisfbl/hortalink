import { useState } from "react";

const dayNames = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];

export default function CreateSchedule() {
    const date = new Date();
    const currentDayOfWeek = date.getDay();

    const [selectedDay, setSelectedDay] = useState(currentDayOfWeek);

    const daysArr = new Array(7).fill(0);

    return (
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
    );
}