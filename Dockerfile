FROM node:18-alpine
WORKDIR /app

# 1) Copy your package manifests
COPY package*.json ./

# 2) Copy ALL of prisma (schema + migrations)
COPY prisma ./prisma

# 3) Install deps
RUN npm install

# 4) Generate the Prisma Client (now that schema is present)
RUN npx prisma generate

# 5) Copy the rest of your source code
COPY . .

EXPOSE 4000

CMD ["npm", "start"]