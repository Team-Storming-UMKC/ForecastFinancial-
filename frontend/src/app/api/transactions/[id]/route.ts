import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL;

async function getToken() {
    const store = await cookies();
    return store.get("auth_token")?.value;
}

function proxy(r: Response, text: string) {
    return new NextResponse(text, {
        status: r.status,
        headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
    });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
    if (!BACKEND_URL) {
        return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
    }

    const token = await getToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const body = await req.text();

    const r = await fetch(`${BACKEND_URL}/transactions/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body,
    });

    const text = await r.text();
    return proxy(r, text);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    if (!BACKEND_URL) {
        return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
    }

    const token = await getToken();
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;

    const r = await fetch(`${BACKEND_URL}/transactions/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    const text = await r.text();
    return new NextResponse(text || "", { status: r.status });
}