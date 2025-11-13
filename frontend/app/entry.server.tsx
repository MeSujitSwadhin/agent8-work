import { PassThrough } from "node:stream";

import type { EntryContext } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToPipeableStream, renderToString } from "react-dom/server";

import { CacheProvider } from "@emotion/react";
import createEmotionServer from "@emotion/server/create-instance";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import createEmotionCache from "./services/createEmotionCache";
import theme from "./services/theme";

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RemixServer context={remixContext} url={request.url} />
        </ThemeProvider>
      </CacheProvider>,
      {
        onShellReady() {
          try {
            const body = new PassThrough();

            // Render the app to string to extract Emotion's critical CSS
            const html = renderToString(
              <CacheProvider value={cache}>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <RemixServer context={remixContext} url={request.url} />
                </ThemeProvider>
              </CacheProvider>
            );

            const emotionChunks = extractCriticalToChunks(html);
            const emotionCss = emotionChunks.styles
              .map(
                (style) =>
                  `<style data-emotion="${style.key} ${style.ids.join(
                    " "
                  )}">${style.css}</style>`
              )
              .join("\n");

            responseHeaders.set("Content-Type", "text/html");

            resolve(
              new Response(createReadableStreamFromReadable(body), {
                headers: responseHeaders,
                status: didError ? 500 : responseStatusCode,
              })
            );

            // Write the HTML response
            body.write(`<!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charSet="utf-8">
                  <meta name="viewport" content="width=device-width,initial-scale=1">
                  ${emotionCss}
                </head>
                <body>
                  <div id="root">`);

            pipe(body);

            body.end(`</div></body></html>`);
          } catch (error) {
            reject(error);
          }
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = true;
          console.error("Error during server rendering:", error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
