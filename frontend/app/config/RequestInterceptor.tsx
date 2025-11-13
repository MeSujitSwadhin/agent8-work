import { useEffect, useRef } from "react";
import { useLocation } from "@remix-run/react";
import Cookies from "js-cookie";
import { client } from "./query-client";

const RequestInterceptor = () => {
    const location = useLocation();
    const interceptorId = useRef<number | undefined>();

    useEffect(() => {
        interceptorId.current = client.interceptors.request.use(
            async (config) => {
                const token = Cookies.get("access_token");
                if (token && location.pathname !== "/signin") {
                    // Ensure the headers object exists before modifying
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Cleanup interceptor on unmount or dependency change
        return () => {
            if (interceptorId.current !== undefined) {
                client.interceptors.request.eject(interceptorId.current);
            }
        };
    }, [location.pathname]);

    return null;
};

export default RequestInterceptor;