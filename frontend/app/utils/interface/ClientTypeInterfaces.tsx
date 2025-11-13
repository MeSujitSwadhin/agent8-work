export type MutationMethodType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface QueryFetchOptions {
    url: string;
    inputParams?: any;
    token?: string
}

export interface MutationFetchOptions {
    url: string;
    method: MutationMethodType;
    body?: any;
    baseURL?: string;
}

export interface MessageResult {
    status?: number;
    message: string;
    data?: any
}

export interface ApiError {
    // httpCode: number;
    // httpStatus: string;
    exceptionName: string;
    message: string;
    errors?: { [key: string]: string };
    status: number;
    detail?: string;
}