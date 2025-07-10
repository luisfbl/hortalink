export function getNextDayOfWeek(dayNumber: number): Date {
    if (!dayNumber) return null;

    const today = new Date();
    const todayDayNumber = today.getDay() || 7;
    
    // Calculate days to add to get to the next occurrence of the target day
    let daysToAdd = (dayNumber - todayDayNumber + 7) % 7;
    
    // If it's the same day, get next week's occurrence
    if (daysToAdd === 0) {
        daysToAdd = 7;
    }

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysToAdd);
    
    // Reset time to start of day for consistency
    nextDate.setHours(0, 0, 0, 0);

    return nextDate;
}