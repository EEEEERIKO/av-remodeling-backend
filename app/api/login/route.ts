import { NextRequest, NextResponse } from "next/server";

  const frontendUrl = process.env.FRONTEND_URL;

  function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": frontendUrl,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders()
  });
}


export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password.",
        },
        {
          status: 401,
          headers: corsHeaders()
        }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
      },
      {
        status: 200,
        headers: corsHeaders()
      }
    );

    response.cookies.set({
      name: "admin-session",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error.",
      },
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
}