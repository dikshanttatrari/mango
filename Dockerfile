# Use official Node.js 20 image
FROM node:20

# Install all the hidden Linux libraries Puppeteer needs to run WhatsApp
RUN apt-get update && apt-get install -y \
    gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
    libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
    fonts-liberation libnss3 lsb-release xdg-utils wget \
    && rm -rf /var/lib/apt/lists/*

# Set up the working directory
WORKDIR /app

# Copy package files and install NPM modules
COPY package*.json ./
RUN npm install

# Copy the rest of your Mango code
COPY . .

# Hugging Face explicitly listens on port 7860
EXPOSE 7860

# Start the bot
CMD ["node", "index.js"]