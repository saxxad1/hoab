import { notFound } from "next/navigation";
import { NewsDetailPage } from "../../components/ContentPages";
import { getPublicData } from "../../../db/public-data";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const data=await getPublicData();const item=data.news.find((post)=>post.slug===slug);if(!item)notFound();return <NewsDetailPage item={item}/>}
