# Backend

균열 감지 프로젝트의 Spring Boot 백엔드입니다.

## 주요 흐름

1. 프론트엔드가 `multipart/form-data`로 이미지를 업로드합니다.
2. 백엔드는 이미지를 S3에 저장합니다.
3. 백엔드는 원본 이미지를 AI 서버로 전달해 분석 결과를 받습니다.
4. 백엔드는 이미지 메타데이터와 AI 분석 결과를 Weaviate에 저장합니다.
5. 앨범 조회 시 Weaviate에서 기록을 조회하고, S3 이미지는 presigned URL로 내려줍니다.

## 로컬 실행

프로젝트 루트에서 Docker Compose를 사용합니다.

```bash
docker compose -f docker-compose.dev.yml up --build
```

로컬 개발 환경에서는 `docker-compose.dev.yml`이 백엔드, 프론트엔드, AI 서버, Weaviate를 함께 실행합니다.

## 이미지 업로드 API

- Method: `POST`
- URL: `http://localhost:8080/api/images/upload`
- Content-Type: `multipart/form-data`
- Form field: `file`

예시:

```bash
curl -X POST "http://localhost:8080/api/images/upload" \
  -F "file=@/path/to/image.jpg"
```

## 주요 환경변수

- `AWS_REGION`: S3 리전
- `S3_BUCKET_NAME`: 이미지 저장 버킷 이름
- `WEAVIATE_URL`: Weaviate 서버 주소
- `WEAVIATE_API_KEY`: Weaviate 인증 키가 필요한 경우 사용
- `WEAVIATE_COLLECTION`: 분석 기록을 저장할 Weaviate 컬렉션 이름
- `AI_BASE_URL`: AI 서버 주소
- `AI_ANALYZE_PATH`: AI 분석 API 경로
- `GOOGLE_CLIENT_ID`: 구글 로그인 클라이언트 ID

## 주의사항

- 업로드 필드명은 반드시 `file`이어야 합니다.
- 허용 이미지 형식은 `jpg`, `jpeg`, `png`입니다.
- S3 버킷이 비공개일 수 있으므로 프론트에는 S3 원본 URL 대신 presigned URL을 내려줍니다.
- Weaviate는 현재 벡터 검색보다 앨범 조회용 저장소 역할로 사용합니다.
