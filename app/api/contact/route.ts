import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const frontendUrl = process.env.FRONTEND_URL;

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
