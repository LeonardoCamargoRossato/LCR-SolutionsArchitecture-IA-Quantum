# Architecture

The portfolio follows: **React UI → Application Services → Repository Interfaces → Infrastructure Adapters → Firebase**.

No React component imports Firebase. Domain models contain no Firestore `Timestamp`, `DocumentReference`, snapshots or Storage types.

## Layers
- `domain/`: provider-independent models and repository contracts.
- `application/services/`: use cases consumed by UI.
- `infrastructure/firebase/`: Firebase SDK, collection names, Storage paths and mappers.
- `infrastructure/memory/`: local fallback/test adapters.
- `bootstrap/services.ts`: composition root. This is the main file to change when replacing Firebase.
- `providers/SiteContentProvider.tsx`: session cache/fallback for public content.

## Replace Firebase
Implement the same interfaces, e.g. `SupabaseProjectRepository`, `S3MediaRepository`, then swap instances in `bootstrap/services.ts`. Pages and components remain unchanged.
