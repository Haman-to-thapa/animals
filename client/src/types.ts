export interface Animal {
    id: string;
    name: string;
    emotion: 'Happy' | 'Angry' | 'Lazy' | 'Rude' | 'Sad' | 'Cute';
    description: string;
    imageUrl?: string;
    audioUrl?: string;
    imageBase64?: string;
    audioBase64?: string;
    uploadedBy: string;
    authorPhoto?: string | null;
    authorName?: string | null;
    approvedAt?: any;
}

export interface AnimalSubmission {
    name: string;
    emotion: string;
    description: string;
    imageUri: string;
    audioUri: string;
    imageBase64?: string;
    audioBase64?: string;
}

export interface SocialPost {
    id: string;
    name: string;
    imageUrl: string;
    emotion: string;
    description: string;
    uploadedBy: string;
    authorName?: string;
    authorPhoto?: string;
    likes: number;
    commentCount?: number;
    isLiked?: boolean;
    reportCount: number;
    createdAt: any;
}

export interface Report {
    id: string;
    postId: string;
    reportedBy: string;
    reason: string;
    createdAt: any;
}

export interface Comment {
    id: string;
    postId: string;
    text: string;
    authorName: string;
    authorPhoto?: string;
    userId: string;
    createdAt: any;
}

export interface Adoption {
    id: string;
    ownerId: string;
    ownerName: string;
    petName: string;
    petAge: string;
    petBreed: string;
    petDescription: string;
    petImageUrl: string;
    petImageBase64?: string;
    location: string;
    status: 'available' | 'pending' | 'adopted' | 'removed';
    price?: number;
    currency?: string;
    isFree: boolean;
    reportCount: number;
    createdAt: any;
}

export interface AdoptionRequest {
    id: string;
    adoptionId: string;
    requesterId: string;
    requesterName: string;
    requesterPhoto?: string;
    ownerId: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: any;
}

export interface AdoptionReport {
    id: string;
    adoptionId: string;
    reportedBy: string;
    reason: string;
    createdAt: any;
}

export interface Chat {
    id: string;
    participants: string[];
    participantNames: { [uid: string]: string };
    participantPhotos: { [uid: string]: string | null };
    adoptionId: string;
    petName: string;
    lastMessage?: {
        text: string;
        senderId: string;
        createdAt: any;
    };
    updatedAt: any;
    unreadCounts?: { [uid: string]: number };
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: any;
}

export interface AdminMessage {
    id: string;
    userId: string;
    message: string;
    relatedPostId?: string;
    read: boolean;
    createdAt: any;
}

export interface UnifiedReport {
    id: string;
    postId: string;
    postType: 'animal' | 'social' | 'adopt';
    reportedBy: string;
    reason: string;
    createdAt: any;
}
