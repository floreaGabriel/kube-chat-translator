# Etapa de build
FROM node:20-alpine AS build

# Setează directorul de lucru
WORKDIR /app

# Copiază package.json și package-lock.json
COPY package*.json ./

# Instalează dependențele
RUN npm ci

# Copiază restul codului sursă
COPY . .

# Construiește aplicația pentru producție
RUN npm run build

# Etapa de producție cu Nginx
FROM nginx:alpine

# Copiază fișierele de configurare Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copiază build-ul din etapa anterioară
COPY --from=build /app/build /usr/share/nginx/html

# Expune portul pentru Nginx
EXPOSE 80

# Pornește Nginx
CMD ["nginx", "-g", "daemon off;"]
