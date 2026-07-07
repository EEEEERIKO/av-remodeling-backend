interface EmailTemplateProps {
  fullName: string;
  phone: string;
  email: string;
  address?: string | null;
  areas?: string[];
  timeline?: string;
  property_type?: string | null;
  budget?: string | null;
  description?: string | null;
  referral?: string | null;
  dashboardUrl: string;
}

export function EmailTemplate({
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
}: EmailTemplateProps) {

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#050505",
        color: "#dfe3ea",
        padding: "32px",
      }}
    >

      <div
        style={{
          background: "#171c22",
          borderRadius: "20px",
          padding: "30px",
          border: "1px solid #3f4852",
        }}
      >

        <h1
          style={{
            color: "#02C7FF",
            marginBottom: "10px",
          }}
        >
          🚨 New AV Remodeling Request
        </h1>


        <p>
          You received a new project request from your website.
        </p>


        <hr style={{borderColor:"#3f4852"}} />


        <h2>
          👤 Client Information
        </h2>


        <p>
          <strong>🧑 Name:</strong> {fullName}
        </p>

        <p>
          <strong>📞 Phone:</strong> {phone}
        </p>

        <p>
          <strong>📧 Email:</strong> {email}
        </p>

        <p>
          <strong>📍 Address:</strong> {address || "Not provided"}
        </p>


        <h2>
          🏠 Project Details
        </h2>


        <p>
          <strong>🛠 Areas:</strong>{" "}
          {areas?.join(", ") || "Not provided"}
        </p>


        <p>
          <strong>🏗 Property type:</strong>{" "}
          {property_type || "Not provided"}
        </p>


        <p>
          <strong>💰 Budget:</strong>{" "}
          {budget || "Not provided"}
        </p>


        <p>
          <strong>⏳ Timeline:</strong>{" "}
          {timeline || "Not provided"}
        </p>


        <p>
          <strong>🤝 Referral:</strong>{" "}
          {referral || "Not provided"}
        </p>


        <p>
          <strong>📝 Description:</strong>
        </p>

        <p>
          {description || "No description provided"}
        </p>


        <a
          href={dashboardUrl}
          style={{
            display:"inline-block",
            marginTop:"25px",
            padding:"14px 24px",
            background:"#02C7FF",
            color:"#050505",
            borderRadius:"999px",
            textDecoration:"none",
            fontWeight:"bold",
          }}
        >
          📊 Open Client Dashboard
        </a>


      </div>

    </div>
  );
}