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
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "chat-backend.dll"]