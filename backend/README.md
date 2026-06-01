# Backend

Spring Boot 기반 백엔드 서버입니다.

## 로컬 실행

루트에서 Docker Compose로 실행하는 것이 기본입니다.

```bash
docker compose -f docker-compose.dev.yml up --build
```

백엔드만 확인할 때는 `backend/Dockerfile.dev`를 사용할 수 있습니다.

## 이미지 업로드 API

프론트에서는 `multipart/form-data`로 이미지를 전송합니다.

- Method: `POST`
- URL: `http://localhost:8080/api/images/upload`
- Form field: `file`

예시 요청:

```bash
curl -X POST "http://localhost:8080/api/images/upload" \
  -F "file=@/path/to/image.jpg"
```

성공 응답 예시:

```json
{
  "objectKey": "images/2026/06/01/uuid.jpg",
  "objectUrl": "https://bucket-name.s3.ap-northeast-2.amazonaws.com/images/2026/06/01/uuid.jpg",
  "fileName": "image.jpg",
  "fileSize": 123456
}
```

## Classifier 연동

백엔드는 S3 저장이 끝나면 classifier 서버로 다음 정보를 전송합니다.

- `imageId`: S3 `objectKey`
- `objectUrl`: S3 객체 URL

classifier 서버 응답 예시:

```json
{
  "imageId": "images/2026/06/01/uuid.jpg",
  "cracked": 1,
  "crackType": 7,
  "crackPos": [
    [14, 10],
    [31, 85]
  ]
}
```

기본 요청 경로는 다음과 같습니다.

- `POST http://localhost:8000/api/classify`

도커 환경에서는 `CLASSIFIER_BASE_URL=http://python:8000` 을 사용합니다.

## 설정

- `AWS_REGION`: S3 리전
- `S3_BUCKET_NAME`: 업로드 대상 버킷 이름
- `CLASSIFIER_BASE_URL`: classifier 서버 주소
- `spring.servlet.multipart.max-file-size`: 단일 파일 최대 크기
- `spring.servlet.multipart.max-request-size`: 요청 전체 최대 크기

## 주의사항

- 파일 필드명은 반드시 `file` 이어야 합니다.
- 허용 형식은 `jpg`, `jpeg`, `png` 입니다.
- 업로드 크기 제한은 백엔드 설정 기준으로 적용됩니다.
