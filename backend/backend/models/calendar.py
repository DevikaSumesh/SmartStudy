from pydantic import BaseModel, Field, ConfigDict, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import CoreSchema, core_schema
from typing import Optional, Annotated, Any
from datetime import datetime
from bson import ObjectId

# This class allows FastAPI to generate the OpenAPI schema for ObjectIds
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

class CalendarEventBase(BaseModel):
    title: str
    subject: str
    start_time: datetime
    end_time: datetime
    event_type: str = "study"  # study, break, exam, other
    description: Optional[str] = None
    is_scheduled_by_ai: bool = False

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    event_type: Optional[str] = None
    description: Optional[str] = None

class CalendarEventResponse(CalendarEventBase):
    # Ensure both use the PyObjectId type
    id: Annotated[PyObjectId, Field(alias="_id")]
    user_id: PyObjectId 
    created_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class CalendarEventInDB(CalendarEventBase):
    # Use Annotated PyObjectId here as well
    id: Annotated[PyObjectId, Field(alias="_id")]
    user_id: Annotated[PyObjectId, Field()]
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )