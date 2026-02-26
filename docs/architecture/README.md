# Architecture Diagrams

This folder contains three Mermaid architecture diagrams:

1. [High-Level Architecture](./01-high-level.md)
2. [C4 Context](./02-c4-context.md)
3. [C4 Container](./03-c4-container.md)

---

## 1) High-Level Architecture

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

## 2) C4 Context

```mermaid
C4Context
title Carecation - System Context

Person(user, "Traveler / Patient", "Researches providers and plans care travel")
Person(admin, "Admin", "Maintains provider directory content")
System(carecation, "Carecation Web App", "Next.js app for provider discovery, itinerary generation, and quote request intake")

Rel(user, carecation, "Browses providers, compares options, generates itinerary, submits quote request")
Rel(admin, carecation, "Manages provider records in admin UI")
```

## 3) C4 Container

```mermaid
C4Container
title Carecation - Container View

Person(user, "Traveler / Patient")
Person(admin, "Admin")

System_Boundary(carecation, "Carecation Web App") {
  Container(web, "Web UI", "Next.js App Router + React", "Landing, intake flow, results, provider detail, itinerary, request, admin")
  Container(domain, "Domain Services", "TypeScript modules", "Provider filtering/sorting, category helpers, trip-cost estimation")
  ContainerDb(mockdata, "Provider Dataset", "In-memory mock module", "Static provider records and constants")
}

Rel(user, web, "Uses", "HTTPS")
Rel(admin, web, "Uses admin screens", "HTTPS")
Rel(web, domain, "Invokes filtering and calculations", "In-process")
Rel(domain, mockdata, "Reads provider data", "In-process")
```
