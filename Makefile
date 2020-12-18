.PHONY: help
.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

config-nginx: ## config nginx files
	sed -e "s|{{ANALOGIST_DOMAIN}}|${ANALOGIST_DOMAIN}|" \
			./rp/default.dist.conf > "./rp/sites-enabled/${ANALOGIST_DOMAIN}.conf"

config: ## patch nginx.conf config file with analogist domain url
	@if [ ! -d ./rp/sites-enabled/ ]; then mkdir ./rp/sites-enabled/; fi
	@make config-nginx

ssl-certs: ## generate ssl certificats for HTTPS
	cd rp; docker-compose -f create-certs.yml up certbot

build-front: ## build analogist web front
	docker-compose build front

build-api: ## build analogist api
	docker-compose build api

build-rp: ## build analogist reverse proxy
	docker-compose build rp

build: build-front build-api build-rp ## build analogist

start: docker-compose up -d ## start analogist

stop: docker-compose stop ## stop analogist

restart: docker-compose restart ## restart analogist

update: git pull ## pull analogist from github

install-api: ## install api dependencies
	cd ./api; npm install

install-front: ## install front dependencies
	cd ./front; npm install

install-doc: ## install documentation dependencies
	cd ./docs; npm install

install: install-api install-front install-doc ## install all dependencies

build-doc: ## build documentation
	cd ./docs; npm run build

start-doc: ## start documentation
	cd ./docs; npm run start

dev-doc: ## run documentation in dev mode
	cd ./docs; npm run dev