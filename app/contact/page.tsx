import { ContactPage } from "../components/ContentPages";
import { getPublicData } from "../../db/public-data";
export const dynamic="force-dynamic";
export default async function Page(){return <ContactPage data={await getPublicData()}/>}
