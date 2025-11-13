import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { mutationFetch } from "~/config/query-client";
import { ApiError, MessageResult } from "~/utils/interface/ClientTypeInterfaces";

interface GenerateTopicData {
    topic: string;
    image_generated?: boolean;
}

interface UpdateData {
    postId: string;
    status: string;
}


export function generateTopic(
    options?: UseMutationOptions<MessageResult, ApiError, GenerateTopicData>
) {
    return useMutation<MessageResult, ApiError, GenerateTopicData>({
        mutationFn: async ({ topic, image_generated }) => {
            return await mutationFetch({
                url: "/generate-topic",
                method: "POST",
                base: "webhook",
                body: {
                    topics: topic,
                    image_generated: image_generated ?? false,
                },
            });
        },
        ...options,
    });
}



export function updateStatus(
    options?: UseMutationOptions<MessageResult, ApiError, UpdateData>
) {
    return useMutation<MessageResult, ApiError, UpdateData>({
        mutationFn: async ({ postId, status }) => {
            if (!postId) throw new Error("Post ID not provided");

            // ✅ match your working Postman URL exactly:
            return await mutationFetch({
                url: "/approve",
                method: "PUT",
                base: "webhook", // uses URL_API_BASE_WEBHOOK from .env
                body: { postId, status },
            });
        },
        ...options,
    });
}
