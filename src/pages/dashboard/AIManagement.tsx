import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { NavLink, Outlet } from "react-router-dom";
import { HiOutlineArrowPath, HiOutlineFunnel, HiOutlineMagnifyingGlass, HiOutlineServerStack } from "react-icons/hi2";
import { AIManagementProvider, useAIManagement } from "@/features/ai-management/AIManagementContext";

const tabs=[
 ["Overview","overview"],["Providers","providers"],["Models","models"],["Agents","agents"],
 ["Routing","routing"],["Quotas","quotas"],["Request Logs","request-logs"],
] as const;

function AIManagementLayout(){
 const state=useAIManagement();
 return <div className="ai-management-dashboard mx-auto grid w-full max-w-[1600px] gap-4 p-1 text-foreground">
  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4"><div><div className="flex items-center gap-2"><span className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">AI Control Plane</span><span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-black text-primary">{state.workspaceName}</span></div><h1 className="mb-0 mt-1 text-2xl font-black">Agents, traffic & intelligence</h1><p className="m-0 text-xs text-muted-foreground">Unified AI orchestration, quotas and token telemetry.</p></div><button onClick={()=>void state.reload()} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-black hover:border-primary"><HiOutlineArrowPath className={state.loading?"animate-spin":""}/>Refresh</button></header>
  <div className="flex flex-wrap items-center justify-between gap-3"><div className="relative w-full max-w-sm"><HiOutlineMagnifyingGlass className="absolute left-3 top-2.5 text-sm text-muted-foreground"/><input value={state.search} onChange={e=>state.setSearch(e.target.value)} placeholder="Search AI resources..." className="w-full rounded-xl border border-border bg-card py-1.5 pl-9 pr-3 text-xs outline-none focus:border-primary"/></div><div className="flex gap-2"><Filter icon={<HiOutlineServerStack/>} value={state.providerFilter} onChange={state.setProviderFilter} options={["all",...state.providerCodes]}/><Filter icon={<HiOutlineFunnel/>} value={state.statusFilter} onChange={state.setStatusFilter} options={["all","success","fallback","failed","healthy","degraded","enabled","disabled"]}/></div></div>
  <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">{tabs.map(([label,path])=><NavLink key={path} to={path} className={({isActive})=>`whitespace-nowrap rounded-lg px-3.5 py-2.5 text-xs font-black no-underline transition ${isActive?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:bg-surface-muted hover:text-foreground"}`}>{label}</NavLink>)}</nav>
  {state.loading?<div className="grid h-64 place-items-center"><CircularProgress/></div>:state.error?<Alert severity="error">{state.error}</Alert>:<Outlet/>}
 </div>;
}
const Filter=({icon,value,onChange,options}:any)=><label className="flex items-center gap-2 rounded-xl border border-border px-3 text-muted-foreground">{icon}<select value={value} onChange={e=>onChange(e.target.value)} className="h-9 min-w-28 bg-transparent text-xs font-bold capitalize text-foreground outline-none">{options.map((option:string)=><option key={option}>{option}</option>)}</select></label>;
export default function AIManagement(){return <AIManagementProvider><AIManagementLayout/></AIManagementProvider>}
