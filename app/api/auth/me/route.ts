import { NextRequest, NextResponse } from "next/server";

const FRONTEND_URL = process.env.FRONTEND_URL;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": FRONTEND_URL || "",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function GET(request: NextRequest) {

  const session = request.cookies.get("admin-session");
      console.log("COOKIE:", session);

  if (
    !session ||
    session.value !== "authenticated"
  ) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
        headers: corsHeaders(),
      }
    );
  }


  return NextResponse.json(
    {
      authenticated: true,
    },
    {
      status: 200,
      headers: corsHeaders(),
    }
  );
}