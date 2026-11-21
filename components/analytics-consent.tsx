"use client";
// Consent-aware PostHog pageview tracking.
// - Nothing loads until the visitor clicks "Allow".
// - Global Privacy Control is treated as a "no".
// - Only $pageview events are sent: no autocapture, no session recording,
//   no surveys, no form or input capture.
// - Query strings and hashes are removed from URLs before sending, so
//   anything typed into a search box or form never leaves the browser.
// - /admin/ pages are never tracked.
import {useEffect,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import type {PostHog} from "posthog-js";

const KEY=process.env.NEXT_PUBLIC_POSTHOG_KEY||"";
const HOST=process.env.NEXT_PUBLIC_POSTHOG_HOST||"https://us.i.posthog.com";
const STORAGE="ih_analytics_consent";
export const OPEN_EVENT="ih:open-consent";

type Choice="granted"|"denied"|null;

function readChoice():Choice{
  try{const v=localStorage.getItem(STORAGE);return v==="granted"||v==="denied"?v:null}catch{return null}
}
function saveChoice(v:"granted"|"denied"){try{localStorage.setItem(STORAGE,v)}catch{}}
function gpcOn(){return typeof navigator!=="undefined"&&(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl===true}
function clean(url:unknown){
  if(typeof url!=="string"||!url)return url;
  try{const u=new URL(url);return u.origin+u.pathname}catch{return url.split(/[?#]/)[0]}
}

export default function AnalyticsConsent(){
  const pathname=usePathname();
  const [choice,setChoice]=useState<Choice>(null);
  const [ready,setReady]=useState(false);
  const ph=useRef<PostHog|null>(null);

  useEffect(()=>{
    setChoice(gpcOn()?"denied":readChoice());
    setReady(true);
    const reopen=()=>setChoice(null);
    window.addEventListener(OPEN_EVENT,reopen);
    return ()=>window.removeEventListener(OPEN_EVENT,reopen);
  },[]);

  // Load PostHog only after consent.
  useEffect(()=>{
    if(!KEY||choice!=="granted"||ph.current)return;
    let cancelled=false;
    import("posthog-js").then(({default:posthog})=>{
      if(cancelled)return;
      posthog.init(KEY,{
        api_host:HOST,
        autocapture:false,
        capture_pageview:false,
        capture_pageleave:false,
        disable_session_recording:true,
        disable_surveys:true,
        advanced_disable_feature_flags:true,
        enable_heatmaps:false,
        capture_dead_clicks:false,
        mask_all_text:true,
        mask_all_element_attributes:true,
        persistence:"localStorage",
        person_profiles:"never",
        before_send:(event)=>{
          if(!event)return null;
          if(event.event!=="$pageview")return null;
          const p=event.properties||{};
          if(typeof p.$pathname==="string"&&p.$pathname.startsWith("/admin"))return null;
          p.$current_url=clean(p.$current_url);
          p.$referrer=clean(p.$referrer);
          p.$initial_referrer=clean(p.$initial_referrer);
          delete p.$set;delete p.$set_once;
          return event;
        },
      });
      ph.current=posthog;
      posthog.capture("$pageview");
    });
    return ()=>{cancelled=true};
  },[choice]);

  // Track client-side navigations after the first load.
  const first=useRef(true);
  useEffect(()=>{
    if(first.current){first.current=false;return}
    if(choice==="granted"&&ph.current)ph.current.capture("$pageview");
  },[pathname,choice]);

  const decide=(v:"granted"|"denied")=>{
    saveChoice(v);
    if(v==="denied"&&ph.current){ph.current.opt_out_capturing();ph.current.reset()}
    if(v==="granted"&&ph.current)ph.current.opt_in_capturing();
    setChoice(v);
  };

  if(!KEY||!ready||choice!==null||pathname?.startsWith("/admin"))return null;
  return <div className="consent" role="dialog" aria-live="polite" aria-label="Analytics choice">
    <p>We'd like to count page visits to see which guides are useful. We don't record what you type, your health details, or your exact location. <a href="/privacy/">Privacy</a></p>
    <div className="consent-actions">
      <button type="button" className="consent-no" onClick={()=>decide("denied")}>No thanks</button>
      <button type="button" className="consent-yes" onClick={()=>decide("granted")}>Allow</button>
    </div>
  </div>;
}

export function ConsentSettingsLink(){
  if(!KEY)return null;
  return <button type="button" className="consent-link" onClick={()=>window.dispatchEvent(new Event(OPEN_EVENT))}>Analytics settings</button>;
}
