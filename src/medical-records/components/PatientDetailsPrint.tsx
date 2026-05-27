import React from "react";
import { getGuardianPrefix } from "../../utils/guardianUtil";

interface OrganizationInfo {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  itNo?: string;
  salesTax?: string;
}

interface PatientDetailsData {
  opNumber: string;
  tokenNo: string;
  registrationDate: string;
  patientName: string;
  secondName: string;
  age: string;
  sex: string;
  dob: string;
  guardianType: string;
  guardianName: string;
  phoneNumber: string;
  email: string;
  address: string;
  country: string;
  state: string;
  district: string;
  post: string;
  village: string;
  pincode: string;
  idType: string;
  idNumber: string;
  department: string;
  consultant: string;
  complaint: string;
  caseType: string;
}

interface Props {
  patientData: PatientDetailsData;
  organization: OrganizationInfo;
  enableGuardianPrefix?: boolean;
}

const PatientDetailsPrint: React.FC<Props> = ({ patientData, enableGuardianPrefix = true }) => {
  const mono = 'monospace';

  const LINE_WIDTH = 40;
  const LABEL_WIDTH = 10;

  const pad = (text: string, length: number) =>
    (text + " ".repeat(length)).substring(0, length);

  // ✅ Center align helper
  const centerText = (label: string, value: string) => {
    if (!value) return "";

    const text = `${label}: ${value}`;
    const space = Math.max(0, Math.floor((LINE_WIDTH - text.length) / 2));

    return " ".repeat(space) + text;
  };

  const formatLine = (label: string, value: string) => {
    if (!value) return "";

    const labelPart = pad(label, LABEL_WIDTH) + ": ";
    const maxValueWidth = LINE_WIDTH - labelPart.length;

    let lines: string[] = [];
    let remaining = value;

    lines.push(labelPart + remaining.substring(0, maxValueWidth));
    remaining = remaining.substring(maxValueWidth);

    while (remaining.length > 0) {
      lines.push(" ".repeat(labelPart.length) + remaining.substring(0, maxValueWidth));
      remaining = remaining.substring(maxValueWidth);
    }

    return lines.join("\n");
  };



  // ✅ Address multiline (guardian line prepended as first entry)
  const formatAddress = (guardianLine: string) => {
    const parts = [
      guardianLine,
      patientData.address,
      patientData.village,
      patientData.post,
      patientData.district,
    ].filter(Boolean);

    if (parts.length === 0) return "";

    const labelPart = pad("Address", LABEL_WIDTH) + ": ";
    let lines: string[] = [];

    lines.push(labelPart + parts[0]);

    for (let i = 1; i < parts.length; i++) {
      lines.push(" ".repeat(labelPart.length) + parts[i]);
    }

    return lines.join("\n");
  };

  const buildContent = () => {
    const fullName = [patientData.patientName, patientData.secondName]
      .filter(Boolean)
      .join(" ");

    const guardianPrefix = enableGuardianPrefix
      ? getGuardianPrefix(patientData.guardianType, patientData.sex)
      : "";
    const guardianDisplay = patientData.guardianName
      ? [guardianPrefix, patientData.guardianName].filter(Boolean).join(" ")
      : "";

    return `
${centerText("Date",patientData.registrationDate)}
__OPNO__${patientData.opNumber}__END__
${formatLine("Name", fullName)}
${formatLine("Age", patientData.age)}
${formatLine("Sex", patientData.sex)}
${formatAddress(guardianDisplay)}
${formatLine("Phone", patientData.phoneNumber)}
`;
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 233mm 100mm;
            margin: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 233mm;
            height: 100mm;
          }

          body {
            margin-top: -8mm;
          }

          .sheet {
            position: fixed;
            top: 0;
            left: 0;
            width: 233mm;
            height: 100mm;
            font-family: ${mono};
          }

          .print-window {
            position: absolute;
            left: 23mm;
            width: 90mm;
            height: 58mm;
            margin-top: 32mm;
          }

          .content {
            font-family: ${mono};
            font-size: 13pt;
            line-height: 1.35;
            font-weight: normal;
            letter-spacing: 0.4px;
            white-space: pre;
          }

          /* ✅ OP NO BIGGER FONT */
          .opno {
            font-size: 14pt;
            font-weight: normal;
          }

          button {
            display: none;
          }
        }

        .sheet {
          position: relative;
          width: 233mm;
          height: 100mm;
          font-family: ${mono};
        }

        .print-window {
          position: absolute;
          left: 23mm;
          width: 90mm;
          height: 58mm;
          margin-top: 32mm; // top margin for print header
        }

        .content {
          font-family: ${mono};
          font-size: 13pt;
          line-height: 1.35;
          font-weight: normal;
          letter-spacing: 0.4px;
          white-space: pre;
        }

        .opno {
          font-size: 14pt;
          font-weight: 700;
        }

        .controls {
          margin-bottom: 10px;
        }
      `}</style>

      <div className="controls">
        <button onClick={() => window.print()}>Print</button>
      </div>

      <div className="sheet">
        <div className="print-window">
          <div className="content">
            {buildContent().split("\n").map((line, index) => {
              if (line.includes("__OPNO__")) {
                return (
                  <div key={index} className="opno">
                    {line.replace("__OPNO__", "OP No : ").replace("__END__", "")}
                  </div>
                );
              }
              return <div key={index}>{line}</div>;
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientDetailsPrint;