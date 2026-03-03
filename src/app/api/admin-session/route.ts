import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SESSION_COOKIE_NAME = "admin_panel_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const payloadSchema = z.object({
  token: z.string().min(1),
});

function isValidToken(value: string): boolean {
  const expectedToken = process.env.ADMIN_PANEL_TOKEN;
  if (!expectedToken) {
    return false;
  }
  return value === expectedToken;
}

function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Token invalido." } },
    { status: 401 },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload = payloadSchema.parse(await request.json());
    if (!isValidToken(payload.token)) {
      return unauthorized();
    }

    const response = NextResponse.json({ data: { ok: true } });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: payload.token,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Payload invalido." } },
      { status: 400 },
    );
  }
}

export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ data: { ok: true } });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
