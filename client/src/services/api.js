const API_URL = "http://localhost:5000/api";

export const registerVisitor = async (visitorData) => {
  const response = await fetch(`${API_URL}/visitors`, {
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
