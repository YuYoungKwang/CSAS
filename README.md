# crackSensingAiService

AI 기반 시설물 균열 감지 서비스

## 기술 스택

- Frontend: React
- Backend: Java, Spring Boot
- AI: Python, FastAPI, PyTorch 예정
- Container: Docker, Docker Compose 예정
- Version Control: Git, GitHub

## 현재 상태

Docker Compose 기반 로컬 개발 실행 구성을 준비한 단계입니다.

## 로컬 실행

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:8080/health
- Python AI health: http://localhost:8000/health

## 폴더 구조 설명

- `frontend/`: React/Vite 기반 웹 프론트엔드가 위치할 예정입니다.
- `backend/`: Java 17과 Spring Boot 기반 API 서버가 위치할 예정입니다.
- `python/`: FastAPI 기반 Python AI 서버가 위치할 예정입니다.
- `docker-compose.dev.yml`: 로컬 Docker 개발환경 구성을 위한 placeholder입니다.
