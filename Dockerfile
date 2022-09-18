FROM node:16

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# ADD "https://www.random.org/cgi-bin/randbyte?nbytes=10&format=h" skipcache

# Bundle app source
COPY . .

EXPOSE 8080
