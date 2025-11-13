import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryFetch } from "~/config/query-client";
import { ApiError } from "~/utils/interface/ClientTypeInterfaces";
import { PostApiResponse, SinglePostApiResponse, PostData } from "~/utils/interface/AgentInterfaces";

export function usePosts(
    status: string = "Generated",
    options?: Partial<UseQueryOptions<PostData[], ApiError>>
) {
    return useQuery<PostData[], ApiError>({
        queryKey: ["posts", status],
        queryFn: async () => {
            const response = await queryFetch<PostApiResponse>({
                url: `/api/v1/posts?status=${status}`,
            });
            return response.data;
        },
        ...options,
    });
}

export function usePostById(
    postId: string | undefined,
    options?: Partial<UseQueryOptions<PostData, ApiError>>
) {
    return useQuery<PostData, ApiError>({
        queryKey: ["post", postId],
        queryFn: async () => {
            if (!postId) throw new Error("Post ID is required");

            const response = await queryFetch<SinglePostApiResponse>({
                url: `/api/v1/post/id?post_id=${postId}`,
            });

            return response.data;
        },
        enabled: !!postId,
        ...options,
    });
}