# High-Level Architecture

```mermaid
flowchart LR
  User["User"]

  subgraph App["Next.js App Router"]
    Layout["Root Layout + AppShell"]
    Landing["Landing (/)"]
    Intake["Intake Wizard (/intake)"]
    Results["Provider Search Results (/results)"]
    ProviderDetail["Provider Detail (/provider/[id])"]
    Itinerary["Itinerary (/itinerary)"]
    Request["Quote Request (/request)"]
    Admin["Admin Providers (/admin/providers)"]
  end

  subgraph Domain["Domain + Data Layer"]
    ProviderRepo["providers-repo.ts\n(filter/sort/query)"]
    ProviderMock["mock/providers.ts\n(seed data + cost helpers)"]
  end

  User --> Landing
  User --> Intake
  User --> Results
  User --> ProviderDetail
  User --> Itinerary
  User --> Request

  Layout --> Landing
  Layout --> Intake
  Layout --> Results
  Layout --> ProviderDetail
  Layout --> Itinerary
  Layout --> Request
  Layout --> Admin

  Intake --> ProviderRepo
  Results --> ProviderRepo
  ProviderDetail --> ProviderRepo
  Itinerary --> ProviderRepo
  Request --> ProviderRepo
  Admin --> ProviderRepo

  ProviderRepo --> ProviderMock
```

## Legend

- `App Router`: User-facing pages and shared shell/layout.
- `Domain + Data Layer`: In-process TypeScript modules for provider querying and trip-cost estimation.
- This version is mock-data based (no live external APIs in the runtime flow).
