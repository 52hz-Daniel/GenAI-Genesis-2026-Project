# Auth setup: Google, Microsoft (Azure AD), Apple

After the app is implemented, **you** need to create the app registrations and set environment variables. Google is required; Microsoft and Apple are optional.

---

## Google: Fix "redirect_uri_mismatch" in production

1. **Get your production URL** from Vercel (e.g. `https://genesis-2026-project.vercel.app`).
2. **Vercel env:** Project → Settings → Environment Variables. Set **Production**:  
   `NEXTAUTH_URL` = `https://<your-vercel-domain>` (no trailing slash). Redeploy if you change it.
3. **Google Cloud Console:** [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) → open your **OAuth 2.0 Client ID** (Web application) → **Authorized redirect URIs** → **Add URI**:  
   `https://<your-vercel-domain>/api/auth/callback/google`  
   (e.g. `https://genesis-2026-project.vercel.app/api/auth/callback/google`) → **Save**.
4. Try sign-in again (no code change needed).

---

## Where to set env vars

- **Local:** `.env.local` in the project root (do not commit secrets).
- **Production (e.g. Vercel):** Project → Settings → Environment Variables. Add each name and value, then redeploy.

---

## Microsoft (Azure AD)

### 1. Register the app in Azure

1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations** → **New registration**.
2. **Name:** e.g. `Aptitude AI`.
3. **Supported account types:** Choose one:
   - "Accounts in any organizational directory and personal Microsoft accounts" (work/school + personal)
   - Or "Single tenant" if you only want your org.
4. **Redirect URI:**  
   - Platform: **Web**  
   - URL: `https://<YOUR_PRODUCTION_DOMAIN>/api/auth/callback/azure-ad`  
   - For local dev: `http://localhost:3000/api/auth/callback/azure-ad` (if your tenant allows localhost).
5. Register.

### 2. Get client ID and tenant ID

- **Overview** → copy **Application (client) ID** and **Directory (tenant) ID**.

### 3. Create a client secret

- **Certificates & secrets** → **New client secret** → add description, expiry → **Add**.
- Copy the **Value** immediately (it is shown only once).

### 4. Env vars (you fill these)

| Variable | Where to get it |
|----------|------------------|
| `AZURE_AD_CLIENT_ID` | Application (client) ID from Overview |
| `AZURE_AD_CLIENT_SECRET` | Secret value from Certificates & secrets |
| `AZURE_AD_TENANT_ID` | Directory (tenant) ID from Overview. Use `common` for multi-tenant/personal, or omit to default to `common`. |

If these are set, the sign-in page will show "Sign in with Microsoft".

---

## Apple (Sign in with Apple)

### 1. Apple Developer account

You need a paid [Apple Developer](https://developer.apple.com) account.

### 2. Create an App ID (if you don’t have one)

- **Certificates, Identifiers & Profiles** → **Identifiers** → **+**.
- **App IDs** → continue → **App** → description and bundle ID → enable **Sign in with Apple** → Register.

### 3. Create a Services ID (for web)

- **Identifiers** → **+** → **Services IDs** → description and identifier (e.g. `com.yourapp.aptitudeai.service`) → Register.
- Open the new Services ID → enable **Sign in with Apple** → **Configure**:
  - **Primary App ID:** select your App ID.
  - **Domains and Subdomains:** your production domain (e.g. `your-app.vercel.app`).
  - **Return URLs:** `https://<YOUR_DOMAIN>/api/auth/callback/apple`.
- Save.

### 4. Create a Key (for client secret)

- **Keys** → **+** → name (e.g. "Sign in with Apple key") → enable **Sign in with Apple** → **Configure** → select your primary App ID → Save → **Continue** → **Register**.
- **Download the .p8 file** (once only). Note the **Key ID**.
- **Membership** → **Account** → note your **Team ID** and **Services ID** (client id).

### 5. Generate the client secret (JWT)

Apple requires the client secret to be a **JWT**. You can generate it with a script or an online tool (e.g. [apple-gen-secret](https://bal.so/apple-gen-secret)) using:

- **Team ID**
- **Key ID**
- **Client ID** (your Services ID identifier)
- **Private key** (contents of the .p8 file)

The JWT is short-lived; Apple often accepts secrets valid for 6 months. Generate a new one when it expires.

### 6. Env vars (you fill these)

| Variable | Description |
|----------|-------------|
| `APPLE_ID` | Services ID identifier (e.g. `com.yourapp.aptitudeai.service`) |
| `APPLE_CLIENT_SECRET` | The generated JWT string (full token). Regenerate when it expires. |

If both are set, the sign-in page will show "Sign in with Apple".

**Note:** Apple does not allow `localhost` as a return URL. For local testing you need HTTPS (e.g. ngrok) and add that URL in the Services ID return URLs.

---

## Callback URLs summary

| Provider | Callback URL |
|----------|--------------|
| Google | `https://<DOMAIN>/api/auth/callback/google` (set in Google Cloud Console) |
| Microsoft | `https://<DOMAIN>/api/auth/callback/azure-ad` (set in Azure app registration) |
| Apple | `https://<DOMAIN>/api/auth/callback/apple` (set in Apple Services ID) |

Use your production domain (e.g. `https://your-app.vercel.app`) and, for local, `http://localhost:3000` where the provider allows it.
