from pydantic import BaseModel, Field, ConfigDict, GetJsonSchemaHandler, field_validator
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import CoreSchema, core_schema
from typing import Optional, List, Annotated, Any, Union
from datetime import datetime, date, time
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: Any
    ) -> CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.is_instance_schema(ObjectId),
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return handler(core_schema.str_schema())

class SleepLogBase(BaseModel):
    # We use Union to allow strings temporarily while validating
    date: Union[datetime, date, str]
    sleep_time: Union[time, str]
    wake_time: Union[time, str]
    hours_slept: float
    quality_rating: int = Field(ge=1, le=10)
    notes: Optional[str] = None
    
    @field_validator("date", mode="before")
    @classmethod
    def parse_date(cls, v: Any) -> Any:
        if isinstance(v, str) and 'T' in v:
            return v.split('T')[0] # Turns "2026-01-17T..." into "2026-01-17"
        return v
    @field_validator("sleep_time", "wake_time", mode="before")
    @classmethod
    def parse_times(cls, v: Any) -> Any:
        # If the frontend sends a full ISO string, extract just the HH:MM:SS part
        if isinstance(v, str) and 'T' in v:
            return v.split('T')[1][:8]
        return v
class SleepLogCreate(SleepLogBase):
    pass

class SleepLogResponse(SleepLogBase):
    id: Annotated[PyObjectId, Field(alias="_id")]
    user_id: PyObjectId
    created_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )