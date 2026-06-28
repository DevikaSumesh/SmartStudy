from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import Optional, Annotated
from datetime import datetime

# 1. This is the "Magic" fix for MongoDB ObjectIds in Pydantic v2
# It converts the ObjectId to a string before validating it.
PyObjectId = Annotated[str, BeforeValidator(str)]

# 2. Define a Base class so you don't repeat yourself
class PomodoroSessionBase(BaseModel):
    task_id: Optional[str] = None
    subject: str
    duration_minutes: int = 25
    actual_duration_minutes: Optional[int] = 0
    completed: bool = False
    start_time: datetime = Field(default_factory=datetime.now)

# 3. This is what the DB looks like
class PomodoroSession(PomodoroSessionBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders = {datetime: lambda v: v.isoformat()}
    )

class PomodoroSessionCreate(BaseModel):
    task_id: Optional[str] = None
    subject: str
    duration_minutes: int = 25

class PomodoroSessionUpdate(BaseModel):
    completed: Optional[bool] = None
    interrupted: Optional[bool] = None
    actual_duration_minutes: Optional[int] = None
    notes: Optional[str] = None

# 4. Use this for the Response (solves your 500 error)
class PomodoroSessionResponse(PomodoroSessionBase):
    id: PyObjectId = Field(alias="_id")
    user_id: PyObjectId
    end_time: Optional[datetime] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )