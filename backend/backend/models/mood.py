from pydantic import BaseModel, Field, ConfigDict, GetJsonSchemaHandler, field_validator
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import CoreSchema, core_schema
from typing import Optional, List, Annotated, Any, Union
from datetime import datetime, date
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

class MoodEntryBase(BaseModel):
    date: Union[date, datetime, str]
    mood_score: int = Field(ge=1, le=6)
    energy_level: int = Field(ge=1, le=10)
    stress_level: int = Field(ge=1, le=5)
    notes: Optional[str] = None
    tags: List[str] = []
    
    @field_validator("date", mode="before")
    @classmethod
    def parse_date(cls, v: Any) -> datetime:
        if isinstance(v, str):
            return datetime.fromisoformat(v)
        elif isinstance(v, date) and not isinstance(v, datetime):
            return datetime.combine(v, datetime.min.time())
        return v

class MoodEntryCreate(MoodEntryBase):
    pass

class MoodEntryResponse(MoodEntryBase):
    id: Annotated[PyObjectId, Field(alias="_id")]
    user_id: Annotated[PyObjectId, Field()]
    created_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class MoodEntryInDB(MoodEntryBase):
    id: Annotated[PyObjectId, Field(alias="_id")]
    user_id: Annotated[PyObjectId, Field()]
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )
