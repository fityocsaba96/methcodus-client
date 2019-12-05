all: build install start
build:
	docker-compose build
install:
	docker-compose run --rm client npm install
start:
	docker-compose up --no-build
stop:
	docker-compose stop
destroy:
	docker-compose down
npm:
	docker-compose exec client npm run $(script)
ssh:
	docker-compose exec client bash
