"""
One-time migration: drop the old users table and recreate with the new schema.
Run from the backend directory: python migrate_users.py
"""
from db import engine, Base
from models import User  # noqa: F401 – registers the model with Base
from sqlalchemy import text

print("Ensuring 'users' table matches new schema ...")
with engine.begin() as conn:
    # if the table already exists drop it (this script is destructive!)
    conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
    print("Dropped existing table.")

    print("Creating tables with new schema ...")
    Base.metadata.create_all(bind=engine)

    # make sure the password column is nullable (older schemas made it NOT NULL)
    try:
        conn.execute(text(
            "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL"
        ))
        print("Updated hashed_password column to nullable.")
    except Exception:
        # if the column doesn't exist or already nullable, ignore
        pass

print("Done! 'users' table created/updated successfully.")
