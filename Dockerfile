# Building layer
FROM node:18-alpine AS development

RUN apk add --no-cache g++ make py3-pip

# Optional NPM automation (auth) token build argument
# ARG NPM_TOKEN

# Optionally authenticate NPM registry
# RUN npm set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

WORKDIR /app

# Copy configuration files
COPY tsconfig*.json ./
COPY package*.json ./

# Install dependencies from package-lock.json, see https://docs.npmjs.com/cli/v7/commands/npm-ci
RUN yarn

# Copy application sources (.ts, .tsx, js)
COPY src/ src/

# Build application (produces dist/ folder)
RUN yarn build

# Runtime (production) layer
FROM node:18-alpine AS production

RUN apk add --no-cache g++ make py3-pip

# Optional NPM automation (auth) token build argument
# ARG NPM_TOKEN

# Optionally authenticate NPM registry
# RUN npm set //registry.npmjs.org/:_authToken ${NPM_TOKEN}

WORKDIR /app

COPY migrations migrations

# Copy dependencies files
COPY package*.json ./

# Install runtime dependencies (without dev/test dependecies)
RUN yarn

# Copy production build
COPY --from=development /app/dist/ ./dist/

# Expose application port
EXPOSE 3000

# Start application
CMD [ "node", "dist/main.js" ]
