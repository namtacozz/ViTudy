from datetime import datetime, date
from sqlalchemy import Column, String, Integer, Date, DateTime, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class PetStreak(Base):
    __tablename__ = "pet_streaks"

    user_id = Column(String(64), primary_key=True, index=True)
    current_streak = Column(Integer, nullable=False, default=0)
    longest_streak = Column(Integer, nullable=False, default=0)
    last_checkin_date = Column(Date, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())
