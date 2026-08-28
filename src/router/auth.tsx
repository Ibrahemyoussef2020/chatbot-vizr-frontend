import { Login, Register } from "@/pages";

const authRouter = [
    {
        path: "/auth",
        children: [
            {
                index: true,
                path: 'login',
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            },
        ],
    },
]

export default authRouter