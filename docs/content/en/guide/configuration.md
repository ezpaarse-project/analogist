---
title: Configuration
description: ''
position: 3
category: Guide
---

> Two configurations are possible, by environment variables or by configuration file

## Configuration file

The configuration file is a json file that you fraudulently add to the config folder, as follows: ``config/local.json``.

A default configuration is preset in the ``config/default.json`` file that you can find [here](https://github.com/ezpaarse-project/analogist/blob/master/config/default.json).

## Environment variables

To use the environment variables, you can follow this [mapping file](https://github.com/ezpaarse-project/analogist/blob/master/config/custom-environment-variables.json) or find them below:

| Variable | Description |
| --- | --- |
| ANALOGIST_DOMAIN | Domain name of the Analogist application (used by the reverse-proxy) |
| ANG_PORT | Port number used by the API (default: 3000) |
| ANG_COOKIE_SECRET | Private key for cookie encryption |
| ANG_COOKIE_MAX_AGE | Cookie validity period (default: 2592000000ms) |
| ANG_MONGO_HOST | Address used by the MongoDB server (default: localhost) |
| ANG_MONGO_PORT | Port used by MongoDB server (default: 27017) |
| ANG_MONGO_DB | Database name (default: analogist) |
| ANG_TRELLO_KEY | [Trello API Key](https://trello.com/app-key/) |
| ANG_TRELLO_SECRET | Trello API secret key |
| ANG_TRELLO_BOARDID | Trello table identifier |
| ANG_SMTP_HOST | Address used by the mail server (default: localhost) |
| ANG_SMTP_PORT | Port used by the mail server (default: 25) |
| ANG_NOTIFICATIONS_SENDER | Email sender name (default: AnalogIST) |
| ENG_NOTIFICATIONS_RECEIVERS | E-mail address list of persons to be notified |
| ANG_HISTORY_DEBOUNCE | Time between refresh of analysis history (default: 900s) |
| ANG_EZPAARSE_URL | URL address of the ezPAARSE instance (default: http://dev.ezpaarse.org) |
| ANG_BADGE_HOST | Badge server address |
| ANG_BADGE_ISSUER | Name of the badge issuer |
| ANG_BADGE_ANALYSES_BRONZE_ID | Badge identifier **Bronze analyses** |
| ANG_BADGE_ANALYSES_BRONZE_NAME | Badge name **Bronze analyses** |
| ANG_BADGE_ANALYSES_BRONZE_EVENT | Name of the badge event **Bronze analyses** |
| ANG_BADGE_ANALYSES_SILVER_ID | Badge ID **Silver Analysis** |
| ANG_BADGE_ANALYSES_SILVER_NAME | Badge name **Silver analysis** |
| ANG_BADGE_ANALYSES_SILVER_EVENT | Name of the badge event **Silver_ANALYSES** |

### Example of an environment variable file

```bash
export ANALOGIST_DOMAIN=

# Trello interactions
export ANG_TRELLO_BOARDID=
export ANG_TRELLO_KEY=
export ANG_TRELLO_SECRET=

# Mailing
export ANG_NOTIFICATIONS_RECEIVERS=
export ANG_NOTIFICATIONS_SENDER=
export ANG_SMTP_HOST=

# Badges
export ANG_BADGE_ANALYSES_BRONZE_ID=
export ANG_BADGE_ANALYSES_BRONZE_NAME="Analyste Bronze"
export ANG_BADGE_ANALYSES_BRONZE_EVENT="analyse"
export ANG_BADGE_ANALYSES_SILVER_ID=
export ANG_BADGE_ANALYSES_SILVER_NAME="Analyste Argent"
export ANG_BADGE_ANALYSES_SILVER_EVENT="analyse"
```