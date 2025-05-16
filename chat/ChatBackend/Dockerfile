# Multi-stage build for .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./

# Create necessary directories if they don't exist
RUN mkdir -p Hubs Models Services

RUN dotnet publish -c Release -o out

# Runtime image with Nginx
FROM nginx:alpine
WORKDIR /app

# Install .NET runtime 
RUN apk add --no-cache icu-libs libstdc++ libintl

# Install .NET runtime from Microsoft's alpine repository
RUN wget -O /etc/apk/keys/microsoft.asc https://packages.microsoft.com/keys/microsoft.asc \
    && echo "https://packages.microsoft.com/alpine/3.17/prod" >> /etc/apk/repositories \
    && apk add --no-cache aspnetcore-runtime-8.0

# Install additional debugging tools
RUN apk add --no-cache curl procps nano

# Copy .NET app
COPY --from=build /app/out /app

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app && dotnet ChatBackend.dll --urls http://localhost:5000 &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

CMD ["/start.sh"]
