from typing import List, Optional
from pydantic import BaseModel

class PetStatusResponse(BaseModel):
    current_streak: int
    longest_streak: int
    checked_in_today: bool
    stage: int
    unlocked_stages: List[int]
    days_to_next_stage: Optional[int]

class PetCheckinResponse(PetStatusResponse):
    evolved: bool
    new_stage: Optional[int]
