# syntax=docker/dockerfile:1

# ---- build ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Restore as its own layer so it is cached until the csproj changes.
COPY Ezra.Api.csproj ./
RUN dotnet restore Ezra.Api.csproj
# Publish the API. The test project is excluded from the compile glob (see csproj).
COPY . .
RUN dotnet publish Ezra.Api.csproj -c Release -o /app --no-restore

# ---- runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app ./
# Listen on 8080 inside the container.
ENV ASPNETCORE_URLS=http://+:8080
# SQLite file lives under /data so a mounted volume can persist it across restarts.
# Program.cs calls db.Database.Migrate() at startup, so EF migrations are applied
# on container start (per the decided architecture).
ENV ConnectionStrings__DefaultConnection="Data Source=/data/tasks.db"
EXPOSE 8080
VOLUME /data
ENTRYPOINT ["dotnet", "Ezra.Api.dll"]
