import { Dashboard, Settings } from "@/layouts";
import {
    Overview,
    Analytics,
    Channels,
    ChatbotInfo,
    Security,
    Widget,
    Configs,
    WhatsAppChannel,
    TelegramChannel,
    GmailChannel,
    Inbox,
    Tags,
    TokenManagement,
    Logs,
} from "@/pages";
import ProtectedRoute from "./ProtectedRoute";

const dashbordRpoter = [
    {
        path: "/dashboard",
        element: <ProtectedRoute />,
        children: [
            {
                element: <Dashboard />,
                children: [
                    { index: true, element: <Overview /> },
                    {
                        path: "analytics",
                        element: <Analytics />,
                    },
                    {
                        path: "inbox",
                        element: <Inbox />,
                    },
                    {
                        path: "tags",
                        element: <Tags />,
                    },
                    {
                        path: "token-management",
                        element: <TokenManagement />,
                    },
                    {
                        path: "logs",
                        element: <Logs />,
                    },
                    {
                        path: "settings",
                        element: <Settings />,
                        children: [
                            {
                                index: true,
                                element: <ChatbotInfo />,
                            },
                            {
                                path: "channels",
                                element: <Channels />,
                            },
                            {
                                path: "channels/whatsapp",
                                element: <WhatsAppChannel />,
                            },
                            {
                                path: "channels/telegram",
                                element: <TelegramChannel />,
                            },
                            {
                                path: "channels/gmail",
                                element: <GmailChannel />,
                            },
                            {
                                path: "configs",
                                element: <Configs />,
                            },
                            {
                                path: "security",
                                element: <Security />,
                            },
                            {
                                path: "widget",
                                element: <Widget />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export default dashbordRpoter;
