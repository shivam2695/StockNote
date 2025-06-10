const BASE_URL = "https://stocknote-backend.onrender.com";

export const addEntry = async (entry) => {
  const res = await fetch(`${BASE_URL}/add-entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  return res.json();
};

export const getEntries = async () => {
  const res = await fetch(`${BASE_URL}/entries`);
  return res.json();
};
