import { Box, Stack } from "@mui/material"
import { Outlet } from "@remix-run/react"


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