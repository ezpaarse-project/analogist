---
title: Configuration
description: ''
position: 3
category: Guide
---

> Deux configurations sont possibles, par variables d'environnement ou par fichier de configuration

## Fichier de configuration

La fichier de configuration est un fichier au format ``json`` qu'il vous frauda ajouter dans le dossier ``config``, comme suit : ``config/local.json``.

Une configuration par défaut est préstente dans le fichier ``config/default.json`` que vous pouvez retrouver [ici](https://github.com/ezpaarse-project/analogist/blob/master/config/default.json).

## Variables d'environnement

Pour utiliser les variables d'environnement, vous pouvez suivre ce [fichier de mapping](https://github.com/ezpaarse-project/analogist/blob/master/config/custom-environment-variables.json) ou bien les retrouver ci-dessous :

| Variable | Description |
| --- | --- |
| ANALOGIST_DOMAIN | Nom de domaine de l'application Analogist (utilisé par le reverse-proxy) |
| ANG_PORT | Numéro de port utiliser par l'API (``défaut: 3000``) |
| ANG_COOKIE_SECRET | Clé privé pour le chiffrement des cookies |
| ANG_COOKIE_MAX_AGE | Durée de validité des cookies (``défaut: 2592000000ms``) |
| ANG_MONGO_HOST | Adresse utilisée par le serveur MongoDB (``défaut: localhost``) |
| ANG_MONGO_PORT | Port utilisé par le serveur MongoDB (``défaut: 27017``) |
| ANG_MONGO_DB | Nom de la base de données (``défaut: analogist``) |
| ANG_TRELLO_KEY | [Clé d'API Trello](https://trello.com/app-key/) |
| ANG_TRELLO_SECRET | Clé secrète de l'API Trello |
| ANG_TRELLO_BOARDID | Identifiant du tableau Trello |
| ANG_SMTP_HOST | Adresse utilisée par le serveur de courrier électronique (``défaut: localhost``) |
| ANG_SMTP_PORT | Port utilisé par le serveur de courrier électronique (``défaut: 25``) |
| ANG_NOTIFICATIONS_SENDER | Nom de l'émtteur de courrier électronique (``défaut: AnalogIST``) |
| ANG_NOTIFICATIONS_RECEIVERS | Liste d'adresses de courrier électronique des personnes à notifier |
| ANG_HISTORY_DEBOUNCE | Temps entre le rafraichissement de l'historique des analyses (``défaut: 900s``) |
| ANG_EZPAARSE_URL | Adresse URL de l'instance ezPAARSE (``défaut: http://dev.ezpaarse.org``) |
| ANG_BADGE_HOST | Adresse du serveur de badges |
| ANG_BADGE_ISSUER | Nom de l'émetteur des badges |
| ANG_BADGE_ANALYSES_BRONZE_ID | Identifiant du badge **Analyses bronze** |
| ANG_BADGE_ANALYSES_BRONZE_NAME | Nom du badge **Analyses bronze** |
| ANG_BADGE_ANALYSES_BRONZE_EVENT | Nom de l'évenement du badge **Analyses bronze** |
| ANG_BADGE_ANALYSES_SILVER_ID | Identifiant du badge **Analyses argent** |
| ANG_BADGE_ANALYSES_SILVER_NAME | Nom du badge **Analyses argent** |
| ANG_BADGE_ANALYSES_SILVER_EVENT | Nom de l'évenement du badge **Analyses argent** |

### Exemple d'un fichier de variables d'environnement

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