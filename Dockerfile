# ============================================
#  STAGE 1: Base Image (Node + Android + Expo)
# ============================================
FROM node:18-bullseye AS base

WORKDIR /app

ENV TZ=UTC \
    LANG=C.UTF-8 \
    ANDROID_SDK_ROOT=/usr/local/android-sdk \
    PATH="$PATH:/usr/local/android-sdk/platform-tools:/usr/local/android-sdk/cmdline-tools/bin"

# ----------------------------
# Install dependencies
# ----------------------------
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    git \
    curl \
    unzip \
    watchman \
    python3 \
    python3-pip \
    bash \
    gradle \
    && rm -rf /var/lib/apt/lists/*

# ----------------------------
# Install Android SDK
# ----------------------------
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    cd ${ANDROID_SDK_ROOT}/cmdline-tools && \
    curl -sSL https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -o tools.zip && \
    unzip tools.zip -d . && rm tools.zip

# Accept Android licenses
RUN yes | sdkmanager --licenses || true

# Install SDK tools and build-tools
RUN sdkmanager --update && \
    sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" || true

# ----------------------------
# Install Expo & EAS CLI globally
# ----------------------------
RUN npm install -g expo-cli eas-cli

# ----------------------------
# Firebase CLI (optional for FCM)
# ----------------------------
RUN npm install -g firebase-tools

# ============================================
#  STAGE 2: Dependencies
# ============================================
FROM base AS deps

COPY package*.json ./
RUN npm install

# ============================================
#  STAGE 3: Build
# ============================================
FROM deps AS build

COPY . .

ENV EXPO_NO_INTERACTIVE=true
ENV CI=true

# Validate setup
RUN expo doctor || true

# Build static web version
RUN npm run build:web

# Create output directory
RUN mkdir -p /app/builds

# ---- Build Android APK locally ----
RUN eas build --platform android --local --non-interactive --output /app/builds/app.apk || true

# ---- Build iOS IPA remotely via EAS Cloud ----
RUN eas build --platform ios --non-interactive || true

# ============================================
#  STAGE 4: Runtime for Expo Development
# ============================================
FROM base AS runtime

WORKDIR /app
COPY --from=build /app /app

EXPOSE 8081 19000 19001 19002

# Default to Expo dev server
CMD ["npm", "start"]
