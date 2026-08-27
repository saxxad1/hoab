"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, Bell, ChevronDown, Download, Eye, EyeOff, FileText, LayoutDashboard, Menu, Plus, Search, Settings, ShipWheel, Trash2, Upload, Users, X } from "lucide-react";
import type { AdminIdentity } from "../admin-auth";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { PUBLIC_MEDIA_BUCKET } from "../../lib/supabase/config";

type Overview = {
  boats: Record<string, unknown>[]; applications: Record<string, unknown>[]; agents: Record<string, unknown>[]; posts: Record<string, unknown>[]; leadership: Record<string, unknown>[]; pages: Record<string, unknown>[]; categories: Record<string, unknown>[]; settings: Record<string,string>;
  stats: { boats:number;activeBoats:number;pendingApplications:number;agents:number };
};
type Entity = "houseboats"|"posts"|"leadership"|"agents"|"pages"|"categories";

const nav = [
  ["dashboard","Dashboard"],["houseboats","Houseboats"],["categories","Boat categories"],["applications","B2B applications"],["agents","Authorised agents"],["posts","News & notices"],["leadership","Leadership"],["pages","Pages & CMS"],["settings","Website settings"],
] as const;

const ADMIN_LOAD_TIMEOUT_MS = 20_000;

const formFields: Record<Entity, Array<[string,string,"text"|"number"|"textarea"|"select",string[]?]>> = {
  houseboats: [["membership_number","Membership number","text"],["slug","URL slug","text"],["name_en","Houseboat name","text"],["owner_name","Owner name","text"],["contact_number","Contact number","text"],["whatsapp","Booking WhatsApp","text"],["email","Business email","text"],["facebook_url","Facebook / Website URL","text"],["starting_price","Starting price (BDT)","number"],["capacity","Total capacity (guests)","number"],["cabins","Total cabins / rooms","number"],["ac_rooms","AC rooms quantity","number"],["non_ac_rooms","Non-AC rooms quantity","number"],["attached_washrooms","Attached washrooms","number"],["common_washrooms","Common washrooms","number"],["category","Boat type","select",["Wooden","Steel","Premium","Other"]],["status","Membership status","select",["active","pending","suspended","expired"]],["district","District","text"],["operating_area","Operating area","text"],["amenities","Amenities JSON","textarea"],["description_en","Description","textarea"],["last_verified_at","Last verified date","text"]],
  posts: [["slug","URL slug","text"],["category","Category","select",["Official Notice","News","Travel Advisory","Government Update","HOAB Event","Press Release","Member Announcement","Houseboat Fair"]],["title_en","Title","text"],["excerpt_en","Excerpt","textarea"],["content_en","Content","textarea"],["status","Publishing status","select",["draft","published","archived"]],["published_at","Publish date","text"]],
  leadership: [["panel","Leadership panel","select",["executive","advisory"]],["term","Committee term","text"],["name_en","Name","text"],["designation_en","Position","text"],["organization","Organisation (optional)","text"],["bio_en","Bio (optional)","textarea"],["status","Status","select",["current","previous"]],["display_order","Display order","number"]],
  agents: [["agent_id","Agent ID","text"],["agency_name","Agency name","text"],["contact_name","Contact person","text"],["phone","Phone","text"],["email","Email","text"],["website","Website","text"],["location","Location","text"],["status","Status","select",["authorised","suspended","expired","archived"]],["valid_since","Valid since","text"],["expires_at","Expires at","text"]],
  pages: [["page_key","Page key","text"],["title_en","Title","text"],["content_en","Content","textarea"],["published","Published (1/0)","number"]],
  categories: [["name_en","Category name","text"],["active","Active (1/0)","number"],["display_order","Display order","number"]],
};

function labelFor(tab:string){return nav.find(([key])=>key===tab)?.[1]??tab}
function value(record:Record<string,unknown>, key:string){return String(record[key]??"")}
function recordValue(record:Record<string,unknown>, key:string){return value(record,key)||value(record,key.replace(/_([a-z])/g,(_,letter:string)=>letter.toUpperCase()))}
function addLabelFor(entity:Entity){return entity==="houseboats"?"houseboat":entity==="leadership"?"committee member":entity==="categories"?"category":entity.slice(0,-1)}
function optionLabel(key:string,option:string){if(key==="panel")return option==="executive"?"Executive committee":"Advisory panel";if(key==="status")return option.charAt(0).toUpperCase()+option.slice(1);return option}

function jsonStringArray(record:Record<string,unknown>,key:string){const camel=key.replace(/_([a-z])/g,(_,letter:string)=>letter.toUpperCase());const raw=record[key]??record[camel];if(Array.isArray(raw))return raw.filter((item):item is string=>typeof item==="string"&&Boolean(item));if(typeof raw!=="string"||!raw.trim())return [];try{const parsed=JSON.parse(raw);return Array.isArray(parsed)?parsed.filter((item):item is string=>typeof item==="string"&&Boolean(item)):[]}catch{return []}}

async function uploadAdminMedia(file:File,area:"houseboats"|"leadership"|"resources"|"settings") {
  const metadata={area,name:file.name,contentType:file.type,size:file.size};
  const prepare=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"prepare",...metadata})});
  const prepared=await prepare.json() as {key?:string;token?:string;error?:string};
  if(!prepare.ok||!prepared.key||!prepared.token)throw new Error(prepared.error||"Upload preparation failed");
  const {error:uploadError}=await createSupabaseBrowserClient().storage.from(PUBLIC_MEDIA_BUCKET).uploadToSignedUrl(prepared.key,prepared.token,file,{contentType:file.type});
  if(uploadError)throw new Error(uploadError.message);
  const complete=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"complete",key:prepared.key,...metadata})});
  const completed=await complete.json() as {asset?:{publicUrl?:string;public_url?:string};error?:string};
  if(!complete.ok)throw new Error(completed.error||"Upload completion failed");
  const publicUrl=completed.asset?.publicUrl||completed.asset?.public_url;
  if(!publicUrl)throw new Error("The uploaded image URL was not returned");
  return publicUrl;
}

