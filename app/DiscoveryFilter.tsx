"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {Search,ArrowUpRight} from "lucide-react";
type Item={title:string;description:string;href:string;label?:string};
export default function DiscoveryFilter({items,placeholder="Search topics",empty="No matching topics yet."}:{items:Item[];placeholder?:string;empty?:string}){
const [query,setQuery]=useState("");
const filtered=useMemo(()=>items.filter(x=>(x.title+" "+x.description+" "+(x.label||"")).toLowerCase().includes(query.trim().toLowerCase())),[items,query]);
return <><div className="discovery-search"><Search size={20}/><input aria-label={placeholder} type="search" placeholder={placeholder} value={query} onChange={e=>setQuery(e.target.value)}/><span>{filtered.length} topics</span></div><div className="discovery-results">{filtered.map(item=><Link href={item.href} className="discovery-result" key={item.title}><span className="discovery-result-label">{item.label||"Explore"}</span><h2>{item.title}</h2><p>{item.description}</p><span className="discovery-result-action">Explore resources <ArrowUpRight size={17}/></span></Link>)}</div>{filtered.length===0&&<p role="status">{empty}</p>}</>}
