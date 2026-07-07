import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL;
const dashboardUrl = `${FRONTEND_URL}/data`;


export async function POST(request: Request) {

  try {

    const body = await request.json();


    const {
      fullName,
      phone,
      email,
      address,
      areas,
      timeline,
      property_type,
      budget,
      description,
      referral,
    } = body;


    const { data, error } = await resend.emails.send({

      from: "AV Remodeling <onboarding@resend.dev>",

      to: [
        "erikovc.dev@gmail.com"
      ],

      subject: `🚨 New Lead - ${fullName} | AV Remodeling`,

      react: EmailTemplate({
        fullName,
        phone,
        email,
        address,
        areas,
        timeline,
        property_type,
        budget,
        description,
        referral,
        dashboardUrl,
      }),

    });


    if(error){

      return Response.json(
        {
          error
        },
        {
          status:500
        }
      );

    }


    return Response.json(data);


  } catch(error){

    return Response.json(
      {
        error
      },
      {
        status:500
      }
    );

  }

}