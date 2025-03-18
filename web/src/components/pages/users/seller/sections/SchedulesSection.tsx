import SellerSchedules from "@layouts/SellerSchedules";
import SellerScheduleGroup from "@components/sellerScheduleGroup";
import type { Schedule } from "@interfaces/Schedule";
import { useStore } from "@nanostores/react";
import SelectionStore, { Selection } from "@stores/pages/SelectionStore";

export default function SellerSchedulesSection(props: { schedules: Schedule[] }) {
    const selected = useStore(SelectionStore.sectionSelection)

    if(selected === Selection.Schedule) {
        const groupedSchedules: Record<number, Schedule[]> = {}

        for(const schedule of props.schedules) {
            if(!groupedSchedules[schedule.day_of_week]) {
                groupedSchedules[schedule.day_of_week] = []
            }

            groupedSchedules[schedule.day_of_week].push(schedule)
        }

        const keys = Object.keys(groupedSchedules)

        return (
            <SellerSchedules>
                {
                    keys.map((key, i) => {
                        const schedules = groupedSchedules[key] as Schedule[]

                        return <SellerScheduleGroup schedules={schedules} key={`seller-schedulegroup-${i}`} />
                    })
                }
            </SellerSchedules>
        )
    } else {
        return <></>
    }
}