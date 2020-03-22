module.exports = {
  capitalise: (str) => str.slice(0, 1).toUpperCase() + str.slice(1),
  cleanName: (tag) => {
    const name = tag.split("#");
    const cleanName = name[0].replace(/\W+/g, "") || "unknown";
    return `${cleanName.slice(0, 95)}-${name[1]}`;
  },
  format: (str, ...args) => {
    for (const arg of args) {
      str = str.replace(/{}/, arg);
    }
    return str;
  },
  convertMS(ms) {
    const roundTowardsZero = ms > 0 ? Math.floor : Math.ceil;
    const converted = {
      days: roundTowardsZero(ms / 86400000),
      hours: roundTowardsZero(ms / 3600000) % 24,
      minutes: roundTowardsZero(ms / 60000) % 60,
      seconds: roundTowardsZero(ms / 1000) % 60,
      milliseconds: roundTowardsZero(ms) % 1000,
      microseconds: roundTowardsZero(ms * 1000) % 1000,
      nanoseconds: roundTowardsZero(ms * 1e6) % 1000
    };

    const plural = (x) => (x !== 1 ? "s" : "");
    const string = [
      +converted.days ? `${converted.days} day${plural(converted.days)}` : "",
      +converted.hours ? `${converted.hours} hour${plural(converted.hours)}` : "",
      +converted.minutes ? `${converted.minutes} minute${plural(converted.minutes)}` : "",
      +converted.seconds ? `${converted.seconds} second${plural(converted.seconds)}` : ""
    ]
      .filter((x) => x)
      .join(", ");

    return { ...converted, string };
  }
};
