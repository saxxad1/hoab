import { AgentsPage } from "../../components/ContentPages";
import { getPublicData } from "../../../db/public-data";
export const dynamic="force-dynamic";
export default async function Page(){return <AgentsPage data={await getPublicData()}/>}
