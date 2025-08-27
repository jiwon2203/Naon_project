module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // 다른 플러그인들이 여기에 있을 수 있습니다...
    'react-native-reanimated/plugin', // 이 줄을 추가하고, 항상 마지막에 두세요.
  ],
};
