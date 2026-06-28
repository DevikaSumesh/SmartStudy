from pydantic import BaseModel, Field, ConfigDict, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import CoreSchema, core_schema
from typing import Optional, List, Annotated, Any
from datetime import datetime
from bson import ObjectId

# --- MongoDB Helper ---
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

# --- Chat Models ---

# This satisfies the "ImportError: ChatRequest"
class ChatRequest(BaseModel):
    question: str

# This satisfies the "ImportError: ChatResponse"
class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = []

class ChatMessageBase(BaseModel):
    message: str
    role: str = "user"  # user or assistant

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    # Added 'id' as 'id' and aliased to '_id' for MongoDB
    id: Annotated[PyObjectId, Field(alias="_id", default_factory=PyObjectId)]
    user_id: Annotated[PyObjectId, Field()]
    response: Optional[str] = None
    context_used: Optional[List[str]] = None
    created_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders = {ObjectId: str}
    )

# --- Document Models ---

class DocumentInfo(BaseModel):
    filename: str
    chunks: int
    uploaded_at: Optional[datetime] = None

class DocumentResponse(BaseModel):
    id: Annotated[PyObjectId, Field(alias="_id", default_factory=PyObjectId)]
    user_id: Annotated[PyObjectId, Field()]
    filename: str
    content_type: str
    size: int
    chunk_count: int
    uploaded_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders = {ObjectId: str}
    )