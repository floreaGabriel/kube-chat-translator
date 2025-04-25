#!/bin/bash

# Setare variabilă de mediu pentru aplicația .NET Core – schimbare port pe 5000 intern
export ASPNETCORE_URLS=http://+:5000

# Pornire server Nginx în background
nginx

# Pornire aplicație .NET Core
dotnet chat-backend.dll
