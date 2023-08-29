# https://nodejs.org/en/docs/guides/nodejs-docker-webapp
FROM node:18-alpine
WORKDIR /usr/src/app

# copy package.json/package-lock.json and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# copy everything else
COPY . .

# pull in git references from build args
ARG GIT_COMMIT_HASH
ENV GIT_COMMIT_HASH=$GIT_COMMIT_HASH
ARG GIT_REPO_URI
ENV GIT_REPO_URI=$GIT_REPO_URI

EXPOSE 8080
USER node
CMD ["sh", "-c", "PORT=8080 NODE_ENV=production npx ts-node --transpile-only src/index.js"]
