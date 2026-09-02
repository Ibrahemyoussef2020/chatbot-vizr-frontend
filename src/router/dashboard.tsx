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
    KnowledgeSessions,
    KnowledgeWorkspace,
    KnowledgePlans,
    KnowledgeReports,
    SavedKnowledgeOutputs,
    BusinessPlans,
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
                        path: "knowledge",
                        element: <KnowledgeSessions />,
                    },
                    {
                        path: "knowledge/upload",
                        element: <KnowledgeSessions mode="upload" />,
                    },
                    {
                        path: "knowledge/chat",
                        element: <KnowledgeSessions mode="chat" />,
                    },
                    {
                        path: "knowledge/:sessionId",
                        element: <KnowledgeWorkspace />,
                    },
                    {
                        path: "knowledge/plans",
                        element: <KnowledgeSessions mode="plans" />,
                    },
                    {
                        path: "knowledge/reports",
                        element: <KnowledgeSessions mode="reports" />,
                    },
                    {
                        path: "knowledge/saved",
                        element: <SavedKnowledgeOutputs />,
                    },
                    {
                        path: "knowledge/:sessionId/plans",
                        element: <KnowledgePlans />,
                    },
                    {
                        path: "knowledge/:sessionId/plans/:outputId",
                        element: <KnowledgePlans />,
                    },
                    {
                        path: "knowledge/:sessionId/reports",
                        element: <KnowledgeReports />,
                    },
                    {
                        path: "knowledge/:sessionId/reports/:outputId",
                        element: <KnowledgeReports />,
                    },
                    {
                        path: "business/plans",
                        element: <BusinessPlans />,
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
