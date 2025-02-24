import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import { useRef } from "react";

export default function CreateScheduleForm(props: { sellerId: number }) {
    const API = new APIWrapper(RequestAPIFrom.Client)

    function getLoc(): Promise<number[]> {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject("Geolocalização não é suportada pelo seu navegador.");
              return;
            }
      
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve([longitude, latitude])
                },
                (error) => {
                    switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject("Permissão negada para acessar a localização.")
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
        })
    }


    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const form = new FormData(event.currentTarget)

        const URLObject = new URL(window.location.href)

        console.log("gettint coord")
        const coords = await getLoc()
        console.log("coord get")
        const address = form.get("address")
        const start_time = form.get("start_time")?.toString()
        const end_time = form.get("end_time")?.toString()
        const day_of_week = URLObject.searchParams.get("day_of_week")
        
        const [start_hour, start_minute] = start_time.split(":")
        const [end_hour, end_minute] = end_time.split(":")
        

        API.createSchedule(props.sellerId, {
            address: address.toString(),
            day_of_week: Number(day_of_week),
            end_time: [Number(end_hour), Number(end_minute), 0, 0],
            start_time: [Number(start_hour), Number(start_minute), 0, 0],
            location: {
                longitude: coords[0],
                latitude: coords[1]
            }
        }).then(() => {
            window.location.href = "/schedules"
        })
    }

    return (
        <>
            <form onSubmit={(event) => submit(event)}>
                <h2>Local:</h2>
                <input type="text" name="address" />
                <h2>Horário</h2>
                <div className="inputs_row">
                    <input type="text" maxLength={5} name="start_time" />
                    <div>:</div>
                    <input type="text" maxLength={5} name="end_time" />
                </div>
                <button className="action_button" type="submit">Criar agendamento</button>
            </form>
        </>
    )
}