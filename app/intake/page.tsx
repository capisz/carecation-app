"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Plane, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { usePageReady } from "@/hooks/use-page-ready";
import { PROCEDURE_CATEGORIES, INTAKE_DESTINATIONS, TRAVEL_MONTHS, BUDGET_RANGES } from "@/lib/mock/providers";
import { upsertTravelRecommendation } from "@/lib/itinerary-plan";
import { findTravelLocation } from "@/lib/travel-locations";
import { useOverlay } from "@/components/overlay/overlay-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const photos: Record<string,string> = { Thailand:"thailand", Mexico:"mexico", Turkey:"turkey", Spain:"spain", Guatemala:"guatemala", "South Korea":"south-korea", Vietnam:"vietnam", Cuba:"cuba", Taiwan:"taiwan", Sweden:"sweden", Norway:"norway", Singapore:"singapore", Ireland:"ireland", Japan:"japan", Netherlands:"netherlands" };

export default function IntakePage() {
  usePageReady();
  const router = useRouter();
  const { runNavOverlay } = useOverlay();
  const [step, setStep] = useState(0);
  const [procedure, setProcedure] = useState("");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [month, setMonth] = useState("");
  const [budget, setBudget] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profile = useMemo(() => findTravelLocation(destinations[0] || "Thailand"), [destinations]);
  const city = profile?.recommendedCity ?? "Bangkok";
  const cityCode = profile?.recommendedCityCode ?? "BKK";
  const airports = (profile?.airports ?? []).map((item) => item.iata).slice(0,3);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const advance = () => { if (timer.current) clearTimeout(timer.current); setStep((current) => Math.min(4,current+1)); };
  const chooseAuto = (fn: () => void) => { fn(); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setStep((current) => Math.min(4,current+1)),420); };
  const toggle = (value:string) => setDestinations((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current,value]);
  const findFlights = () => {
    const summary = `Recommended start: ${city} (${cityCode}). Based on ${procedure} in ${month} with ${budget}, compare flights first, then add a hotel and care estimate.`;
    upsertTravelRecommendation({ procedure, country:destinations[0] || "Any", month, budgetLabel:budget, recommendedDestination:city, recommendedCityCode:cityCode, recommendedAirportCodes:airports, preferredDestinations:destinations, summary, createdAt:new Date().toISOString() });
    const params = new URLSearchParams({ destination:city, destinationCityCode:cityCode, destinationAirports:airports.join(","), country:destinations[0] || "Any", preferredDestinations:destinations.join(","), month, procedure, budgetLabel:budget });
    runNavOverlay("/travel"); router.push(`/travel?${params.toString()}`);
  };
  const questions = ["What care are you looking for?", "Where would you like to go?", "When do you want to travel?", "What's your budget?"];
  const image = `/destinations/${photos[destinations[0] || "Thailand"]}.jpg`;
  return <AppShell><div className="care-page intake-page min-h-[78vh]">
    <div className="mx-auto max-w-[1240px]">
      <div className="intake-topbar">
        <Link href="/" aria-label="Carecation home" className="care-brand"><span className="care-brand-mark"><Image src="/brand/carecation-heart-light.png" alt="" fill sizes="22px"/></span><span>Care<span>cation</span></span></Link>
        <p className="text-sm font-extrabold text-muted-foreground">{step < 4 ? `${step + 1} / 4` : "Your plan"}</p>
        <div className="intake-controls"><ThemeToggle/><Link href="/" aria-label="Exit planning" className="rounded-full p-2 hover:bg-secondary"><X size={20}/></Link></div>
      </div>
      <div className="relative mt-3 h-px bg-border"><div className="h-px bg-primary transition-[width] duration-1000" style={{width:`${Math.min(step/4,1)*100}%`}}/><Plane aria-hidden="true" className="absolute -top-3 text-primary transition-[left] duration-1000" size={22} style={{left:`calc(${Math.min(step/4,1)*100}% - 11px)`,transform:"rotate(45deg)"}}/></div>
      {step < 4 ? <section key={step} className="pt-20 pb-12 animate-care-rise">
        <h1 className="care-h1 max-w-[900px]">{questions[step]}</h1>
        {step === 0 && <div className="mt-12 grid gap-x-14 gap-y-1 sm:grid-cols-2">{PROCEDURE_CATEGORIES.map((item) => <button key={item} onClick={() => chooseAuto(() => setProcedure(item))} className={`flex min-h-16 items-center gap-3 border-b border-border text-left text-xl font-bold tracking-[-.02em] transition-colors sm:text-[26px] ${procedure===item?"text-primary":"hover:text-primary"}`}><span className={`h-2.5 w-2.5 rounded-full bg-primary transition-opacity ${procedure===item?"opacity-100":"opacity-0"}`}/>{item}</button>)}</div>}
        {step === 1 && <><p className="mt-3 text-lg font-semibold text-muted-foreground">Pick as many as you like.</p><div className="mt-10 flex flex-wrap gap-3">{INTAKE_DESTINATIONS.map((item) => <button key={item} onClick={() => toggle(item)} className={`rounded-full border px-5 py-3 font-bold transition-colors ${destinations.includes(item)?"border-primary bg-primary text-primary-foreground":"border-border hover:border-primary"}`}>{item}</button>)}</div><div className="mt-12 flex items-center gap-6"><button className="care-pill disabled:opacity-35" disabled={!destinations.length} onClick={advance}>Continue <Plane className="ml-1 inline h-[17px] w-[17px] rotate-45" aria-hidden="true" /></button><button className="text-sm font-bold text-muted-foreground" onClick={() => setStep(0)}><ArrowLeft className="mr-2 inline" size={15}/>Back</button></div></>}
        {step === 2 && <div className="mt-12 grid grid-cols-2 gap-x-12 sm:grid-cols-3 lg:grid-cols-4">{TRAVEL_MONTHS.map((item) => <button key={item} onClick={() => chooseAuto(() => setMonth(item))} className={`border-b border-border py-4 text-left text-xl font-bold transition-colors hover:text-primary ${month===item?"text-primary":""}`}>{item}{month===item&&<Check className="ml-2 inline" size={16}/>}</button>)}</div>}
        {step === 3 && <div className="mt-12 grid gap-x-12 sm:grid-cols-2">{BUDGET_RANGES.map((item) => <button key={item.label} onClick={() => chooseAuto(() => setBudget(item.label))} className={`flex items-center justify-between border-b border-border py-6 text-left text-2xl font-bold transition-colors hover:text-primary ${budget===item.label?"text-primary":""}`}>{item.label}{budget===item.label&&<Check size={20}/>}</button>)}</div>}
      </section> : <section className="grid items-center gap-12 py-16 lg:grid-cols-[1fr_.9fr]">
        <div><p className="mb-5 font-extrabold text-muted-foreground">Your starting point</p><h1 className="care-h1">Start in <span className="text-primary">{city}.</span></h1><p className="mt-6 max-w-xl text-lg font-semibold leading-relaxed text-muted-foreground">{procedure} · {month} · {budget}. Compare flights first, then add a hotel and a care estimate.</p><div className="mt-9 flex flex-wrap items-center gap-6"><button className="care-pill" onClick={findFlights}>Find flights <Plane className="ml-1 inline h-[17px] w-[17px] rotate-45" aria-hidden="true" /></button><button onClick={() => {setStep(0);setProcedure("");setDestinations([]);setMonth("");setBudget("");}} className="font-bold text-muted-foreground underline underline-offset-4">Start over</button></div></div>
        <div className="relative aspect-[1.1] overflow-hidden rounded-[28px]"><Image src={image} alt={`${destinations[0] || "Thailand"} travel destination`} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover animate-care-zoom" priority/></div>
      </section>}
      {step > 0 && step < 4 && <button onClick={() => {if(timer.current)clearTimeout(timer.current);setStep(step-1);}} className="mt-3 inline-flex items-center gap-2 font-bold text-muted-foreground"><ArrowLeft size={16}/>Back</button>}
    </div>
  </div></AppShell>;
}
