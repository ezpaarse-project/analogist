.PHONY: help
.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

config-nginx: ## config nginx files
	sed -e "s|{{ANALOGIST_DOMAIN}}|${ANALOGIST_DOMAIN}|" \
			./rp/default.dist.conf > "./rp/sites-available/${ANALOGIST_DOMAIN}.conf"

config: ## patch nginx.conf config file with analogist domain url
	@if [ ! -d ./rp/sites-available/ ]; then mkdir ./rp/sites-available/; fi
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
