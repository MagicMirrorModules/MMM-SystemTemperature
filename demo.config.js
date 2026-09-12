const config = {
  address: "0.0.0.0",
  ipWhitelist: [],
  logLevel: ["INFO", "LOG", "WARN", "ERROR", "DEBUG"],
  modules: [
    {
      module: "clock",
      position: "middle_center"
    },
    {
      module: "MMM-SystemTemperature",
      position: "top_center",
      config: {
        prependString: "CPU temperature: ",
        warning: {
          temp: 60,
          color: "orange",
          command: null
        },
        critical: {
          temp: 75,
          color: "red",
          command: null
        }
      }
    }
  ]
};

/** ************* DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = config;
}
