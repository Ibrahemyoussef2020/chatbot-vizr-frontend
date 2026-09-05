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
    Logs,
    KnowledgeSessions,
    KnowledgeWorkspace,
    KnowledgePlans,
    KnowledgeReports,
    SavedKnowledgeOutputs,
    BusinessPlans,
    AIManagement,
} from "@/pages";
import ProtectedRoute from "./ProtectedRoute";
import { Navigate } from "react-router-dom";
import { AgentsView, ModelsView, RequestLogsView, RoutingView } from "@/features/ai-management/AIManagementViews";
import QuotasView from "@/features/ai-management/views/QuotasView";
import OverviewView from "@/features/ai-management/views/OverviewView";
import ProvidersView from "@/features/ai-management/views/ProvidersView";

const dashbordRpoter = [
    {
        path: "/dashboard",
        element: <ProtectedRoute />,
        children: [
            {
                element: <Dashboard />,
                children: [
                    { index: true, element: <Overview /> },
                    { path: "ai-management", element: <AIManagement />, children: [
                        { index: true, element: <Navigate to="overview" replace /> },
                        { path: "overview", element: <OverviewView /> },
                        { path: "providers", element: <ProvidersView /> },
                        { path: "models", element: <ModelsView /> },
                        { path: "agents", element: <AgentsView /> },
                        { path: "routing", element: <RoutingView /> },
                        { path: "quotas", element: <QuotasView /> },
                        { path: "analytics", element: <Navigate to="../overview" replace /> },
                        { path: "request-logs", element: <RequestLogsView /> },
                    ] },
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
                        element: <Navigate to="/dashboard/ai-management" replace />,
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
