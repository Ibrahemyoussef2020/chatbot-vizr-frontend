import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAppSelector } from "@/redux/store";
import { fetchAIAgents, fetchAIAnalytics, fetchAIModels, fetchAIOverview, fetchAIProviders, fetchAIQuotas, fetchAIRequestLogs, fetchAIRouting, updateAIProvider, type AIOverview, type AIProviderItem } from "@/services/llms/aiManagement";

type State = {
 workspace?: string; workspaceName: string; loading: boolean; error: string; overview: AIOverview|null;
 providers: AIProviderItem[]; models:any[]; agents:any[]; routing:any[]; quotas:any[]; logs:any[]; analytics:any;
 search:string; setSearch:(value:string)=>void; providerFilter:string; setProviderFilter:(value:string)=>void; statusFilter:string; setStatusFilter:(value:string)=>void;
 providerCodes:string[]; filter:<T>(items:T[])=>T[]; reload:()=>Promise<void>; toggleProvider:(provider:AIProviderItem)=>Promise<void>;
};
const Context=createContext<State|null>(null);

export function AIManagementProvider({children}:{children:ReactNode}){
 const active=useAppSelector(state=>state.workspace.active); const [loading,setLoading]=useState(true),[error,setError]=useState("");
 const [overview,setOverview]=useState<AIOverview|null>(null),[providers,setProviders]=useState<AIProviderItem[]>([]),[models,setModels]=useState<any[]>([]),[agents,setAgents]=useState<any[]>([]),[routing,setRouting]=useState<any[]>([]),[quotas,setQuotas]=useState<any[]>([]),[logs,setLogs]=useState<any[]>([]),[analytics,setAnalytics]=useState<any>({providers:[],daily:[],statuses:[]});
 const [search,setSearch]=useState(""),[providerFilter,setProviderFilter]=useState("all"),[statusFilter,setStatusFilter]=useState("all");
 const reload=useCallback(async()=>{setLoading(true);setError("");try{const data=await Promise.all([fetchAIOverview(active?.slug),fetchAIProviders(),fetchAIModels(),fetchAIAgents(active?.slug),fetchAIRouting(active?.slug),fetchAIQuotas(active?.slug),fetchAIRequestLogs(active?.slug),fetchAIAnalytics(active?.slug)]);setOverview(data[0]);setProviders(data[1]);setModels(data[2]);setAgents(data[3]);setRouting(data[4]);setQuotas(data[5]);setLogs(data[6]);setAnalytics(data[7])}catch{setError("AI management data could not be loaded.")}finally{setLoading(false)}},[active?.slug]);
 useEffect(()=>{void reload()},[reload]);
 const providerCodes=useMemo(()=>Array.from(new Set([...providers.map(p=>p.code),...logs.map(l=>l.provider)])).filter(Boolean),[providers,logs]);
 const filter=useCallback(<T,>(items:T[])=>items.filter((item:any)=>{const text=JSON.stringify(item).toLowerCase(),provider=String(item.provider||item.providerId?.code||item.code||"").toLowerCase(),status=String(item.status||item.health||(item.enabled?"enabled":"disabled")).toLowerCase();return text.includes(search.toLowerCase())&&(providerFilter==="all"||provider===providerFilter)&&(statusFilter==="all"||status===statusFilter)}),[search,providerFilter,statusFilter]);
 const toggleProvider=async(provider:AIProviderItem)=>{const updated=await updateAIProvider(provider.id,{enabled:!provider.enabled});setProviders(all=>all.map(item=>item.id===updated.id?updated:item))};
 const value=useMemo<State>(()=>({workspace:active?.slug,workspaceName:active?.name||"Global",loading,error,overview,providers,models,agents,routing,quotas,logs,analytics,search,setSearch,providerFilter,setProviderFilter,statusFilter,setStatusFilter,providerCodes,filter,reload,toggleProvider}),[active?.slug,active?.name,loading,error,overview,providers,models,agents,routing,quotas,logs,analytics,search,providerFilter,statusFilter,providerCodes,filter,reload]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useAIManagement=()=>{const value=useContext(Context);if(!value)throw new Error("useAIManagement must be used within AIManagementProvider");return value};
