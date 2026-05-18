from app.config import get_settings

settings = get_settings()
print(f"Allowed Origins: {settings.allowed_origins}")
print(f"Type: {type(settings.allowed_origins)}")
