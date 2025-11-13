# Minimal FastAPI CRUD Starter

## Endpoints
- GET `/health` — simple health check
- CRUD under `/api/v1/posts`:
  - POST `/api/v1/generate` (generate content)
  - PUT  `/api/v1/approve` (approve)
  - GET  `/api/v1/publish/{post_id}` (publish)

## Run
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Example curl
```bash
# create
curl -X POST http://localhost:8000/api/v1/posts   -H "Content-Type: application/json"   -d '{"title":"Hello","body":"World"}'

# list
curl http://localhost:8000/api/v1/posts

# get one
curl http://localhost:8000/api/v1/posts/1

# update
curl -X PUT http://localhost:8000/api/v1/posts/1   -H "Content-Type: application/json"   -d '{"title":"Updated","body":"Text"}'

# delete
curl -X DELETE http://localhost:8000/api/v1/posts/1
```
