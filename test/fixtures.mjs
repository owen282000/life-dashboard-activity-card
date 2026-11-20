// Sample days for the harness and the node tests. Every number here is made up: a phone
// named Sam's Pixel that does not exist, and a week shaped so the card has something to show.

import { dayKey } from "../dist/life-dashboard-activity-card.js";

export const TIME_ZONE = "Europe/Amsterdam";
const DAY = 86400000;
const ENTRY = "01SAMPLEENTRY0000000000000";

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Six earlier days and today, oldest first: steps, active kcal, exercise minutes. */
export const week = {
  steps: [8120, 11450, 13200, 10480, 10950, 11830, 7842],
  energy: [640, 520, 702, 455, 610, 612, 412],
  exercise: [41, 18, 55, 34, 38, 31, 26],
};

/** Forty ordinary days before that week, so the streak has a past to stop at. */
function earlier(metric, seed) {
  const random = mulberry32(seed);
  const base = { steps: 7600, energy: 480, exercise: 24 }[metric];
  return Array.from({ length: 40 }, () => Math.round(base * (0.55 + random() * 0.8)));
}

/** Daily rows as the recorder returns them: one per day, starting at local midnight. */
export function rows(values, now, { field = "change", factor = 1 } = {}) {
  const today = Date.parse(`${dayKey(now, TIME_ZONE)}T00:00:00Z`);
  const count = values.length;
  // Midnight in Amsterdam is 23:00 UTC the evening before, in winter.
  return values.map((value, index) => ({
    start: today - (count - index) * DAY - 3600000,
    end: today - (count - index - 1) * DAY - 3600000,
    [field]: value * factor,
  }));
}

function sensor(entity_id, state, unit, name, extra = {}) {
  return { entity_id, state: String(state), attributes: { unit_of_measurement: unit, friendly_name: name, ...extra } };
}

const pixel = {
  steps: "sensor.sams_pixel_steps_today",
  energy: "sensor.sams_pixel_active_calories_today",
  exercise: "sensor.sams_pixel_exercise_today",
};

const tablet = {
  steps: "sensor.milas_phone_steps",
  energy: "sensor.milas_phone_active_energy",
  exercise: "sensor.milas_phone_exercise_time",
};
const old = { steps: "sensor.old_phone_steps", energy: "sensor.old_phone_active_calories" };

function past(metric) {
  return [...earlier(metric, { steps: 11, energy: 23, exercise: 37 }[metric]), ...week[metric].slice(0, 6)];
}

