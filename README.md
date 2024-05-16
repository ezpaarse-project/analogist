# AnalogIST

AnalogIST is the platform that gathers all analyses made for ezPAARSE.
http://ang.couperin.org/

## Requirements

- Node.js v8+
- MongoDB v2.6+
- OpenSSL

## Configuration

Before running anything, create a local config file `config/local.json` and provide the trello board to use and your API credentials. All defaults are visible in the the [default.json](https://github.com/ezpaarse-project/analogist/blob/master/config/default.json) file.

You can also use **environment variables**, following [this mapping file](https://github.com/ezpaarse-project/analogist/blob/master/config/custom-environment-variables.json).

### Typical env file
```bash
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

### Badges

Generate your [**certificate signing request token**](https://openbadgefactory.com/) in **Admin tools &rarr; API key**, use your certificate in **OBF_CERT** (environment variable) and run this command :
```
$ docker-compose -f docker-compose.conf.yml up
```

### Trello connection

To connect Analogist to Trello, you need to create power key.
You need an account that belongs to the trello table
 https://trello.com/power-ups/admin/


## Build Setup

``` bash
# install dependencies
npm install # Or yarn install

# serve with hot reload at localhost:3000
npm run dev

# build for production and launch server
npm run build
npm start
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).


## Development

```bash
# Run tests
npm test

# Run lint
npm run lint
```
# LangsTools
