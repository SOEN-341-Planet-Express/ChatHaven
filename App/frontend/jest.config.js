module.exports = {
    transform: {
      "^.+\.(js|jsx)$": "babel-jest",
    },
    testEnvironment: "jsdom",
    moduleDirectories: ["node_modules", "src"],
  };