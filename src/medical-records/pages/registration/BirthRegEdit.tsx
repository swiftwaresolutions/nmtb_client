import React, { useState } from "react";
import {
  formatNumberDisplay,
  handleNumberBlur,
  handleNumberChange,
} from "../../../utils/numberInputUtil";

type ViewState = "search" | "list" | "edit" | "success";
type SearchType = "mother" | "baby";

export default function BirthRegEdit() {
  const [view, setView] = useState<ViewState>("search");
  const [searchType, setSearchType] = useState<SearchType>("mother");
  const [motherNo, setMotherNo] = useState("");
  const [babyNo, setBabyNo] = useState("");
  const [babySex, setBabySex] = useState("Male");
  const [dob, setDob] = useState("2024-01-12");
  const [tob, setTob] = useState("10:30");
  const [weightKg, setWeightKg] = useState<number>(3.2);
  const [deliveryType, setDeliveryType] = useState("Normal");
  const [birthType, setBirthType] = useState("Live");
  const [week, setWeek] = useState<number>(38);
  const [address, setAddress] = useState("Demo address...");

  const handleSearch = () => {
    if (searchType === "mother" && !motherNo.trim()) {
      return;
    }
    if (searchType === "baby" && !babyNo.trim()) {
      return;
    }
    setView("list");
  };

  const handleEdit = () => {
    setView("edit");
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
      <h3 className="text-center mb-3">Edit Birth Registration</h3>

      {view === "search" && (
        <div className="card p-4 mb-4">
          <h5 className="mb-3">Search</h5>
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="searchMother"
                  name="searchType"
                  checked={searchType === "mother"}
                  onChange={() => setSearchType("mother")}
                />
                <label className="form-check-label" htmlFor="searchMother">
                  Mother Hospital No
                </label>
              </div>
              <input
                type="text"
                className="form-control mt-2"
                value={motherNo}
                onChange={(event) => setMotherNo(event.target.value)}
                placeholder="Enter mother hospital no"
                disabled={searchType !== "mother"}
              />
            </div>

            <div className="col-md-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="searchBaby"
                  name="searchType"
                  checked={searchType === "baby"}
                  onChange={() => setSearchType("baby")}
                />
                <label className="form-check-label" htmlFor="searchBaby">
                  Baby No
                </label>
              </div>
              <input
                type="text"
                className="form-control mt-2"
                value={babyNo}
                onChange={(event) => setBabyNo(event.target.value)}
                placeholder="Enter baby no"
                disabled={searchType !== "baby"}
              />
            </div>
          </div>

          <div className="mt-4">
            <button type="button" className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="card p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Mother: Lakshmi | Father: Ramesh</h5>
            <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
              Back
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>Sl</th>
                  <th>Baby No</th>
                  <th>Sex</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Weight</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>B001</td>
                  <td>Male</td>
                  <td>2024-01-12</td>
                  <td>10:30</td>
                  <td>3.2 Kg</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleEdit}>
                      Edit
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>B002</td>
                  <td>Female</td>
                  <td>2024-01-12</td>
                  <td>10:45</td>
                  <td>2.9 Kg</td>
                  <td>
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleEdit}>
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "edit" && (
        <div className="card p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Edit Baby Details</h5>
            <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
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
              <div className="col-md-3">Date</div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  value={dob}
                  onChange={(event) => setDob(event.target.value)}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-3">Time</div>
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

            <div className="row mb-3">
              <div className="col-md-3">Delivery Type</div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={deliveryType}
                  onChange={(event) => setDeliveryType(event.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Caesarean">Caesarean</option>
                </select>
              </div>
              <div className="col-md-3">Birth Type</div>
              <div className="col-md-3">
                <div className="d-flex gap-3 mt-1">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="birthLive"
                      name="birthType"
                      checked={birthType === "Live"}
                      onChange={() => setBirthType("Live")}
                    />
                    <label className="form-check-label" htmlFor="birthLive">
                      Live
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="birthIud"
                      name="birthType"
                      checked={birthType === "IUD"}
                      onChange={() => setBirthType("IUD")}
                    />
                    <label className="form-check-label" htmlFor="birthIud">
                      IUD
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-3">
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
                  placeholder="Week"
                />
              </div>
              <div className="col-md-3">Address</div>
              <div className="col-md-3">
                <textarea
                  className="form-control"
                  rows={3}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
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
      )}

      {view === "success" && (
        <div className="card p-5 text-center">
          <h4 className="text-success mb-0">Successfully Done</h4>
          <div className="mt-4">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
