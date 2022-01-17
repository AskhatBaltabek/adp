FROM nginx:latest

WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs && \
    node -v && \
    npm -v

COPY package*.json ./

RUN npm install

COPY . .

COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
