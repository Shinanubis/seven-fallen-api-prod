# This is my first api with Node Express Postgresql

## Server
### Server with NodeJs + Express
1. **Create app** 
2. **Create the Routes**
      1. Cards Route
            - [ ] **GET** /card?page=1&size=20&types=[1,2,3,4,5]&kingdoms=[1,2,3,4]&name=Fafnir 
            - [ ] **GET** /card/:id 
            - [ ] **GET** /card/type/:id?page=1&size=20 
            - [ ] **GET** /card/kingdom/:kingdom?page=1&size=20
      2. Decks Route
            - [x] **GET, POST** /deck?page=1&size=20&kingdoms=[1,2,3,4]
            - [ ] **GET, PATCH, DELETE** /deck/:id
            - [ ] **GET** /deck/:id/stats
      3. User Route
            - [x] **GET, POST** /user?page=1&size=20
            - [x] **GET, PATCH, DELETE** /user/:id

### Server caching with Redis
1. Install Redis
      - [x] sudo apt update
      - [x] sudo apt install redis-server
      - [x] sudo nano /etc/redis/redis.conf
      - [x] supervised no -> systemd
      - [x] sudo systemctl restart redis.service
2. Redis Test
      - [x] sudo systemctl status redis
      - [x] redis-cli
      - [x] ping
      - [x] set test "It's working!"
      - [x] get test
      - [x] exit
      - [x] sudo systemctl restart redis
      - [x] redis-cli
      - [x] get test
      - [x] exit
3. Link Redis to Localhost
      - [x] sudo nano /etc/redis/redis.conf
      - [x] bind 127.0.0.1 ::1
      - [x] sudo systemctl restart redis
      - [x] sudo apt install net-tools
      - [x] sudo netstat -lnp | grep redis
4. Redis password setting
      - [x] sudo nano /etc/redis/redis.conf
      - [x] uncomment **# requirepass foobared** -> **requirepass newpasswordofthedeath**
      - [x] sudo systemctl restart redis.service
      - [x] redis-cli
      - [x] set key1 10
      - [x] NOAUTH Authentication required.
      - [x] auth your_redis_password
      - [x] set key1 10
      - [x] get key1
      - [x] quit

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
