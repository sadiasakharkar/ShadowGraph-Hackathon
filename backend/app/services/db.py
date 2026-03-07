import os
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient
from neo4j import AsyncGraphDatabase
import redis.asyncio as redis

mongo_client: AsyncIOMotorClient | None = None
mongo_db: Any = None
neo4j_driver = None
redis_client = None


async def connect_all() -> None:
    global mongo_client, mongo_db, neo4j_driver, redis_client
    mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
    mongo_db = mongo_client[os.getenv("MONGO_DB", "shadowgraph")]
    neo4j_driver = AsyncGraphDatabase.driver(
        os.getenv("NEO4J_URI", "bolt://localhost:7687"),
        auth=(os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD", "shadowgraph_password")),
    )
    redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)


async def close_all() -> None:
    if mongo_client:
        mongo_client.close()
    if neo4j_driver:
        await neo4j_driver.close()
    if redis_client:
        await redis_client.close()
