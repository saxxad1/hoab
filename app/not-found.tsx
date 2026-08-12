"use client";
import { Compass } from "lucide-react";
import { Footer, Header } from "./components/PublicSite";
export default function NotFound(){return <main><Header language="en" onLanguage={()=>{}}/><section className="error-page"><Compass/><span className="section-kicker">404 · Off course</span><h1>This page is not on the map.</h1><p>Return to HOAB or continue with the official houseboat directory.</p><div><a className="button button--dark" href="/">HOAB home</a><a className="button button--outline" href="/houseboats">Find a houseboat</a></div></section><Footer/></main>}
