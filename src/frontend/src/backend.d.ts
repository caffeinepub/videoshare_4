import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Video {
    id: string;
    title: string;
    likeCount: bigint;
    thumbnail?: ExternalBlob;
    uploaderName: string;
    video: ExternalBlob;
    description: string;
    viewCount: bigint;
    timestamp: Time;
    uploaderId: Principal;
}
export type Time = bigint;
export interface Comment {
    id: string;
    username: string;
    userId: Principal;
    text: string;
    timestamp: Time;
    videoId: string;
}
export interface UserProfile {
    bio: string;
    username: string;
    avatar?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createVideo(title: string, description: string, video: ExternalBlob, thumbnail: ExternalBlob | null): Promise<string>;
    deleteComment(videoId: string, commentId: string): Promise<void>;
    deleteVideo(videoId: string): Promise<void>;
    getAllVideos(): Promise<Array<Video>>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getChannelSubscribers(channelId: Principal): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideo(videoId: string): Promise<Video>;
    getVideoComments(videoId: string): Promise<Array<Comment>>;
    getVideoLikes(_videoId: string): Promise<bigint>;
    getVideosByUploaderId(uploaderId: Principal): Promise<Array<Video>>;
    incrementViewCount(videoId: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    likeVideo(videoId: string): Promise<void>;
    postComment(videoId: string, text: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    subscribeToChannel(channelId: Principal): Promise<void>;
    unlikeVideo(videoId: string): Promise<void>;
    unsubscribeFromChannel(channelId: Principal): Promise<void>;
}
