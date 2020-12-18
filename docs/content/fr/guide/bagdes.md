---
title: OpenBadges
description: ''
position: 4
category: Guide
---

Analogist, est une application qui émet des [open-badges](https://openbadges.info/), pour ce faire l'application utilise les services d'[OpenBadgeFactory](https://openbadgefactory.com/).

Pour configurer les open-bagdes, ils vous faut générer votre jeton OpenBadgeFactory, pour ce faire rendez-vous sur [OpenBadgeFactory](https://openbadgefactory.com/), connectez-vous puis aller dans la section ``Admin Tools`` pour ensuite vous rendre sur la page ``API Key``.

Une fois votre jeton en votre possession, il vous faudra le mettre dans une variable d'environnement comme suit :
```bash
export OBF_CERT=<votre jeton>
```

Une fois cette variable d'environnement mise en place, il vous suffira simplement d'éxécuter via docker la commande suivante:
```bash
docker-compose -f docker-compose.conf.yml up -d
```
