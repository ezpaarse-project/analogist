---
title: Lancement 
description: ''
position: 6
category: Guide
---

Il est possible de lancer l'application dans deux modes différents, le mode de ``production`` et le mode de ``développement``.

Vous pouvez aussi bien éxecuter l'application en ``ligne de commande`` ou bien via ``Docker``.

## Production

### Lancement en ligne de commande

Pour lancer l'application en ligne de commande, il vous suffira simplement d'éxécuter la commande suivante :
```bash
npm run start
```

### Lancement via Docker

Pour lancer l'application via Docker, il vous suffira simplement d'éxécuter les commandes suivantes :

```bash
make config
# génération des certificats SSL pour le HTTPS dans le dossier /rp/sites-enabled
make build
make start
```

Pour redémarrer l'application la commande est la suivante :

```bash
make restart
```

Pour stopper l'application la commande est la suivante :

```bash
make stop
```

## Développement

### Lancement en ligne de commande

Pour lancer l'application en ligne de commande, il vous suffira simplement d'éxécuter la commande suivante :
```bash
npm run dev
```

### Lancement via Docker

Pour lancer l'application via Docker, il vous suffira simplement d'éxécuter les commandes suivantes :
```bash
make config
# génération des certificats SSL pour le HTTPS dans le dossier /rp/sites-enabled
make dev-start
```

Pour redémarrer l'application la commande est la suivante :

```bash
make dev-restart
```

Pour stopper l'application la commande est la suivante :

```bash
make dev-stop
```