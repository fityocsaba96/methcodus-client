FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get install -y nodejs

RUN useradd -m client
USER client

COPY --chown=client . /app/

WORKDIR /app
ARG NODE_ENV=development
RUN npm install
RUN npm run build
RUN npm prune --production

CMD NODE_ENV=production npm start
