#!/bin/bash
set -e

IMAGE_NAME=${IMAGE_NAME:-rag-offline}
IMAGE_TAG=${IMAGE_TAG:-latest}

DATA_DIR=${DATA_DIR:-$(pwd)/data}
mkdir -p "${DATA_DIR}"

docker rm -f rag-offline >/dev/null 2>&1 || true

docker run -d \
  --name rag-offline \
  -p 5173:5173 \
  -p 3001:3001 \
  -v "${DATA_DIR}:/app/data" \
  ${IMAGE_NAME}:${IMAGE_TAG}

echo "OK: http://localhost:5173"

