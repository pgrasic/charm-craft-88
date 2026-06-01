const API_BASE = "http://localhost:8001";

const isBrowser = typeof window !== "undefined";

function getStoredToken(): string | null {
  return isBrowser ? localStorage.getItem("access_token") : null;
}

function getAuthHeaders() {
  const token = getStoredToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export function getUserIdFromToken(): string | null {
  try {
    const token = getStoredToken();
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload?.sub || null;
  } catch {
    return null;
  }
}

export function getCurrentUser(): Record<string, any> | null {
  try {
    const token = getStoredToken();
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function logout(): void {
  if (isBrowser) localStorage.removeItem("access_token");
}

async function parseResponse(res: Response) {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* empty */ }
  return { res, data, text };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, lozinka: password }),
  });
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || data?.message || text || "Login failed");
  const token = data?.access_token || null;
  if (token) localStorage.setItem("access_token", token);
  return data;
}

export async function register(payload: { ime: string; prezime: string; email: string; lozinka: string }) {
  console.log("payload: ", payload);
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || text || "Register failed");
  const token = data?.access_token || null;
  if (token) localStorage.setItem("access_token", token);
  return data;
}

export async function getUserInfo() {
  const res = await fetch(`${API_BASE}/korisnici/me`, { headers: getAuthHeaders() });
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || text || "Failed to fetch user info");
  return data;
}

export async function updateUserInfo(payload: { ime?: string; prezime?: string; email?: string; lozinka?: string }) {
  const tokenUserId = getUserIdFromToken();
  const path = tokenUserId ? `/korisnici/${tokenUserId}` : `/korisnici/me`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const { data, text } = await parseResponse(res);
  if (data?.access_token) localStorage.setItem("access_token", data.access_token);
  if (!res.ok) throw new Error(data?.detail || text || "Failed to update user");
  return data?.user || data || null;
}

export async function getAllMeds() {
  const res = await fetch(`${API_BASE}/lijekovi`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch medications");
  return res.json();
}

export async function getUserReminders() {
  const res = await fetch(`${API_BASE}/korisnik-lijek`, { headers: getAuthHeaders() });
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || text || "Failed to fetch reminders");
  return data;
}

export async function createKorisnikLijek(entry: {
  korisnik_id: number;
  lijek_id: number;
  pocetno_vrijeme: Date | string;
  razmak_sati: number;
  kolicina: number;
}) {
  const res = await fetch(`${API_BASE}/korisnik-lijek`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(entry),
  });
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || text || "Failed to create reminder");
  return data;
}

export async function updateKorisnikLijek(lijek_id: number, entry: any) {
  const res = await fetch(`${API_BASE}/korisnik-lijek/${lijek_id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(entry),
  });
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || text || "Failed to update reminder");
  return data;
}

export async function deleteKorisnikLijek(lijek_id: number) {
  const res = await fetch(`${API_BASE}/korisnik-lijek/${lijek_id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || text || "Failed to delete reminder");
  return data;
}

export async function medicationTaken(lijek_id: number) {
  const res = await fetch(`${API_BASE}/korisnik-lijek/${lijek_id}/confirm`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark as taken");
  return res.json();
}

export async function snoozeReminder(lijek_id: number) {
  const res = await fetch(`${API_BASE}/korisnik-lijek/${lijek_id}/snooze`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to snooze");
  return res.json();
}

export async function dontRemindToday(lijek_id: number) {
  const res = await fetch(`${API_BASE}/korisnik-lijek/${lijek_id}/skip`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to skip");
  return res.json();
}

export async function createMedicationRequest(payload: {
  naziv: string;
  DjelatnaTvar?: string;
  nestasica?: boolean;
  accepted?: boolean;
}) {
  const res = await fetch(`${API_BASE}/lijekovi`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || text || "Failed to create request");
  return data;
}

export async function emailAction(token: string) {
  const res = await fetch(`${API_BASE}/korisnik-lijek/action?token=${encodeURIComponent(token)}`);
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || text || "Akcija nije uspjela");
  return data as { message: string; action: string };
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Stats fetch failed");
  return res.json();
}

export async function getMedicationRequests() {
  const res = await fetch(`${API_BASE}/lijekovi/requests`, { headers: getAuthHeaders() });
  const { data, text } = await parseResponse(res);
  if (!res.ok) throw new Error(data?.detail || text || "Failed to fetch requests");
  return data;
}

export async function approveRequest(requestId: number) {
  const res = await fetch(`${API_BASE}/lijekovi/${requestId}/approve`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to approve request");
  return res.json();
}

export async function rejectRequest(requestId: number) {
  const res = await fetch(`${API_BASE}/lijekovi/${requestId}/reject`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reject request");
  return res.json();
}
