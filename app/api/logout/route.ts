import { NextResponse } from "next/server";

function corsHeaders() {
  const frontendUrl = process.env.FRONTEND_URL;

  return {
    "Access-Control-Allow-Origin": frontendUrl || "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logout successful.",
    },
    {
      status: 200,
      headers: corsHeaders(),
    }
  );

  response.cookies.set({
    name: "admin-session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    path: "/",
    maxAge: 0,
  });

  return response;
}