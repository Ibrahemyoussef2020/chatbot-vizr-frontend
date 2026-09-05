import { HiOutlineBolt, HiOutlineCalendarDays, HiOutlineCircleStack, HiOutlineClock, HiOutlineUsers } from "react-icons/hi2";
import type { ReactNode } from "react";
import AITokenInsights from "@/components/dashboard/AITokenInsights";
import AIEntityCrud, { AIEntityCardActions } from "@/components/dashboard/AIEntityCrud";
import { useAIManagement } from "../AIManagementContext";

const compact=(n=0)=>n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:String(n);
const percent=(used=0,limit=0)=>limit?Math.min(100,Math.round(used/limit*100)):0;
const barTone=(value:number)=>value>=90?"bg-danger":value>=70?"bg-warning":"bg-primary";
const resetLabel=(value?:string)=>{if(!value)return "No reset scheduled";const ms=new Date(value).getTime()-Date.now();if(ms<=0)return "Reset pending";const hours=Math.ceil(ms/3_600_000);return hours<24?`Resets in ${hours}h`:`Resets in ${Math.ceil(hours/24)}d`};

function UsageBar({label,used,limit,icon}:{label:string;used:number;limit:number;icon:ReactNode}){
 const value=percent(used,limit);
 return <div><div className="mb-1.5 flex items-center justify-between text-[10px]"><span className="flex items-center gap-1 font-bold text-muted-foreground">{icon}{label}</span><span><b className="text-foreground">{compact(used)}</b> / {compact(limit)} <b className={value>=90?"text-danger":value>=70?"text-warning":"text-primary"}>{value}%</b></span></div><div className="h-2 overflow-hidden rounded-full bg-surface-muted"><i className={`block h-full rounded-full transition-[width] duration-500 ${barTone(value)}`} style={{width:`${value}%`}}/></div></div>;
}

export default function QuotasView(){
 const context=useAIManagement();const quotas=context.filter(context.quotas);
 return <div className="space-y-4">
  <AITokenInsights workspace={context.workspace} mode="quota"/>
  <AIEntityCrud kind="Quotas" items={quotas} providers={context.providers} models={context.models} agents={context.agents} workspace={context.workspace} onChanged={()=>void context.reload()}/>
  <div className="flex flex-wrap gap-3">{quotas.map((quota:any)=><article key={quota._id} className="min-w-[280px] flex-1 basis-[340px] overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm transition hover:border-primary/50 hover:shadow-md">
   <header className="flex items-center justify-between border-b border-border bg-surface-muted/40 px-4 py-2.5"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${quota.enabled?"bg-success":"bg-muted-foreground"}`}/><h2 className="m-0 truncate text-xs font-black">{quota.name}</h2></div><span className="ml-4 text-[9px] font-bold uppercase text-primary">{quota.scope} · {quota.period}</span></div><AIEntityCardActions kind="Quotas" item={quota}/></header>
   <div className="grid gap-4 p-4"><UsageBar label="Token consumption" used={quota.usedTokens} limit={quota.tokenLimit} icon={<HiOutlineCircleStack/>}/><UsageBar label="Request consumption" used={quota.usedRequests} limit={quota.requestLimit} icon={<HiOutlineBolt/>}/><div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-card py-2 text-center"><div><HiOutlineUsers className="mx-auto text-primary"/><b className="block text-xs">{quota.concurrencyLimit}</b><span className="text-[8px] uppercase text-muted-foreground">Concurrent</span></div><div><HiOutlineClock className="mx-auto text-primary"/><b className="block text-xs capitalize">{quota.period}</b><span className="text-[8px] uppercase text-muted-foreground">Window</span></div><div><HiOutlineCalendarDays className="mx-auto text-primary"/><b className="block text-[10px]">{resetLabel(quota.resetAt)}</b><span className="text-[8px] uppercase text-muted-foreground">Schedule</span></div></div></div>
  </article>)}</div>
  {!quotas.length&&<div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">No quota policies match the current filters.</div>}
 </div>;
}
