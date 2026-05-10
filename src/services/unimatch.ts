import apiClient from './api-client';

export interface UnimatchPhoto {
    _id: string;
    userId: string;
    imageUrl: string;
    order: number;
}

export interface DiscoverProfile {
    _id: string;
    nombre: string;
    avatarUrl?: string;
    descripcion?: string;
    universidad?: { _id: string; nombre: string };
    grado?: { _id: string; nombre: string };
    asignaturas?: { _id: string; nombre: string }[];
    unimatchPhotos: UnimatchPhoto[];
}

export interface SwipeResult {
    matched: boolean;
}

export interface MatchUser {
    _id: string;
    nombre: string;
    avatarUrl?: string;
    unimatchPhoto?: string;
}

// Descubrir perfiles
export const discoverProfiles = (limit: number = 10) => {
    return apiClient.get<DiscoverProfile[]>('/unimatch/discover', { params: { limit } });
};

// Registrar swipe
export const recordSwipe = (toUserId: string, type: 'like' | 'dislike') => {
    return apiClient.post<SwipeResult>('/unimatch/swipe', { toUserId, type });
};

// Subir foto
export const uploadUnimatchPhoto = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<UnimatchPhoto>('/unimatch/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Obtener mis fotos
export const getMyPhotos = () => {
    return apiClient.get<UnimatchPhoto[]>('/unimatch/photos');
};

// Obtener fotos de un usuario
export const getUserPhotos = (userId: string) => {
    return apiClient.get<UnimatchPhoto[]>(`/unimatch/photos/${userId}`);
};

// Eliminar foto
export const deleteUnimatchPhoto = (photoId: string) => {
    return apiClient.delete(`/unimatch/photos/${photoId}`);
};

// Reordenar fotos
export const reorderUnimatchPhotos = (photoIds: string[]) => {
    return apiClient.patch<UnimatchPhoto[]>('/unimatch/photos/reorder', { photoIds });
};

// Aceptar términos
export const acceptUnimatchTerms = () => {
    return apiClient.post('/unimatch/accept-terms');
};

// Obtener matches
export const getMatches = () => {
    return apiClient.get<MatchUser[]>('/unimatch/matches');
};
