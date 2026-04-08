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

export async function POST(req: Request) {
    if (!BACKEND_URL) {
        return NextResponse.json({ error: "BACKEND_URL not set" }, { status: 500 });
    }

    const token = await getToken();
    if (!token) {
        return NextResponse.json({ error: "Unauthorized (no auth_token cookie)" }, { status: 401 });
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const r = await fetch(`${BACKEND_URL}/transactions/import-csv`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        body: formData,
    });

    const text = await r.text();
    return proxyResponse(r, text);
}
