from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Any
from uuid import uuid4

from bson import ObjectId


class FakeInsertResult:
    def __init__(self, inserted_id: Any):
        self.inserted_id = inserted_id


class FakeCursor:
    def __init__(self, docs: list[dict[str, Any]]):
        self.docs = docs
        self._sort = []
        self._idx = 0

    def sort(self, pairs: list[tuple[str, int]]):
        self._sort = pairs
        return self

    def __aiter__(self):
        docs = list(self.docs)
        for key, direction in reversed(self._sort):
            reverse = direction < 0
            docs.sort(key=lambda d: d.get(key, datetime.fromtimestamp(0, tz=timezone.utc)), reverse=reverse)
        self.docs = docs
        return self

    async def __anext__(self):
        if self._idx >= len(self.docs):
            raise StopAsyncIteration
        item = self.docs[self._idx]
        self._idx += 1
        return item


@dataclass
class FakeCollection:
    docs: list[dict[str, Any]]

    async def find_one(self, query: dict[str, Any], sort: list[tuple[str, int]] | None = None):
        filtered = [d for d in self.docs if all(_matches(d, k, v) for k, v in query.items())]
        if not filtered:
            return None
        if sort:
            for key, direction in reversed(sort):
                filtered.sort(key=lambda d: d.get(key), reverse=direction < 0)
        return dict(filtered[0])

    async def insert_one(self, doc: dict[str, Any]) -> FakeInsertResult:
        d = dict(doc)
        d.setdefault("_id", ObjectId())
        self.docs.append(d)
        return FakeInsertResult(d["_id"])

    async def update_one(self, query: dict[str, Any], update: dict[str, Any], upsert: bool = False):
        target = await self.find_one(query)
        if target:
            idx = self.docs.index(next(d for d in self.docs if d["_id"] == target["_id"]))
            self.docs[idx] = {**self.docs[idx], **update.get("$set", {})}
            return
        if upsert:
            new_doc = {**query, **update.get("$set", {})}
            await self.insert_one(new_doc)

    def find(self, query: dict[str, Any]) -> FakeCursor:
        filtered = [dict(d) for d in self.docs if all(_matches(d, k, v) for k, v in query.items())]
        return FakeCursor(filtered)


def _matches(doc: dict[str, Any], key: str, value: Any) -> bool:
    if isinstance(value, dict) and "$in" in value:
        return doc.get(key) in value["$in"]
    return doc.get(key) == value


def make_fake_db() -> Any:
    return SimpleNamespace(
        users=FakeCollection([]),
        scan_results=FakeCollection([{"_id": str(uuid4()), "user_id": "user-1", "risk": {"overall_risk_score": 0.61, "category": "high"}}]),
        defense_alerts=FakeCollection([]),
    )