export default function AdminConsole({identity}:{identity:AdminIdentity}) {
  const [tab,setTab]=useState("dashboard"); const [navOpen,setNavOpen]=useState(false); const [data,setData]=useState<Overview|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [toast,setToast]=useState(""); const [editor,setEditor]=useState<{entity:Entity;record:Record<string,unknown>}|null>(null); const [search,setSearch]=useState("");
  const notify=(message:string)=>{setToast(message);window.setTimeout(()=>setToast(""),2400)};
  const load=useCallback(async()=>{setLoading(true);setError("");const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),ADMIN_LOAD_TIMEOUT_MS);try{const response=await fetch("/api/admin/overview",{cache:"no-store",signal:controller.signal});const result=await response.json() as Overview&{error?:string};if(!response.ok)throw new Error(result.error||"Unable to load");setData(result)}catch(caught){setError(caught instanceof DOMException&&caught.name==="AbortError"?"The management system took too long to respond. Please retry.":caught instanceof Error?caught.message:"Unable to load admin data")}finally{window.clearTimeout(timeout);setLoading(false)}},[]);
  useEffect(()=>{void load()},[load]);
  useEffect(()=>{if(!navOpen)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setNavOpen(false)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[navOpen]);
  const save=async(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();if(!editor)return;const form=new FormData(event.currentTarget);const payload:Record<string,unknown>={};for(const [key,val] of form.entries())payload[key]=val; if(editor.record.id)payload.id=editor.record.id;for(const [key,,type] of formFields[editor.entity])if(type==="number"){const current=payload[key];payload[key]=current==="true"?1:current==="false"?0:Number(current||0)}const response=await fetch(`/api/admin/records/${editor.entity}`,{method:editor.record.id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const result=await response.json() as {error?:string};if(!response.ok){setError(result.error||"Save failed");return}setEditor(null);notify("Saved successfully");await load()};
  const remove=async(entity:Entity,id:unknown)=>{if(!confirm(entity==="houseboats"?"Permanently delete this houseboat?":"Delete this record?"))return;const response=await fetch(`/api/admin/records/${entity}?id=${id}`,{method:"DELETE"});if(!response.ok){const r=await response.json() as {error?:string};setError(r.error||"Delete failed");return}notify("Record deleted");await load()};
  const bulkUpdate=async(entity:Entity,ids:number[],values:Record<string,unknown>)=>{const response=await fetch(`/api/admin/records/${entity}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids,...values})});const result=await response.json() as {error?:string;count?:number};if(!response.ok){setError(result.error||"Bulk update failed");return}notify(`Updated ${result.count??ids.length} houseboat(s)`);await load()};
  const togglePublished=async(entity:Entity,id:unknown,published:boolean)=>{const response=await fetch(`/api/admin/records/${entity}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,published})});const result=await response.json() as {error?:string};if(!response.ok){setError(result.error||"Update failed");return}notify(published?"Made visible on website":"Hidden from website");await load()};
  const review=async(id:unknown,status:string)=>{const internalNote=status==="additional_information_required"?prompt("What additional information is required?")||"":"";const response=await fetch(`/api/admin/applications/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,internalNote})});const result=await response.json() as {error?:string};if(!response.ok){setError(result.error||"Review failed");return}notify(status==="approved"?"Application approved and agent created":"Application updated");await load()};
  const importBoats=async(file:File)=>{const form=new FormData();form.set("file",file);const response=await fetch("/api/admin/import/houseboats",{method:"POST",body:form});const result=await response.json() as {error?:string;imported?:number;updated?:number;invalid?:number};if(!response.ok){setError(result.error||"Import failed");return}notify(`Imported ${result.imported}, updated ${result.updated}, invalid ${result.invalid}`);await load()};
  const filtered=(records:Record<string,unknown>[])=>{const q=search.toLowerCase();return q?records.filter((record)=>Object.values(record).some((item)=>String(item??"").toLowerCase().includes(q))):records};
  const rowData=useMemo(()=>data?tab==="houseboats"?data.boats:tab==="categories"?data.categories:tab==="applications"?data.applications:tab==="agents"?data.agents:tab==="posts"?data.posts:tab==="leadership"?data.leadership:tab==="pages"?data.pages:[]:[],[data,tab]);
  const entity=(tab==="houseboats"||tab==="categories"||tab==="agents"||tab==="posts"||tab==="leadership"||tab==="pages")?tab as Entity:null;
  return <main className="admin-shell"><aside id="admin-navigation" className={`admin-sidebar ${navOpen?"is-open":""}`}><div className="admin-brand"><a href="/" aria-label="Houseboat Owner's Association Bangladesh home"><img src="/brand/hoab-logo.png" alt="Houseboat Owner's Association Bangladesh" width="1396" height="606"/></a><small>Management system</small></div><button type="button" className="admin-sidebar__close" onClick={()=>setNavOpen(false)} aria-label="Close admin navigation"><X/></button><nav aria-label="Admin navigation">{nav.map(([key,label],index)=><button type="button" className={tab===key?"is-active":""} key={key} onClick={()=>{setTab(key);setNavOpen(false);setSearch("")}}>{index===0?<LayoutDashboard/>:key==="houseboats"?<ShipWheel/>:key==="applications"||key==="posts"?<FileText/>:key==="agents"||key==="leadership"?<Users/>:key==="settings"?<Settings/>:<span className="nav-dot"/>}<span>{label}</span>{key==="applications"&&data?.stats.pendingApplications?<em>{data.stats.pendingApplications}</em>:null}</button>)}</nav><div className="admin-help"><strong>{identity.displayName}</strong><p>{identity.email}</p><a href="/">View public site →</a><form action="/api/auth/signout" method="post"><button type="submit">Sign out →</button></form></div></aside><button type="button" className={`admin-sidebar-backdrop ${navOpen?"is-open":""}`} onClick={()=>setNavOpen(false)} aria-label="Close admin navigation"/><section className="admin-main"><header className="admin-topbar"><button type="button" className="admin-menu" onClick={()=>setNavOpen(true)} aria-expanded={navOpen} aria-controls="admin-navigation" aria-label="Open admin navigation"><Menu/></button><label><Search/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder={`Search ${labelFor(tab).toLowerCase()}…`} aria-label={`Search ${labelFor(tab).toLowerCase()}`}/></label><div><button type="button" className="icon-button" aria-label="Notifications"><Bell/><span/></button><button type="button" className="admin-user" aria-label="Admin account menu"><span>{identity.displayName.slice(0,2).toUpperCase()}</span><span><strong>{identity.displayName}</strong><small>{identity.role.replaceAll("_"," ")}</small></span><ChevronDown/></button></div></header><div className="admin-content">
    {error&&<div className="admin-error"><span>{error}</span><span><button onClick={()=>void load()}>Retry</button><button onClick={()=>setError("")} aria-label="Dismiss error"><X/></button></span></div>}
    {loading&&!data?<div className="admin-loading"><ShipWheel/><p>Loading management system…</p></div>:data&&<>
      <div className="admin-title"><div><p>HOAB central administration</p><h1>{labelFor(tab)}</h1><span>{tab==="leadership"?"Manage Executive Committee and Advisory Panel members":`Signed in as ${identity.email}`}</span></div><div className="admin-title__actions">{entity&&<button className="admin-primary" onClick={()=>setEditor({entity,record:entity==="leadership"?{panel:"executive",term:"2026–2028",status:"current",displayOrder:data.leadership.length+1}:{}})}><Plus/> Add {addLabelFor(entity)}</button>}{tab==="houseboats"&&<><label className="admin-import"><Upload/> Import CSV/XLSX<input type="file" accept=".csv,.xlsx" onChange={(e)=>{const file=e.target.files?.[0];if(file)void importBoats(file)}}/></label><a className="admin-secondary" href="/api/admin/export/houseboats"><Download/> Export</a></>}{tab==="agents"&&<a className="admin-secondary" href="/api/admin/export/agents"><Download/> Export</a>}</div></div>
      {tab==="dashboard"&&<Dashboard data={data} onNavigate={setTab}/>} {entity&&<RecordTable entity={entity} rows={filtered(rowData)} onEdit={(record)=>setEditor({entity,record})} onRemove={(id)=>void remove(entity,id)} onBulkUpdate={(ids,vals)=>bulkUpdate(entity,ids,vals)} onTogglePublished={(id,pub)=>togglePublished(entity,id,pub)}/>} {tab==="applications"&&<Applications rows={filtered(rowData)} review={review}/>} {tab==="settings"&&<SettingsPanel settings={data.settings} onSaved={async()=>{notify("Settings updated");await load()}}/>}
    </>}
  </div></section>{editor&&<Editor state={editor} onClose={()=>setEditor(null)} onSave={save}/>} {toast&&<div className="toast"><BadgeCheck/>{toast}</div>}</main>
}

function Dashboard({data,onNavigate}:{data:Overview;onNavigate:(tab:string)=>void}){return <><div className="admin-stats"><article><span className="stat-icon stat-icon--green"><ShipWheel/></span><div><small>Registered boats</small><strong>{data.stats.boats}</strong><em>{data.stats.activeBoats} active</em></div></article><article><span className="stat-icon stat-icon--gold"><FileText/></span><div><small>Pending applications</small><strong>{data.stats.pendingApplications}</strong><em>Waiting for review</em></div></article><article><span className="stat-icon stat-icon--olive"><BadgeCheck/></span><div><small>Authorised agents</small><strong>{data.stats.agents}</strong><em>Publicly verified</em></div></article></div><div className="admin-grid"><section className="admin-panel admin-panel--wide"><div className="admin-panel__head"><div><h2>Recent B2B applications</h2><p>Prioritised by submission date</p></div><button onClick={()=>onNavigate("applications")}>View all →</button></div><Applications rows={data.applications.slice(0,5)} compact review={()=>{}}/></section><section className="admin-panel"><div className="admin-panel__head"><div><h2>Quick actions</h2><p>Common management tasks</p></div></div><div className="quick-actions"><button onClick={()=>onNavigate("houseboats")}><Plus/><span><strong>Add or import houseboats</strong><small>Manage the official registry</small></span></button><button onClick={()=>onNavigate("posts")}><FileText/><span><strong>Publish a notice</strong><small>Official updates and advisories</small></span></button><button onClick={()=>onNavigate("applications")}><Users/><span><strong>Review B2B applications</strong><small>Approve or request information</small></span></button></div></section><section className="admin-panel admin-panel--full"><div className="admin-panel__head"><div><h2>Recently updated houseboats</h2><p>Latest registry activity</p></div><button onClick={()=>onNavigate("houseboats")}>Manage directory →</button></div><div className="boat-admin-list">{data.boats.slice(0,5).map((boat)=><div key={String(boat.id)}><img src={value(boat,"coverImage")||value(boat,"cover_image")||"/images/hero-houseboat.jpg"} alt=""/><span><strong>{value(boat,"nameEn")||value(boat,"name_en")}</strong><small>{value(boat,"membershipNumber")||value(boat,"membership_number")} · {value(boat,"ownerName")||value(boat,"owner_name")}</small></span><em>{value(boat,"status")}</em></div>)}</div></section></div></>}

function RecordTable({
  entity,
  rows,
  onEdit,
  onRemove,
  onBulkUpdate,
  onTogglePublished
}: {
  entity: Entity;
  rows: Record<string, unknown>[];
  onEdit: (r: Record<string, unknown>) => void;
  onRemove: (id: unknown) => void;
  onBulkUpdate?: (ids: number[], values: Record<string, unknown>) => Promise<void>;
  onTogglePublished?: (id: unknown, published: boolean) => Promise<void>;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
    setVisibilityFilter("all");
  }, [entity]);

  const filteredRows = useMemo(() => {
    if (entity !== "houseboats" || visibilityFilter === "all") return rows;
    if (visibilityFilter === "visible") {
      return rows.filter((r) => r.published === true || r.published === 1 || r.published === "true");
    }
    return rows.filter((r) => !r.published || r.published === 0 || r.published === "false");
  }, [rows, entity, visibilityFilter]);

  const visibleCount = useMemo(() => {
    if (entity !== "houseboats") return 0;
    return rows.filter((r) => r.published === true || r.published === 1 || r.published === "true").length;
  }, [rows, entity]);

  const hiddenCount = rows.length - visibleCount;

  const toggleSelect = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    const displayedIds = filteredRows.map((r) => Number(r.id)).filter(Number.isInteger);
    const allSelected = displayedIds.length > 0 && displayedIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((current) => current.filter((id) => !displayedIds.includes(id)));
    } else {
      setSelectedIds((current) => Array.from(new Set([...current, ...displayedIds])));
    }
  };

  const handleBulkVisibility = async (published: boolean) => {
    if (!onBulkUpdate || !selectedIds.length) return;
    setBulkBusy(true);
    try {
      await onBulkUpdate(selectedIds, { published });
      setSelectedIds([]);
    } finally {
      setBulkBusy(false);
    }
  };

  const isHouseboat = entity === "houseboats";

  const columns: Record<Entity, string[]> = {
    houseboats: ["coverImage", "membershipNumber", "nameEn", "ownerName", "contactNumber", "category", "status"],
    categories: ["nameEn", "active", "displayOrder"],
    posts: ["category", "titleEn", "publishedAt", "status"],
    leadership: ["photo", "panel", "nameEn", "designationEn", "term", "displayOrder", "status"],
    pages: ["pageKey", "titleEn", "published"],
    agents: ["agentId", "agencyName", "contactName", "phone", "status"]
  };

  const labels: Record<string, string> = {
    coverImage: "Photo",
    photo: "Photo",
    panel: "Panel",
    membershipNumber: "Membership",
    nameEn: "Name",
    ownerName: "Owner",
    contactNumber: "Phone",
    titleEn: "Title",
    publishedAt: "Published",
    designationEn: "Position",
    agentId: "Agent ID",
    agencyName: "Agency",
    contactName: "Contact",
    pageKey: "Page key",
    displayOrder: "Order"
  };

  const style = {
    gridTemplateColumns:
      entity === "leadership"
        ? "74px minmax(125px,.8fr) minmax(170px,1.3fr) minmax(170px,1.3fr) 110px 70px 90px 110px"
        : isHouseboat
        ? "38px 56px 105px minmax(180px,1.4fr) minmax(140px,1fr) minmax(125px,1fr) 85px 80px 110px 115px"
        : `repeat(${columns[entity].length + 1},minmax(110px,1fr))`
  };

  const displayedIds = filteredRows.map((r) => Number(r.id)).filter(Number.isInteger);
  const isAllSelected = displayedIds.length > 0 && displayedIds.every((id) => selectedIds.includes(id));

  return (
    <section className="admin-panel admin-record-panel" style={{ borderRadius: "4px", overflow: "hidden", border: "1px solid #e6e2d8" }}>
      {isHouseboat && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 20px", background: "#fbfaf7", borderBottom: "1px solid #e8e4dc", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: visibilityFilter === "all" ? "1px solid var(--green)" : "1px solid #d4dcd6",
                background: visibilityFilter === "all" ? "var(--green)" : "white",
                color: visibilityFilter === "all" ? "white" : "#44504c",
                boxShadow: visibilityFilter === "all" ? "0 2px 5px rgba(15,61,46,0.2)" : "none"
              }}
              onClick={() => setVisibilityFilter("all")}
            >
              All houseboats <em style={{ fontStyle: "normal", fontSize: "11px", padding: "1px 7px", borderRadius: "10px", background: visibilityFilter === "all" ? "rgba(255,255,255,0.25)" : "#e8eee9", color: visibilityFilter === "all" ? "white" : "#333", fontWeight: 700 }}>{rows.length}</em>
            </button>
            <button
              type="button"
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: visibilityFilter === "visible" ? "1px solid var(--green)" : "1px solid #d4dcd6",
                background: visibilityFilter === "visible" ? "var(--green)" : "white",
                color: visibilityFilter === "visible" ? "white" : "#44504c",
                boxShadow: visibilityFilter === "visible" ? "0 2px 5px rgba(15,61,46,0.2)" : "none"
              }}
              onClick={() => setVisibilityFilter("visible")}
            >
              <Eye size={14} /> Visible on website <em style={{ fontStyle: "normal", fontSize: "11px", padding: "1px 7px", borderRadius: "10px", background: visibilityFilter === "visible" ? "rgba(255,255,255,0.25)" : "#e1f2e6", color: visibilityFilter === "visible" ? "white" : "#1e7e34", fontWeight: 700 }}>{visibleCount}</em>
            </button>
            <button
              type="button"
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: visibilityFilter === "hidden" ? "1px solid var(--green)" : "1px solid #d4dcd6",
                background: visibilityFilter === "hidden" ? "var(--green)" : "white",
                color: visibilityFilter === "hidden" ? "white" : "#44504c",
                boxShadow: visibilityFilter === "hidden" ? "0 2px 5px rgba(15,61,46,0.2)" : "none"
              }}
              onClick={() => setVisibilityFilter("hidden")}
            >
              <EyeOff size={14} /> Hidden from website <em style={{ fontStyle: "normal", fontSize: "11px", padding: "1px 7px", borderRadius: "10px", background: visibilityFilter === "hidden" ? "rgba(255,255,255,0.25)" : "#fdf0d5", color: visibilityFilter === "hidden" ? "white" : "#925102", fontWeight: 700 }}>{hiddenCount}</em>
            </button>
          </div>

          <span style={{ fontSize: "12px", color: "#74807a", fontWeight: 500 }}>
            Showing {filteredRows.length} of {rows.length} houseboats
          </span>
        </div>
      )}

      {isHouseboat && selectedIds.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", background: "#eaf5ee", borderBottom: "2px solid var(--green)", flexWrap: "wrap" }}>
          <strong style={{ fontSize: "13px", color: "var(--green)", fontWeight: 700 }}>
            ✓ {selectedIds.length} houseboat(s) selected
          </strong>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => void handleBulkVisibility(true)}
            style={{
              padding: "7px 15px",
              borderRadius: "4px",
              background: "var(--green)",
              color: "white",
              fontSize: "12px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 5px rgba(15,61,46,0.25)"
            }}
            title="Make all selected houseboats visible on public website"
          >
            <Eye size={14} /> Show on website
          </button>
          <button
            type="button"
            disabled={bulkBusy}
            onClick={() => void handleBulkVisibility(false)}
            style={{
              padding: "7px 15px",
              borderRadius: "4px",
              background: "#d97706",
              color: "white",
              fontSize: "12px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 5px rgba(217,119,6,0.25)"
            }}
            title="Hide all selected houseboats from public website"
          >
            <EyeOff size={14} /> Hide from website
          </button>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#55615d",
              fontSize: "12px",
              textDecoration: "underline",
              cursor: "pointer",
              padding: "4px"
            }}
            onClick={() => setSelectedIds([])}
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="admin-record-table">
        <div className="admin-record-row is-head" style={style}>
          {isHouseboat && (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                aria-label="Select all houseboats"
                style={{ cursor: "pointer", width: "16px", height: "16px" }}
              />
            </span>
          )}
          {columns[entity].map((column) => (
            <span key={column}>{labels[column] || column.replace(/([A-Z])/g, " $1")}</span>
          ))}
          {isHouseboat && <span>Website Visibility</span>}
          <span>Actions</span>
        </div>

        {filteredRows.map((row) => {
          const rowId = Number(row.id);
          const isSelected = selectedIds.includes(rowId);
          const isPublished = row.published === true || row.published === 1 || row.published === "true";

          return (
            <div
              className={`admin-record-row ${entity === "leadership" ? "is-leadership" : ""}`}
              style={{
                ...style,
                backgroundColor: isSelected ? "#eef8f2" : undefined
              }}
              key={String(row.id)}
            >
              {isHouseboat && (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(rowId)}
                    aria-label={`Select ${recordValue(row, "name_en")}`}
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  />
                </span>
              )}

              {columns[entity].map((column) =>
                column === "photo" ? (
                  <span className="leadership-table-photo" key={column} data-label="Photo">
                    {recordValue(row, "photo") ? (
                      <img src={recordValue(row, "photo")} alt="" />
                    ) : (
                      <span>{(recordValue(row, "name_en") || "?").slice(0, 1)}</span>
                    )}
                  </span>
                ) : column === "coverImage" ? (
                  <span className="houseboat-table-photo" key={column} data-label="Photo">
                    {recordValue(row, "cover_image") ? (
                      <img src={recordValue(row, "cover_image")} alt="" />
                    ) : (
                      <ShipWheel />
                    )}
                  </span>
                ) : column === "ownerName" || column === "owner_name" ? (
                  <span key={column} data-label={labels[column] || column} style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                    {recordValue(row, "owner_photo") ? (
                      <img
                        src={recordValue(row, "owner_photo")}
                        alt="Owner"
                        style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover", border: "1px solid #d4cdc3", flexShrink: 0 }}
                        title={`Owner: ${recordValue(row, column)}`}
                      />
                    ) : null}
                    <span>{recordValue(row, column) || "—"}</span>
                  </span>
                ) : (
                  <span key={column} data-label={labels[column] || column}>
                    {column === "panel"
                      ? optionLabel("panel", recordValue(row, column))
                      : recordValue(row, column) || "—"}
                  </span>
                )
              )}

              {isHouseboat && (
                <span data-label="Website Visibility">
                  <button
                    type="button"
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      border: isPublished ? "1px solid #b7e1cd" : "1px solid #fce39f",
                      background: isPublished ? "#e6f4ea" : "#fef7e0",
                      color: isPublished ? "#137333" : "#925102",
                      transition: "all 0.2s ease"
                    }}
                    onClick={() => onTogglePublished && void onTogglePublished(row.id, !isPublished)}
                    title={isPublished ? "Click to hide from website" : "Click to show on website"}
                  >
                    {isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                    {isPublished ? "Visible" : "Hidden"}
                  </button>
                </span>
              )}

              <span className="record-actions" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                  type="button"
                  style={{
                    padding: "5px 10px",
                    borderRadius: "3px",
                    border: "1px solid #dce0dd",
                    background: "white",
                    color: "var(--green)",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                  onClick={() => onEdit(row)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  style={{
                    padding: "5px 8px",
                    borderRadius: "3px",
                    border: "1px solid #f0d0cc",
                    background: "#fff8f7",
                    color: "#c0392b",
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center"
                  }}
                  onClick={() => onRemove(row.id)}
                  title="Delete record"
                >
                  <Trash2 size={13} />
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {!filteredRows.length && (
        <div className="empty-state">
          <Search />
          <h2>No records found</h2>
        </div>
      )}
    </section>
  );
}

function Applications({rows,review,compact=false}:{rows:Record<string,unknown>[];review:(id:unknown,status:string)=>void;compact?:boolean}){return <div className="admin-table"><div className="admin-table__row admin-table__header"><span>Application</span><span>Applicant</span><span>Submitted</span><span>Status</span><span/></div>{rows.map((app)=><div className="admin-table__row" key={String(app.id)}><span><strong>{value(app,"agencyName")||value(app,"agency_name")}</strong><small>{value(app,"referenceNumber")||value(app,"reference_number")}</small></span><span>{value(app,"contactName")||value(app,"contact_name")}</span><span>{value(app,"submittedAt")||value(app,"submitted_at")}</span><span><em className="status status--submitted">{(value(app,"status")||"submitted").replaceAll("_"," ")}</em></span><span className="record-actions">{!compact&&<><DocumentButton id={app.id}/><button onClick={()=>review(app.id,"under_review")}>Review</button><button onClick={()=>review(app.id,"approved")}>Approve</button><button onClick={()=>review(app.id,"additional_information_required")}>More info</button><button className="danger" onClick={()=>review(app.id,"rejected")}>Reject</button></>}</span></div>)}</div>}
function DocumentButton({id}:{id:unknown}){const [documents,setDocuments]=useState<Array<{id:number;originalName:string;documentType:string;size:number}>|null>(null);const load=async()=>{const response=await fetch(`/api/admin/applications/${id}/documents`);const result=await response.json() as {documents?:Array<{id:number;originalName:string;documentType:string;size:number}>};setDocuments(result.documents??[])};return <>{!documents?<button onClick={()=>void load()}>Documents</button>:documents.length?documents.map((document)=><a key={document.id} href={`/api/admin/applications/${id}/documents/${document.id}`} target="_blank" rel="noreferrer">{document.documentType.replaceAll("_"," ")}</a>):<small>No files</small>}</>}
function SettingsPanel({settings,onSaved}:{settings:Record<string,string>;onSaved:()=>void}){
  const initialHeroImages = useMemo(() => {
    try {
      const raw = settings.hero_images;
      if (!raw) return ["/images/hero-houseboat.jpg"];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.filter((item): item is string => typeof item === "string" && Boolean(item)) : ["/images/hero-houseboat.jpg"];
    } catch {
      return ["/images/hero-houseboat.jpg"];
    }
  }, [settings.hero_images]);

  const [heroImages, setHeroImages] = useState<string[]>(initialHeroImages);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");

  const uploadHeroImages = async (files: File[]) => {
    setUploadError("");
    if (heroImages.length + files.length > 12) {
      setUploadError("You can upload up to 12 hero slider images.");
      return;
    }
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of files) {
        uploaded.push(await uploadAdminMedia(file, "settings"));
      }
    } catch (caught) {
      setUploadError(caught instanceof Error ? caught.message : "Image upload failed");
    } finally {
      if (uploaded.length) {
        setHeroImages((current) => Array.from(new Set([...current, ...uploaded])));
      }
      setUploading(false);
    }
  };

  const removeHeroImage = (url: string) => {
    setHeroImages((current) => current.filter((item) => item !== url));
  };

  const moveHeroImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= heroImages.length) return;
    const next = [...heroImages];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setHeroImages(next);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    payload.hero_images = JSON.stringify(heroImages.length > 0 ? heroImages : ["/images/hero-houseboat.jpg"]);
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) {
      setError(result.error || "Save failed");
      return;
    }
    onSaved();
  };

  return (
    <section className="admin-panel settings-panel">
      <form onSubmit={save}>
        <h2>Global website settings</h2>
        <p>These details are used across public contact, hero slideshow and footer areas.</p>

        <div className="hero-slide-editor" style={{ marginBottom: "32px", padding: "22px", border: "1px solid #e3ddd2", background: "#faf9f5", borderRadius: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: "0 0 5px", color: "var(--green)", fontSize: "18px", fontWeight: 700 }}>Hero section slider images</h3>
              <p style={{ margin: 0, color: "#6f7a75", fontSize: "13px" }}>
                Upload multiple JPG, PNG or WebP images. These images will automatically rotate in the homepage hero background slideshow.
              </p>
            </div>
            <label className="button button--outline" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Upload size={16} />
              {uploading ? "Uploading…" : "Add slide images"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={uploading}
                style={{ position: "absolute", width: "1px", height: "1px", opacity: 0 }}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) void uploadHeroImages(files);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {heroImages.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginTop: "18px" }}>
              {heroImages.map((url, index) => (
                <article
                  key={url}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid #dce1dc",
                    borderRadius: "4px",
                    background: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                  }}
                >
                  <img
                    src={url}
                    alt={`Hero slide ${index + 1}`}
                    style={{ width: "100%", height: "115px", objectFit: "cover", display: "block" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: "7px",
                      top: "7px",
                      padding: "2px 8px",
                      borderRadius: "3px",
                      background: "rgba(15, 61, 46, 0.88)",
                      color: "white",
                      fontSize: "11px",
                      fontWeight: 700,
                      backdropFilter: "blur(4px)"
                    }}
                  >
                    Slide {index + 1}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#fdfcf9", borderTop: "1px solid #eee" }}>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveHeroImage(index, -1)}
                        style={{
                          padding: "3px 7px",
                          border: "1px solid #dce0dd",
                          borderRadius: "2px",
                          background: index === 0 ? "#f4f4f4" : "white",
                          color: index === 0 ? "#bbb" : "var(--green)",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: index === 0 ? "default" : "pointer"
                        }}
                        title="Move left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === heroImages.length - 1}
                        onClick={() => moveHeroImage(index, 1)}
                        style={{
                          padding: "3px 7px",
                          border: "1px solid #dce0dd",
                          borderRadius: "2px",
                          background: index === heroImages.length - 1 ? "#f4f4f4" : "white",
                          color: index === heroImages.length - 1 ? "#bbb" : "var(--green)",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: index === heroImages.length - 1 ? "default" : "pointer"
                        }}
                        title="Move right"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHeroImage(url)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#c0392b",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center"
                      }}
                      title="Remove slide"
                      aria-label={`Remove slide ${index + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ minHeight: "100px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "6px", marginTop: "18px", border: "1px dashed #b5bdb9", color: "#74817b", fontSize: "13px", borderRadius: "4px", background: "white" }}>
              <ShipWheel size={24} style={{ color: "var(--olive)" }} />
              <span>No hero images added yet (default image will be used)</span>
            </div>
          )}
          {uploadError && <p className="form-error" style={{ marginTop: "12px" }}>{uploadError}</p>}
        </div>

        <div className="form-grid">
          <label>Official organisation name<input name="site_name" defaultValue={settings.site_name} /></label>
          <label>Official email<input name="official_email" defaultValue={settings.official_email} /></label>
          <label>Official phone<input name="official_phone" defaultValue={settings.official_phone} /></label>
          <label>Office hours<input name="office_hours" defaultValue={settings.office_hours} /></label>
          <label className="span-2">Office address<textarea name="office_address" defaultValue={settings.office_address} /></label>
          <label>Facebook URL<input name="facebook_url" defaultValue={settings.facebook_url} /></label>
          <label>YouTube URL<input name="youtube_url" defaultValue={settings.youtube_url} /></label>
        </div>

        {error && <p className="form-error">{error}</p>}
        <button className="button button--dark" disabled={uploading}>
          {uploading ? "Uploading images…" : "Save settings"}
        </button>
      </form>
    </section>
  );
}

