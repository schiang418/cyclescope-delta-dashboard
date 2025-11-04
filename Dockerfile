# Use Node.js 22 with Python support
FROM node:22-bullseye

# Install Python, Chrome, and dependencies for Selenium
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    chromium \
    chromium-driver \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install selenium pillow

# Create python3.11 symlink for compatibility
RUN ln -s /usr/bin/python3 /usr/bin/python3.11

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package.json and patches directory (needed for pnpm install)
COPY package.json ./
COPY patches ./patches

# Install dependencies without lockfile
RUN pnpm install --no-frozen-lockfile

# Copy all project files
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["pnpm", "start"]

