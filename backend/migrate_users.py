"""
One-time migration: drop the old users table and recreate with the new schema.
Run from the backend directory: python migrate_users.py
"""
from db import engine, Base
from models import User  # noqa: F401 – registers the model with Base
from sqlalchemy import text

print("Dropping old 'users' table (if exists) ...")
with engine.begin() as conn:
    conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
print("Dropped.")

print("Creating tables with new schema ...")
Base.metadata.create_all(bind=engine)
print("Done! New 'users' table created successfully.")
