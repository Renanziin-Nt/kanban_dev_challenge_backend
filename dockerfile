# Use a imagem oficial do Node.js
FROM node:20-alpine

# Diretório de trabalho dentro do container
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Copiar o restante do código da aplicação
COPY . .

# Gerar o Prisma Client
RUN npx prisma generate

# Compilar a aplicação TypeScript
RUN npm run build

# Expor a porta da aplicação
EXPOSE 3001

# Comando para rodar a aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]