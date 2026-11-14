from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo
from typing import Tuple, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .models import PetStreak
from .schemas import PetStatusResponse, PetCheckinResponse

# Configurable constants
TIMEZONE_VN = ZoneInfo("Asia/Ho_Chi_Minh")
MISSED_DAY_RESET_STREAK = 1  # Streak reset value after missing a day

# Stage day ranges: (stage_num, min_days, max_days)
STAGE_THRESHOLDS = [
    (1, 0, 3),      # Trứng
    (2, 4, 10),     # Nứt vỏ
    (3, 11, 100),   # Vịt con
    (4, 101, None)  # Trưởng thành
]

def get_server_today() -> date:
    """Returns today's date in Asia/Ho_Chi_Minh zone."""
    return datetime.now(TIMEZONE_VN).date()

def calculate_stage(streak: int) -> int:
    for stage, min_d, max_d in STAGE_THRESHOLDS:
        if max_d is None:
            if streak >= min_d:
                return stage
        elif min_d <= streak <= max_d:
            return stage
    return 1

def calculate_days_to_next_stage(streak: int) -> Optional[int]:
    current_stage = calculate_stage(streak)
    if current_stage >= len(STAGE_THRESHOLDS):
        return None
    next_min = STAGE_THRESHOLDS[current_stage][1]
    return max(0, next_min - streak)

def get_unlocked_stages(longest_streak: int) -> List[int]:
    highest_stage = calculate_stage(longest_streak)
    return list(range(1, highest_stage + 1))

router = APIRouter(prefix="/api/pet", tags=["Streak Pet"])

# Replace this dependency with your real authentication provider
def get_current_user_id() -> str:
    # Example placeholder: extract user_id from JWT token or session
    return "user_default"

def get_db():
    # Example placeholder: yield your SQLAlchemy session
    raise NotImplementedError("Provide your get_db session dependency")

@router.get("/status", response_model=PetStatusResponse)
def get_pet_status(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    today = get_server_today()
    record = db.query(PetStreak).filter(PetStreak.user_id == user_id).first()

    if not record:
        return PetStatusResponse(
            current_streak=0,
            longest_streak=0,
            checked_in_today=False,
            stage=1,
            unlocked_stages=[1],
            days_to_next_stage=STAGE_THRESHOLDS[1][1]
        )

    checked_in = record.last_checkin_date == today
    stage = calculate_stage(record.current_streak)
    unlocked = get_unlocked_stages(record.longest_streak)
    days_to_next = calculate_days_to_next_stage(record.current_streak)

    return PetStatusResponse(
        current_streak=record.current_streak,
        longest_streak=record.longest_streak,
        checked_in_today=checked_in,
        stage=stage,
        unlocked_stages=unlocked,
        days_to_next_stage=days_to_next
    )

@router.post("/checkin", response_model=PetCheckinResponse)
def checkin_pet(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    today = get_server_today()

    # Lock row for update in single transaction to avoid double counting / race conditions
    with db.begin():
        record = (
            db.query(PetStreak)
            .filter(PetStreak.user_id == user_id)
            .with_for_update()
            .first()
        )

        if not record:
            record = PetStreak(
                user_id=user_id,
                current_streak=1,
                longest_streak=1,
                last_checkin_date=today
            )
            db.add(record)
            old_stage = 1
            new_stage = calculate_stage(1)
            evolved = new_stage > old_stage
        else:
            old_stage = calculate_stage(record.current_streak)

            if record.last_checkin_date == today:
                # Idempotent: already checked in today
                evolved = False
                new_stage = old_stage
            else:
                yesterday = today - timedelta(days=1)
                if record.last_checkin_date == yesterday:
                    record.current_streak += 1
                else:
                    # Missed at least one day
                    record.current_streak = MISSED_DAY_RESET_STREAK

                if record.current_streak > record.longest_streak:
                    record.longest_streak = record.current_streak

                record.last_checkin_date = today
                new_stage = calculate_stage(record.current_streak)
                evolved = new_stage > old_stage

    unlocked = get_unlocked_stages(record.longest_streak)
    days_to_next = calculate_days_to_next_stage(record.current_streak)

    return PetCheckinResponse(
        current_streak=record.current_streak,
        longest_streak=record.longest_streak,
        checked_in_today=True,
        stage=new_stage,
        unlocked_stages=unlocked,
        days_to_next_stage=days_to_next,
        evolved=evolved,
        new_stage=new_stage if evolved else None
    )
