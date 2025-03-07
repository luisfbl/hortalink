import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";
import type { Schedule } from "@interfaces/Schedule";
import { useRef } from "react";

export default function CreateScheduleForm(props: { sellerId: number, scheduleData?: Schedule }) {
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

      
        const address = form.get("address")
        const start_time = form.get("start_time")?.toString()
        const end_time = form.get("end_time")?.toString()
        const day_of_week = URLObject.searchParams.get("day_of_week")
        const useGPS = Boolean(form.get("use_gps"))

        const coords = (!props.scheduleData || !useGPS) ? await getLoc() : null
        
        const [start_hour, start_minute] = start_time.split(":")
        const [end_hour, end_minute] = end_time.split(":")
        

        if(!props.scheduleData) {
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
        } else {
            API.editSchedule(props.sellerId, props.scheduleData.id, {
                address: address.toString(),
                day_of_week: Number(day_of_week),
                end_time: [Number(end_hour), Number(end_minute), 0, 0],
                start_time: [Number(start_hour), Number(start_minute), 0, 0],
                location: useGPS ? {
                    longitude: coords[0],
                    latitude: coords[1]
                } : undefined
            }).then(() => {
                window.location.href = "/schedules"
            })
        }
    }

    return (
        <>
            <form onSubmit={(event) => submit(event)}>
                <h2>Local:</h2>
                <input type="text" name="address" defaultValue={props.scheduleData?.address || null} />
                <h2>Horário</h2>
                <div className="inputs_row">
                    <input type="text" maxLength={5} name="start_time" defaultValue={props.scheduleData?.start_time || null} />
                    <div>:</div>
                    <input type="text" maxLength={5} name="end_time" defaultValue={props.scheduleData?.end_time || null} />
                </div>
                {
                    props.scheduleData && <>
                        <div className="inputs_row" style={{ marginTop: "1rem" }}>
                            <input type="checkbox" name="use_gps" id="use_gps" defaultChecked={false} />
                            <label htmlFor="use_gps">Atualizar localização usando GPS</label>
                        </div>
                    </>
                }
                <button className="action_button" type="submit">Criar agendamento</button>
            </form>
        </>
    )
}