import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value;
}


export async function GET() {
    if (!BACKEND_URL) {
        return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
    }

    const token = getToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const r = await fetch(`${BACKEND_URL}/transactions`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    const text = await r.text();
    return new NextResponse(text, {
        status: r.status,
        headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
    });
}

export async function POST(req: Request) {
    if (!BACKEND_URL) {
        return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
    }

    const token = getToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.text(); // pass-through (keeps exact JSON)

    const r = await fetch(`${BACKEND_URL}/transactions`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body,
    });

    const text = await r.text();
    return new NextResponse(text, {
        status: r.status,
        headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
    });
}