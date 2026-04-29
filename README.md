# Insighta CLI

Command‑line interface for the Insighta Labs Profile Intelligence System – allows engineers and power users to query, search, export, and manage demographic profiles from the terminal.

## Installation

```bash
# Install directly from GitHub
npm install -g https://github.com/Kpellehboy/insighta-cli.git

# Or clone and link for development
git clone https://github.com/Kpellehboy/insighta-cli.git
cd insighta-cli
npm install
npm link
After installation, the insighta command is available globally.

Commands
Authentication
Command	Description
insighta login	Start PKCE OAuth flow, store tokens in ~/.insighta/credentials.json.
insighta logout	Remove stored tokens and invalidate refresh token on the server.
insighta whoami	Display current user info (username, role, email).
Profiles
Command	Description
insighta profiles-list [options]	List profiles with filters, sorting, pagination.
insighta profiles-get <id>	Fetch a single profile by UUID.
insighta profiles-search <query>	Natural language search (e.g., "young males from nigeria").
insighta profiles-create --name <name>	Create a new profile (admin only).
insighta profiles-export [options]	Export filtered profiles to CSV (saves in current working directory).
Options for profiles-list
Option	Description
--gender <male/female>	Filter by gender.
--country <code>	Filter by two‑letter country code (e.g., NG, KE).
--age-group <group>	One of child, teenager, adult, senior.
--min-age <age>	Minimum age.
--max-age <age>	Maximum age.
--sort-by <field>	age, created_at, or gender_probability.
--order <asc/desc>	Sort order.
--page <number>	Page number (default 1).
--limit <number>	Items per page (max 50, default 10).
Examples
bash
# List first 10 profiles
insighta profiles-list

# Filter males from Nigeria, age 25‑35, sorted by age descending
insighta profiles-list --gender male --country NG --min-age 25 --max-age 35 --sort-by age --order desc

# Natural language search
insighta profiles-search "young females from kenya"

# Export all profiles to CSV
insighta profiles-export --format csv

# Export filtered profiles
insighta profiles-export --format csv --gender female --country NG

# Create a new profile (admin only)
insighta profiles-create --name "Ada Lovelace"
Authentication Flow (PKCE)
The CLI implements the Proof Key for Code Exchange (PKCE) extension of OAuth 2.0:

Login command:

Generates a code_verifier (random string) and code_challenge (SHA‑256 hash of the verifier).

Generates a random state parameter.

Opens the browser to GET /auth/github?state=...&code_challenge=...&code_verifier=... (backend endpoint).

Starts a local HTTP server on a random available port (3001‑3010) and waits for the callback.

Backend stores verifier: The backend saves the code_verifier in a temporary OAuthState collection (expires after 5 minutes).

User authorises on GitHub.

GitHub redirects to the backend’s callback URL with code and state.

Backend:

Retrieves the code_verifier using the state.

Exchanges code + code_verifier for a GitHub access token.

Fetches user data, creates/updates a local user.

Issues an access token (JWT, expires 3 min) and a refresh token (random, expires 5 min, stored in DB).

Stores the tokens in an AuthSession collection keyed by the state.

CLI polls GET /auth/token?state=... every 2 seconds until the tokens are available, then saves them to ~/.insighta/credentials.json.

Token Handling
Storage – Tokens are saved in ~/.insighta/credentials.json (Unix) or %USERPROFILE%\.insighta\credentials.json (Windows).

Auto‑refresh – Before every API request, the CLI checks the access token expiry. If expired, it automatically sends the refresh token to the backend (POST /auth/refresh) to obtain a new pair. The old refresh token is invalidated.

Fallback – If refresh fails (e.g., refresh token expired), the CLI requires the user to re‑run insighta login.

Role Enforcement (Server‑side)
Admin role – Can use profiles-create and profiles-delete (delete not yet implemented in CLI, but backend enforces).

Analyst role – Can use list, get, search, export. Attempts to create profiles will receive a 403 Forbidden response.

The CLI does not store the role; it relies on backend error messages.

Natural Language Search
The CLI forwards the raw query string to the backend endpoint /api/profiles/search?q=....
The backend’s rule‑based parser (documented in the backend README) interprets phrases like:

"young males from nigeria" → gender=male, min_age=16, max_age=24, country_id=NG

"females above 30" → gender=female, min_age=30

"adult males from kenya" → gender=male, age_group=adult, country_id=KE

Limitations (same as backend):

No boolean logic (AND/OR).

No negation.

Single country only.

Country names limited to a hard‑coded mapping.

Error Handling
Network errors are displayed in red with a descriptive message.

If the backend returns a 401, the CLI attempts a silent refresh. If refresh fails, it prompts the user to log in again.

Rate limiting (429) or server errors (5xx) are printed as received from the backend.

Environment Variables
Variable	Default	Description
INSIGHTA_API_URL	http://localhost:3000	Base URL of the Insighta backend (set to your production URL).
GITHUB_CLIENT_ID	(not used directly by CLI)	The backend uses this; the CLI only needs the backend URL.
Development
bash
git clone https://github.com/Kpellehboy/insighta-cli.git
cd insighta-cli
npm install
npm link          # makes `insighta` available globally
# Edit code, test locally
Related Repositories
Backend: https://github.com/Kpellehboy/Build-Insighta-Labs-Secure-Access-Multi-Interface-Integration.git

Web portal: https://github.com/Kpellehboy/insighta-web.git
