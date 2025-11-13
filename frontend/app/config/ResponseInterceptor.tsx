import { useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import Cookies from "js-cookie";
import { client } from "./query-client";


const ResponseInterceptor = () => {
    const navigate = useNavigate();
    const interceptorId = useRef<number | undefined>();

    useEffect(() => {
        // Add response interceptor
        interceptorId.current = client.interceptors.response.use(
            (response) => response, // Pass through successful responses
            (error) => {
                if (error.response?.status === 401) {
                    // Remove cookies on unauthorized error
                    Cookies.remove("access_token");

                    // Redirect to the auth page
                    navigate("/signin");
                }

                return Promise.reject(error);
            }
        );

        // Cleanup interceptor on unmount or dependencies change
        return () => {
            if (interceptorId.current !== undefined) {
                client.interceptors.response.eject(interceptorId.current);
            }
        };
    }, [navigate]);

    return null; // This component doesn't render anything
};

export default ResponseInterceptor;