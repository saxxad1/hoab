import type { Metadata } from "next";
import { DirectoryPage } from "../components/PublicSite";
import { getPublicData } from "../../db/public-data";

export const metadata: Metadata = {
  title: "Registered Houseboats | HOAB",
  description: "Search and verify active houseboat members of the Houseboat Owners Association of Bangladesh.",
};

export const dynamic = "force-dynamic";

export default async function Houseboats() {
  const data = await getPublicData();
  return <DirectoryPage boats={data.boats} />;
}
