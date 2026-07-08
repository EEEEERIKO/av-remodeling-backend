import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";

const frontendUrl = process.env.FRONTEND_URL;
const resend = new Resend(process.env.RESEND_API_KEY);

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": frontendUrl || "",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}


export async function GET(request: NextRequest) {
  const session = request.cookies.get("admin-session");
    console.log("COOKIE Conttact:", session);

    if (
      !session ||
      session.value !== "authenticated"
    ) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
        headers: corsHeaders(),
      }
    );
  }

  try {
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          message: "Supabase is not configured.",
        },
        {
          status: 500,
          headers: corsHeaders(),
        }
      );
    }

    const contactsTable =
      process.env.SUPABASE_CONTACTS_TABLE || "contacts";


    const { data, error } = await supabase
      .from(contactsTable)
      .select("*")
      .order("created_at", {
        ascending: false,
      });


    if (error) {
      
      
      return NextResponse.json(
        {
          success: false,
          message: "Unable to fetch contacts.",
          error: error.message,
        },
        {
          status: 500,
          headers: corsHeaders(),
        }
      );
    }


    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );


  } catch (error) {

    console.error("GET contacts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error",
      },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );

  }
}
const contactsTable = process.env.SUPABASE_CONTACTS_TABLE || 'contacts';

const contactSchema = z.object({
  fullName: z.string().trim().min(1, 'fullName is required'),
  phone: z.string().trim().min(1, 'phone is required'),
  email: z.string().trim().email('email must be a valid email address'),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  areas: z
    .array(z.string().trim().min(1))
    .min(1, 'areas must contain at least one value'),
  timeline: z.string().trim().min(1, 'timeline is required'),
  property_type: z.string().trim().max(200).optional().or(z.literal('')),
  budget: z.string().trim().max(200).optional().or(z.literal('')),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  referral: z.string().trim().max(200).optional().or(z.literal('')),
});

function normalizeFormData(formData: FormData) {
  const raw: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') continue;

    if (key === 'areas') {
      const values = formData.getAll('areas').filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
      raw.areas = values;
      continue;
    }

    raw[key] = value;
  }

  return raw;
}

function sanitizeInput(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim().length > 0 ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Content-Type must be multipart/form-data.',
        },
        { status: 400,
          headers: corsHeaders()
         }
      );
    }

    const formData = await request.formData();
    const rawData = normalizeFormData(formData);

    const parsed = contactSchema.safeParse(rawData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400, 
          headers: corsHeaders()

         }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          message: 'Supabase is not configured.',
        },
        { status: 500,
          headers: corsHeaders()

         }
      );
    }

    const payload = {
      full_name: sanitizeInput(parsed.data.fullName),
      phone: sanitizeInput(parsed.data.phone),
      email: sanitizeInput(parsed.data.email),
      address: sanitizeInput(parsed.data.address) ?? null,
      areas: parsed.data.areas.map((area) => area.trim()),
      timeline: sanitizeInput(parsed.data.timeline),
      property_type: sanitizeInput(parsed.data.property_type) ?? null,
      budget: sanitizeInput(parsed.data.budget) ?? null,
      description: sanitizeInput(parsed.data.description) ?? null,
      referral: sanitizeInput(parsed.data.referral) ?? null,
    };

    const { data, error } = await supabase.from(contactsTable).insert(payload).select().single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Unable to save contact request at this time.',
        },
        { 
          status: 500,
          headers: corsHeaders()
        }
      );
    }

    try {
      await resend.emails.send({
        from: "AV Remodeling <onboarding@resend.dev>",
        to: ["erikovc.dev@gmail.com"],
        subject: `🚨 New Lead - ${payload.full_name} | AV Remodeling`,

        html: `
        <!DOCTYPE html>
        <html>
        <body style="
            margin:0;
            padding:40px;
            background:#050505;
            font-family:Arial,Helvetica,sans-serif;
            color:#dfe3ea;
        ">

            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center">

                        <table
                            width="700"
                            cellpadding="0"
                            cellspacing="0"
                            style="
                                background:#171c22;
                                border:1px solid #3f4852;
                                border-radius:20px;
                                padding:35px;
                            "
                        >

                            <tr>
                                <td>

                                    <h1 style="
                                        color:#02C7FF;
                                        margin:0 0 12px;
                                        font-size:30px;
                                    ">
                                        🚨 New AV Remodeling Request
                                    </h1>

                                    <p style="margin-top:0;color:#c7d0d8;">
                                        You received a new project request from your website.
                                    </p>

                                    <hr style="
                                        border:none;
                                        border-top:1px solid #3f4852;
                                        margin:30px 0;
                                    ">

                                    <h2 style="color:white;">
                                        👤 Client Information
                                    </h2>

                                    <table width="100%" cellpadding="10">

                                        <tr>
                                            <td><strong>🧑 Name</strong></td>
                                            <td>${payload.full_name}</td>
                                        </tr>

                                        <tr>
                                            <td><strong>📞 Phone</strong></td>
                                            <td>${payload.phone}</td>
                                        </tr>

                                        <tr>
                                            <td><strong>📧 Email</strong></td>
                                            <td>${payload.email}</td>
                                        </tr>

                                        <tr>
                                            <td><strong>📍 Address</strong></td>
                                            <td>${payload.address || "Not provided"}</td>
                                        </tr>

                                    </table>

                                    <hr style="
                                        border:none;
                                        border-top:1px solid #3f4852;
                                        margin:30px 0;
                                    ">

                                    <h2 style="color:white;">
                                        🏠 Project Details
                                    </h2>

                                    <table width="100%" cellpadding="10">

                                        <tr>
                                            <td><strong>🛠 Areas</strong></td>
                                            <td>${payload.areas.join(", ")}</td>
                                        </tr>

                                        <tr>
                                            <td><strong>🏗 Property Type</strong></td>
                                            <td>${payload.property_type || "Not provided"}</td>
                                        </tr>

                                        <tr>
                                            <td><strong>💰 Budget</strong></td>
                                            <td>${payload.budget || "Not provided"}</td>
                                        </tr>

                                        <tr>
                                            <td><strong>⏳ Timeline</strong></td>
                                            <td>${payload.timeline || "Not provided"}</td>
                                        </tr>

                                        <tr>
                                            <td><strong>🤝 Referral</strong></td>
                                            <td>${payload.referral || "Not provided"}</td>
                                        </tr>

                                    </table>

                                    <h3 style="
                                        color:white;
                                        margin-top:35px;
                                    ">
                                        📝 Project Description
                                    </h3>

                                    <div style="
                                        background:#202831;
                                        padding:18px;
                                        border-radius:12px;
                                        line-height:1.7;
                                    ">
                                        ${payload.description || "No description provided"}
                                    </div>

                                    <div style="margin-top:40px;text-align:center;">

                                        <a
                                            href="${process.env.FRONTEND_URL}/data"
                                            style="
                                                display:inline-block;
                                                padding:15px 28px;
                                                background:#02C7FF;
                                                color:#050505;
                                                text-decoration:none;
                                                font-weight:bold;
                                                border-radius:999px;
                                            "
                                        >
                                            📊 Open Client Dashboard
                                        </a>

                                    </div>

                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        `,
      });

    } catch(emailError) {
      console.error("Resend error:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Contact request submitted successfully.',
      },
      { 
        status: 201,
        headers: corsHeaders()
      }
    );
  } catch (error) {
    console.error('Contact route error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred.',
      },
      { status: 500,
        headers: corsHeaders()
       }
    );
  }
}
