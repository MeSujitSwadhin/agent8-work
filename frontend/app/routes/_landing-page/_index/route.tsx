import { MetaFunction } from "@remix-run/node";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    CircularProgress,
    FormControlLabel,
    Switch,
} from "@mui/material";
import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { usePostById, usePosts } from "~/services/agent/agent.query";
import { generateTopic, updateStatus } from "~/services/agent/agent.mutation";

export const meta: MetaFunction = () => [
    { title: "Vidyutva | Agentic AI - Social Media Marketing" },
    { name: "description", content: "Generate and approve AI marketing content" },
];

export default function Index() {
    const [topic, setTopic] = useState("");
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [imageGenerated, setImageGenerated] = useState(false);
    const { data: posts, isLoading, isError } = usePosts("Generated");
    const { data: selectedPost, isLoading: isPostLoading } = usePostById(
        selectedPostId ?? undefined,
        { enabled: !!selectedPostId }
    );

    const formatIST = (timeString: string) => {
        if (!timeString) return "";
        let date = new Date(timeString);

        // If it lacks timezone info, assume UTC and adjust to IST manually
        if (!/[zZ]|(\+\d{2}:\d{2})$/.test(timeString)) {
            const utc = new Date(`${timeString}Z`);
            date = utc;
        }

        return date.toLocaleString("en-IN", {
            hour12: true,
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };



    const { mutate: generatePost, isPending: isGenerating } = generateTopic({
        onSuccess: (data) => {
            console.log("✅ Generated:", data);
            alert("Content generated successfully!. Please check email for approval.");
        },
        onError: (error) => {
            console.error("❌ Generation failed:", error);
            alert("Something went wrong while generating!");
        },
    });

    const { mutate: approvePost } = updateStatus({
        onSuccess: (data) => {
            console.log("Status updated:", data.message);
            alert("Post approved successfully!");
        },
        onError: (error) => {
            console.error("Update failed:", error);
            alert("Something went wrong!");
        },
    });

    return (
        <Box
            className="min-h-screen flex flex-col items-center px-6 py-10"
            sx={{
                position: "relative",
                overflow: "hidden",
                color: "#ffffff",
                background:
                    "linear-gradient(135deg, #ff8fc6 0%, #a78bfa 40%, #60a5fa 100%)",
                backgroundAttachment: "fixed",
                backgroundSize: "cover",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background:
                        "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3), rgba(255,255,255,0.05))",
                    mixBlendMode: "overlay",
                    filter: "blur(120px)",
                    zIndex: 0,
                },
            }}
        >
            <Box
                className="w-[55rem] flex flex-col items-center gap-4 mb-12"
                sx={{ position: "relative", zIndex: 2 }}
            >
                <Box className="w-full flex items-center">
                    <Box
                        className="flex items-center w-full bg-white/40 shadow-md rounded-full px-5 py-2 border border-white/30 backdrop-blur-md"
                        sx={{
                            transition: "all 0.3s ease",
                            "&:focus-within": {
                                boxShadow: "0 0 0 3px rgba(37,99,235,0.2)",
                            },
                        }}
                    >
                        <Search className="text-gray-700 opacity-80" size={20} />
                        <TextField
                            variant="standard"
                            placeholder="Ask or enter a topic..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            fullWidth
                            InputProps={{
                                disableUnderline: true,
                                style: { color: "#1F2937", fontSize: "1.05rem" },
                            }}
                            sx={{
                                mx: 2,
                                input: { "::placeholder": { color: "#6B7280" } },
                            }}
                        />
                        <Button
                            disabled={!topic.trim() || isGenerating}
                            onClick={() => generatePost({ topic, image_generated: imageGenerated })}
                            sx={{
                                borderRadius: "9999px",
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                                textTransform: "none",
                                background: "#00a181",
                                color: "white",
                                "&:hover": { opacity: 0.9 },
                            }}
                        >
                            {isGenerating ? "Generating..." : "Generate"}
                        </Button>

                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={imageGenerated}
                                onChange={(e) => setImageGenerated(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Generate Image"
                        sx={{
                            mx: 2,
                            '& .MuiFormControlLabel-label': { color: '#1F2937', fontSize: '0.9rem' },
                        }}
                    />
                </Box>

                {/* Suggested Topics */}
                <Box className="w-full max-w-3xl mt-1 overflow-hidden">
                    <motion.div
                        className="flex gap-3 overflow-x-auto scroll-smooth pb-1"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                        {[
                            "EV Charging",
                            "Climate Change",
                            "Green Energy",
                            "Clean Mobility",
                            "Battery Recycling",
                            "Solar Innovation",
                            "Smart Grids",
                        ].map((suggestion) => (
                            <Chip
                                key={suggestion}
                                label={suggestion}
                                onClick={() => setTopic(suggestion)}
                                sx={{
                                    backgroundColor: "rgba(255,255,255,0.4)",
                                    color: "#1F2937",
                                    fontWeight: 500,
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    backdropFilter: "blur(6px)",
                                    "&:hover": {
                                        backgroundColor: "rgba(255,255,255,0.6)",
                                    },
                                }}
                            />
                        ))}
                    </motion.div>
                </Box>
            </Box>

            {/* 📰 Pending Posts Section */}
            <Box className="w-full max-w-6xl" sx={{ position: "relative", zIndex: 2 }}>
                <Typography
                    variant="h6"
                    className="font-semibold mb-6 text-gray-800 text-center"
                >
                    Pending posts for approval
                </Typography>

                {/* 🌀 Loading */}
                {isLoading && (
                    <Box className="flex justify-center items-center py-10">
                        <CircularProgress sx={{ color: "#fff" }} />
                    </Box>
                )}

                {/* ❌ Error / Empty */}
                {!isLoading && (isError || !posts?.length) && (
                    <Typography align="center" color="white" sx={{ opacity: 0.8 }}>
                        No posts found.
                    </Typography>
                )}

                {/* ✅ Cards */}
                {!isLoading && posts && (
                    <Box
                        sx={{
                            position: "relative",
                            overflowX: "auto",
                            px: { xs: 2, md: 4 },
                            py: 2,
                            display: "flex",
                            gap: 3,
                            scrollSnapType: "x mandatory",
                            scrollPadding: "0 24px",
                            scrollBehavior: "smooth",
                            "&::-webkit-scrollbar": { display: "none" },
                            msOverflowStyle: "none",
                            scrollbarWidth: "none",
                        }}
                    >
                        <Box sx={{ flex: "0 0 12px" }} />

                        {posts.map((post) => {
                            const availablePlatforms = Object.keys(post).filter((key) =>
                                ["blog", "linkedin", "whatsapp"].includes(key)
                            );

                            return (
                                <motion.div
                                    key={post.postId}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex-shrink-0"
                                    style={{
                                        minWidth: "340px",
                                        maxWidth: "360px",
                                        scrollSnapAlign: "start",
                                    }}
                                >
                                    <Card
                                        sx={{
                                            background: "rgba(255,255,255,0.4)",
                                            backdropFilter: "blur(10px)",
                                            borderRadius: "18px",
                                            border: "1px solid rgba(255,255,255,0.4)",
                                            boxShadow:
                                                "0 4px 20px rgba(0,0,0,0.08), 0 0 20px rgba(255,255,255,0.2)",
                                            color: "#1F2937",
                                            position: "relative",
                                            transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                            transformOrigin: "center center",
                                            overflow: "visible",
                                            "&:hover": {
                                                transform: "translateY(-4px) scale(1.02)",
                                                boxShadow:
                                                    "0 8px 28px rgba(0,0,0,0.15), 0 0 30px rgba(255,255,255,0.3)",
                                            },
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                position: "absolute",
                                                top: 10,
                                                right: 16,
                                                color: "#374151",
                                                fontSize: "0.75rem",
                                                opacity: 0.7,
                                            }}
                                        >
                                            {formatIST(post.createdAt)}
                                        </Typography>

                                        <CardContent>
                                            <Typography
                                                variant="h6"
                                                className="font-semibold mb-1"
                                                sx={{ pr: 6 }}
                                            >
                                                {post.topic}
                                            </Typography>

                                            <Typography variant="body2" sx={{ color: "#4B5563" }}>
                                                Content generated for:
                                            </Typography>

                                            <Box className="flex gap-2 mt-2 flex-wrap">
                                                {availablePlatforms.map((p) => (
                                                    <Chip
                                                        key={p}
                                                        label={p.charAt(0).toUpperCase() + p.slice(1)}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            borderColor: "rgba(255,255,255,0.6)",
                                                            color: "#1F2937",
                                                            fontWeight: 500,
                                                            background: "rgba(255,255,255,0.4)",
                                                            backdropFilter: "blur(5px)",
                                                        }}
                                                    />
                                                ))}
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                className="mt-3 cursor-pointer"
                                                sx={{
                                                    color: "#2563EB",
                                                    fontWeight: 500,
                                                    "&:hover": { textDecoration: "underline" },
                                                }}
                                                onClick={() => setSelectedPostId(post.postId)}
                                            >
                                                Click to see details &gt;
                                            </Typography>

                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                disabled={isLoading}
                                                onClick={() =>
                                                    approvePost({
                                                        postId: post.postId,
                                                        status: "approved",
                                                    })
                                                }
                                                sx={{
                                                    mt: 2,
                                                    borderRadius: "10px",
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    borderColor: "#2563EB",
                                                    color: "#2563EB",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(37,99,235,0.1)",
                                                    },
                                                }}
                                            >
                                                Approve
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}

                        <Box sx={{ flex: "0 0 12px" }} /> {/* Right buffer */}
                    </Box>
                )}
            </Box>

            {/* 🪟 Details Modal */}
            <Dialog
                open={!!selectedPostId}
                onClose={() => setSelectedPostId(null)}
                maxWidth="md"
                fullWidth
            >
                {isPostLoading ? (
                    <Box
                        className="flex justify-center items-center py-20"
                        sx={{ minHeight: "300px" }}
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <DialogTitle>{selectedPost?.topic} — Platform Details</DialogTitle>
                        <DialogContent dividers>
                            {selectedPost && (
                                <Box>
                                    {selectedPost.blog && (
                                        <Box mb={3}>
                                            <Typography variant="h6" color="primary">
                                                📝 Blog
                                            </Typography>
                                            <Typography fontWeight={600} mt={1}>
                                                {selectedPost.blog.title}
                                            </Typography>
                                            <Typography variant="body2" mt={1}>
                                                {selectedPost.blog.content}
                                            </Typography>
                                        </Box>
                                    )}
                                    {selectedPost.linkedin && (
                                        <Box mb={3}>
                                            <Typography variant="h6" color="primary">
                                                💼 LinkedIn
                                            </Typography>
                                            <Typography fontWeight={600} mt={1}>
                                                {selectedPost.linkedin.title}
                                            </Typography>
                                            <Typography variant="body2" mt={1}>
                                                {selectedPost.linkedin.content}
                                            </Typography>
                                        </Box>
                                    )}
                                    {selectedPost.whatsapp && (
                                        <Box>
                                            <Typography variant="h6" color="primary">
                                                💬 WhatsApp
                                            </Typography>
                                            <Typography variant="body2" mt={1}>
                                                {selectedPost.whatsapp.message}
                                            </Typography>
                                        </Box>
                                    )}
                                    {selectedPost?.images && selectedPost.images.length > 0 && (
                                        <Box mt={3}>
                                            <Typography variant="h6" color="primary">
                                                🖼️ Generated Images
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 2,
                                                    mt: 1,
                                                }}
                                            >
                                                {selectedPost?.images?.map((img, idx) => (
                                                    <Card
                                                        key={idx}
                                                        sx={{
                                                            width: 180,
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                                                            transition: "transform 0.25s ease",
                                                            "&:hover": { transform: "scale(1.03)" },
                                                        }}
                                                    >
                                                        <img
                                                            loading="lazy"
                                                            src={`/${img.googleDriveFileId}`}
                                                            alt={`Generated Image ${idx + 1}`}
                                                            style={{
                                                                width: "100%",
                                                                height: "auto",
                                                                // display: "block",
                                                            }}
                                                        />
                                                    </Card>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
