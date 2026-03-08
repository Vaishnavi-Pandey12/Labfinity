from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.sql import func

from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    # allow NULL because Google‑only accounts will not have a local password
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, nullable=True)
    profile_picture = Column(String, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"