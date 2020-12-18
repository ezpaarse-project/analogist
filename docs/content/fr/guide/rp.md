---
title: Reverse proxy
description: ''
position: 5
category: Guide
---

L'application Analogist quand elle est lancé via ``Docker`` utilise un ``reverse proxy`` configurer avec ``nginx``

Pout utiliser le reverse proxy, la variable d'environnement ``ANALOGIST_DOMAIN`` est **obligatoire**, elle permet de configurer les fichiers de configuration du serveur nginx.

## Exemple

Pour avoir une adresse web telle que ``analogist.dev`` nous allons devoir configurer la variable d'envrionnement comme suit :

```bash
export ANALOGIST_DOMAIN=analogist.dev
```

Une fois la varible définie, il va falloir configurer les fichiers du serveur nginx :

```bash
make config
```

Les fichiers du serveur nginx vont être générés dans le dossier ``rp/sites-enabled``, vous devriez y retrouver le fichier correspondant au nom de domaine défini, dans notre exemple ``rp/sites-enabled/analogist.dev.conf``

Pour pouvoir utiliser se nom de domaine sur votre machine il faut modifier le fichier ``/etc/hosts``

```bash
sudo echo "127.0.0.1 ${ANALOGIST_DOMAIN}" >> /etc/hosts
```