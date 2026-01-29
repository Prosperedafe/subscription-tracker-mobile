const path = require('path');
const fs = require('fs');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const toastMessageRoot = path.resolve(__dirname, 'node_modules', 'react-native-toast-message');
const dateTimePickerRoot = path.resolve(__dirname, 'node_modules', '@react-native-community', 'datetimepicker');
const googleFontsRoot = path.resolve(__dirname, 'node_modules', '@expo-google-fonts');

function resolveRelativeFromPackage(origin, moduleName) {
  if (!origin || !moduleName.startsWith('.')) return null;
  const originDir = path.dirname(origin);
  const resolvedBase = path.resolve(originDir, moduleName);
  const candidates = [
    resolvedBase + '.js',
    path.join(resolvedBase, 'index.js'),
    resolvedBase,
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return { filePath: candidate, type: 'sourceFile' };
    }
  }
  return null;
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context.originModulePath;
  const resolvedOrigin = origin ? path.resolve(origin) : '';
  const isFromToastMessage = resolvedOrigin.startsWith(toastMessageRoot);
  const isFromDateTimePicker = resolvedOrigin.startsWith(dateTimePickerRoot);
  const isFromGoogleFonts = resolvedOrigin.startsWith(googleFontsRoot);

  if ((isFromToastMessage || isFromDateTimePicker || isFromGoogleFonts) && moduleName.startsWith('.')) {
    const result = resolveRelativeFromPackage(origin, moduleName);
    if (result) return result;
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
