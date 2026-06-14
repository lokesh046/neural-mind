# Neural Mind

Neural Mind is a full-stack Machine Learning (ML) coding challenge platform. Users can write python solutions for tensor and ML problems (like Positional Encodings, Softmax, MSE loss), read related theory, view math formulas (rendered in LaTeX), edit custom test case inputs, and submit their solutions for real-time grading.

## Project Structure
- `backend/`: FastAPI + Python application. Includes routers, models, schemas, and a code execution grading engine.
- `frontend/`: React + TypeScript + Vite + Tailwind CSS application. Includes Monaco Editor and resizable workspace SplitPanes.
- `docker-compose.yml`: Coordinates multi-container builds for database, redis, backend, and frontend.

---

## Running Locally (Recommended for Fast Local Development)

Because running Judge0 sandboxes locally can be heavy, the backend automatically supports falling back to:
1. **SQLite (`tensortonic.db`)** if PostgreSQL is unavailable.
2. **Local subprocess Python execution** if no external `JUDGE0_URL` is set.

### 1. Prerequisites
- Python 3.10 or higher installed.
- Node.js (v18+) installed.

### 2. Backend Setup
Activate the pre-configured virtual environment and run the uvicorn server:
```powershell
# In the root folder:
# 1. Activate the environment
venv\Scripts\activate

# 2. Run the database seed (creates tables and seeds default ML tasks)
python backend/seed.py

# 3. Start the FastAPI server
cd backend
uvicorn app.main:app --reload
```
The backend API runs at [http://localhost:8000](http://localhost:8000).

### 3. Frontend Setup
In a new terminal window:
```bash
# In the root folder:
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running with Docker Compose
If you have Docker Desktop running, you can boot all containers simultaneously:
```bash
# In the root folder:
docker-compose up --build
```
Then, you can seed the docker PostgreSQL instance by running a seed command inside the backend container:
```bash
docker exec -it tensortonic_backend python seed.py
```

---

## Seeding default challenges
The seed script populates three problems:
1. **Implement Positional Encoding (sin/cos)** (Medium)
2. **Softmax Function** (Easy)
3. **Mean Squared Error Loss** (Easy)

You can write your solution, customize the inputs in the **Testcase** panel, and click **Submit** to see real-time polling updates.
