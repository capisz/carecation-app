# Carecation Travel Search (Amadeus)

## Amadeus API setup

1. Create a free Amadeus Self-Service account at [developers.amadeus.com](https://developers.amadeus.com/).
2. Create an application in the Amadeus dashboard and copy:
   - `AMADEUS_CLIENT_ID`
   - `AMADEUS_CLIENT_SECRET`
3. Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

4. Install dependencies and run locally:

```bash
npm install
npm run dev
```

The travel page uses:
- `POST /api/flights/search` for flight offers
- `POST /api/hotels/search` for hotel offers

Secrets are read server-side only via `lib/amadeus.ts` and are never exposed in client code.
