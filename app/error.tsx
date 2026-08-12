"use client";
import { useEffect } from "react";
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){useEffect(()=>{console.error(error)},[error]);return <main className="error-page"><span className="section-kicker">Something went wrong</span><h1>We could not complete that request.</h1><p>Please try again. If the issue continues, contact the HOAB secretariat.</p><button className="button button--dark" onClick={reset}>Try again</button></main>}
