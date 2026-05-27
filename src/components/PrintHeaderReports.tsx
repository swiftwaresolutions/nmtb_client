import React from "react";

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

const PrintHeaderReports: React.FC<PrintHeaderProps> = ({
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          paddingTop: "2px",
          paddingBottom: "2px",
          gap: "6px",
        }}
      >
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
          {organization.name || "NIGHTINGALE"}
        </div>

        {organization.address && (
          <div
            style={{
              fontSize: "0.68rem",
              color: "#29313c",
              lineHeight: 1.5,
            }}
          >
            {organization.address || "BATLAGUNDU - 624202,DINDUGAL DIST, TAMILNADU"}
          </div>
        )}

        {(organization.phone || gstNumber) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px",
              fontSize: "0.65rem",
              color: "#29313c",
            }}
          >
            {organization.phone && (
              <span>✆&nbsp;{organization.phone || "04543-262670 ,262041"}</span>
            )}
            {gstNumber && (
              <span>
                <span style={{ fontWeight: 600 }}>GST:&nbsp;</span>{gstNumber || "33AAATT3603J1ZP"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintHeaderReports;