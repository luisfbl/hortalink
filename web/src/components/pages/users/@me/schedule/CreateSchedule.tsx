import { dayNumberToName }from "@utils/weekDays";
import { useState } from "react";

const dayNames = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"]
const monthNames = {
    1: "Janeiro",
    2: "Fevereiro",
    3: "Março",
    4: "Abril",
    5: "Maio",
    6: "Junho",
    7: "Julho",
    8: "Agosto",
    9: "Setembro",
    10: "Outubro",
    11: "Novembro",
    12: "Dezembro"
}

function getLastDay(month: number, year: number): number {
    if (month === 2) {
        return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
    } else if ([4, 6, 9, 11].includes(month)) {
        return 30;
    } else {
    
        return 31;
    }
}

export default function CreateSchedule() {
    const date = new Date()

    const currentDayOfWeek = date.getDay() // day of week
    
    const [selectedDay, setSelectedDay] = useState(currentDayOfWeek)

    const daysArr = new Array(7).fill(0)

    return (
        <section className="create_schedule">
            <div className="create_schedule_header">
                <h2>Selecionar dia da semana</h2>
            </div>
            <div className="create_schedule_days_selector">
                {
                    daysArr.map((_, day) => (
                        <button key={`create_schedule_day-${day}`} className={`day ${selectedDay === day ? 'selected': ''}`} onClick={() => setSelectedDay(day)} aria-label={`Selecionar a data`}>
                            {dayNames[day].slice(0, 3)}<br />
                        </button>    
                    ))
                }
            </div>
            <a className="create_schedule_button" href={`/schedules/form?day_of_week=${selectedDay}`}>
                Criar Agendamento
            </a>
        </section>
    )
}