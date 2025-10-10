# TRS Mobile - Multi-Platform Setup Guide

This React Native Expo application runs seamlessly on _Web_, _Android_, and _iOS_, with full support for EAS builds, OTA updates, and App Store / Play Store distribution.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   # For all platforms
   npm start

   # Or for specific platforms
   npm run web      # Web browser
   npm run android  # Android device/emulator
   npm run ios      # iOS device/simulator
   ```

## 📱 Platform-Specific Features

### Web

- Responsive design optimized for desktop and tablet
- PWA capabilities with offline support
- SEO-optimized meta tags
- Touch-friendly interface for tablets

### Android

- Material Design components
- Edge-to-edge display support
- Optimized for various screen sizes
- APK and AAB build support

### iOS

- Native iOS design patterns
- Safe area handling
- Optimized for iPhone and iPad
- App Store ready builds

### Key Features Implemented

1. **Responsive Design**

   - Adaptive layouts for different screen sizes
   - Platform-specific styling
   - Touch-friendly interfaces

2. **Cross-Platform Components**

   - `ResponsiveImage`: Handles images across platforms
   - `ResponsiveLayout`: Flexible layout component
   - `StatusBar`: Platform-aware status bar

3. **Platform Detection**

   - Screen size detection (tablet, mobile, desktop)
   - Platform-specific rendering
   - Responsive breakpoints

4. **Web Optimization**
   - PWA configuration
   - SEO meta tags
   - Performance optimizations

## 🏗 Building for Production

### Web

```bash
npx expo export --platform web
```

### Android

```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

### iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

## 🎨 UI/UX

### Design System

- Consistent color palette across platforms
- Typography scale for different screen sizes
- Spacing system based on 8px grid
- Shadow and elevation system

### Responsive Breakpoints

- Small screens: < 375px
- Medium screens: 375px - 768px
- Large screens: > 768px
- Tablet: > 768px with specific aspect ratio

### Accessibility

- Screen reader support
- Keyboard navigation
- High contrast support
- Touch target optimization

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**

   ```bash
   npx expo start --clear
   ```

2. **Platform-specific build errors**

   - Check platform-specific dependencies
   - Verify platform configurations

3. **Web build issues**
   - Ensure all web-compatible dependencies
   - Check for web-specific code

### Performance Optimization

1. **Image Optimization**

   - Use `ResponsiveImage` component
   - Implement lazy loading
   - Optimize image sizes

2. **Bundle Size**
   - Remove unused dependencies
   - Use platform-specific imports
   - Implement code splitting

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Expo Router](https://expo.github.io/router/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## 🤝 Contributing

1. Follow the established code style
2. Test on all platforms before submitting
3. Update documentation for new features
4. Ensure responsive design principles

## 📄 License

This project is licensed under the MIT License.
