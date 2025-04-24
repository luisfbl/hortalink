export function getNextDayOfWeek(dayNumber: number): Date {
    if (!dayNumber) return null;

    const today = new Date();
    const todayDayNumber = today.getDay() || 7;
    const daysToAdd = (dayNumber + 7 - todayDayNumber) % 7;

    const daysToAddFinal = daysToAdd === 0 ? 7 : daysToAdd;

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysToAddFinal);

    return nextDate;
}