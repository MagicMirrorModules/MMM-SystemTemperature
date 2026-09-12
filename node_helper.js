const systeminformation = require("systeminformation");
const Log = require("logger");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  start() {
    Log.log(`Starting module helper: ${this.name}`);
    this.intervalId = null;
    this.temperatureRequestInFlight = false;
  },

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      Log.log(`${this.name} helper stopped`);
    }
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;

      // Clear existing interval if any
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      // Start temperature monitoring
      this.intervalId = setInterval(() => {
        this.sendTemperature();
      }, this.config.updateInterval);

      Log.log(
        `${this.name}: Temperature monitoring started (interval: ${this.config.updateInterval}ms)`
      );
    }
  },

  async getCPUTemperature() {
    try {
      const data = await systeminformation.cpuTemperature();

      // Validate temperature data
      if (
        !data ||
        typeof data.main !== "number" ||
        data.main < -50 ||
        data.main > 150
      ) {
        Log.warn(`${this.name}: Invalid temperature data received:`, data);
        return null;
      }

      return data.main;
    } catch (error) {
      Log.error(
        `${this.name}: Error retrieving CPU temperature:`,
        error.message
      );
      return null;
    }
  },

  async sendTemperature() {
    if (this.temperatureRequestInFlight) return;

    this.temperatureRequestInFlight = true;

    try {
      const temperature = await this.getCPUTemperature();

      if (temperature !== null) {
        this.sendSocketNotification("TEMPERATURE", temperature);
      } else {
        Log.warn(
          `${this.name}: Skipping temperature update due to invalid data`
        );
      }
    } finally {
      this.temperatureRequestInFlight = false;
    }
  }
});
