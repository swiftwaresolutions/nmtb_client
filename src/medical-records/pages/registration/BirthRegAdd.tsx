import React, { useState } from "react";
import {
  formatNumberDisplay,
  handleNumberBlur,
  handleNumberChange,
} from "../../../utils/numberInputUtil";

type ViewState = "search" | "form" | "success";

export default function BirthRegAdd() {
  const [view, setView] = useState<ViewState>("search");
  const [regNo, setRegNo] = useState("PAT123");
  const [babySex, setBabySex] = useState("Male");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [weightKg, setWeightKg] = useState<number>(3.1);
  const [deliveryType, setDeliveryType] = useState("Normal");
  const [birthType, setBirthType] = useState("Live Birth");
  const [permanentAddress, setPermanentAddress] = useState("Kochi, Kerala");
  const [patientNameNumber, setPatientNameNumber] = useState(
    "Ipsita Sahu / C37832"
  );
  const [ageSex, setAgeSex] = useState("28 Years / Female");
  const [houseName, setHouseName] = useState("");
  const [address, setAddress] = useState(
    "GANJAM,GANJAM[P.O], GANJAM[Taluk],ODISHA[Dist]."
  );
  const [occupation, setOccupation] = useState("GOVT SEVICE");
  const [husbandName, setHusbandName] = useState("Akash Kumar Panda");
  const [aadhaar, setAadhaar] = useState("754671635844");
  const [religion, setReligion] = useState("");
  const [deliveryPerineum, setDeliveryPerineum] = useState("PRAGYA");
  const [week, setWeek] = useState<number>(0);
  const [isTwins, setIsTwins] = useState(false);
  const [secondBabySex, setSecondBabySex] = useState("Male");
  const [secondDob, setSecondDob] = useState("");
  const [secondTob, setSecondTob] = useState("");
  const [secondWeightKg, setSecondWeightKg] = useState<number>(0);
  const [secondDeliveryType, setSecondDeliveryType] = useState(
    "Normal with RMLE"
  );
  const [secondBirthType, setSecondBirthType] = useState("Live Birth");
  const [secondDeliveryPerineum, setSecondDeliveryPerineum] = useState("-");
  const [esiCardNo, setEsiCardNo] = useState("");

  const handleSearch = () => {
    if (!regNo.trim()) {
      return;
    }
    setView("form");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setView("success");
  };

  const handleReset = () => {
    setView("search");
  };

  return (
    <div className="container mt-4">
      {view === "search" && (
        <div className="card p-4 mb-4">
          <h3 className="text-center">Birth Registration</h3>
          <div className="row mt-3">
            <div className="col-md-6 offset-md-3">
              <label className="form-label">Enter Patient Number</label>
              <input
                type="text"
                className="form-control"
                value={regNo}
                onChange={(event) => setRegNo(event.target.value)}
                placeholder="Patient number"
              />
              <button
                type="button"
                className="btn btn-primary mt-3 w-100"
                onClick={handleSearch}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "form" && (
        <div className="card p-4">
          <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <h4 className="text-center mb-3">Patient Details</h4>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Patient Name / Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={patientNameNumber}
                  onChange={(event) => setPatientNameNumber(event.target.value)}
                />
              </div>
            <div className="col-md-6">
              <label className="form-label">Age / Sex</label>
              <input
                type="text"
                className="form-control"
                value={ageSex}
                onChange={(event) => setAgeSex(event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">House Name</label>
              <input
                type="text"
                className="form-control"
                value={houseName}
                onChange={(event) => setHouseName(event.target.value)}
                placeholder="House name"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Occupation</label>
              <input
                type="text"
                className="form-control"
                value={occupation}
                onChange={(event) => setOccupation(event.target.value)}
                placeholder="Occupation"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Husband's Name</label>
              <input
                type="text"
                className="form-control"
                value={husbandName}
                onChange={(event) => setHusbandName(event.target.value)}
                placeholder="Husband's name"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Aadhaar</label>
              <input
                type="text"
                className="form-control"
                value={aadhaar}
                onChange={(event) => setAadhaar(event.target.value)}
                placeholder="Aadhaar"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Religion</label>
              <input
                type="text"
                className="form-control"
                value={religion}
                onChange={(event) => setReligion(event.target.value)}
                placeholder="Religion"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Address</label>
              <textarea
                className="form-control"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={2}
              />
            </div>
          </div>

            <hr />

            <form onSubmit={handleSubmit}>
            <div className="row mb-2">
              <div className="col-md-3">Baby Sex</div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={babySex}
                  onChange={(event) => setBabySex(event.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="col-md-3">Date of Birth</div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                />
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-3">Time of Birth</div>
              <div className="col-md-3">
                <input
                  type="time"
                  className="form-control"
                  value={tob}
                  onChange={(event) => setTob(event.target.value)}
                />
              </div>
              <div className="col-md-3">Weight (Kg)</div>
              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  value={formatNumberDisplay(weightKg)}
                  onChange={(event) =>
                    setWeightKg(handleNumberChange(event.target.value))
                  }
                  onBlur={(event) =>
                    setWeightKg(handleNumberBlur(event.target.value))
                  }
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-3">Delivery Type</div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={deliveryType}
                  onChange={(event) => setDeliveryType(event.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="C-Section">C-Section</option>
                  <option value="Normal with RMLE">Normal with RMLE</option>
                </select>
              </div>
              <div className="col-md-3">Birth Type</div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={birthType}
                  onChange={(event) => setBirthType(event.target.value)}
                >
                  <option value="Live Birth">Live Birth</option>
                  <option value="IUD">IUD / Still Birth</option>
                </select>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-3">Delivery Perineum</div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  value={deliveryPerineum}
                  onChange={(event) => setDeliveryPerineum(event.target.value)}
                  placeholder="Delivery perineum"
                />
              </div>
              <div className="col-md-3">Week</div>
              <div className="col-md-3">
                <input
                  type="number"
                  className="form-control"
                  value={formatNumberDisplay(week)}
                  onChange={(event) =>
                    setWeek(handleNumberChange(event.target.value))
                  }
                  onBlur={(event) => setWeek(handleNumberBlur(event.target.value))}
                  min="0"
                  step="1"
                  placeholder="Enter week"
                />
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-3">Is Twins</div>
              <div className="col-md-3">
                <div className="form-check mt-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isTwins"
                    checked={isTwins}
                    onChange={(event) => setIsTwins(event.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="isTwins">
                    Yes
                  </label>
                </div>
              </div>
            </div>

            {isTwins && (
              <div className="border rounded p-3 mb-3">
                <div className="row mb-2">
                  <div className="col-md-3">Second Baby's Sex</div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={secondBabySex}
                      onChange={(event) =>
                        setSecondBabySex(event.target.value)
                      }
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="col-md-3">Second Baby's Date of Birth</div>
                  <div className="col-md-3">
                    <input
                      type="date"
                      className="form-control"
                      value={secondDob}
                      onChange={(event) => setSecondDob(event.target.value)}
                    />
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-md-3">Second Baby's Time of Birth</div>
                  <div className="col-md-3">
                    <input
                      type="time"
                      className="form-control"
                      value={secondTob}
                      onChange={(event) => setSecondTob(event.target.value)}
                    />
                  </div>
                  <div className="col-md-3">Second Baby's Weight (Kg)</div>
                  <div className="col-md-3">
                    <input
                      type="number"
                      className="form-control"
                      value={formatNumberDisplay(secondWeightKg)}
                      onChange={(event) =>
                        setSecondWeightKg(handleNumberChange(event.target.value))
                      }
                      onBlur={(event) =>
                        setSecondWeightKg(handleNumberBlur(event.target.value))
                      }
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-md-3">Second Baby's Type of Delivery</div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={secondDeliveryType}
                      onChange={(event) =>
                        setSecondDeliveryType(event.target.value)
                      }
                    >
                      <option value="Normal">Normal</option>
                      <option value="C-Section">C-Section</option>
                      <option value="Normal with RMLE">Normal with RMLE</option>
                    </select>
                  </div>
                  <div className="col-md-3">Second Baby's Birth Type</div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={secondBirthType}
                      onChange={(event) =>
                        setSecondBirthType(event.target.value)
                      }
                    >
                      <option value="Live Birth">Live Birth</option>
                      <option value="IUD">IUD / Still Birth</option>
                    </select>
                  </div>
                </div>

                <div className="row mb-2">
                  <div className="col-md-3">Second Baby's Delivery Perineum</div>
                  <div className="col-md-3">
                    <input
                      type="text"
                      className="form-control"
                      value={secondDeliveryPerineum}
                      onChange={(event) =>
                        setSecondDeliveryPerineum(event.target.value)
                      }
                      placeholder="Delivery perineum"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="row mb-3">
              <div className="col-md-3">Permanent Address</div>
              <div className="col-md-9">
                <textarea
                  className="form-control"
                  value={permanentAddress}
                  onChange={(event) => setPermanentAddress(event.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-3">ESI Card No</div>
              <div className="col-md-9">
                <input
                  type="text"
                  className="form-control"
                  value={esiCardNo}
                  onChange={(event) => setEsiCardNo(event.target.value)}
                  placeholder="Enter ESI Card No"
                />
              </div>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-success px-5">
                Submit
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {view === "success" && (
        <div className="card p-5 text-center">
          <h2 className="text-success">Successfully Added</h2>
          <p className="mt-3">
            <strong>Baby No:</strong> B2026-001
          </p>
          <button
            type="button"
            className="btn btn-secondary mt-3"
            onClick={handleReset}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
