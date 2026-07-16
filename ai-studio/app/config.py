from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import os


class Settings(BaseSettings):
    mistral_api_key: str = ""

    upload_dir: str = os.path.abspath("./uploads")
    max_file_size: int = 50 * 1024 * 1024
    allowed_extensions: str = "jpg,jpeg,png,bmp,tiff,pdf"

    api_host: str = "0.0.0.0"
    api_port: int = 9000
    api_env: str = "development"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env")

    @field_validator("mistral_api_key", mode="before")
    @classmethod
    def validate_mistral_api_key(cls, v):
        if v is None or str(v).strip() == "":
            return ""
        return str(v)

    @field_validator("allowed_extensions", "cors_origins", mode="before")
    @classmethod
    def validate_comma_separated(cls, v):
        if isinstance(v, str):
            return v
        return ",".join(v)


settings = Settings()
