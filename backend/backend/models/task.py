from pydantic import BaseModel, Field, ConfigDict, GetJsonSchemaHandler, field_validator
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import CoreSchema, core_schema
from typing import Optional, List, Annotated, Any
from datetime import datetime
from bson import ObjectId

# Helper class to handle MongoDB ObjectId serialization
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler: Any) -> CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.is_instance_schema(ObjectId),
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema: CoreSchema, handler: GetJsonSchemaHandler) -> JsonSchemaValue:
        return handler(core_schema.str_schema())

class TaskBase(BaseModel):
    title: str
    subject: str
    description: Optional[str] = None
    priority: str = "medium"  # low, medium, high
    # We use Union/Optional and a specific field validator to prevent default dates
    due_date: Optional[datetime] = Field(default=None) 
    estimated_minutes: int = Field(default=60, alias="duration_minutes")
    completed: bool = False
    tags: List[str] = []

    # FIX: Prevents empty strings from UI or nulls from becoming 1970-01-01
    @field_validator('due_date', mode='before')
    @classmethod
    def validate_due_date(cls, v: Any) -> Optional[datetime]:
        if v == "" or v is None:
            return None
        return v

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = Field(default=None)
    estimated_minutes: Optional[int] = None
    completed: Optional[bool] = None
    tags: Optional[List[str]] = None

    @field_validator('due_date', mode='before')
    @classmethod
    def validate_due_date(cls, v: Any) -> Optional[datetime]:
        if v == "" or v is None:
            return None
        return v

class TaskResponse(TaskBase):
    # Annotated with PyObjectId ensures the frontend sees a string, not an object
    id: Annotated[PyObjectId, Field(alias="_id")]
    user_id: Annotated[PyObjectId, Field()]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    urgency_score: Optional[float] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        # Standard ISO format for the Next.js frontend
        json_encoders = {datetime: lambda v: v.isoformat()}
    )

class TaskInDB(TaskBase):
    id: Annotated[PyObjectId, Field(alias="_id")]
    user_id: Annotated[PyObjectId, Field()]
    created_at: datetime
    updated_at: datetime
    urgency_score: Optional[float] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )