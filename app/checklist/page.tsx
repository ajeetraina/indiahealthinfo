import TravelChecklist from "@/components/travel-checklist";
import type {Metadata} from "next";
export const metadata:Metadata={title:"Medical Travel Checklist",description:"A free interactive checklist for planning medical travel to India: documents, visas, insurance, accommodation, treatment and return travel."};
export default function Page(){return <><div className="page-head"><div className="wrap"><div className="eyebrow">Plan step by step</div><h1>Medical travel checklist</h1><p>Everything you may need to consider, in one simple list. Check items off as you prepare and keep track on your own device.</p></div></div><section className="section"><div className="wrap"><TravelChecklist/></div></section></>}