export const scenes = {
  // Life Dashboard: three sensors of one phone, the days in the integration's own statistics.
  app: {
    config: { ...pixel, energy_goal: 600 },
    states: {
      [pixel.steps]: sensor(pixel.steps, week.steps[6], "steps", "Sam's Pixel Steps today"),
      [pixel.energy]: sensor(pixel.energy, week.energy[6], "kcal", "Sam's Pixel Active calories today"),
      [pixel.exercise]: sensor(pixel.exercise, week.exercise[6], "min", "Sam's Pixel Exercise today"),
    },
    registry: {
      [pixel.steps]: { platform: "life_dashboard", config_entry_id: ENTRY, unique_id: `${ENTRY}_steps_today` },
      [pixel.energy]: { platform: "life_dashboard", config_entry_id: ENTRY, unique_id: `${ENTRY}_active_calories_today` },
      [pixel.exercise]: { platform: "life_dashboard", config_entry_id: ENTRY, unique_id: `${ENTRY}_exercise_today` },
    },
    statistics: (now) => ({
      [`life_dashboard:${ENTRY.toLowerCase()}_steps`]: rows(past("steps"), now),
      [`life_dashboard:${ENTRY.toLowerCase()}_active_calories`]: rows(past("energy"), now),
      // The integration keeps exercise in hours.
      [`life_dashboard:${ENTRY.toLowerCase()}_exercise_minutes`]: rows(past("exercise"), now, { factor: 1 / 60 }),
    }),
    metadata: [
      { statistic_id: `life_dashboard:${ENTRY.toLowerCase()}_steps`, statistics_unit_of_measurement: "steps" },
      { statistic_id: `life_dashboard:${ENTRY.toLowerCase()}_active_calories`, statistics_unit_of_measurement: "kcal" },
      { statistic_id: `life_dashboard:${ENTRY.toLowerCase()}_exercise_minutes`, statistics_unit_of_measurement: "h" },
    ],
    devices: { entities: Object.fromEntries(Object.values(pixel).map((id) => [id, { device_id: "pixel", platform: "life_dashboard" }])), devices: { pixel: { name: "Sam's Pixel" } } },
  },
  // Any other integration: one steps sensor that counts up through the day.
  steps: {
    config: { steps: "sensor.sams_watch_steps" },
    states: {
      "sensor.sams_watch_steps": sensor("sensor.sams_watch_steps", week.steps[6], "steps", "Sam's watch Steps", { state_class: "total_increasing" }),
    },
    statistics: (now) => ({ "sensor.sams_watch_steps": rows(past("steps"), now) }),
    metadata: [{ statistic_id: "sensor.sams_watch_steps", statistics_unit_of_measurement: "steps" }],
  },
  // Every goal reached, the goals from helpers, and exercise in hours.
  reached: {
    config: { ...tablet, steps_goal: "input_number.step_goal", energy_goal: 500, exercise_goal: "input_number.exercise_goal", streak: "all" },
    states: {
      [tablet.steps]: sensor(tablet.steps, 9240, "steps", "Steps today"),
      [tablet.energy]: sensor(tablet.energy, 655, "kcal", "Active calories today"),
      [tablet.exercise]: sensor(tablet.exercise, 0.8, "h", "Exercise today"),
      "input_number.step_goal": sensor("input_number.step_goal", 8000, "steps", "Step goal"),
      "input_number.exercise_goal": sensor("input_number.exercise_goal", 0.5, "h", "Exercise goal"),
    },
    statistics: (now) => ({
      [tablet.steps]: rows([5200, 8300, 9100, 12040], now),
      [tablet.energy]: rows([430, 560, 610, 540], now),
      [tablet.exercise]: rows([10, 35, 44, 61], now, { field: "max" }),
    }),
    metadata: [
      { statistic_id: tablet.steps, statistics_unit_of_measurement: "steps" },
      { statistic_id: tablet.energy, statistics_unit_of_measurement: "kcal" },
      { statistic_id: tablet.exercise, statistics_unit_of_measurement: "min" },
    ],
  },
  // A sensor Home Assistant has no statistics for yet.
  fresh: {
    config: { steps: "sensor.new_steps" },
    states: { "sensor.new_steps": sensor("sensor.new_steps", 3120, "steps", "New steps") },
    statistics: () => ({}),
    metadata: [],
  },
  // One sensor unavailable and one that does not exist.
  broken: {
    config: { steps: old.steps, energy: old.energy, exercise: "sensor.gone" },
    states: {
      [old.steps]: sensor(old.steps, 4310, "steps", "Steps today"),
      [old.energy]: sensor(old.energy, "unavailable", "kcal", "Active calories today"),
    },
    statistics: (now) => ({ [old.steps]: rows([9000, 10400, 12000], now) }),
    metadata: [],
  },
  empty: { config: { steps: "" }, states: {}, statistics: () => ({}), metadata: [] },
};

export const hostileString = '<img src=x onerror="window.__pwned=1">';

/** A fake `hass.callWS` for a scene, counting what was asked. */
export function makeCallWS(scene, log = []) {
  return async (message) => {
    log.push(message);
    if (message.type === "config/entity_registry/get") {
      const entry = scene.registry?.[message.entity_id];
      if (!entry) throw new Error("not found");
      return entry;
    }
    if (message.type === "recorder/statistics_during_period") {
      const all = scene.statistics(Date.now());
      return Object.fromEntries(message.statistic_ids.filter((id) => all[id]).map((id) => [id, all[id]]));
    }
    if (message.type === "recorder/get_statistics_metadata") return scene.metadata;
    throw new Error(`unexpected ${message.type}`);
  };
}
