"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";

const KEY=process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST="https://us.i.posthog.com";
const CHOICE="ih_analytics_consent";
const ID="ih_analytics_visitor";
const SESSION="ih_analytics_session";
const OPEN_EVENT="ih:open-consent";
function doNotTrack(){return navigator.doNotTrack==="1"||((navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl===true)}
function identifier(storage:Storage,key:string){let value=storage.getItem(key);if(!value){value=crypto.randomUUID();storage.setItem(key,value)}return value}
function capture(path:string){
  const saved=localStorage.getItem(CHOICE);
  if(!KEY||doNotTrack()||(saved!=="yes"&&saved!=="granted")||path.startsWith("/admin"))return;
  // Do not send search parameters, page titles, referrers, form data or medical checklist content.
  const distinct_id=identifier(localStorage,ID);
  const session_id=identifier(sessionStorage,SESSION);
  const event={api_key:KEY,event:"$pageview",distinct_id,timestamp:new Date().toISOString(),properties:{$pathname:path,$host:location.hostname,$session_id:session_id,$process_person_profile:false,$ip:null}};
  void fetch(HOST+"/capture/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(event),keepalive:true}).catch(()=>{});
}
export default function AnalyticsConsent(){
 const path=usePathname();
 const [choice,setChoice]=useState<"yes"|"no"|null>(null);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
   if(KEY&&!doNotTrack()){
     const saved=localStorage.getItem(CHOICE);
     if(saved==="yes"||saved==="granted")setChoice("yes");
     else if(saved==="no"||saved==="denied")setChoice("no");
   }
   setReady(true);
   const reopen=()=>setChoice(null);
   window.addEventListener(OPEN_EVENT,reopen);
   return ()=>window.removeEventListener(OPEN_EVENT,reopen);
 },[]);
 useEffect(()=>{if(choice==="yes"&&path)capture(path);},[choice,path]);
 if(!KEY||!ready||doNotTrack()||choice!==null||path?.startsWith("/admin"))return null;
 return <div role="dialog" aria-label="Optional website analytics" style={{position:"fixed",bottom:16,left:16,right:16,zIndex:1000,maxWidth:590,margin:"auto",padding:20,background:"#fff",color:"#143d43",border:"1px solid #bedad4",borderRadius:16,boxShadow:"0 10px 45px #1235"}}>
   <strong>Optional website analytics</strong>
   <p style={{margin:"8px 0 14px",fontSize:14}}>With your permission, we use PostHog to understand page visits and improve this website. We do not send checklist answers, forms, search queries, or medical details. <a href="/privacy/" style={{textDecoration:"underline"}}>Privacy details</a>.</p>
   <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button type="button" className="btn" onClick={()=>{localStorage.setItem(CHOICE,"yes");setChoice("yes")}}>Allow analytics</button><button type="button" className="btn btn-outline" onClick={()=>{localStorage.setItem(CHOICE,"no");setChoice("no")}}>Decline</button></div>
 </div>;
}

export function ConsentSettingsLink(){
 if(!KEY)return null;
 return <button type="button" className="consent-link" onClick={()=>window.dispatchEvent(new Event(OPEN_EVENT))}>Analytics settings</button>;
}
