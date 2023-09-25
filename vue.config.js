const { defineConfig } = require("@vue/cli-service");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
module.exports = defineConfig({
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    plugins: [new NodePolyfillPlugin()],
    target: "electron-renderer",
  },
  pluginOptions: {
    electronBuilder: {
      // 엔트리 포인트 설정 (당연히 필수, 기본은 src/background.ts)
      mainProcessFile: "./src/main/background.ts",
      // 여기서 ES2020 의 문법 등을 TS로 컴파일 하기 전에
      //Babel로 전처리해야지 Electron에서 제대로 동작한다.
      chainWebpackMainProcess: (config) => {
        config.module
          .rule("babel")
          .before("ts")
          // .test(/C:\\Users\\pgh26\\Lab\\JavaScript\\DCParser\\dcparser\.ts$/)
          .test(/src\\main\\modules\\dcparser\.ts$/)
          .use("babel")
          .loader("babel-loader")
          .options({
            presets: [["@babel/preset-env", { modules: false }]],
            plugins: ["@babel/plugin-proposal-class-properties"],
          });
      },
      nsis: {
        shortcutName: "DCExplorer", // Shortcut name
        artifactName: "DCExplorer.${ext}", // Installation package name
      },
      win: {
        target: [
          {
            target: "portable",
            arch: ["ia32", "x64"],
          },
        ],
      },
    },
  },
  // 렌더러 프로세스의 엔트리 포인트 설정 (당연히 필수)
  pages: {
    index: "./src/renderer/main.ts",
  },
});
