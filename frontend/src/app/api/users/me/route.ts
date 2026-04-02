import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL;

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
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const r = await fetch(`${BACKEND_URL}/users/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        cache: "no-store",
    });

    const text = await r.text();
    return proxyResponse(r, text);
}

export async function PATCH(req: Request) {
    if (!BACKEND_URL) {
        return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
    }

    const token = await getToken();
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const r = await fetch(`${BACKEND_URL}/users/me`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(body),
    });

    const text = await r.text();
    return proxyResponse(r, text);
}
