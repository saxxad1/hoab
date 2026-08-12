import type { Metadata } from "next";
import HomePage from "./components/PublicSite";
import { getPublicData } from "../db/public-data";

export const metadata: Metadata = {
  title: "HOAB — Official Houseboat Registry of Bangladesh",
  description: "Find and verify HOAB-registered houseboats, meet the association leadership, and access official notices and B2B registration.",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPublicData();
  return <HomePage data={data} />;
}
