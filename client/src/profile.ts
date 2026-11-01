import axios from "axios";

const KEY = "profileId";

export function getProfileId(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setProfileId(id: string | null) {
  try {
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
  } catch {
    // storage unavailable, ignore
  }
}

axios.interceptors.request.use((config) => {
  const id = getProfileId();
  if (id) config.headers.set("X-Profile-Id", id);
  return config;
});