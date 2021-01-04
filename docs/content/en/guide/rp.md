---
title: Reverse proxy
description: ''
position: 5
category: Guide
---

The Analogist application when launched via Docker uses a reverse proxy configured withnginx.

To use the reverse proxy, the environment variable ``ANALOGIST_DOMAIN`` is **mandatory**, it allows to configure the nginx server configuration files.

## Example

To get a web address such as ``analogist.dev`` we will have to configure the environment variable as follows:

```bash
export ANALOGIST_DOMAIN=analogist.dev
```

Once the varible is defined, you will have to configure the nginx server files:

```bash
make config
```

The nginx server files will be generated in the directory ``rp/sites-enabled``, you should find the file corresponding to the defined domain name, in our example ``rp/sites-enabled/analogist.dev.conf``.

To be able to use this domain name on your machine you have to modify the file ``/etc/hosts``.

```bash
sudo echo "127.0.0.1 ${ANALOGIST_DOMAIN}" >> /etc/hosts
```