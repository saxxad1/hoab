import { notFound } from "next/navigation";
import { BoatDetailPage } from "../../components/ContentPages";
import { getPublicBoat, getPublicData } from "../../../db/public-data";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const [boat,data]=await Promise.all([getPublicBoat(slug),getPublicData()]);if(!boat)notFound();return <BoatDetailPage boat={boat} related={data.boats.filter((item)=>item.id!==boat.id)}/>}
