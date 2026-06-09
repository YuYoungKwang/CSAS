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

## EKS deployment

Use PowerShell for AWS CLI commands on Windows. Do not use the `latest` tag because ECR repositories may be tag immutable. The manual deployment examples below use `v1`; for later releases use a new tag such as `v2` or a Git SHA.

Target AWS resources:

- Region: `ap-northeast-2`
- EKS cluster: `crack-sensing`
- AWS account ID: `533267330483`
- ECR registry: `533267330483.dkr.ecr.ap-northeast-2.amazonaws.com`
- ECR repositories:
  - Backend: `csas-backend`
  - Frontend: `csas-frontend`
  - Python AI: `csas-python`
- Manual image tags:
  - `533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-backend:v1`
  - `533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-frontend:v1`
  - `533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-python:v1`
- AI model bucket: `cracksensing-models-dev`
- AI model path:
  - `s3://cracksensing-models-dev/models/crack/v1/best.pt`
  - `s3://cracksensing-models-dev/models/crack/v1/classes.json`
  - `s3://cracksensing-models-dev/models/crack/v1/config.yaml`

### 1. Check AWS CLI identity

```powershell
aws sts get-caller-identity
aws eks update-kubeconfig --region ap-northeast-2 --name crack-sensing
```

### 2. Create missing ECR repositories

`csas-backend` already exists. Create `csas-frontend` and `csas-python` if they do not exist.

```powershell
aws ecr describe-repositories `
  --repository-names csas-frontend `
  --region ap-northeast-2

aws ecr create-repository `
  --repository-name csas-frontend `
  --region ap-northeast-2 `
  --image-tag-mutability IMMUTABLE

aws ecr describe-repositories `
  --repository-names csas-python `
  --region ap-northeast-2

aws ecr create-repository `
  --repository-name csas-python `
  --region ap-northeast-2 `
  --image-tag-mutability IMMUTABLE
```

If `describe-repositories` succeeds, skip the matching `create-repository` command.

### 3. Upload AI model files to S3

The AI server image is pushed to ECR, but model artifacts should be uploaded to S3. The bucket should block public access, use server-side encryption, and keep versioning enabled.

```powershell
aws s3api create-bucket `
  --bucket cracksensing-models-dev `
  --region ap-northeast-2 `
  --create-bucket-configuration LocationConstraint=ap-northeast-2

aws s3api put-public-access-block `
  --bucket cracksensing-models-dev `
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api put-bucket-versioning `
  --bucket cracksensing-models-dev `
  --versioning-configuration Status=Enabled
```

Upload model artifacts after training:

```powershell
aws s3 cp .\best.pt s3://cracksensing-models-dev/models/crack/v1/best.pt --region ap-northeast-2
aws s3 cp .\classes.json s3://cracksensing-models-dev/models/crack/v1/classes.json --region ap-northeast-2
aws s3 cp .\config.yaml s3://cracksensing-models-dev/models/crack/v1/config.yaml --region ap-northeast-2

aws s3 ls s3://cracksensing-models-dev/models/crack/v1/ --region ap-northeast-2
```

The Python deployment reads these paths from `MODEL_S3_URI`, `MODEL_CLASSES_S3_URI`, and `MODEL_CONFIG_S3_URI`.

### 4. Clean up mistaken local images

If the Python folder was accidentally built with the backend repository name, remove the wrong local tags before rebuilding.

```powershell
docker image ls "*csas-backend*"
docker image rm csas-backend:latest
docker image rm 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-backend:latest
```

Ignore `No such image` errors. Do not try to overwrite `csas-backend:latest` in ECR.

### 5. Login to ECR

```powershell
aws ecr get-login-password --region ap-northeast-2 `
  | docker login --username AWS --password-stdin 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com
```

### 6. Build local images

```powershell
docker build -t csas-backend:v1 .\backend
docker build -t csas-frontend:v1 .\frontend
docker build -t csas-python:v1 .\python
```

### 7. Tag images for ECR

```powershell
docker tag csas-backend:v1 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-backend:v1
docker tag csas-frontend:v1 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-frontend:v1
docker tag csas-python:v1 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-python:v1
```

### 8. Push images

```powershell
docker push 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-backend:v1
docker push 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-frontend:v1
docker push 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-python:v1
```

### 9. Create runtime secret

Create the backend runtime secret before applying manifests. Do not commit real secrets.

```powershell
kubectl create secret generic backend-secrets `
  --from-literal=S3_BUCKET_NAME=replace-me `
  --from-literal=GOOGLE_CLIENT_ID=replace-me
```

If the secret already exists, update it with the real values or delete and recreate it.

### 10. Deploy to EKS

```powershell
kubectl apply -f k8s/
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend
kubectl rollout status deployment/python
```

### GitHub Actions

The workflow in `.github/workflows/deploy-eks.yml` uses Git SHA image tags, creates missing ECR repositories if needed, pushes images to `csas-backend` and `csas-frontend`, then updates the backend and frontend EKS deployments with `kubectl set image`.

The Python AI server is intentionally excluded from GitHub Actions. Build and push `csas-python` manually when the AI server or bundled model changes, then update the Python deployment image yourself.

Manual Python AI image deployment:

```powershell
$TAG="ai-v1"

aws ecr get-login-password --region ap-northeast-2 `
  | docker login --username AWS --password-stdin 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com

docker build -t csas-python:$TAG .\python
docker tag csas-python:$TAG 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-python:$TAG
docker push 533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-python:$TAG

kubectl set image deployment/python python=533267330483.dkr.ecr.ap-northeast-2.amazonaws.com/csas-python:$TAG
kubectl rollout status deployment/python
```

Required GitHub Secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `GOOGLE_CLIENT_ID`

`GOOGLE_CLIENT_ID` is used twice in GitHub Actions:

- As `VITE_GOOGLE_CLIENT_ID` during the frontend Docker build. Vite embeds this value into the browser bundle.
- As `GOOGLE_CLIENT_ID` in the backend Kubernetes Secret so the backend can validate Google token audience.

Weaviate is deployed from `k8s/weaviate.yaml` and is accessed by the backend through the internal Kubernetes service `http://weaviate:8080`.

### Add GitHub Secrets

In GitHub:

1. Open the repository.
2. Go to `Settings`.
3. Go to `Secrets and variables` -> `Actions`.
4. Click `New repository secret`.
5. Add each secret by exact name.

Use these names:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME
GOOGLE_CLIENT_ID
```

Example values:

```text
S3_BUCKET_NAME=cracksensing-images-dev
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```
