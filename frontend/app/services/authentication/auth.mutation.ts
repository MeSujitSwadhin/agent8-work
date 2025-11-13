import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { mutationFetch } from "~/config/query-client";
import { SiginRequestInterface } from "~/utils/interface/AuthInterfaces";
import { ApiError, MessageResult } from "~/utils/interface/ClientTypeInterfaces";


export function signin(
    options?: UseMutationOptions<MessageResult, ApiError, SiginRequestInterface>
) {
    return useMutation<MessageResult, ApiError, SiginRequestInterface>({
        mutationFn: async (body: SiginRequestInterface) => {
            return await mutationFetch({
                url: `/api/v1/signin`,
                method: "POST",
                base: "main",
                body: {
                    email: body.email,
                    password: body.password,
                },
            });
        },
        ...options,
    });
}