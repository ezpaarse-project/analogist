# analogist
AnalogIST is the platform that gathers all analyses made for ezPAARSE.

## Install
We assume that node.js v4+ is installed and that a mongo v2.6+ is up and running.
```
git clone https://github.com/ezpaarse-project/analogist.git analogist
cd analogist
npm install
npm install bower -g
bower install
```

Before running anything, create `config/config.json` and provide the trello board to use and your API credentials (see `default.json` for the syntax). This step may become unecessary in the future.

## Run
```
npm start
```

## Use with docker

When running a container, don't forget to set the environment variables `TRELLO__KEY`, `TRELLO__SECRET` and `TRELLO__BOARDID`. This step may become unecessary in the future.

```
# Get the latest images
docker pull mongo
docker pull ezpaarseproject/analogist

# Run the containers
docker run -d --name anadb mongo
docker run -d --name analogist --link anadb:mongodb -p 3000:3000 ezpaarseproject/analogist

# Stop
docker stop anadb analogist
# Restart
docker start anadb analogist
```
### Use with docker-compose (alternative)
```
# Create the directory that will contain the configuration file and mongo data
mkdir analogist && cd analogist

# Grab the latest docker-compose file
wget https://raw.githubusercontent.com/ezpaarse-project/analogist/master/docker-compose/docker-compose.yml

# Edit docker-compose.yml and define the trello variables under 'environment'
  
# Pull the latest images
docker-compose pull
# (re)Create the containers
docker-compose up
# Stop
docker-compose stop
# Restart
docker-compose start
```

## Development

Run tests:
```shell
npm test
```
Run javascript linter:
```shell
npm run lint
```

A hook that run tests before each commit is available in `git-hooks`. To activate it, just create a symlink :
```shell
ln -s ../../git-hooks/pre-commit .git/hooks/pre-commit
```
