// ✅ Represents individual platform data
export interface PlatformData {
    title?: string;
    content?: string;
    tags?: string[];
    message?: string;
}

export interface ImageData {
    publicImageUrl: string;
    googleDriveImageUrl: string;
    googleDriveFileId: string;
}


// ✅ Represents a Post (single record)
export interface PostData {
    postId: string;
    topic: string;
    blog?: PlatformData;
    linkedin?: PlatformData;
    whatsapp?: PlatformData;
    status: string;
    images?: ImageData[];
    createdAt: string;
    updatedAt: string;
}

// ✅ API Response wrapper
export interface PostApiResponse {
    message: string;
    count?: number;
    data: PostData[]; // For /posts
}

export interface SinglePostApiResponse {
    message: string;
    data: PostData; // For /post/id
}
