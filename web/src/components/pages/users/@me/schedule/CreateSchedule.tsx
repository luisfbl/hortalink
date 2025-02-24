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
    const currentDay = date.getDate()
    const currentMonth = date.getMonth()
    
    const days: number[] = new Array(dayNames.length)
    days[currentDayOfWeek] = currentDay
    const lastDay = getLastDay(currentMonth + 1, date.getFullYear())
    
    const [selectedDay, setSelectedDay] = useState(currentDay)
    const [selectedMonth, setSelectedMonth] = useState(currentMonth + 1)

    let dayMove = 1
    for (let d = currentDayOfWeek + 1; d < dayNames.length; d++) {
        let newDay = currentDay + dayMove
        if(newDay > lastDay) {
            newDay -= lastDay
        }
        days[d] = newDay
        dayMove += 1
    }

    dayMove = 1

    for(let d = currentDayOfWeek - 1; d > -1; d--) {
        let newDay = currentDay - dayMove

        if(newDay < 1) {
            newDay = lastDay - (newDay)
        }
        days[d] = newDay
        dayMove += 1
    }

    return (
        <section className="create_schedule">
            <div className="create_schedule_header">
                <img
                    src="/assets/chevron.svg"
                    alt="Seta para esquerda, clique para mudar para o mês anterior."
                    width={27}
                    height={27}
                    style={{ marginRight: "auto" }}
                    onClick={() => {
                        if(selectedMonth >= 2) {
                            setSelectedMonth((month) => month - 1)
                        }
                    }}
                />
                <h2>{monthNames[selectedMonth]}</h2>
                <img
                    src="/assets/chevron.svg"
                    alt="Seta para direita, clique para mudar para o próximo mês."
                    width={27}
                    height={27}
                    style={{ transform: "rotate(-180deg)", marginLeft: "auto" }}
                    onClick={() => {
                        if(selectedMonth <= 11) {
                            setSelectedMonth((month) => month + 1)
                        }
                    }}
                />
            </div>
            <div className="create_schedule_days_selector">
                {
                    days.map((day, i) => (
                        <button key={`create_schedule_day-${day}`} className={`day ${selectedDay === day ? 'selected': ''}`} onClick={() => setSelectedDay(day)} aria-label={`Selecionar a data`}>
                            {dayNames[i].slice(0, 3)}<br />
                        </button>    
                    ))
                }
            </div>
            <button className="create_schedule_button">
                Criar Agendamento
            </button>
        </section>
    )
}