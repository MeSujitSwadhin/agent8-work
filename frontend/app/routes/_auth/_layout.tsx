import { Box } from "@mui/material";
import { Outlet } from "@remix-run/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/router";

export async function loader({ request }: LoaderFunctionArgs) {
    const cookies = request.headers.get("Cookie");
    if (cookies && cookies.includes("access_token")) {
        throw redirect('/dashboard');
    }
    return null;
}

export default function Layout() {
    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",

            }}
        >
            <Outlet />
        </Box >
    );
}