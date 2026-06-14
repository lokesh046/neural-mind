FROM node:20-alpine

WORKDIR /app

# Copy dependency configs
COPY package.json .

# Install dependencies using legacy-peer-deps to handle React 19 warnings
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
