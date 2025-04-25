# Multi-stage build for .NET backend with Apache proxy
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set working directory
WORKDIR /src

# Copy and restore project files
COPY *.csproj ./
RUN dotnet restore

# Copy all source code and build the application
COPY . ./
RUN dotnet publish -c Debug -o /app/publish

# Create the final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0

# Install Apache
RUN apt-get update && \
    apt-get install -y apache2 && \
    a2enmod proxy proxy_http headers && \
    rm -rf /var/lib/apt/lists/*

# Set working directory for the .NET application
WORKDIR /app

# Copy the published .NET application
COPY --from=build /app/publish .

# Create Apache configuration for proxying
COPY apache-proxy.conf /etc/apache2/sites-available/000-default.conf

# Create a debug startup script with more logging
RUN echo '#!/bin/bash\n\
echo "Content of /app directory:"\n\
ls -la /app\n\
echo "Starting .NET application..."\n\
dotnet /app/ia-backend.dll --urls="http://localhost:5090" > /app/backend.log 2>&1 &\n\
sleep 3\n\
echo "Checking if .NET process is running:"\n\
ps aux | grep dotnet\n\
echo "First few lines of backend log:"\n\
head -10 /app/backend.log\n\
echo "Starting Apache server..."\n\
apache2ctl -D FOREGROUND' > /app/startup.sh && \
    chmod +x /app/startup.sh


# Expose port 80 for Apache
EXPOSE 80

# Start both services
CMD ["/app/startup.sh"]