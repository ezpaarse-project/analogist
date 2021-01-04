---
title: Running 
description: ''
position: 6
category: Guide
---

It is possible to launch the application in two different modes, the ``production`` mode and the ``development`` mode.

You can run the application either in ``Command line`` or ``Dock`` mode.

## Production

### Command line launch

To launch the application from the command line, simply execute the following command:
```bash
npm run start
```

### Launch via Docker

To launch the application via Docker, simply execute the following commands:

```bash
make config
# generation of SSL certificates for HTTPS in the /rp/sites-enabled folder
make build
make start
```

To restart the application the command is as follows:

```bash
make restart
```

To stop the application the command is as follows:

```bash
make stop
```

## Development

### Command line launch

To launch the application from the command line, simply execute the following command:

```bash
npm run dev
```

### Launch via Docker

To launch the application via Docker, simply execute the following commands:

```bash
make config
# generation of SSL certificates for HTTPS in the /rp/sites-enabled folder
make dev-start
```

To restart the application the command is as follows:

```bash
make dev-restart
```

To stop the application the command is as follows:

```bash
make dev-stop
```