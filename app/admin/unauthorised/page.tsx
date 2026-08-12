import { chatGPTSignOutPath, getChatGPTUser } from "../../chatgpt-auth";
export const dynamic="force-dynamic";
export default async function Page(){const user=await getChatGPTUser();return <main className="admin-access-page"><div><h1>Administrator access required</h1><p>{user?.email??"This account"} is signed in but is not on the HOAB administrator allow-list.</p><a className="button button--dark" href={chatGPTSignOutPath("/admin")}>Use another account</a><a className="text-link" href="/">Return to website</a></div></main>}
