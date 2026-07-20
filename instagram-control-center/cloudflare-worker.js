const SESSION_COOKIE = "hasi_cockpit_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const LOGIN_HTML = "__LOGIN_HTML__";
const ADMIN_HTML = "__ADMIN_HTML__";
const APP_HTML = "__APP_HTML__";
const HOME_HTML = "__HOME_HTML__";
const DEMO_HTML = "__DEMO_HTML__";

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function textBytes(value) {
  return new TextEncoder().encode(value);
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", textBytes(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    textBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, textBytes(value));
  return base64Url(new Uint8Array(signature));
}

function decodeBase64Url(value) {
  const normalized = String(value || "").replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function verifyHmac(secret, value, signature) {
  const key = await crypto.subtle.importKey(
    "raw",
    textBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  try {
    return crypto.subtle.verify("HMAC", key, decodeBase64Url(signature), textBytes(value));
  } catch {
    return false;
  }
}

function readCookie(request, name) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function createSession(identity, env) {
  const payload = base64Url(textBytes(JSON.stringify({
    email: identity.email,
    role: identity.role,
    tenantId: identity.tenantId || null,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })));
  const sig = await hmac(env.SESSION_SECRET, payload);
  return `${payload}.${sig}`;
}

async function verifySession(request, env) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!env.SESSION_SECRET || !(await verifyHmac(env.SESSION_SECRET, payload, sig))) return null;
  try {
    const json = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    if (json.exp <= Math.floor(Date.now() / 1000)) return null;
    if (json.role === "admin" && json.email) return { email: json.email, role: "admin", tenantId: null };
    if (json.role === "customer" && json.email && json.tenantId) {
      return { email: json.email, role: "customer", tenantId: slugify(json.tenantId) };
    }
    return null;
  } catch {
    return null;
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function noStoreHeaders(extra = {}) {
  return {
    "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
    ...extra,
  };
}

function redirectNoStore(location, status = 302) {
  return new Response(null, {
    status,
    headers: noStoreHeaders({ Location: location }),
  });
}

function isCustomerPagePath(pathname) {
  return pathname === "/hasi-elektronic" || pathname === "/kebyshop";
}

function tenantPath(tenantId) {
  if (tenantId === "hasi-elektronic") return "/hasi-elektronic";
  if (tenantId === "keby-shop") return "/kebyshop";
  return `/kunde/${encodeURIComponent(tenantId)}`;
}

function tenantFromPath(pathname) {
  if (pathname === "/hasi-elektronic") return "hasi-elektronic";
  if (pathname === "/kebyshop") return "keby-shop";
  const match = pathname.match(/^\/kunde\/([^/?#]+)/i);
  return match ? slugify(decodeURIComponent(match[1])) : "";
}

function defaultTarget(identity) {
  return identity?.role === "customer" ? tenantPath(identity.tenantId) : "/hasi-elektronic";
}

function authorizedTarget(identity, value) {
  const target = safeRedirectTarget(value, defaultTarget(identity));
  if (identity?.role === "admin") return target;
  const targetTenant = tenantFromPath(new URL(target, "https://hasi.live").pathname);
  return targetTenant === identity?.tenantId ? target : defaultTarget(identity);
}

function canAccessTenant(identity, tenantId) {
  return identity?.role === "admin" || (identity?.role === "customer" && identity.tenantId === tenantId);
}

function safeRedirectTarget(value, fallback = "/hasi-elektronic") {
  const target = String(value || "").trim();
  if (!target || !target.startsWith("/") || target.startsWith("//")) return fallback;
  if (target === "/app" || target.startsWith("/app?") || target.startsWith("/app#")) return target;
  if (target === "/admin" || target.startsWith("/admin?") || target.startsWith("/admin#")) return target;
  if (target === "/hasi-elektronic" || target.startsWith("/hasi-elektronic?") || target.startsWith("/hasi-elektronic#")) return target;
  if (target === "/kebyshop" || target.startsWith("/kebyshop?") || target.startsWith("/kebyshop#")) return target;
  if (/^\/kunde\/[a-z0-9-]+([/?#].*)?$/i.test(target)) return target;
  return fallback;
}

async function serveAsset(env, path, request) {
  const url = new URL(request.url);
  url.pathname = path;
  return env.ASSETS.fetch(new Request(url, {
    method: "GET",
    headers: { Accept: request.headers.get("Accept") || "*/*" },
  }));
}

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey("raw", textBytes(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: decodeBase64Url(salt), iterations: 210000 },
    key,
    256
  );
  return base64Url(new Uint8Array(bits));
}

function randomSalt() {
  return base64Url(crypto.getRandomValues(new Uint8Array(16)));
}

async function portalUsers(env) {
  if (!env.CUSTOMERS) return [];
  const rows = await env.CUSTOMERS.get("portal-users", "json");
  return Array.isArray(rows) ? rows : [];
}

async function savePortalUsers(env, rows) {
  if (!env.CUSTOMERS) throw new Error("CUSTOMERS KV binding fehlt");
  await env.CUSTOMERS.put("portal-users", JSON.stringify(rows));
}

async function customerIdentity(env, email, password) {
  const users = await portalUsers(env);
  const user = users.find((row) => row.enabled !== false && String(row.email || "").toLowerCase() === email);
  if (!user?.passwordHash || !user?.passwordSalt || !user?.tenantId) return null;
  const actual = await passwordHash(password, user.passwordSalt);
  if (actual !== user.passwordHash) return null;
  return { email, role: "customer", tenantId: slugify(user.tenantId) };
}

async function upsertPortalUser(env, customer, input, existingCustomer = null) {
  const portalInput = input.portal || input;
  const loginEmail = String(portalInput.loginEmail ?? customer.portal?.loginEmail ?? "").trim().toLowerCase();
  const temporaryPassword = String(portalInput.temporaryPassword || "");
  const enabled = boolValue(portalInput.loginEnabled ?? customer.portal?.enabled);
  const users = await portalUsers(env);
  const existingIndex = users.findIndex((row) => row.tenantId === customer.id);
  const existingUser = existingIndex >= 0 ? users[existingIndex] : null;

  if (!enabled && !loginEmail && !existingUser) return;
  if (enabled && !loginEmail) throw new Error("Portal-E-Mail fehlt");
  if (temporaryPassword && temporaryPassword.length < 12) {
    throw new Error("Das temporäre Passwort muss mindestens 12 Zeichen haben");
  }
  if (enabled && !temporaryPassword && !existingUser?.passwordHash) {
    throw new Error("Für den ersten Portalzugang ist ein temporäres Passwort erforderlich");
  }
  const passwordSalt = temporaryPassword ? randomSalt() : existingUser?.passwordSalt;
  const nextUser = {
    email: loginEmail || existingUser?.email || existingCustomer?.portal?.loginEmail || "",
    tenantId: customer.id,
    role: "customer",
    enabled,
    passwordSalt,
    passwordHash: temporaryPassword ? await passwordHash(temporaryPassword, passwordSalt) : existingUser?.passwordHash,
    updatedAt: new Date().toISOString(),
  };
  const nextUsers = existingIndex >= 0
    ? users.map((row, index) => index === existingIndex ? nextUser : row)
    : [...users, nextUser];
  await savePortalUsers(env, nextUsers);
}

async function handleLogin(request, env) {
  const contentType = request.headers.get("Content-Type") || "";
  const isFormPost = contentType.toLowerCase().includes("application/x-www-form-urlencoded");
  const body = isFormPost
    ? Object.fromEntries(new URLSearchParams(await request.text()))
    : await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const expectedEmail = String(env.COCKPIT_EMAIL || "").trim().toLowerCase();
  const salt = env.COCKPIT_PASSWORD_SALT || "";
  const hash = await sha256Hex(`${salt}:${password}`);
  const hashMatches = env.COCKPIT_PASSWORD_HASH && hash === env.COCKPIT_PASSWORD_HASH;
  const secretMatches = env.COCKPIT_PASSWORD && password === env.COCKPIT_PASSWORD;
  const adminMatches = expectedEmail && email === expectedEmail && (hashMatches || secretMatches);
  const identity = adminMatches
    ? { email, role: "admin", tenantId: null }
    : await customerIdentity(env, email, password);
  const redirectTo = authorizedTarget(identity, body.next);
  if (!identity) {
    if (isFormPost) {
      return new Response(null, {
        status: 303,
        headers: noStoreHeaders({
          Location: `/login?next=${encodeURIComponent(redirectTo)}&error=1`,
          "Set-Cookie": clearSessionCookie(),
        }),
      });
    }
    return json({ ok: false }, 401);
  }
  const session = await createSession(identity, env);
  const cookie = `${SESSION_COOKIE}=${session}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
  if (isFormPost) {
    return new Response(null, {
      status: 303,
      headers: noStoreHeaders({
        Location: redirectTo,
        "Set-Cookie": cookie,
      }),
    });
  }
  return new Response(JSON.stringify({ ok: true, redirectTo, role: identity.role }), {
    headers: noStoreHeaders({
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": cookie,
    }),
  });
}

function contentTypeOk(type, expected) {
  return String(type || "").toLowerCase().includes(expected);
}

function manifestSlug(file) {
  return String(file || "").replace(/\.manifest\.json$/, "").replace(/\.(reel|story)$/, "");
}

function matchesManifest(entry, file, slug) {
  return entry?.manifest ? entry.manifest === file : entry?.slug === slug;
}

function safePublishFile(value) {
  return String(value || "").replace(/[^a-zA-Z0-9._-]/g, "");
}

async function activityLog(env, request, tenantId = "hasi-elektronic") {
  const fallbackResponse = await serveAsset(env, "/data/status.json", request);
  const snapshot = fallbackResponse.ok ? await fallbackResponse.json().catch(() => ({})) : {};
  const staticLog = tenantId === "hasi-elektronic" && Array.isArray(snapshot.log) ? snapshot.log : [];
  const storedLog = env.CUSTOMERS ? await env.CUSTOMERS.get(`activity-log:${tenantId}`, "json") : [];
  const legacyStoredLog = tenantId === "hasi-elektronic" && env.CUSTOMERS
    ? await env.CUSTOMERS.get("activity-log", "json")
    : [];
  const combined = [
    ...(Array.isArray(storedLog) ? storedLog : []),
    ...(Array.isArray(legacyStoredLog) ? legacyStoredLog : []),
    ...staticLog,
  ];
  const seen = new Set();
  return combined.filter((entry) => {
    const key = `${entry.action || ""}:${entry.manifest || ""}:${entry.instagramId || ""}:${entry.time || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
}

async function appendActivityLog(env, request, entry, tenantId = "hasi-elektronic") {
  if (!env.CUSTOMERS) throw new Error("CUSTOMERS KV binding fehlt");
  const log = await activityLog(env, request, tenantId);
  const next = [{ ...entry, tenantId }, ...log].slice(0, 100);
  await env.CUSTOMERS.put(`activity-log:${tenantId}`, JSON.stringify(next, null, 2));
}

function applyActivityLog(snapshot, log) {
  const items = Array.isArray(snapshot.manifests) ? snapshot.manifests : [];
  snapshot.manifests = items.map((item) => {
    const published = log.find((entry) => {
      if (entry.status !== "published" && !entry.instagramId) return false;
      return matchesManifest(entry, item.file, item.slug || manifestSlug(item.file));
    });
    const approved = log.find((entry) => {
      if (entry.status !== "approved") return false;
      return matchesManifest(entry, item.file, item.slug || manifestSlug(item.file));
    });
    return {
      ...item,
      approved: Boolean(approved) || Boolean(published) || Boolean(item.approved),
      approvedAt: approved?.time || item.approvedAt || "",
      published: Boolean(published) || Boolean(item.published),
      publishedAt: published?.time || item.publishedAt || "",
      instagramId: published?.instagramId || item.instagramId || "",
    };
  });
  snapshot.log = log.slice(0, 50);
  return snapshot;
}

function requestedTenant(request, identity) {
  if (identity?.role === "customer") return identity.tenantId;
  return slugify(new URL(request.url).searchParams.get("tenant") || "hasi-elektronic") || "hasi-elektronic";
}

async function status(env, request, identity) {
  const tenantId = requestedTenant(request, identity);
  if (!canAccessTenant(identity, tenantId)) return json({ error: "Forbidden" }, 403);
  const response = await serveAsset(env, "/data/status.json", request);
  if (!response.ok) return json({ error: "Status snapshot not found" }, 404);
  const snapshot = await response.json();
  const allCustomers = await customers(env, request);
  const customer = allCustomers.find((row) => row.id === tenantId);
  if (!customer) return json({ error: "Kunde nicht gefunden" }, 404);
  snapshot.customers = identity.role === "admin" ? allCustomers : [customer];
  snapshot.session = { email: identity.email, role: identity.role, tenantId };
  if (tenantId !== "hasi-elektronic") {
    snapshot.customer = customer;
    snapshot.manifests = [];
    snapshot.plan = [];
    snapshot.log = [];
  }
  try {
    const factoryUrl = env.CONTENT_FACTORY_URL || "https://hasi-content-factory.hguencavdi.workers.dev";
    const factoryResponse = await fetch(`${factoryUrl}/api/tenants/${encodeURIComponent(tenantId)}/dashboard`, { headers: { Accept: "application/json" } });
    if (factoryResponse.ok) snapshot.cloudFactory = await factoryResponse.json();
    else snapshot.cloudFactory = { error: `Content Factory HTTP ${factoryResponse.status}` };
  } catch (error) {
    snapshot.cloudFactory = { error: String(error?.message || error) };
  }
  return json(applyActivityLog(snapshot, await activityLog(env, request, tenantId)));
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function parseTopics(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 12);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function boolValue(value) {
  return value === true || value === "true" || value === "on" || value === "1";
}

function normalizeOnboarding(input = {}, existing = {}) {
  return {
    profileComplete: boolValue(input.profileComplete ?? existing.profileComplete),
    brandComplete: boolValue(input.brandComplete ?? existing.brandComplete),
    productPhotos: boolValue(input.productPhotos ?? existing.productPhotos),
    productList: boolValue(input.productList ?? existing.productList),
    instagramBusiness: boolValue(input.instagramBusiness ?? existing.instagramBusiness),
    facebookPage: boolValue(input.facebookPage ?? existing.facebookPage),
    metaAccess: boolValue(input.metaAccess ?? existing.metaAccess),
    contentPlan: boolValue(input.contentPlan ?? existing.contentPlan),
    publishPermission: String(input.publishPermission || existing.publishPermission || "missing").trim(),
    notes: String(input.notes ?? existing.notes ?? "").trim(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeCadence(input = {}, existing = {}) {
  return {
    carousel: String(input.carouselTime || input.carousel || existing.carousel || "12:30").trim(),
    reel: String(input.reelTime || input.reel || existing.reel || "19:30").trim(),
    story: String(input.storyTime || input.story || existing.story || "08:00").trim(),
  };
}

function normalizeCustomer(input, existing = null) {
  const company = String(input.company || input.name || "").trim();
  if (!company) throw new Error("Firma fehlt");
  const id = slugify(existing?.id || input.id || company);
  if (!id) throw new Error("Kunden-ID fehlt");
  const onboardingInput = input.onboarding || input;
  const brandInput = input.brand || {};
  const cadenceInput = input.cadence || input;
  return {
    id,
    name: company,
    company,
    owner: String(input.owner || "").trim(),
    email: String(input.email || "").trim(),
    phone: String(input.phone || "").trim(),
    city: String(input.city || "").trim(),
    address: String(input.address || "").trim(),
    instagram: String(input.instagram || "").trim(),
    industry: String(input.industry || "").trim(),
    language: String(input.language || "de").trim(),
    status: String(input.status || "active").trim(),
    brand: {
      primary: String(input.primary || brandInput.primary || "#3ABADF").trim(),
      secondary: String(input.secondary || brandInput.secondary || input.primary || brandInput.primary || "#41AADE").trim(),
      accent: String(input.accent || brandInput.accent || "#FF6B00").trim(),
      font: String(input.font || brandInput.font || "Plus Jakarta Sans").trim(),
      logo: String(input.logo || brandInput.logo || "").trim(),
    },
    topics: parseTopics(input.topics),
    cadence: normalizeCadence(cadenceInput, existing?.cadence),
    positioning: String(input.positioning || "").trim(),
    portal: {
      loginEmail: String(input.loginEmail || input.portal?.loginEmail || existing?.portal?.loginEmail || "").trim().toLowerCase(),
      enabled: boolValue(input.loginEnabled ?? input.portal?.enabled ?? existing?.portal?.enabled),
    },
    factory: {
      publishMode: String(input.factoryPublishMode || input.factory?.publishMode || existing?.factory?.publishMode || (id === "hasi-elektronic" ? "automatic" : onboardingInput.publishPermission === "direct" ? "automatic" : onboardingInput.publishPermission === "approval" ? "approval" : "disabled")).trim(),
      userRef: String(input.instagramUserRef || input.factory?.userRef || existing?.factory?.userRef || (id === "hasi-elektronic" ? "IG_USER_ID" : "")).trim().toUpperCase(),
      secretRef: String(input.instagramSecretRef || input.factory?.secretRef || existing?.factory?.secretRef || (id === "hasi-elektronic" ? "IG_ACCESS_TOKEN" : "")).trim().toUpperCase(),
      graphVersion: String(input.graphVersion || input.factory?.graphVersion || existing?.factory?.graphVersion || "v25.0").trim(),
    },
    onboarding: normalizeOnboarding(onboardingInput, existing?.onboarding),
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
}

async function fallbackCustomers(env, request) {
  const response = await serveAsset(env, "/data/customers.json", request);
  if (!response.ok) return [];
  return response.json();
}

async function customers(env, request) {
  if (env.CUSTOMERS) {
    const stored = await env.CUSTOMERS.get("customers", "json");
    if (Array.isArray(stored)) return stored.map((row) => normalizeCustomer(row, row));
  }
  const rows = await fallbackCustomers(env, request);
  return rows.map((row) => normalizeCustomer(row, row));
}

async function saveCustomers(env, rows) {
  if (!env.CUSTOMERS) throw new Error("CUSTOMERS KV binding fehlt");
  await env.CUSTOMERS.put("customers", JSON.stringify(rows, null, 2));
}

function addMinutes(time, minutes) {
  const [hour, minute] = String(time || "00:00").split(":").map(Number);
  const total = ((hour * 60 + minute + minutes) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

async function syncFactoryTenant(env, customer) {
  if (!env.CONTENT_FACTORY_SECRET) return { skipped: true };
  const factoryUrl = env.CONTENT_FACTORY_URL || "https://hasi-content-factory.hguencavdi.workers.dev";
  const payload = {
    slug: customer.id,
    name: customer.company || customer.name,
    instagramHandle: customer.instagram,
    active: customer.status !== "inactive",
    brand: customer.brand,
    strategy: {
      carousel: { info: 70, "problem-solution": 20, promotion: 10 },
      reel: { info: 60, "problem-solution": 25, promotion: 15 },
      topics: customer.topics,
      positioning: customer.positioning,
      language: customer.language,
    },
    schedule: {
      storyMorning: customer.cadence.story,
      carousel: customer.cadence.carousel,
      reel: customer.cadence.reel,
      storyEvening: addMinutes(customer.cadence.reel, 15),
    },
    publishMode: customer.factory.publishMode,
    userRef: customer.factory.userRef,
    secretRef: customer.factory.secretRef,
    version: customer.factory.graphVersion,
  };
  const response = await fetch(`${factoryUrl}/api/admin/tenants/${encodeURIComponent(customer.id)}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${env.CONTENT_FACTORY_SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Content Factory: ${result.error || `HTTP ${response.status}`}`);
  return result;
}

async function factoryRequest(env, path, options = {}) {
  if (!env.CONTENT_FACTORY_SECRET) throw new Error("Content Factory Service-Secret fehlt");
  const factoryUrl = env.CONTENT_FACTORY_URL || "https://hasi-content-factory.hguencavdi.workers.dev";
  const response = await fetch(`${factoryUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.CONTENT_FACTORY_SECRET}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Content Factory HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function editorialTenant(identity, input = {}) {
  return identity.role === "customer" ? identity.tenantId : slugify(input.tenantId || "hasi-elektronic");
}

async function proposeEditorialWeek(request, env, identity, weekStart) {
  const input = await request.json().catch(() => ({}));
  const tenantId = editorialTenant(identity, input);
  if (!tenantId || !canAccessTenant(identity, tenantId)) return json({ error: "Forbidden" }, 403);
  try {
    return json(await factoryRequest(env, `/api/admin/tenants/${encodeURIComponent(tenantId)}/editorial-weeks/${weekStart}/propose`, { method: "POST", body: "{}" }), 201);
  } catch (error) {
    return json({ error: error.message }, error.status || 500);
  }
}

async function updateEditorialItem(request, env, identity, weekStart, itemId, regenerate = false) {
  const input = await request.json().catch(() => ({}));
  const tenantId = editorialTenant(identity, input);
  if (!tenantId || !canAccessTenant(identity, tenantId)) return json({ error: "Forbidden" }, 403);
  const suffix = regenerate ? "/regenerate" : "";
  try {
    return json(await factoryRequest(env, `/api/admin/tenants/${encodeURIComponent(tenantId)}/editorial-weeks/${weekStart}/items/${encodeURIComponent(itemId)}${suffix}`, {
      method: regenerate ? "POST" : "PATCH",
      body: JSON.stringify(regenerate ? {} : input),
    }));
  } catch (error) {
    return json({ error: error.message }, error.status || 500);
  }
}

async function approveEditorialWeekFromPortal(request, env, identity, weekStart) {
  const input = await request.json().catch(() => ({}));
  const tenantId = editorialTenant(identity, input);
  if (!tenantId || !canAccessTenant(identity, tenantId)) return json({ error: "Forbidden" }, 403);
  try {
    return json(await factoryRequest(env, `/api/admin/tenants/${encodeURIComponent(tenantId)}/editorial-weeks/${weekStart}/approve`, {
      method: "POST",
      body: JSON.stringify({ approvedBy: identity.email }),
    }), 202);
  } catch (error) {
    return json({ error: error.message }, error.status || 500);
  }
}

async function approveFactoryAsset(request, env, identity, assetId) {
  const input = await request.json().catch(() => ({}));
  const tenantId = identity.role === "customer" ? identity.tenantId : slugify(input.tenantId || "hasi-elektronic");
  if (!tenantId || !canAccessTenant(identity, tenantId)) return json({ error: "Forbidden" }, 403);
  const factoryUrl = env.CONTENT_FACTORY_URL || "https://hasi-content-factory.hguencavdi.workers.dev";
  const dashboardResponse = await fetch(`${factoryUrl}/api/tenants/${encodeURIComponent(tenantId)}/dashboard`, { headers: { Accept: "application/json" } });
  const dashboard = await dashboardResponse.json().catch(() => ({}));
  if (!dashboardResponse.ok) return json({ error: dashboard.error || `Content Factory HTTP ${dashboardResponse.status}` }, dashboardResponse.status);
  const asset = (dashboard.assets || []).find((entry) => entry.id === assetId);
  if (!asset) return json({ error: "Inhalt gehört nicht zu diesem Kunden" }, 404);
  const approval = await factoryRequest(env, `/api/assets/${encodeURIComponent(assetId)}/approval`, {
    method: "POST",
    body: JSON.stringify({ approved: true, approvedBy: identity.email }),
  });
  const publish = input.publishNow === false ? null : await factoryRequest(env, `/api/assets/${encodeURIComponent(assetId)}/publish`, { method: "POST", body: "{}" });
  await appendActivityLog(env, request, {
    action: "factory-approval",
    status: publish?.status || approval.approvalStatus,
    manifest: `cloud-${assetId}`,
    time: new Date().toISOString(),
  }, tenantId);
  return json({ ok: true, approval, publish });
}

async function factoryAssetPublishStatus(request, env, identity, assetId) {
  const input = await request.json().catch(() => ({}));
  const tenantId = identity.role === "customer" ? identity.tenantId : slugify(input.tenantId || "hasi-elektronic");
  if (!tenantId || !canAccessTenant(identity, tenantId)) return json({ error: "Forbidden" }, 403);
  const factoryUrl = env.CONTENT_FACTORY_URL || "https://hasi-content-factory.hguencavdi.workers.dev";
  const dashboardResponse = await fetch(`${factoryUrl}/api/tenants/${encodeURIComponent(tenantId)}/dashboard`, { headers: { Accept: "application/json" } });
  const dashboard = await dashboardResponse.json().catch(() => ({}));
  if (!dashboardResponse.ok) return json({ error: dashboard.error || `Content Factory HTTP ${dashboardResponse.status}` }, dashboardResponse.status);
  if (!(dashboard.assets || []).some((entry) => entry.id === assetId)) return json({ error: "Inhalt gehört nicht zu diesem Kunden" }, 404);
  return json(await factoryRequest(env, `/api/assets/${encodeURIComponent(assetId)}/publish-status`, { method: "POST", body: "{}" }));
}

async function addCustomer(request, env) {
  const input = await request.json();
  const customer = normalizeCustomer(input);
  const rows = await customers(env, request);
  if (rows.some((row) => row.id === customer.id)) {
    return json({ error: "Kunde existiert bereits" }, 409);
  }
  const nextRows = [customer, ...rows];
  await syncFactoryTenant(env, customer);
  await upsertPortalUser(env, customer, input);
  await saveCustomers(env, nextRows);
  return json({ customer }, 201);
}

async function updateCustomer(request, env, id) {
  const input = await request.json();
  const rows = await customers(env, request);
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return json({ error: "Kunde nicht gefunden" }, 404);
  const customer = normalizeCustomer(input, rows[index]);
  const nextRows = rows.map((row, rowIndex) => rowIndex === index ? customer : row);
  await syncFactoryTenant(env, customer);
  await upsertPortalUser(env, customer, input, rows[index]);
  await saveCustomers(env, nextRows);
  return json({ customer });
}

function graphConfig(env) {
  const igUserId = env.IG_USER_ID;
  const accessToken = env.IG_ACCESS_TOKEN;
  if (!igUserId || !accessToken) throw new Error("Instagram Cloud Secrets fehlen: IG_USER_ID / IG_ACCESS_TOKEN");
  return {
    igUserId,
    accessToken,
    version: env.GRAPH_API_VERSION || "v25.0",
    graphHost: env.IG_GRAPH_HOST || "graph.instagram.com",
  };
}

async function graphPost(env, path, params) {
  const config = graphConfig(env);
  const body = new URLSearchParams({ ...params, access_token: config.accessToken });
  const response = await fetch(`https://${config.graphHost}/${config.version}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(JSON.stringify(data.error || data));
  return data;
}

async function graphGet(env, path, params = {}) {
  const config = graphConfig(env);
  const url = new URL(`https://${config.graphHost}/${config.version}${path}`);
  url.search = new URLSearchParams({ ...params, access_token: config.accessToken }).toString();
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(JSON.stringify(data.error || data));
  return data;
}

async function waitForContainer(env, containerId, attempts = 24) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const status = await graphGet(env, `/${containerId}`, { fields: "status_code,status" });
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR") throw new Error(`Container ${containerId} failed: ${status.status || "unknown error"}`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error(`Container ${containerId} wurde nicht rechtzeitig fertig.`);
}

async function findManifest(env, request, file) {
  const response = await serveAsset(env, "/data/status.json", request);
  if (!response.ok) throw new Error("Status snapshot not found");
  const snapshot = await response.json();
  return (snapshot.manifests || []).find((item) => item.file === file);
}

async function verifyPublishItem(item) {
  if (!item || !Array.isArray(item.urls) || item.urls.length === 0) throw new Error("Manifest nicht gefunden oder ohne URLs.");
  const checks = await Promise.all(item.urls.map(async (url) => {
    const response = await fetch(url, { method: "HEAD" });
    return { ok: response.ok, status: response.status, type: response.headers.get("content-type") || "" };
  }));
  if (item.type === "carousel" && !checks.every((check) => check.ok && contentTypeOk(check.type, "image/png"))) {
    throw new Error("Karussell ist nicht publish-ready: Bild-URLs liefern nicht alle image/png.");
  }
  if (item.type === "reel" && !checks.every((check) => check.ok && contentTypeOk(check.type, "video/mp4"))) {
    throw new Error("Reel ist nicht publish-ready: Video-URL liefert kein video/mp4.");
  }
  if (item.type === "story" && !checks.every((check) => check.ok && (contentTypeOk(check.type, "video/mp4") || contentTypeOk(check.type, "image/")))) {
    throw new Error("Story ist nicht veröffentlichungsbereit: Die URL liefert kein unterstütztes Bild oder MP4-Video.");
  }
}

async function publishCarousel(env, item) {
  if (item.urls.length < 2 || item.urls.length > 10) throw new Error("Instagram Karussell braucht 2 bis 10 Bilder.");
  const children = [];
  for (const imageUrl of item.urls) {
    const child = await graphPost(env, `/${graphConfig(env).igUserId}/media`, {
      image_url: imageUrl,
      is_carousel_item: "true",
    });
    await waitForContainer(env, child.id, 20);
    children.push(child.id);
  }
  const parent = await graphPost(env, `/${graphConfig(env).igUserId}/media`, {
    media_type: "CAROUSEL",
    children: children.join(","),
    caption: item.caption || "",
  });
  await waitForContainer(env, parent.id, 20);
  return graphPost(env, `/${graphConfig(env).igUserId}/media_publish`, { creation_id: parent.id });
}

async function publishReel(env, item) {
  const container = await graphPost(env, `/${graphConfig(env).igUserId}/media`, {
    media_type: "REELS",
    video_url: item.urls[0],
    caption: item.caption || "",
    share_to_feed: "true",
  });
  await waitForContainer(env, container.id, 60);
  return graphPost(env, `/${graphConfig(env).igUserId}/media_publish`, { creation_id: container.id });
}

async function publishStory(env, item) {
  const mediaUrl = item.urls[0];
  const isVideo = String(item.checks?.[0]?.type || "").includes("video/mp4") || /\.mp4(?:$|\?)/i.test(mediaUrl);
  const container = await graphPost(env, `/${graphConfig(env).igUserId}/media`, {
    media_type: "STORIES",
    ...(isVideo ? { video_url: mediaUrl } : { image_url: mediaUrl }),
  });
  await waitForContainer(env, container.id, 60);
  return graphPost(env, `/${graphConfig(env).igUserId}/media_publish`, { creation_id: container.id });
}

async function createVideoContainer(env, item, type) {
  const mediaUrl = item.urls[0];
  if (type === "reel") {
    return graphPost(env, `/${graphConfig(env).igUserId}/media`, {
      media_type: "REELS",
      video_url: mediaUrl,
      caption: item.caption || "",
      share_to_feed: "true",
    });
  }
  const isVideo = String(item.checks?.[0]?.type || "").includes("video/mp4") || /\.mp4(?:$|\?)/i.test(mediaUrl);
  return graphPost(env, `/${graphConfig(env).igUserId}/media`, {
    media_type: "STORIES",
    ...(isVideo ? { video_url: mediaUrl } : { image_url: mediaUrl }),
  });
}

async function approveFromCloud(request, env, type, file) {
  if (!["carousel", "reel", "story"].includes(type)) {
    return json({ ok: false, error: "Unbekannter Inhaltstyp." }, 400);
  }
  const safeFile = safePublishFile(file);
  const item = await findManifest(env, request, safeFile);
  if (!item || item.type !== type) return json({ ok: false, error: "Manifest nicht gefunden oder falscher Typ." }, 404);
  if (!item.ready) return json({ ok: false, error: "Der Inhalt ist noch nicht vollständig geprüft." }, 409);

  const log = await activityLog(env, request);
  const existing = log.find((entry) => entry.status === "approved" && matchesManifest(entry, safeFile, item.slug));
  if (existing) return json({ ok: true, skipped: true, entry: existing, message: "Bereits freigegeben." });

  const entry = {
    time: new Date().toISOString(),
    action: "approve-content",
    status: "approved",
    type,
    topic: item.slug || manifestSlug(safeFile),
    slug: item.slug || manifestSlug(safeFile),
    manifest: safeFile,
    instagramId: "",
    note: "Im Kundenportal freigegeben.",
  };
  await appendActivityLog(env, request, entry);
  return json({ ok: true, entry });
}

async function publishFromCloud(request, env, type, file) {
  if (!["carousel", "reel", "story"].includes(type)) {
    return json({ ok: false, error: "Unbekannter Inhaltstyp." }, 400);
  }
  const safeFile = safePublishFile(file);
  const item = await findManifest(env, request, safeFile);
  if (!item || item.type !== type) return json({ ok: false, error: "Manifest nicht gefunden oder falscher Typ." }, 404);

  const log = await activityLog(env, request);
  const already = log.find((entry) => (entry.status === "published" || entry.instagramId) && matchesManifest(entry, safeFile, item.slug));
  if (already) {
    return json({ ok: true, skipped: true, instagramId: already.instagramId || "", message: "Schon veröffentlicht." });
  }
  const activeProcess = log.find((entry) => entry.status === "processing" && entry.containerId && matchesManifest(entry, safeFile, item.slug));
  const laterFailure = activeProcess && log.find((entry) => entry.status === "failed" && matchesManifest(entry, safeFile, item.slug) && new Date(entry.time) > new Date(activeProcess.time));
  if (activeProcess && !laterFailure && (type === "reel" || type === "story")) {
    return json({ ok: true, pending: true, containerId: activeProcess.containerId, message: "Instagram verarbeitet das Video noch." }, 202);
  }
  const approved = log.find((entry) => entry.status === "approved" && matchesManifest(entry, safeFile, item.slug));

  try {
    await verifyPublishItem(item);
    if (!approved) {
      await appendActivityLog(env, request, {
        time: new Date().toISOString(),
        action: "approve-content",
        status: "approved",
        type,
        topic: item.slug || manifestSlug(safeFile),
        slug: item.slug || manifestSlug(safeFile),
        manifest: safeFile,
        instagramId: "",
        note: "Freigabe zusammen mit der Veröffentlichung im Kundenportal bestätigt.",
      });
    }
    if (type === "reel" || type === "story") {
      const container = await createVideoContainer(env, item, type);
      await appendActivityLog(env, request, {
        time: new Date().toISOString(),
        action: `process-${type}`,
        status: "processing",
        type,
        topic: item.title || item.slug || manifestSlug(safeFile),
        slug: item.slug || manifestSlug(safeFile),
        manifest: safeFile,
        containerId: container.id,
        instagramId: "",
        note: "Instagram verarbeitet den Mediencontainer.",
      });
      return json({ ok: true, pending: true, containerId: container.id }, 202);
    }
    const published = await publishCarousel(env, item);
    const entry = {
      time: new Date().toISOString(),
      action: `publish-${type}`,
      status: "published",
      type,
      topic: item.slug || manifestSlug(safeFile),
      slug: item.slug || manifestSlug(safeFile),
      manifest: safeFile,
      instagramId: published.id || "",
      note: approved
        ? "Nach Kundenfreigabe über Hasi Social Media veröffentlicht."
        : "Im Kundenportal freigegeben und direkt über Hasi Social Media veröffentlicht.",
    };
    await appendActivityLog(env, request, entry);
    return json({ ok: true, instagramId: published.id || "", entry });
  } catch (error) {
    await appendActivityLog(env, request, {
      time: new Date().toISOString(),
      action: `publish-${type}`,
      status: "failed",
      type,
      topic: item.slug || manifestSlug(safeFile),
      slug: item.slug || manifestSlug(safeFile),
      manifest: safeFile,
      instagramId: "",
      note: String(error.message || error).slice(0, 500),
    }).catch(() => {});
    return json({ ok: false, error: String(error.message || error) }, 500);
  }
}

async function completeVideoPublish(request, env, type, file, containerId) {
  if (!["reel", "story"].includes(type)) return json({ ok: false, error: "Unbekannter Video-Typ." }, 400);
  const safeFile = safePublishFile(file);
  const safeContainerId = String(containerId || "").replace(/[^0-9]/g, "");
  if (!safeContainerId) return json({ ok: false, error: "Container-ID fehlt." }, 400);
  const item = await findManifest(env, request, safeFile);
  if (!item || item.type !== type) return json({ ok: false, error: "Manifest nicht gefunden oder falscher Typ." }, 404);
  const log = await activityLog(env, request);
  const already = log.find((entry) => (entry.status === "published" || entry.instagramId) && matchesManifest(entry, safeFile, item.slug));
  if (already) return json({ ok: true, pending: false, skipped: true, instagramId: already.instagramId || "" });
  const processEntry = log.find((entry) => entry.status === "processing" && entry.containerId === safeContainerId && matchesManifest(entry, safeFile, item.slug));
  if (!processEntry) return json({ ok: false, error: "Kein aktiver Veröffentlichungsvorgang gefunden." }, 409);
  try {
    const container = await graphGet(env, `/${safeContainerId}`, { fields: "status_code,status" });
    if (container.status_code === "ERROR") throw new Error(container.status || "Instagram konnte das Video nicht verarbeiten.");
    if (container.status_code !== "FINISHED") {
      return json({ ok: true, pending: true, containerId: safeContainerId, status: container.status_code || "IN_PROGRESS" }, 202);
    }
    const published = await graphPost(env, `/${graphConfig(env).igUserId}/media_publish`, { creation_id: safeContainerId });
    const entry = {
      time: new Date().toISOString(),
      action: `publish-${type}`,
      status: "published",
      type,
      topic: item.title || item.slug || manifestSlug(safeFile),
      slug: item.slug || manifestSlug(safeFile),
      manifest: safeFile,
      containerId: safeContainerId,
      instagramId: published.id || "",
      note: "Im Kundenportal freigegeben und über Hasi Social Media veröffentlicht.",
    };
    await appendActivityLog(env, request, entry);
    return json({ ok: true, pending: false, instagramId: published.id || "", entry });
  } catch (error) {
    await appendActivityLog(env, request, {
      time: new Date().toISOString(), action: `publish-${type}`, status: "failed", type,
      topic: item.title || item.slug || manifestSlug(safeFile), slug: item.slug || manifestSlug(safeFile),
      manifest: safeFile, containerId: safeContainerId, instagramId: "", note: String(error.message || error).slice(0, 500),
    }).catch(() => {});
    return json({ ok: false, error: String(error.message || error) }, 500);
  }
}

async function handleRequest(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/home") {
      return new Response(HOME_HTML, {
        headers: noStoreHeaders({
          "Content-Type": "text/html; charset=utf-8",
        }),
      });
    }
    if (url.pathname === "/demo" || url.pathname === "/demo.html") {
      return new Response(DEMO_HTML, {
        headers: noStoreHeaders({
          "Content-Type": "text/html; charset=utf-8",
        }),
      });
    }
    if (url.pathname === "/login" || url.pathname === "/login.html") {
      const identity = await verifySession(request, env);
      if (identity) {
        return redirectNoStore(`${url.origin}${authorizedTarget(identity, url.searchParams.get("next"))}`);
      }
      return new Response(LOGIN_HTML, {
        headers: noStoreHeaders({
          "Content-Type": "text/html; charset=utf-8",
        }),
      });
    }
    if (url.pathname === "/api/login" && request.method === "POST") {
      return handleLogin(request, env);
    }
    if (url.pathname === "/hasi-logo.png") {
      return serveAsset(env, "/hasi-logo.png", request);
    }
    if (url.pathname === "/logout") {
      return new Response(null, {
        status: 302,
        headers: noStoreHeaders({
          Location: "/login?loggedOut=1",
          "Set-Cookie": clearSessionCookie(),
        }),
      });
    }

    const identity = await verifySession(request, env);
    if (!identity) {
      if (url.pathname.startsWith("/api/")) return json({ error: "Unauthorized" }, 401);
      const next = safeRedirectTarget(`${url.pathname}${url.search}`, "/hasi-elektronic");
      return redirectNoStore(`${url.origin}/login?next=${encodeURIComponent(next)}`);
    }

    if (url.pathname === "/admin" || url.pathname === "/admin.html") {
      if (identity.role !== "admin") return redirectNoStore(`${url.origin}${defaultTarget(identity)}`, 303);
      return new Response(ADMIN_HTML, {
        headers: noStoreHeaders({ "Content-Type": "text/html; charset=utf-8" }),
      });
    }
    if (url.pathname === "/app" || url.pathname === "/app.html") {
      return redirectNoStore(`${url.origin}${defaultTarget(identity)}`, 303);
    }
    if (url.pathname.startsWith("/kunde/") || isCustomerPagePath(url.pathname)) {
      const tenantId = tenantFromPath(url.pathname);
      if (!tenantId) return json({ error: "Kunde nicht gefunden" }, 404);
      if (!canAccessTenant(identity, tenantId)) return redirectNoStore(`${url.origin}${defaultTarget(identity)}`, 303);
      return new Response(APP_HTML, {
        headers: noStoreHeaders({
          "Content-Type": "text/html; charset=utf-8",
        }),
      });
    }
    if (url.pathname === "/api/session") {
      return json({ email: identity.email, role: identity.role, tenantId: identity.tenantId });
    }
    if (url.pathname === "/api/status") return status(env, request, identity);
    const editorialProposeMatch = url.pathname.match(/^\/api\/editorial-weeks\/(\d{4}-\d{2}-\d{2})\/propose$/);
    if (editorialProposeMatch && request.method === "POST") return proposeEditorialWeek(request, env, identity, editorialProposeMatch[1]);
    const editorialApproveMatch = url.pathname.match(/^\/api\/editorial-weeks\/(\d{4}-\d{2}-\d{2})\/approve$/);
    if (editorialApproveMatch && request.method === "POST") return approveEditorialWeekFromPortal(request, env, identity, editorialApproveMatch[1]);
    const editorialRegenerateMatch = url.pathname.match(/^\/api\/editorial-weeks\/(\d{4}-\d{2}-\d{2})\/items\/([^/]+)\/regenerate$/);
    if (editorialRegenerateMatch && request.method === "POST") return updateEditorialItem(request, env, identity, editorialRegenerateMatch[1], decodeURIComponent(editorialRegenerateMatch[2]), true);
    const editorialItemMatch = url.pathname.match(/^\/api\/editorial-weeks\/(\d{4}-\d{2}-\d{2})\/items\/([^/]+)$/);
    if (editorialItemMatch && request.method === "PATCH") return updateEditorialItem(request, env, identity, editorialItemMatch[1], decodeURIComponent(editorialItemMatch[2]));
    if (url.pathname === "/api/customers" && request.method === "GET") {
      const rows = await customers(env, request);
      return json({ customers: identity.role === "admin" ? rows : rows.filter((row) => row.id === identity.tenantId) });
    }
    if (url.pathname === "/api/customers" && request.method === "POST") {
      if (identity.role !== "admin") return json({ error: "Forbidden" }, 403);
      return addCustomer(request, env);
    }
    if (url.pathname.startsWith("/api/customers/") && request.method === "PUT") {
      if (identity.role !== "admin") return json({ error: "Forbidden" }, 403);
      const id = decodeURIComponent(url.pathname.replace("/api/customers/", ""));
      return updateCustomer(request, env, id);
    }
    if (url.pathname.startsWith("/api/publish/") && request.method === "POST") {
      if (identity.role !== "admin" && identity.tenantId !== "hasi-elektronic") return json({ error: "Für diesen Kunden ist noch kein Instagram-Konto verbunden." }, 403);
      const [, , , type, ...fileParts] = url.pathname.split("/");
      return publishFromCloud(request, env, type, decodeURIComponent(fileParts.join("/") || ""));
    }
    if (url.pathname.startsWith("/api/publish-status/") && request.method === "POST") {
      if (identity.role !== "admin" && identity.tenantId !== "hasi-elektronic") return json({ error: "Forbidden" }, 403);
      const [, , , type, file, containerId] = url.pathname.split("/");
      return completeVideoPublish(request, env, type, decodeURIComponent(file || ""), decodeURIComponent(containerId || ""));
    }
    if (url.pathname.startsWith("/api/approve/") && request.method === "POST") {
      if (identity.role !== "admin" && identity.tenantId !== "hasi-elektronic") return json({ error: "Für diesen Kunden ist die Freigabe noch nicht eingerichtet." }, 403);
      const [, , , type, ...fileParts] = url.pathname.split("/");
      return approveFromCloud(request, env, type, decodeURIComponent(fileParts.join("/") || ""));
    }
    const factoryApprovalMatch = url.pathname.match(/^\/api\/factory-assets\/([^/]+)\/approve$/);
    if (factoryApprovalMatch && request.method === "POST") {
      return approveFactoryAsset(request, env, identity, decodeURIComponent(factoryApprovalMatch[1]));
    }
    const factoryStatusMatch = url.pathname.match(/^\/api\/factory-assets\/([^/]+)\/publish-status$/);
    if (factoryStatusMatch && request.method === "POST") {
      return factoryAssetPublishStatus(request, env, identity, decodeURIComponent(factoryStatusMatch[1]));
    }
  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error("Unhandled Worker error", error);
      if (new URL(request.url).pathname.startsWith("/api/")) {
        const status = Number(error?.status);
        return json({ ok: false, error: `Worker-Fehler: ${String(error.message || error)}` }, status >= 400 && status <= 599 ? status : 500);
      }
      return new Response("Interner Fehler", { status: 500 });
    }
  },
};
