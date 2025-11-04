# Usar imagen oficial de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código del servidor
COPY server.js .

# Railway asigna el puerto dinámicamente via $PORT
EXPOSE ${PORT:-3001}

# Healthcheck (Railway maneja esto, pero lo dejamos como fallback)
# Nota: El puerto debe ser el asignado por Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3001; require('http').get(\`http://localhost:\${port}/health\`, (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando para iniciar el servidor
CMD ["node", "server.js"]
