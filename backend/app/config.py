from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/tensortonic"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "supersecretjwtkeyforlocaldevelopmentonly12345"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Judge0 Settings (can be empty to use local subprocess fallback)
    JUDGE0_URL: str = ""
    JUDGE0_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
