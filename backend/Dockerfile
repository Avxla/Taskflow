# Usamos una imagen oficial de Node.js ligera
FROM node:20-alpine

# Creamos y establecemos el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del backend
COPY . .

# Exponemos el puerto en el que corre Express
EXPOSE 5000

# Comando para iniciar la aplicación
CMD ["npm", "start"]