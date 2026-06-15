from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.config import settings
from app.routers import auth, problems, submissions

# Auto-create tables on startup (as a fallback or in-development helper)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database table creation fallback skipped/failed: {e}")

app = FastAPI(
    title="Neural Mind API",
    description="Backend API for Neural Mind - Machine Learning problem platform",
    version="1.0.0"
)

# Configure CORS
# Allow frontend development server and production FRONTEND_URL
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(problems.router)
app.include_router(submissions.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to TensorTonic Clone API", "status": "running"}
