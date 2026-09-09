# Étape 1 : Build de l'application Vite React
FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le code source frontend
COPY . .

# Variable d'environnement pour le build Vite (vide par défaut = requêtes relatives /api)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Compiler l'application
RUN npm run build

# Étape 2 : Serveur Nginx léger pour la production
FROM nginx:alpine

# Copier le bundle compilé
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port HTTP interne
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
