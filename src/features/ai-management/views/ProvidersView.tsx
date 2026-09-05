import Switch from "@mui/material/Switch";
import { HiOutlineCpuChip, HiOutlineServerStack } from "react-icons/hi2";
import { useAIManagement } from "../AIManagementContext";

const statusClass=(value:string)=>value==="healthy"||value==="configured"?"bg-success/10 text-success":value==="missing env"?"bg-danger/10 text-danger":"bg-warning/10 text-warning";
const Badge=({value}:{value:string})=><span className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${statusClass(value)}`}>{value}</span>;

export default function ProvidersView(){
 const context=useAIManagement();const providers=context.filter(context.providers);
 return <div className="space-y-3">
  <div className="flex items-center justify-between"><p className="m-0 text-[10px] text-muted-foreground">Registry-managed provider connections and health.</p><span className="text-[10px] font-bold text-muted-foreground">{providers.length} providers</span></div>
  <div className="flex flex-wrap items-start gap-2.5">{providers.map(provider=>{const modelCount=context.models.filter(model=>model.providerId?.code===provider.code).length;return <article key={provider.id} className="min-w-[180px] max-w-[240px] flex-1 basis-[200px] rounded-xl border border-border bg-surface-elevated p-3 shadow-sm transition hover:border-primary/50">
   <div className="flex items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><HiOutlineServerStack/></span><div className="min-w-0 flex-1"><h2 className="m-0 truncate text-xs font-black">{provider.name}</h2><code className="block truncate text-[8px] text-muted-foreground">{provider.code}</code></div><Switch size="small" checked={provider.enabled} onChange={()=>void context.toggleProvider(provider)}/></div>
   <div className="mt-2 flex items-center gap-1.5"><Badge value={provider.configured?"configured":"missing env"}/><Badge value={provider.health}/><span className="ml-auto flex items-center gap-1 text-[8px] font-bold text-muted-foreground"><HiOutlineCpuChip/>{modelCount}</span><span className="text-[8px] text-muted-foreground">P{provider.priority}</span></div>
  </article>})}</div>
  {!providers.length&&<div className="rounded-xl border border-dashed border-border p-10 text-center text-xs text-muted-foreground">No providers match the current filters.</div>}
 </div>;
}
