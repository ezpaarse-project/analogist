# analogist
AnalogIST is the platform that gathers all analyses made for ezPAARSE.

## Install
We assume that node.js is installed and that a mongo database is up and running.
```
git clone https://github.com/ezpaarse-project/analogist.git analogist
cd analogist
npm install
npm install bower -g
bower install
```

## Run
```
npm start
```

## Use with docker
```
# Run
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

# Run
docker-compose up
# Stop
docker-compose stop
# Restart
docker-compose start
```
