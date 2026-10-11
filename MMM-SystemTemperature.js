/* global Module */

const MIN_UPDATE_INTERVAL = 1000;
const MAX_UPDATE_INTERVAL = 86400000;
const VALID_UNITS = ["c", "f", "k"];

Module.register("MMM-SystemTemperature", {
  defaults: {
    prependString: "System temperature: ",
    updateInterval: 5000,
    animationSpeed: 0,
    unit: "c",
    warning: {
      temp: 60,
      color: "orange",
      command: undefined
    },
    critical: {
      temp: 75,
      color: "red",
      command: {
        notification: "REMOTE_ACTION",
        payload: { action: "SHUTDOWN" }
      }
    }
  },

  getStyles() {
    return ["MMM-SystemTemperature.css", "font-awesome.css"];
  },

  start() {
    const configuredInterval = Number.isFinite(this.config.updateInterval)
      ? this.config.updateInterval
      : this.defaults.updateInterval;
    this.config.updateInterval = Math.max(
      MIN_UPDATE_INTERVAL,
      Math.min(configuredInterval, MAX_UPDATE_INTERVAL)
    );

    const unit = String(this.config.unit ?? "")
      .trim()
      .toLowerCase();
    this.config.unit = VALID_UNITS.includes(unit) ? unit : this.defaults.unit;

    this.sendSocketNotification("CONFIG", this.config);
    this.commandExecutor = this.getCommandExecutor();
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "TEMPERATURE") {
      const temperature = Number.parseFloat(payload);
      this.temperature =
        Number.isFinite(temperature) && temperature !== 0 ? temperature : null;
      this.sensorUnavailable = false;
      this.stateConfig = this.getStateConfigByTemperature();
      this.updateDom(this.config.animationSpeed);
      this.commandExecutor();
    } else if (notification === "TEMPERATURE_UNAVAILABLE") {
      this.sensorUnavailable = true;
      this.updateDom(this.config.animationSpeed);
    }
  },

  getDom() {
    const wrapper = document.createElement("div");

    if (this.sensorUnavailable) {
      wrapper.append("Temperature unavailable");
    } else if (Number.isFinite(this.temperature)) {
      wrapper.append(this.config.prependString, this.getTemperatureLabel());
      wrapper.style.color = this.stateConfig?.color || "";
    } else {
      const spinner = document.createElement("i");
      spinner.className = "fas fa-spinner fa-spin";
      wrapper.append(spinner, ` ${this.translate("LOADING")}`);
    }

    return wrapper;
  },

  getTemperatureLabel() {
    const label = document.createElement("span");
    const value = document.createElement("span");
    const unit = document.createElement("span");

    label.className = "temperatureLabel";
    value.className = "temperatureValue";
    unit.className = "temperatureUnit";
    value.textContent = this.getConvertedTemperature();
    unit.textContent = this.config.unit.toUpperCase();
    label.append(value, unit);

    return label;
  },

  getStateConfigByTemperature() {
    if (!this.temperature) return null;

    const { critical, warning } = this.config;

    if (critical && this.temperature >= critical.temp) {
      return critical;
    } else if (warning && this.temperature >= warning.temp) {
      return warning;
    }

    return null;
  },

  getConvertedTemperature() {
    if (!this.temperature) return this.temperature;

    const unit = this.config.unit;
    if (unit === "c") return this.temperature;

    let convertedTemp;

    switch (unit) {
      case "f":
        convertedTemp = (this.temperature * 9) / 5 + 32;
        break;
      case "k":
        convertedTemp = this.temperature + 273.15;
        break;
      default:
        return this.temperature;
    }

    // Round to 2 decimal places
    return Math.round(convertedTemp * 100) / 100;
  },

  getCommandExecutor() {
    const wait = this.config.updateInterval * 5;
    let timeoutId = null;
    let lastStateConfig = null;
    const alertedStates = new Set();
    const context = this;

    return function stateChangeExecutor() {
      const stateConfig = context.stateConfig ?? null;
      if (stateConfig === lastStateConfig) return;

      lastStateConfig = stateConfig;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (!stateConfig) {
        alertedStates.clear();
        return;
      }
      if (!stateConfig.command || alertedStates.has(stateConfig)) return;

      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (context.stateConfig !== stateConfig) return;

        alertedStates.add(stateConfig);
        context.sendNotification(
          stateConfig.command.notification,
          stateConfig.command.payload
        );
      }, wait);
    };
  }
});
