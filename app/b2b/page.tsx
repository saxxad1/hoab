import { B2BPage } from "../components/ContentPages";
import { getPublicData } from "../../db/public-data";
export const dynamic="force-dynamic";
export default async function Page(){return <B2BPage data={await getPublicData()}/>}
