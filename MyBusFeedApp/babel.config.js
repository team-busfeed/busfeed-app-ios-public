const presets = ['module:metro-react-native-babel-preset', "module:react-native-dotenv"]
const plugins = []

plugins.push([
  'module-resolver',
  {
    root: ['./src'],
    extensions: ['.js', '.json'],
    alias: {
      '@': './src',
    },
  },
])

module.exports = {
  presets,
  plugins,
}
