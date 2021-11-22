# This is my first api with Node Express Postgresql

## Server
### Server with NodeJs + Express
1. Create app 
2. Create the Routes + Controller + Models

### Server caching with Redis
1. Install Redis
      - sudo apt update
      - sudo apt install redis-server
      - sudo nano /etc/redis/redis.conf
      - supervised no -> systemd
      - sudo systemctl restart redis.service
2. Redis Test
      - sudo systemctl status redis
      - redis-cli
      - ping
      - set test "It's working!"
      - get test
      - exit
      - sudo systemctl restart redis
      - redis-cli
      - get test
      - exit
3. Link Redis to Localhost
      - sudo nano /etc/redis/redis.conf
      - bind 127.0.0.1 ::1
      - sudo systemctl restart redis
      - sudo apt install net-tools
      - sudo netstat -lnp | grep redis
4. Redis password setting
      - sudo nano /etc/redis/redis.conf
      - uncomment **# requirepass foobared** -> **requirepass newpasswordofthedeath**
      - sudo systemctl restart redis.service
      - redis-cli
      - set key1 10
      - (error) NOAUTH Authentication required.
      - auth your_redis_password
      - set key1 10
      - get key1
      - quit

### Route testing with postman
1. Install postman for local mode **https://www.postman.com/downloads/**

### Automation with node-cron
1. Install node-cron **npm install node-cron**
2. Settings the time scheduling every midnight
3. Create Models for upsert

### Authentication with passport
1. Install passport **npm install passport passport-facebook passport-google-oauth20** 

### Documentation
1. Install swagger **npm install swagger-ui-express swagger-jsdoc**

### Validation / Sanitization
1. Install Validator **npm install express-validator**
2. Check if routes need sanitization and validation 

## Database
### Database with postgresql and pg
1. Make the UML Model
2. Install postgresql on linux **sudo apt-get install postgresql postgresql-contrib**
3. Install pg **npm install pg**
4. Install Postgresql
5. Settings User Account
6. Create the tables 
