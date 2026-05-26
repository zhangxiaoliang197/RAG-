#!/bin/bash
set -e

IMAGE_NAME=${IMAGE_NAME:-rag-offline}
IMAGE_TAG=${IMAGE_TAG:-latest}
OUTPUT_TAR=${OUTPUT_TAR:-rag-offline-image.tar}

docker build -f Dockerfile.offline -t ${IMAGE_NAME}:${IMAGE_TAG} .
docker save -o ${OUTPUT_TAR} ${IMAGE_NAME}:${IMAGE_TAG}

echo "OK: ${OUTPUT_TAR}"

