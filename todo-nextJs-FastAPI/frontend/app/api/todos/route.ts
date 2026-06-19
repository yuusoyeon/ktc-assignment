import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

async function proxyRequest(
  request: NextRequest,
  method: "GET" | "POST",
) {
  const url = new URL(request.url);
  const backendUrl = new URL("/todos", BACKEND_URL);

  url.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  const response = await fetch(backendUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: method === "POST" ? await request.text() : undefined,
    cache: "no-store",
  });

  const text = await response.text();

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    return proxyRequest(request, "GET");
  } catch {
    return NextResponse.json(
      { detail: "Todo 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return proxyRequest(request, "POST");
  } catch {
    return NextResponse.json(
      { detail: "Todo를 생성하지 못했습니다." },
      { status: 500 },
    );
  }
}
