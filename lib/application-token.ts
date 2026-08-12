import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createSubmissionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSubmissionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function submissionTokenMatches(token: string, expectedHash: string) {
  const actual = Buffer.from(hashSubmissionToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
