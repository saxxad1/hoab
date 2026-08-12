import { getDb } from "../../../db";
import { enquiries } from "../../../db/schema";
import { seedDatabase } from "../../../db/seed";

export async function POST(request: Request) {
  try {
    await seedDatabase();
    const body = await request.json() as Record<string, string>;
    const name = body.name?.trim();
    const email = body.email?.trim();
    const subject = body.subject?.trim();
    const message = body.message?.trim();
    if (!name || !email || !subject || !message) return Response.json({ error: "Name, email, subject and message are required" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "A valid email is required" }, { status: 400 });
    const [enquiry] = await getDb().insert(enquiries).values({ name: name.slice(0, 120), email: email.slice(0, 180), phone: body.phone?.trim().slice(0, 40) ?? "", subject: subject.slice(0, 180), message: message.slice(0, 5000) }).returning();
    return Response.json({ id: enquiry.id, message: "Your message has been received." }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to send message" }, { status: 500 }); }
}
