# Identity Graph Schema (Neo4j)

## Node Labels
- `GraphVersion`
- `UserIdentity`
- `Account`
- `Image`
- `TextArtifact`
- `Repository`

## Relationship Types
- `HAS_ACCOUNT`
- `HAS_IMAGE`
- `SIMILAR_USERNAME`
- `SIMILAR_IMAGE`
- `SIMILAR_TEXT`
- `CONNECTED_TO`

## Versioning Model
- Each scan creates a new `GraphVersion` node with:
  - `id`
  - `user_id`
  - `scan_id`
  - `source`
  - `timestamp`
- Nodes in a version carry:
  - `entity_id`
  - `user_id`
  - `graph_version_id`
  - `confidence_score`
  - `source`
  - `timestamp`
- Edges in a version carry:
  - `graph_version_id`
  - `raw_score`
  - `confidence_score`
  - `source`
  - `timestamp`

## Snapshot Access
- `GET /graph/latest`
- `GET /graph/version/{id}`
