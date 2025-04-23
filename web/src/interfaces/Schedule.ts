interface Schedule {
    id: number
    address: string,
    start_time: string,
    end_time: string,
    day_of_week: number,
    longitude: number,
    latitude: number
}

interface ScheduleApiBody {
    address: string,
    start_time: number[],
    end_time: number[],
    day_of_week: number,
    location: {
        longitude: number,
        latitude: number
    }
}

export type {
    Schedule,
    ScheduleApiBody
}