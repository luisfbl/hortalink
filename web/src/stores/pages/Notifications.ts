import type { Notification } from "@interfaces/Notifications";
import { atom } from "nanostores";

export const NotificationsStore = atom<Notification[]>([]);

export function addNotification(notification: Notification): void {
  const currentNotifications = NotificationsStore.get();
  NotificationsStore.set([notification, ...currentNotifications]);
}

export function markAsRead(notificationId: number): void {
  const currentNotifications = NotificationsStore.get();
  const updatedNotifications = currentNotifications.map(notification => 
    notification.id === notificationId 
      ? { ...notification, read: true } 
      : notification
  );
  NotificationsStore.set(updatedNotifications);
}

export function updateNotifications(notifications: Notification[]): void {
  NotificationsStore.set(notifications);
}