import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get("auth_token")?.value;
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
    if (!BACKEND_URL) {
        return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
    }

    const token = getToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.text();
    const { id } = ctx.params;

    const r = await fetch(`${BACKEND_URL}/transactions/${encodeURIComponent(id)}`, {
        method: "PUT",
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

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
    if (!BACKEND_URL) {
        return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
    }

    const token = getToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = ctx.params;

    const r = await fetch(`${BACKEND_URL}/transactions/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    // Spring might return empty body on delete; handle both cases safely
    const text = await r.text();
    return new NextResponse(text || null, { status: r.status });
}