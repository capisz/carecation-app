# C4 Container Diagram

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

## Legend

- `Web UI`: All page-level UI and navigation.
- `Domain Services`: Business logic for querying providers and computing estimate ranges.
- `Provider Dataset`: Current static/mock data source.
