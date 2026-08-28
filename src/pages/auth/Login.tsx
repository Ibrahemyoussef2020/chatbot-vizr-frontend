import React, { useEffect } from "react";
import { IoIosLogIn } from "react-icons/io";
import { Box, Typography, Button } from "@mui/material";
import CustomizedInput from "@/components/shared/CustomizedInput";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import getErrorText from "@/utils/typeErrorText";
import { useAppDispatch, useAppSelector, loginAsync } from "@/redux";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        try {
            toast.loading("Signing In", { id: "login" });
            await dispatch(loginAsync({ email, password })).unwrap();
            toast.success("Signed In Successfully", { id: "login" });
            navigate("/dashboard");
        } catch (error) {
            console.log(error);
            toast.error(getErrorText(error), { id: "login" });
        }
    };
    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);
    return (
        <Box sx={{ width: "100%", height: "100%", display: "flex", flex: 1 }}>
            <Box sx={{ padding: 8, mt: 8, display: { md: "flex", sm: "none", xs: "none" } }}>
                <img src="/airobot.png" alt="Robot" style={{ width: "400px" }} />
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flex: { xs: 1, md: 0.5 },
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 2,
                    ml: "auto",
                    mt: 16,
                }}
            >
                <form
                    onSubmit={handleSubmit}
                    style={{
                        margin: "auto",
                        padding: "30px",
                        boxShadow: "10px 10px 20px #000",
                        borderRadius: "10px",
                        border: "none",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            variant="h4"
                            sx={{
                                textAlign: "center",
                                padding: 2,
                                fontWeight: 600,
                            }}
                        >
                            Login
                        </Typography>
                        <CustomizedInput type="email" name="email" label="Email" />
                        <CustomizedInput type="password" name="password" label="Password" />
                        <Button
                            type="submit"
                            sx={{
                                px: 2,
                                py: 1,
                                mt: 2,
                                width: "400px",
                                borderRadius: 2,
                                bgcolor: "#00fffc",
                                ":hover": {
                                    bgcolor: "white",
                                    color: "black",
                                },
                            }}
                            endIcon={<IoIosLogIn />}
                        >
                            Login
                        </Button>
                    </Box>
                </form>
            </Box>
        </Box>
    );
};

export default Login;
