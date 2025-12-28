# Etapa 1: Build del Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Etapa 2: Servidor Final
FROM node:20-slim
WORKDIR /app

# Instalar dependencias del sistema
# Instalamos pip3 para poder bajar yt-dlp de forma fiable
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    ca-certificates \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# Instalar yt-dlp vía pip
RUN pip3 install --break-system-packages yt-dlp

# Instalar dependencias del backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copiar el build del frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copiar el código del backend
COPY backend/ ./backend/

# Copiar el package.json raíz para el comando de inicio
COPY package.json ./

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Comando para arrancar el servidor
CMD ["node", "backend/server.js"]
