import type { Metadata } from "next";
import HomePage from "./components/PublicSite";

export const metadata: Metadata = {
  title: "HOAB — Official Houseboat Registry of Bangladesh",
  description: "Find and verify HOAB-registered houseboats, meet the association leadership, and access official notices and B2B registration.",
};

export default function Home() {
  return <HomePage />;
}
