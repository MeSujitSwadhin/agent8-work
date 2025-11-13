import RequestInterceptor from "./config/RequestInterceptor";
import ResponseInterceptor from "./config/ResponseInterceptor";
import { queryClient } from "./config/query-client";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "./services/createEmotionCache";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./services/theme";
import "./style/fonts";
import "./style/global.css";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { SnackbarProvider } from "notistack";


const clientSideEmotionCache = createEmotionCache();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CacheProvider value={clientSideEmotionCache}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            maxSnack={5}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={5000}
          >
            <RequestInterceptor />
            <ResponseInterceptor />
            <CssBaseline />
            <Outlet />
            <Meta />
            <Links />
            <ScrollRestoration />
            <Scripts />
          </SnackbarProvider>
        </ThemeProvider>
      </CacheProvider>
    </QueryClientProvider >
  );
}