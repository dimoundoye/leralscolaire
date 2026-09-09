FROM node:20-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances de production
RUN npm install --omit=dev --legacy-peer-deps

# Copie du code source backend
COPY . .

# Création des répertoires de stockage des uploads
RUN mkdir -p uploads/photos uploads/justificatifs_inapte uploads/messages uploads/partages uploads/cahier_texte

# Port du serveur backend
EXPOSE 5002

# Démarrage de l'application
CMD ["npm", "start"]
