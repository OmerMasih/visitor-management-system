import API_URL from "../config";

const API_BASE_URL = `${API_URL}/api`;

export const registerVisitor = async (visitorData) => {
  const response = await fetch(`${API_BASE_URL}/visitors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(visitorData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};
