# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# copiere si restaurare dependinte

COPY ["chat-backend.csproj", "./"]
RUN dotnet restore "chat-backend.csproj"

# copiere si compilare cod sursa
COPY . .
RUN dotnet build "chat-backend.csproj" -c Release -o /app/build

# stage 2: publish

FROM build AS publish
RUN dotnet publish "chat-backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime final
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS final

# Instalare Nginx
RUN apt-get update && apt-get install -y nginx

# Configurare aplicație .NET Core
WORKDIR /app
COPY --from=publish /app/publish .

# Configurare Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Script de pornire
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expunere porturi (backend pe 80 intern, Nginx pe 88 extern)
EXPOSE 80 88

# Utilizare script pentru pornirea ambelor servicii
ENTRYPOINT ["/start.sh"]