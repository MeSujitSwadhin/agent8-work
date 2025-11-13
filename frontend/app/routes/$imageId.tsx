import type { LoaderFunction } from "@remix-run/node";

/**
 * This loader proxies Google Drive images safely through your Remix server.
 * Example usage:
 *    <img src={`/api/image/1LmMJcMVwGWGMaTCi2Rbxi4eQiAL0OiES`} alt="Generated Image" />
 */
export const loader: LoaderFunction = async ({ params }) => {
    const fileId = params.imageId;

    if (!fileId) {
        return new Response("Missing image ID", { status: 400 });
    }

    // Use export=download to get a clean image binary stream
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    try {
        const response = await fetch(driveUrl);

        if (!response.ok) {
            console.error(`❌ Google Drive returned ${response.status}: ${response.statusText}`);
            return new Response("Failed to fetch image from Google Drive", {
                status: response.status,
            });
        }

        // Detect MIME type (image/jpeg, image/png, etc.)
        const contentType = response.headers.get("Content-Type") || "image/jpeg";

        // Stream response directly to the browser
        return new Response(response.body, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable", // Browser caching
            },
        });
    } catch (error) {
        console.error("🚨 Error fetching image:", error);
        return new Response("Image not found or forbidden", { status: 404 });
    }
};
