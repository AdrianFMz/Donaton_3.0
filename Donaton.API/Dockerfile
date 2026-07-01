# Etapa 1: Entorno de ejecución (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Etapa 2: Entorno de compilación (SDK)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiamos el archivo de proyecto y restauramos las dependencias de NuGet
COPY ["Donaton.API.csproj", "."]
RUN dotnet restore "Donaton.API.csproj"

# Copiamos todo el código fuente restante y compilamos
COPY . .
RUN dotnet build "Donaton.API.csproj" -c Release -o /app/build

# Etapa 3: Publicación de los binarios limpios
FROM build AS publish
RUN dotnet publish "Donaton.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 4: Imagen final que correrá en Render
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Donaton.API.dll"]