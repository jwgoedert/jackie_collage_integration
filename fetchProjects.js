export async function fetchProjectsByYear() {
  const API_URL = "http://137.184.181.147:1337/api/projects/group-by-year";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    console.log("API Response Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

export async function fetchProjectsByParent() {
  const API_URL = "http://137.184.181.147:1337/api/projects/group-by-parent";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    console.log("API Response Data (By Parent):", data);
    return data;
  } catch (error) {
    console.error("Error fetching projects by parent:", error);
    throw error;
  }
}
