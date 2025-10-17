# ----------------------------
# STAGE 1: Base Node environment
# ----------------------------
FROM node:18-bullseye AS base

# Set working directory
WORKDIR /app

# Set timezone and locale
ENV TZ=UTC \
    LANG=C.UTF-8

# Install system dependencies (required by Expo CLI and EAS)
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    git \
    watchman \
    python3 \
    python3-pip \
    bash \
    unzip \
    gradle \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK tools
ENV ANDROID_SDK_ROOT=/usr/local/android-sdk
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    cd ${ANDROID_SDK_ROOT}/cmdline-tools && \
    curl -sSL https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -o tools.zip && \
    unzip tools.zip -d . && rm tools.zip

# Add Android SDK to PATH
ENV PATH="${ANDROID_SDK_ROOT}/cmdline-tools/bin:${ANDROID_SDK_ROOT}/platform-tools:${PATH}"

# Accept Android licenses
RUN yes | sdkmanager --licenses || true

# Install Expo CLI and EAS CLI globally
RUN npm install -g expo-cli eas-cli

# ----------------------------
# STAGE 2: Dependencies
# ----------------------------
FROM base AS deps

# Copy only package files
COPY package*.json ./

# Install node_modules (cached separately)
RUN npm install

# ----------------------------
# STAGE 3: Build
# ----------------------------
FROM deps AS build

# Copy all source files
COPY . .

# Environment variables for Expo build
ENV EXPO_NO_INTERACTIVE=true
ENV CI=true

# Validate project setup
RUN expo doctor || true

# Build production web version
RUN npm run build:web

# Optionally build APK for Android (using EAS)
# Uncomment the next line if you have credentials set up
# RUN eas build --platform android --non-interactive --local --output /app/builds/android.apk

# ----------------------------
# STAGE 4: Runtime (for development or serving web)
# ----------------------------
FROM base AS runtime

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app /app

# Expose Expo development ports
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Default command starts Expo in dev mode
CMD ["npm", "start"]
