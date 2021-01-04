---
title: OpenBadges
description: ''
position: 4
category: Guide
---

Analogist, is an application that issues [open-badges](https://openbadges.info/), for this purpose the application uses the services of [OpenBadgeFactory](https://openbadgefactory.com/).

To set up open-bags, you need to generate your OpenBadgeFactory token, to do this go to [OpenBadgeFactory](https://openbadgefactory.com/), log in and go to the ``Admin Tools`` section and then go to the ``API Key`` page.

Once you have your token, you will need to put it into an environment variable as follows:

```bash
export OBF_CERT=<your token>
```

Once this environment variable is set, you will simply need to execute the following command via docker:

```bash
docker-composes -f docker-composes.conf.yml up -d
```