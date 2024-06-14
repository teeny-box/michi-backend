#!/bin/bash

REPOSITORY=~/michi-backend
DOCKER_COMPOSE_FILE=${REPOSITORY}/docker-compose.yml

echo "> 프로젝트 폴더로 이동"
cd $REPOSITORY || exit 1

echo "> git pull"
git pull origin dev || exit 1

echo "> npm 패키지 업데이트"
npm install

echo "> npm build"
npm run build

echo "> 현재 실행중인 컨테이너 확인"
CURRENT_CONTAINER_MONGO=$(docker ps --format "{{.Names}}" | grep "mongo")
CURRENT_CONTAINER_REDIS=$(docker ps --format "{{.Names}}" | grep "redis")

echo "> MongoDB, Redis 컨테이너 상태 확인 및 실행"

if [ -z "$CURRENT_CONTAINER_MONGO" ]; then
    echo "> MongoDB 컨테이너가 실행되지 않았습니다. 컨테이너를 시작합니다."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d mongo || exit 1
else
    echo "> MongoDB 컨테이너가 실행 중입니다."
fi

if [ -z "$CURRENT_CONTAINER_REDIS" ]; then
    echo "> Redis 컨테이너가 실행되지 않았습니다. 컨테이너를 시작합니다."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d redis || exit 1
else
    echo "> Redis 컨테이너가 실행 중입니다."
fi

echo "> WAS 실행 여부 확인"
IS_RUNNING=$(ps aux | grep main.js | grep -v grep)

if [ -n $"IS_RUNNING" ] ; then
	echo "> WAS가 실행 중이면 restart"
	pm2 restart ecosystem.config.js
else
	echo "> WAS가 꺼져 있다면 start"
	pm2 start ecosystem.config.js
fi

echo "> 배포 완료"
