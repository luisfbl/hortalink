import type {Notification} from "@interfaces/Notifications.ts"
import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { NotificationsStore, markAsRead, updateNotifications } from "@stores/pages/Notifications";
import APIWrapper, { RequestAPIFrom } from "@HortalinkAPIWrapper";

function formatDate(date: Date) {
    const currentDate = new Date()

    if((`${date.getDay()}-${date.getMonth()}`) === (`${currentDate.getDay()}-${currentDate.getMonth()}`)) {
        return `${date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`
    } else if(((date.getDay())) === (currentDate.getDate() - 1) && (date.getMonth() === currentDate.getMonth())) {
        return `Ontem`
    } else {
        return `${date.getDay()}/${date.getMonth()} ${date.getHours()}:${date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()}`
    }
}

export default function NotificationsList(props: { notifications: Notification[] }) {
    const notifications = useStore(NotificationsStore);
    const API = new APIWrapper(RequestAPIFrom.Client);

    useEffect(() => {
        if (notifications.length === 0 && props.notifications.length > 0) {
            updateNotifications(props.notifications);
        }
    }, [props.notifications]);

    const handleNotificationClick = async (notificationId: number) => {
        try {
            markAsRead(notificationId);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    return (
        <section className="notifications_list_container">
            {notifications.length === 0 ? (
                <div className="empty-notifications">
                    <p>Você não tem notificações no momento</p>
                </div>
            ) : (
                notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`notification ${notification.read ? "" : "notification_marked"}`}
                        onClick={() => handleNotificationClick(notification.id)}
                    >
                        <div className={`ellipse ${notification.read ? "" : "ellipse_marked"}`} />
                        <p>{notification.title}</p>
                        <p>{formatDate(new Date(notification.created_at * 1000))}</p>
                    </div>
                ))
            )}
        </section>
    )
}