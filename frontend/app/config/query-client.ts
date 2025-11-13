import axios from "axios";
import qs from "qs";
import { QueryClient } from "@tanstack/react-query";
import {
    QueryFetchOptions,
    ApiError,
    MutationFetchOptions,
} from "../utils/interface/ClientTypeInterfaces";

console.log(`🔹 API Base URLs:
  - Main: ${import.meta.env.URL_API_BASE_MAIN}
  - Webhook: ${import.meta.env.URL_API_BASE_WEBHOOK}
  - Public: ${import.meta.env.URL_API_BASE_PUBLIC}
`);

/* 🔹 Environment-based Base URLs */
export const BASE_API_MAIN = import.meta.env.URL_API_BASE_MAIN;
export const BASE_API_WEBHOOK = import.meta.env.URL_API_BASE_WEBHOOK;
export const BASE_API_PUBLIC = import.meta.env.URL_API_BASE_PUBLIC;

/* 🔹 Axios Clients */
export const client = axios.create({ baseURL: BASE_API_MAIN });
export const webhookClient = axios.create({ baseURL: BASE_API_WEBHOOK });
export const publicClient = axios.create({ baseURL: BASE_API_PUBLIC });

/* 🔹 Helper: Select client based on base type */
function getClient(base?: "main" | "webhook" | "public") {
    switch (base) {
        case "webhook":
            return webhookClient;
        case "public":
            return publicClient;
        default:
            return client; // main API default
    }
}

/* 🔹 Token Setup (shared across all clients) */
export function setupToken(token?: string): void {
    const clients = [client, webhookClient, publicClient];
    for (const c of clients) {
        if (token) {
            c.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete c.defaults.headers.common["Authorization"];
        }
    }
}

/* 🔹 Query Fetcher (GET requests) */
export async function queryFetch<T>({
    url,
    inputParams,
    base = "main",
}: QueryFetchOptions & { base?: "main" | "webhook" | "public" }): Promise<T> {
    const activeClient = getClient(base);
    const params = inputParams ? qs.stringify(inputParams) : "";

    try {
        const fetchUrl = params ? `${url}?${params}` : url;
        const res = await activeClient.get(fetchUrl);
        return res.data;
    } catch (error: any) {
        throw error.response as ApiError;
    }
}

/* 🔹 Mutation Fetcher (POST, PUT, DELETE JSON) */
export async function mutationFetch<T>({
    url,
    method,
    body,
    base = "main",
}: MutationFetchOptions & { base?: "main" | "webhook" | "public" }): Promise<T> {
    const activeClient = getClient(base);

    try {
        const res = await activeClient.request({
            url,
            method,
            headers: { "Content-Type": "application/json" },
            data: body,
        });
        return res.data;
    } catch (error: any) {
        throw {
            status: error.response?.status || 500,
            detail: error.response?.data?.detail || "Something went wrong",
        };
    }
}

/* 🔹 Mutation for Form Data (less used, kept for compatibility) */
export async function mutationFormData<T>({
    url,
    body,
    method,
    base = "main",
}: MutationFetchOptions & { base?: "main" | "webhook" | "public" }): Promise<T> {
    const activeClient = getClient(base);
    try {
        const res = await activeClient.request({
            url,
            method,
            data: body,
            headers: { "Content-Type": "application/json" },
        });
        return res.data;
    } catch (error: any) {
        throw error.response?.data as ApiError;
    }
}

/* 🔹 Server-side query (supports token) */
export async function queryFetchServer<T>({
    url,
    inputParams,
    token,
    base = "main",
}: QueryFetchOptions & { token?: string; base?: "main" | "webhook" | "public" }) {
    const activeClient = getClient(base);
    let data!: T;
    let isError = false;
    let error: ApiError | null = null;

    const params = inputParams ? qs.stringify(inputParams) : "";
    const endpoint = params ? `${url}?${params}` : url;

    try {
        const res = await activeClient.get(endpoint, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        data = res.data as T;
    } catch (err: any) {
        console.error("❌ queryFetchServer error:", err);
        isError = true;
        error = err.response?.data ?? null;
    }

    return { data, isError, error };
}

/* 🔹 React Query Global Client */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000, // 1 minute cache
        },
    },
});
