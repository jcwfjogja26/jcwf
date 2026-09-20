import crypto from "crypto";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase-server";

const COOKIE_NAME = "jcwf_session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createParticipantSession(
  participantId: string
) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() +
      SESSION_DAYS * 24 * 60 * 60 * 1000
  );

  const { error } = await supabaseServer
    .from("participant_sessions")
    .insert({
      participant_id: participantId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error(
      "CREATE PARTICIPANT SESSION ERROR:",
      error
    );

    throw new Error("Failed to create session");
  }

  const cookieStore = await cookies();

  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentParticipant() {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const { data: session, error } =
    await supabaseServer
      .from("participant_sessions")
      .select(
        `
        id,
        participant_id,
        expires_at,
        participants (
          id,
          reconnect_id,
          full_name,
          whatsapp,
          email,
          city,
          interest_category,
          created_at
        )
        `
      )
      .eq("token_hash", tokenHash)
      .gt(
        "expires_at",
        new Date().toISOString()
      )
      .maybeSingle();

  if (error || !session) {
    return null;
  }

  // Supabase bisa mengembalikan relation
  // sebagai object atau array tergantung schema/type inference.
  const participant = Array.isArray(
    session.participants
  )
    ? session.participants[0]
    : session.participants;

  if (!participant) {
    return null;
  }

  return participant;
}

export async function deleteParticipantSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);

    await supabaseServer
      .from("participant_sessions")
      .delete()
      .eq("token_hash", tokenHash);
  }

  cookieStore.delete(COOKIE_NAME);
}