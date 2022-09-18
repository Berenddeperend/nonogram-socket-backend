run:
	docker build . -t nonogram-backend --no-cache && docker-compose up

down:
	docker-compose down -v --rmi all

say_hello:
	echo "Hello World"

say_hi:
	echo "Hi"

container:
	docker exec -ti nonogram-backend /bin/sh
