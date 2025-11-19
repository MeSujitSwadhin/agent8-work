import { Form, MetaFunction, useNavigate } from "@remix-run/react";
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Typography,
    TextField,
    InputAdornment,
    Button
} from "@mui/material";
import { signin } from "~/services/authentication/auth.mutation";
import { useState } from "react";
import Cookies from 'js-cookie';
import { useSnackbar } from "notistack";
import { Eye, EyeClosed, KeyRound, Mail } from "lucide-react";
import { MessageResult } from "~/utils/interface/ClientTypeInterfaces";
import { SiginRequestInterface } from "~/utils/interface/AuthInterfaces";


export const meta: MetaFunction = () => ([
    { title: "Sign In | Vidyutva | Agentic AI" },
    {
        name: "description",
        content:
            "Sign in to your account to access our AI-powered Writer Agent. ",
    },
]);

export default function Signin() {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isSignin, setIsSignin] = useState(false);

    const togglePasswordVisibility = (event: React.MouseEvent) => {
        event.preventDefault();
        setShowPassword(prev => !prev);
    };

    const mutation = signin({
        onSuccess: (res: MessageResult) => {
            console.log(res.data.access_token);
            Cookies.set("access_token", res.data.access_token);
            enqueueSnackbar(res.message, { variant: 'success' });
            navigate("/dashboard");
        },
        onError: (error: any) => {
            const statusCode = error?.status || error?.response?.status || "Unknown";
            const errorMessage = Array.isArray(error?.detail)
                ? error.detail.map((err: any) => err.msg).join(", ")
                : error?.error || error?.detail || error?.message || "An unexpected error occurred";

            const errorMessages: Record<number, string> = {
                400: `Bad Request: ${errorMessage}`,
                401: `Authentication Error: ${errorMessage}`,
                403: `Access Denied: ${errorMessage}`,
                404: `Not Found: ${errorMessage}`,
                422: errorMessage,
                500: `Server Error: ${errorMessage}`,
            };

            enqueueSnackbar(errorMessages[statusCode] || `Error ${statusCode}: ${errorMessage}`, {
                variant: "error",
            });
        },
        onSettled: () => {
            setIsSignin(false);
        },
    });

    const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSignin(true);
        const formData = new FormData(event.currentTarget);
        const payload: SiginRequestInterface = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        };
        mutation.mutate(payload);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                backgroundImage: "url('/assets/images/signin_bg.webp')", // <-- put image in public/images/
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <Card
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 400,
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 3,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    p: 2,
                    mb: "5rem",
                }}
            >
                <CardContent>
                    <Box sx={{ mb: "2rem" }}>
                        <Typography variant="h5" sx={{ textAlign: "center", fontWeight: "bold" }}>
                            SIGN IN
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: "center", mb: 2 }}
                        >
                            Sign in to your account
                        </Typography>
                    </Box>

                    <Form method="post" onSubmit={onSubmitHandler}>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "2rem",
                            }}
                        >
                            {/* EMAIL INPUT */}
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                required
                                placeholder="Enter your email"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Mail size={20} color="gray" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* PASSWORD INPUT */}
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Enter your password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <KeyRound size={20} color="gray" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onMouseDown={togglePasswordVisibility}
                                                onClick={togglePasswordVisibility}
                                                edge="end"
                                            >
                                                {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* SIGN IN BUTTON */}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                disabled={isSignin}
                            >
                                {isSignin ? (
                                    <CircularProgress size={24} sx={{ color: "white" }} />
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </Box>
                    </Form>
                </CardContent>
            </Card>
        </Box>
    );
}
