from pydantic import BaseModel, EmailStr, Field, ConfigDict, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import CoreSchema, core_schema
from typing import Optional, List, Annotated, Any
from datetime import datetime
from bson import ObjectId

# This class fixes the "500 Internal Server Error" on the /docs page
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

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    
class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: Annotated[PyObjectId, Field(alias="_id")]
    created_at: datetime
    
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

# --- THIS WAS THE MISSING CLASS ---


class UserInDB(UserBase):
    id: Annotated[PyObjectId, Field(alias="_id")]
    hashed_password: str
    created_at: datetime
    
    subjects: List[str] = []
    goals: List[str] = []
    preferred_study_hours: int = 8
    sleep_target_hours: int = 8
    break_preference: int = 15

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )