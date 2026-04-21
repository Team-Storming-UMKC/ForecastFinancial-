import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL;
const INSIGHTS_ERROR_CODE = "AI_INSIGHTS_UNAVAILABLE";

async function getToken() {
  const store = await cookies();
  return store.get("auth_token")?.value;
}

function proxyResponse(r: Response, text: string) {
  return new NextResponse(text, {
    status: r.status,
    headers: {
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized (no auth_token cookie)" }, { status: 401 });
  }

  try {
    const r = await fetch(`${BACKEND_URL}/api/insights`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await r.text();
    if (!r.ok) {
      return NextResponse.json(
        {
          error: "Unable to load AI savings tips.",
          errorCode: INSIGHTS_ERROR_CODE,
        },
        { status: r.status >= 500 ? 503 : r.status },
      );
    }

    return proxyResponse(r, text);
  } catch {
    return NextResponse.json(
      {
        error: "Unable to reach the AI insights service.",
        errorCode: INSIGHTS_ERROR_CODE,
      },
      { status: 503 },
    );
  }
}
