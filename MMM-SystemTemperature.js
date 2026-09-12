/* global Module */

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
    this.sendSocketNotification("CONFIG", this.config);
    this.config.unit = this.config.unit && this.config.unit.toLowerCase();
    this.commandExecutor = this.getCommandExecutor();
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "TEMPERATURE") {
      const temperature = Number.parseFloat(payload);
      this.temperature =
        Number.isFinite(temperature) && temperature !== 0 ? temperature : null;
      this.stateConfig = this.getStateConfigByTemperature();
      this.updateDom(this.config.animationSpeed);
      this.commandExecutor();
    }
  },

  getDom() {
    const wrapper = document.createElement("div");

    if (this.temperature !== null && !isNaN(this.temperature)) {
      wrapper.innerHTML =
        this.config.prependString + this.getTemperatureLabel();
      wrapper.style.color = this.stateConfig?.color || "";
    } else {
      wrapper.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${this.translate("LOADING")}`;
    }

    return wrapper;
  },

  getTemperatureLabel() {
    return `<span class="temperatureLabel">
      <span class="temperatureValue">${this.getConvertedTemperature()}</span>
      <span class="temperatureUnit">${this.config.unit.toUpperCase()}</span>
    </span>`;
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
    const context = this;

    return function throttledExecutor() {
      if (timeoutId) return; // Already scheduled

      timeoutId = setTimeout(() => {
        timeoutId = null;
        const { stateConfig } = context;
        if (stateConfig?.command) {
          context.sendNotification(
            stateConfig.command.notification,
            stateConfig.command.payload
          );
        }
      }, wait);
    };
  }
});
