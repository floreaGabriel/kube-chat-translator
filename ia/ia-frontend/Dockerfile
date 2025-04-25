# Etapa de dezvoltare
FROM node:20-alpine

# Setează directorul de lucru
WORKDIR /app

# Copiază package.json și package-lock.json
COPY package*.json ./

# Instalează dependențele
RUN npm ci

# Copiază restul codului sursă
COPY . .

# Expune portul pentru dezvoltare
EXPOSE 3000

# Pornește aplicația în modul dezvoltare pentru a face hot-reloading
CMD ["npm", "start"]