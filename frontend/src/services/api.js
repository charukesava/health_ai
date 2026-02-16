const BASE_URL = "http://localhost:5000";

/**
 * Generic POST helper.
 * Keeps original structure but adds basic error handling.
 */
export const postData = (url, data) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(async (res) => {
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw Object.assign(new Error("Request failed"), {
        status: res.status,
        data: json,
      });
    }
    return json;
  });

/**
 * POST /api/hospital-updates
 */
export const postHospitalUpdates = (data) =>
  postData(`${BASE_URL}/api/hospital-updates`, data);

/**
 * GET /api/hospital-updates
 */
export const getHospitalUpdates = () =>
  fetch(`${BASE_URL}/api/hospital-updates`).then(async (res) => {
    const json = await res.json().catch(() => []);
    if (!res.ok) {
      throw Object.assign(new Error("Request failed"), {
        status: res.status,
        data: json,
      });
    }
    return json;
  });
