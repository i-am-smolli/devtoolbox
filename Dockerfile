FROM node:24-alpine AS builder

WORKDIR /app

RUN apk update && apk upgrade

COPY . .


ENV BUILD_STANDALONE=true
RUN npm install
RUN npm run build

# Prepare the app for production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Start the app
CMD ["npm", "start"]
