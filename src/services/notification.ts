import apiClient from "./api-client";
import type { PaginatedResponse } from "../models/pagination";

export interface Notification {
    _id: string;
    recipient: string;
    sender: {
        _id: string;
        nombre: string;
        avatarUrl?: string;
    };
    type: 'like' | 'like_comment' | 'comment' | 'follow' | 'follow_request' | 'follow_accepted';
    post?: {
        _id: string;
        imageUrl: string;
        caption: string;
    };
    isRead: boolean;
    createdAt: string;
}

export const getNotifications = (page: number = 1, limit: number = 20) => {
    return apiClient.get<PaginatedResponse<Notification>>("/notifications", {
        params: { page, limit }
    });
};

export const markAsRead = (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
    return apiClient.patch("/notifications/read-all");
};

const notificationService = {
    getNotifications,
    markAsRead,
    markAllAsRead
};

export default notificationService;
