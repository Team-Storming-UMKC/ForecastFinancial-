import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const store = await cookies();
    const token = store.get("auth_token")?.value;

    return NextResponse.json({
        hasAuthToken: Boolean(token),
        tokenPreview: token ? token.slice(0, 25) + "..." : null,
        allCookieNames: store.getAll().map((c) => c.name),
    });
}