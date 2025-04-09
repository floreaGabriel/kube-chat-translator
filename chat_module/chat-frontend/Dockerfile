# Multi-stage build pentru aplicația React
FROM node:16-alpine AS build

# Directorul de lucru în container
WORKDIR /app

# Copierea fișierelor package.json și package-lock.json
COPY package*.json ./

# Instalarea dependențelor
RUN npm install

# Copierea codului sursă
COPY . .

# Construirea aplicației pentru producție
RUN npm run build

# Etapa a doua - server nginx pentru servirea aplicației
FROM nginx:alpine

# Copierea fișierelor build din etapa anterioară
COPY --from=build /app/build /usr/share/nginx/html

# Copierea configurației nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expunerea portului 90
EXPOSE 90

# Comanda de pornire pentru Nginx
CMD ["nginx", "-g", "daemon off;"]