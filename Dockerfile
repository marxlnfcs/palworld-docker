### Base Image ###
FROM cm2network/steamcmd

### Labels ###
LABEL maintainer="marxlnfcs"

### Environments ###
# OS environment variables
ENV TIMEZONE=Europe/Berlin
ENV DEBIAN_FRONTEND=noninteractive
ENV PUID=0
ENV PGID=0

# Application environment variables
ENV PW_START_MODE=0
ENV PW_DEBUG=false
ENV PW_MAX_PLAYERS=32
ENV PW_SERVER_NAME="palworld-dedicated-server"
ENV PW_SERVER_DESCRIPTION="My Palworld dedicated server"
ENV PW_SERVER_PASSWORD=""
ENV PW_SERVER_ADMIN_PASSWORD="Chang3M3!"
ENV PW_PUBLIC_IP=10.0.0.1
ENV PW_PUBLIC_PORT=8211
ENV PW_MULTITHREAD_ENABLED=true
ENV PW_COMMUNITY_SERVER=true

### Dependencies ###
# Switch to "root" user to setup image
USER root

# Install dependencies
RUN dpkg --add-architecture i386
RUN apt install -y curl && curl -fsSL https://deb.nodesource.com/setup_20.x | bash
RUN apt install -y make python build-essential lib32gcc-s1 nodejs

# Create directories
RUN mkdir -p /data/config
RUN mkdir -p /data/manager
RUN mkdir -p /data/server
RUN mkdir -p /data/saves
RUN mkdir -p /data/backups

# Install NPM dependencies
WORKDIR /data/manager
COPY ./manager/package.json /data/manager/package.json
RUN npm install --omit=dev

# Copy files/directories to image
COPY ./manager/lib /data/manager/lib
COPY ./manager/server-manager.js /data/manager/server-manager.js

# Set permissions for user
RUN chmod -R 775 /data && chown -R steam:steam /data
RUN chmod -R 775 /home/steam && chown -R steam:steam /home/steam
RUN chmod -R 777 /tmp

### Finalizing Image ###
# Switch to "steam" user to finalize image
WORKDIR /data
USER steam

EXPOSE 8211/udp
EXPOSE 25575/udp

VOLUME "/data/server"
VOLUME "/data/saves"
VOLUME "/data/backups"

ENTRYPOINT ["node", "/data/manager/server-manager.js"]