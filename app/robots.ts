import type { MetadataRoute } from "next";
import { headers } from "next/headers";
export default async function robots():Promise<MetadataRoute.Robots>{const requestHeaders=await headers();const host=requestHeaders.get("host")||"localhost:3000";const base=`${host.startsWith("localhost")?"http":"https"}://${host}`;return{rules:{userAgent:"*",allow:"/",disallow:["/admin","/api"]},sitemap:`${base}/sitemap.xml`}}