function Editor({state,onClose,onSave}:{state:{entity:Entity;record:Record<string,unknown>};onClose:()=>void;onSave:(event:React.FormEvent<HTMLFormElement>)=>void}){
  const initialCover=recordValue(state.record,"cover_image");
  const initialGallery=jsonStringArray(state.record,"gallery");
  const effectiveCover=initialCover||initialGallery[0]||"";
  const [photo,setPhoto]=useState(recordValue(state.record,"photo"));
  const [ownerPhoto,setOwnerPhoto]=useState(recordValue(state.record,"owner_photo"));
  const [boatImages,setBoatImages]=useState(()=>Array.from(new Set([effectiveCover,...initialGallery].filter(Boolean))));
  const [boatCover,setBoatCover]=useState(effectiveCover);
  const [uploading,setUploading]=useState(false);
  const [uploadError,setUploadError]=useState("");

  const uploadPhoto=async(file:File)=>{setUploadError("");setUploading(true);try{setPhoto(await uploadAdminMedia(file,"leadership"))}catch(caught){setUploadError(caught instanceof Error?caught.message:"Photo upload failed")}finally{setUploading(false)}};
  const uploadOwnerPhoto=async(file:File)=>{setUploadError("");setUploading(true);try{setOwnerPhoto(await uploadAdminMedia(file,"houseboats"))}catch(caught){setUploadError(caught instanceof Error?caught.message:"Owner photo upload failed")}finally{setUploading(false)}};
  const uploadBoatPhotos=async(files:File[])=>{setUploadError("");if(boatImages.length+files.length>20){setUploadError("A houseboat can have up to 20 photos.");return}setUploading(true);const uploaded:string[]=[];try{for(const file of files)uploaded.push(await uploadAdminMedia(file,"houseboats"))}catch(caught){setUploadError(caught instanceof Error?caught.message:"Photo upload failed")}finally{if(uploaded.length){setBoatImages((current)=>Array.from(new Set([...current,...uploaded])));setBoatCover((current)=>current||uploaded[0])}setUploading(false)}};
  const removeBoatImage=(url:string)=>{const remaining=boatImages.filter((item)=>item!==url);setBoatImages(remaining);if(boatCover===url)setBoatCover(remaining[0]??"")};

  return <div className="admin-modal-backdrop" onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}><section className="admin-editor"><header><div><span>{state.record.id?"Edit record":"Create record"}</span><h2>{state.entity==="leadership"?"Leadership member":labelFor(state.entity)}</h2></div><button type="button" onClick={onClose}><X/></button></header><form onSubmit={onSave}>
    {state.entity==="houseboats"&&(
      <>
        {/* 1. Houseboat Owner Photo (মালিকের ছবি - Top Centered, Compact) */}
        <section className="houseboat-owner-top-card">
          <div className="houseboat-owner-top-card__header">
            <span className="houseboat-owner-top-card__tag">🔒 Internal Admin Record · Not Public</span>
            <h3>Owner / Operator Photo (মালিকের ছবি)</h3>
            <p>Upload a clear portrait of the houseboat owner or managing partner. Saved strictly for HOAB admin records (not shown on public website).</p>
          </div>

          <div className="houseboat-owner-top-card__body">
            <div className="houseboat-owner-top-card__avatar-wrap">
              {ownerPhoto ? (
                <img
                  src={ownerPhoto}
                  alt="Owner portrait"
                  className="houseboat-owner-top-card__img"
                />
              ) : (
                <div className="houseboat-owner-top-card__placeholder">
                  <Users size={30} />
                  <span>No photo</span>
                </div>
              )}
            </div>

            <div className="houseboat-owner-top-card__actions">
              <label className="button button--outline">
                <Upload size={14} />
                {uploading ? "Uploading…" : ownerPhoto ? "Change owner photo" : "Upload owner photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadOwnerPhoto(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              {ownerPhoto && (
                <button
                  type="button"
                  className="button button--outline"
                  style={{ color: "#c0392b", borderColor: "#f0d0cc", background: "#fff8f7" }}
                  onClick={() => setOwnerPhoto("")}
                  title="Remove owner photo"
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </div>
          <input type="hidden" name="owner_photo" value={ownerPhoto} />
        </section>

        {/* 2. Houseboat photos (Cover + Gallery) */}
        <section className="houseboat-image-editor"><div className="houseboat-image-editor__head"><div><h3>Houseboat photos</h3><p>Upload multiple JPG, PNG or WebP images. Select one image as the cover photo. Maximum 20 photos, 12 MB each.</p></div><label className="button button--outline"><Upload/>{uploading?"Uploading…":"Add photos"}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading} onChange={(e)=>{const files=Array.from(e.target.files??[]);if(files.length)void uploadBoatPhotos(files);e.currentTarget.value=""}}/></label></div>{boatImages.length?<div className="houseboat-image-grid">{boatImages.map((url,index)=><article className={url===boatCover?"is-cover":""} key={url}><img src={url} alt={`Houseboat photo ${index+1}`}/>{url===boatCover&&<span>Cover photo</span>}<div><button type="button" disabled={url===boatCover} onClick={()=>setBoatCover(url)}>{url===boatCover?"Selected":"Set as cover"}</button><button type="button" className="danger" onClick={()=>removeBoatImage(url)} aria-label={`Remove photo ${index+1}`}><Trash2/></button></div></article>)}</div>:<div className="houseboat-image-empty"><ShipWheel/><span>No photos added yet</span></div>}<input type="hidden" name="cover_image" value={boatCover}/><input type="hidden" name="gallery" value={JSON.stringify(boatImages.filter((url)=>url!==boatCover))}/></section>
      </>
    )}
    {uploadError&&<p className="form-error" style={{ marginBottom: "14px" }}>{uploadError}</p>}
    {state.entity==="leadership"&&<div className="leadership-photo-editor"><div className={`leadership-photo-preview ${photo?"has-image":""}`}>{photo?<img src={photo} alt="Selected committee member"/>:<Users/>}</div><div><h3>Member photo</h3><p>Upload a clear portrait. JPG, PNG or WebP, maximum 12 MB.</p><div className="leadership-photo-actions"><label className="button button--outline"><Upload/>{uploading?"Uploading…":photo?"Replace photo":"Upload photo"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e)=>{const file=e.target.files?.[0];if(file)void uploadPhoto(file);e.currentTarget.value=""}}/></label>{photo&&<button type="button" className="button button--outline" onClick={()=>setPhoto("")}><Trash2/> Remove</button>}</div><input type="hidden" name="photo" value={photo}/></div></div>}
    <div className="form-grid">
      {formFields[state.entity].map(([key, label, type, options]) => (
        <label className={type === "textarea" ? "span-2" : ""} key={key}>
          {label}
          {type === "select" ? (
            <select name={key} defaultValue={recordValue(state.record, key)}>
              {options?.map((option) => (
                <option key={option} value={option}>
                  {optionLabel(key, option)}
                </option>
              ))}
            </select>
          ) : type === "textarea" ? (
            <textarea name={key} defaultValue={recordValue(state.record, key)} />
          ) : (
            <>
              <input
                name={key}
                type={type}
                defaultValue={recordValue(state.record, key)}
                placeholder={
                  key === "contact_number" || key === "whatsapp" || key === "phone"
                    ? "e.g. 017XXXXXXXX (BD +880 automatic)"
                    : undefined
                }
              />
              {(key === "contact_number" || key === "whatsapp" || key === "phone") && (
                <small style={{ display: "block", color: "#7a8581", fontSize: "11px", marginTop: "2px" }}>
                  💡 Just enter 017... or +88017... (Country code +880 is automatically formatted)
                </small>
              )}
            </>
          )}
        </label>
      ))}
    </div>
    <div className="form-actions"><button type="button" className="button button--outline" onClick={onClose}>Cancel</button><button className="button button--gold" disabled={uploading}>{uploading?"Uploading photos…":"Save changes"}</button></div></form></section></div>
}
