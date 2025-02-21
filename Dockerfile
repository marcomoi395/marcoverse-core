FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
