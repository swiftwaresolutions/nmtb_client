import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faFileMedical, faSearch } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../components/PageHeader";
import { showErrorToast, showSuccessModal, showSuccessToast, showValidationError } from "../../../utils/alertUtil";
import MedicalRecordsApiService from "../../../api/medical-records/medical-records-api-service";

interface DeathRegistrationFormState {
  opNo: string;
  ipNo: string;
  patId: number;
  ipId: number;
  visitId: string;
  patientName: string;
  age: string;
  sex: string;
  gname: string;
  address: string;
  expdate: string;
  expiredHour: string;
  expiredMinute: string;
  expiredSecond: string;
  expiredMeridiem: string;
  diagnosis: string;
  caretype: string;
}

const padTwoDigits = (value: number): string => String(value).padStart(2, "0");

const getTodayDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${padTwoDigits(now.getMonth() + 1)}-${padTwoDigits(now.getDate())}`;
};

const getCurrentTime = (): Pick<DeathRegistrationFormState, "expiredHour" | "expiredMinute" | "expiredSecond" | "expiredMeridiem"> => {
  const now = new Date();
  const hour24 = now.getHours();
  const hour12 = hour24 % 12 || 12;

  return {
    expiredHour: padTwoDigits(hour12),
    expiredMinute: padTwoDigits(now.getMinutes()),
    expiredSecond: padTwoDigits(now.getSeconds()),
    expiredMeridiem: hour24 >= 12 ? "PM" : "AM",
  };
};

const parseApiDate = (value: string | undefined): string => {
  if (!value) {
    return getTodayDate();
  }

  const normalizedValue = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(normalizedValue)) {
    return normalizedValue.substring(0, 10);
  }

  const parsed = new Date(normalizedValue);
  if (Number.isNaN(parsed.getTime())) {
    return getTodayDate();
  }

  return `${parsed.getFullYear()}-${padTwoDigits(parsed.getMonth() + 1)}-${padTwoDigits(parsed.getDate())}`;
};

const parseApiTime = (value: string | undefined): Pick<DeathRegistrationFormState, "expiredHour" | "expiredMinute" | "expiredSecond" | "expiredMeridiem"> => {
  const fallback = getCurrentTime();
  if (!value) {
    return fallback;
  }

  const normalizedValue = value.trim();
  const meridiemMatch = normalizedValue.match(/(AM|PM)$/i);
  if (meridiemMatch) {
    const meridiem = meridiemMatch[1].toUpperCase() as "AM" | "PM";
    const timePart = normalizedValue.replace(/\s?(AM|PM)$/i, "");
    const [hourPart, minutePart = "00", secondPart = "00"] = timePart.split(":");
    const hour = Number(hourPart);
    const minute = Number(minutePart);
    const second = Number(secondPart.split(".")[0]);

    if ([hour, minute, second].some((num) => Number.isNaN(num))) {
      return fallback;
    }

    return {
      expiredHour: padTwoDigits(hour),
      expiredMinute: padTwoDigits(minute),
      expiredSecond: padTwoDigits(second),
      expiredMeridiem: meridiem,
    };
  }

  const [hourPart, minutePart = "00", secondPart = "00"] = normalizedValue.split(":");
  const hour24 = Number(hourPart);
  const minute = Number(minutePart);
  const second = Number(secondPart.split(".")[0]);

  if ([hour24, minute, second].some((num) => Number.isNaN(num))) {
    return fallback;
  }

  return {
    expiredHour: padTwoDigits(hour24 % 12 || 12),
    expiredMinute: padTwoDigits(minute),
    expiredSecond: padTwoDigits(second),
    expiredMeridiem: hour24 >= 12 ? "PM" : "AM",
  };
};

const to24Hour = (hour12: number, meridiem: "AM" | "PM"): number => {
  if (meridiem === "AM") {
    return hour12 === 12 ? 0 : hour12;
  }
  return hour12 === 12 ? 12 : hour12 + 12;
};

const createDefaultState = (): DeathRegistrationFormState => ({
  opNo: "",
  ipNo: "",
  patId: 0,
  ipId: 0,
  visitId: "",
  patientName: "",
  age: "",
  sex: "",
  gname: "",
  address: "",
  expdate: getTodayDate(),
  ...getCurrentTime(),
  diagnosis: "",
  caretype: "",
});

export default function DeathRegistration() {
  const apiService = useMemo(() => new MedicalRecordsApiService(), []);
  const [form, setForm] = useState<DeathRegistrationFormState>(createDefaultState);
  const [deathId, setDeathId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof DeathRegistrationFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFetchPatientDetails = async () => {
    if (!form.opNo.trim()) {
      showValidationError("Please enter OP Number");
      return;
    }

    setIsFetchingDetails(true);
    try {
      const response = await apiService.fetchDetailForDeath(form.opNo.trim());

      if (!response) {
        showValidationError("No death registration details found for this OP Number");
        return;
      }

      const parsedTime = parseApiTime(response.exptime);
      setDeathId(response.deathId > 0 ? response.deathId : null);

      setForm((prev) => ({
        ...prev,
        opNo: response.opNo || prev.opNo,
        patId: Number(response.patId ?? 0),
        visitId: String(response.visitId ?? ""),
        ipId: Number(response.ipId ?? 0),
        patientName: response.patientName || "",
        age: response.age || "",
        address: response.address || "",
        gname: response.gname || "",
        sex: response.sex || "",
        expdate: parseApiDate(response.expdate),
        expiredHour: parsedTime.expiredHour,
        expiredMinute: parsedTime.expiredMinute,
        expiredSecond: parsedTime.expiredSecond,
        expiredMeridiem: parsedTime.expiredMeridiem,
        diagnosis: response.diagnosis || "",
        caretype: response.caretype || "",
      }));

      setShowDetails(true);

      showSuccessToast("Patient details loaded");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to load patient details";
      showErrorToast(msg);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleClearHeader = () => {
    const emptyState = createDefaultState();
    setForm(emptyState);
    setDeathId(null);
    setShowDetails(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.opNo.trim()) {
      showValidationError("Please enter OP Number");
      return;
    }

    if (!form.patId || !form.visitId) {
      showValidationError("Please load patient details before submit");
      return;
    }

    if (!form.diagnosis.trim()) {
      showValidationError("Please enter Diagnosis");
      return;
    }

    if (!form.caretype.trim()) {
      showValidationError("Please enter Cause of Death");
      return;
    }

    setIsSubmitting(true);
    try {
      const hour12 = Number(form.expiredHour);
      const minute = Number(form.expiredMinute);
      const second = Number(form.expiredSecond);
      const hour24 = Number.isNaN(hour12) ? 0 : to24Hour(hour12, form.expiredMeridiem as "AM" | "PM");
      const exptimeStr = `${padTwoDigits(hour24)}:${padTwoDigits(Number.isNaN(minute) ? 0 : minute)}:${padTwoDigits(Number.isNaN(second) ? 0 : second)}`;
      const payload = {
        expdate: form.expdate,
        exptime: exptimeStr,
        caretype: form.caretype.trim(),
        diagnosis: form.diagnosis.trim(),
        opNo: form.opNo.trim(),
        patId: Number(form.patId) || 0,
        visitId: String(form.visitId ?? "").trim(),
        ipId: Number(form.ipId) || 0,
      };

      const response = deathId
        ? await apiService.UpdateDeath(deathId, payload)
        : await apiService.saveDeath(payload);

      const displayId = response?.displayId ?? "N/A";
      const modalResult = await showSuccessModal(
        `Display ID: ${displayId}`,
        deathId ? "Death registration updated successfully" : "Death registration submitted successfully",
        "OK"
      );

      if (modalResult?.isConfirmed) {
        handleClearHeader();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to submit death registration";
      showErrorToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid mt-3">
      <PageHeader
        icon={faFileMedical}
        title="Death Registration"
        subtitle="Manage patient death registration details"
      />

      <form onSubmit={handleSubmit}>
        <div className="card shadow-sm border-0 mb-3">
          <div className="card-header bg-white">
            <div className="row g-2 align-items-end">
              <div className="col-md-4 col-lg-3">
                <label className="form-label mb-1">OP Number</label>
                <input
                  className="form-control"
                  value={form.opNo}
                  onChange={(event) => handleChange("opNo", event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleFetchPatientDetails();
                    }
                  }}
                  placeholder="Enter OP Number"
                />
              </div>
              <div className="col">
                <button
                  type="button"
                  className="btn theme-btn-secondary me-3"
                  onClick={handleFetchPatientDetails}
                  disabled={isFetchingDetails}
                >
                  {isFetchingDetails ? (
                    "Loading..."
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSearch} className="me-1" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn theme-btn-primary"
                  onClick={handleClearHeader}
                >
                  <FontAwesomeIcon icon={faEraser} className="me-1" />
                </button>
              </div>
            </div>
          </div>

          {showDetails && <div className="card-body">
            <div className="row g-3 mb-4">
              <div className="col-lg-6">
                <div className="row g-2">
                  <div className="col-5">Patient's Name</div>
                  <div className="col-7 fw-bold">{form.patientName}</div>

                  <div className="col-5">Address</div>
                  <div className="col-7 fw-bold">{form.address}</div>

                  <div className="col-5"></div>
                  <div className="col-7 fw-bold"></div>

                  <div className="col-5">Father's Name</div>
                  <div className="col-7 fw-bold">{form.gname}</div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="row g-2">
                  <div className="col-5">OP/No</div>
                  <div className="col-7 fw-bold">
                    {form.opNo || "-"}
                  </div>

                  <div className="col-5">IP/No</div>
                  <div className="col-7 fw-bold">
                    {form.ipNo || "-"}
                  </div>

                  <div className="col-5">Age/Sex</div>
                  <div className="col-7 fw-bold">{form.age} / {form.sex}</div>
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="row g-3 align-items-start">
              <div className="col-lg-6">
                <div className="row g-3">
                  <div className="col-5 col-md-4">Expired Date</div>
                  <div className="col-7 col-md-8">
                    <input
                      type="date"
                      className="form-control"
                      value={form.expdate}
                      onChange={(event) => handleChange("expdate", event.target.value)}
                    />
                  </div>

                  <div className="col-5 col-md-4">Expired Time</div>
                  <div className="col-7 col-md-8">
                    <div className="row g-2">
                      <div className="col-3">
                        <select
                          className="form-select"
                          value={form.expiredHour}
                          onChange={(event) => handleChange("expiredHour", event.target.value)}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                            <option key={hour} value={String(hour).padStart(2, "0")}>
                              {String(hour).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-3">
                        <select
                          className="form-select"
                          value={form.expiredMinute}
                          onChange={(event) => handleChange("expiredMinute", event.target.value)}
                        >
                          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                            <option key={minute} value={String(minute).padStart(2, "0")}>
                              {String(minute).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-3">
                        <select
                          className="form-select"
                          value={form.expiredSecond}
                          onChange={(event) => handleChange("expiredSecond", event.target.value)}
                        >
                          {Array.from({ length: 60 }, (_, i) => i).map((second) => (
                            <option key={second} value={String(second).padStart(2, "0")}>
                              {String(second).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-3">
                        <select
                          className="form-select"
                          value={form.expiredMeridiem}
                          onChange={(event) =>
                            handleChange("expiredMeridiem", event.target.value)
                          }
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="row g-3">
                  <div className="col-4">Diagnosis</div>
                  <div className="col-8">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.diagnosis}
                      onChange={(event) => handleChange("diagnosis", event.target.value)}
                      placeholder="Enter diagnosis"
                    />
                  </div>

                  <div className="col-4">Cause of Death</div>
                  <div className="col-8">
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.caretype}
                      onChange={(event) => handleChange("caretype", event.target.value)}
                      placeholder="Enter cause of death"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>}

          {showDetails && <div className="card-footer bg-white text-end">
            <button type="submit" className="btn theme-btn-secondary px-4" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>}
        </div>
      </form>
    </div>
  );
}
    