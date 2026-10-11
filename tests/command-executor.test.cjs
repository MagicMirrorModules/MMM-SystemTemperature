const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { runInNewContext } = require("node:vm");
const test = require("node:test");

const moduleSource = readFileSync(
  new URL("../MMM-SystemTemperature.js", `file://${__filename}`),
  "utf8"
);

const createTimers = () => {
  const timers = new Map();
  let nextTimerId = 0;

  return {
    clearTimeout: (timerId) => timers.delete(timerId),
    pendingCount: () => timers.size,
    runNext: () => {
      const [timerId, timer] = timers.entries().next().value;
      timers.delete(timerId);
      timer.callback();
    },
    setTimeout: (callback, delay) => {
      nextTimerId += 1;
      timers.set(nextTimerId, { callback, delay });
      return nextTimerId;
    }
  };
};

const loadModule = (
  config,
  timers,
  notifications,
  socketNotifications = []
) => {
  let definition;
  runInNewContext(moduleSource, {
    clearTimeout: timers.clearTimeout,
    Module: {
      register: (_name, moduleDefinition) => {
        definition = moduleDefinition;
      }
    },
    setTimeout: timers.setTimeout
  });

  return Object.assign(Object.create(definition), {
    config,
    sendSocketNotification: (notification, payload) =>
      socketNotifications.push({ notification, payload: { ...payload } }),
    sendNotification: (notification, payload) =>
      notifications.push({ notification, payload })
  });
};

const createAlertConfig = () => ({
  updateInterval: 1000,
  warning: {
    temp: 60,
    command: { notification: "WARNING", payload: { level: 1 } }
  },
  critical: {
    temp: 75,
    command: { notification: "CRITICAL", payload: { level: 2 } }
  }
});

test("start normalizes update interval and unit before sending config", () => {
  const timers = createTimers();
  const socketNotifications = [];
  const module = loadModule(
    { ...createAlertConfig(), updateInterval: 1, unit: "F" },
    timers,
    [],
    socketNotifications
  );

  module.start();

  assert.equal(socketNotifications[0].notification, "CONFIG");
  assert.equal(socketNotifications[0].payload.updateInterval, 1000);
  assert.equal(socketNotifications[0].payload.unit, "f");
});

test("start caps excessive intervals and falls back for unsupported units", () => {
  const timers = createTimers();
  const socketNotifications = [];
  const module = loadModule(
    { ...createAlertConfig(), updateInterval: 90000000, unit: "rankine" },
    timers,
    [],
    socketNotifications
  );

  module.start();

  assert.equal(socketNotifications[0].payload.updateInterval, 86400000);
  assert.equal(socketNotifications[0].payload.unit, "c");
});

test("start falls back for invalid interval and non-string unit", () => {
  const timers = createTimers();
  const socketNotifications = [];
  const module = loadModule(
    { ...createAlertConfig(), updateInterval: "often", unit: 42 },
    timers,
    [],
    socketNotifications
  );

  module.start();

  assert.equal(socketNotifications[0].payload.updateInterval, 5000);
  assert.equal(socketNotifications[0].payload.unit, "c");
});

test("command runs once while temperature remains in the same alert state", () => {
  const timers = createTimers();
  const notifications = [];
  const module = loadModule(createAlertConfig(), timers, notifications);
  module.stateConfig = module.config.critical;
  const executeCommand = module.getCommandExecutor();

  executeCommand();
  timers.runNext();
  executeCommand();

  assert.equal(timers.pendingCount(), 0);
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].notification, "CRITICAL");
});

test("state changes restart the pending command delay", () => {
  const timers = createTimers();
  const notifications = [];
  const module = loadModule(createAlertConfig(), timers, notifications);
  module.stateConfig = module.config.warning;
  const executeCommand = module.getCommandExecutor();

  executeCommand();
  module.stateConfig = module.config.critical;
  executeCommand();
  timers.runNext();

  assert.equal(timers.pendingCount(), 0);
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].notification, "CRITICAL");
});

test("alert states do not repeat commands before returning to normal", () => {
  const timers = createTimers();
  const notifications = [];
  const module = loadModule(createAlertConfig(), timers, notifications);
  const executeCommand = module.getCommandExecutor();

  module.stateConfig = module.config.warning;
  executeCommand();
  timers.runNext();
  module.stateConfig = module.config.critical;
  executeCommand();
  timers.runNext();
  module.stateConfig = module.config.warning;
  executeCommand();

  assert.equal(timers.pendingCount(), 0);
  assert.equal(notifications.length, 2);
});

test("returning to normal rearms the alert command", () => {
  const timers = createTimers();
  const notifications = [];
  const module = loadModule(createAlertConfig(), timers, notifications);
  module.stateConfig = module.config.warning;
  const executeCommand = module.getCommandExecutor();

  executeCommand();
  timers.runNext();
  module.stateConfig = null;
  executeCommand();
  module.stateConfig = module.config.warning;
  executeCommand();
  timers.runNext();

  assert.equal(notifications.length, 2);
  assert.equal(notifications[1].notification, "WARNING");
});
