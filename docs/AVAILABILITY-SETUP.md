# Nastavení automatické dostupnosti (Google Calendar API)

Web tahá obsazenost apartmánu z **neveřejného** Google Kalendáře přes Calendar API,
přihlášené účtem, který má na kalendář přístup. Kalendář zůstává privátní — na web
jdou jen datumy „obsazeno/volno", jména hostů se nikdy neukládají.

Stačí nastavit jednou. Pak GitHub Action běží 2× denně a web se sám aktualizuje.

## A. Google Cloud (≈10 min)

1. <https://console.cloud.google.com/> → nahoře vytvoř nový projekt (např. `tenerife-availability`).
2. **APIs & Services → Library** → vyhledej „Google Calendar API" → **Enable**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External** → Create.
   - Vyplň app name, support email, developer email.
   - Scopes → přidej `.../auth/calendar.readonly`.
   - **Publishing status → Publish app → „In production".** (Důležité: v testovacím režimu token vyprší po 7 dnech a automatika se rozbije.) Varování „neověřená appka" je v pořádku — appku používáš jen ty.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Desktop app** → Create.
   - Zkopíruj si **Client ID** a **Client secret**.

## B. Získej refresh token (jednou, lokálně)

V terminálu ve složce `tenerife-guide` (PowerShell):

```powershell
$env:GOOGLE_CLIENT_ID="...client id z A4..."
$env:GOOGLE_CLIENT_SECRET="...client secret z A4..."
node scripts/google-auth.mjs
```

Otevře se odkaz → přihlas se účtem, který má přístup ke kalendáři → odsouhlas.
V terminálu se vypíše **refresh token**.

## C. Vlož secrets do GitHubu

Repo `kristinakumberova/tenerife-guide` → **Settings → Secrets and variables → Actions
→ New repository secret**. Přidej:

| Name | Hodnota |
|---|---|
| `GOOGLE_CLIENT_ID` | Client ID z kroku A4 |
| `GOOGLE_CLIENT_SECRET` | Client secret z kroku A4 |
| `GOOGLE_REFRESH_TOKEN` | token z kroku B |
| `GOOGLE_CALENDAR_ID` | volitelné — výchozí ID je už v kódu |

## Hotovo

- Workflow běží automaticky 2× denně.
- Ručně hned: **Actions → Deploy to GitHub Pages → Run workflow**.
- Na web jdou vždy jen datumy. Jména hostů zůstávají v privátním kalendáři.
