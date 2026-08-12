import type { Metadata } from "next";
import { DirectoryPage } from "../components/PublicSite";

export const metadata: Metadata = {
  title: "Registered Houseboats | HOAB",
  description: "Search and verify active houseboat members of the Houseboat Owners Association of Bangladesh.",
};

export default function Houseboats() {
  return <DirectoryPage />;
}
