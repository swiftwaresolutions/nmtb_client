import type { CSSProperties } from "react";

export const NAVY = "#1e3a5f";
export const BORDER = "1px solid #000000";
export const COL_BORDER = "1px solid #000000";

export const thStyle: CSSProperties = {
    padding: "2px 5px",
    background: "#f1f5f9",
    textAlign: "left",
    borderRight: BORDER,
    fontWeight: 600,
    fontSize: "var(--font-size-base)",
};

export const tdStyle: CSSProperties = {
    padding: "1px 5px",
    fontSize: "var(--font-size-base)",
    borderRight: BORDER,
};

export const formatDateTime = (datetime: string): string => {
    try {
        return new Date(datetime).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    } catch {
        return datetime;
    }
};
