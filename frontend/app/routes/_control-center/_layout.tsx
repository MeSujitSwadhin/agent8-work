import { Box, Stack } from "@mui/material"
import { Outlet } from "@remix-run/react"
import { requireUserSession } from "~/services/session";
import { LoaderFunctionArgs } from "@remix-run/router";

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserSession(request);
    return null;
}

const Layout = () => {
    return (
        <>
            <Box component={'main'}>
                <Stack
                    component={'div'}
                >
                    <Outlet />
                </Stack>
            </Box>
        </>
    )
}

export default Layout