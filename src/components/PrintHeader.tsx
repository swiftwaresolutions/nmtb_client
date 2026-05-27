import React from "react";
import logo from "../assets/images/logo.png";

interface OrganizationInfo {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  itNo?: string;
  salesTax?: string;
}

interface PrintHeaderProps {
  organization: OrganizationInfo;
  className?: string;
  gstNumber?: string;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({
  organization,
  className = "",
  gstNumber,
}) => {
  return (
    <div
      className={className}
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        background: "#fff",
        paddingBottom: "6px",
        marginBottom: "2px",
        borderBottom: "1px solid #000",
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch", gap: "16px" }}>
        {/* ─ Logo — fills the natural height of the text column ─ */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: "100%", maxHeight: "100px", width: "auto", objectFit: "contain", display: "block" }}
          />
        </div>

        {/* ─ Details ─ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingTop: "2px",
            paddingBottom: "2px",
            gap: "6px",
          }}
        >
          {/* Hospital name */}
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#0f172a",
              lineHeight: 1.15,
            }}
          >
            {organization.name || "HOSPITAL NAME"}
          </div>

          {/* Address — exactly as stored */}
          {organization.address && (
            <div
              style={{
                fontSize: "0.68rem",
                color: "#29313c",
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
              }}
            >
              {organization.address}
            </div>
          )}

          {/* Phone + GST */}
          {(organization.phone || gstNumber) && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                fontSize: "0.65rem",
                color: "#29313c",
              }}
            >
              {organization.phone && (
                <span>✆&nbsp;{organization.phone}</span>
              )}
              {gstNumber && (
                <span>
                  <span style={{ fontWeight: 600 }}>GST:&nbsp;</span>{gstNumber}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintHeader;