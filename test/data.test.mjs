import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HISTORY_DAYS,
  LANGUAGES,
  METRICS,
  ORDER,
  VERSION,
  buildModel,
  countStreak,
  dayKey,
  formatAmount,
  formatFull,
  formatNumber,
  formatStreak,
  fromForm,
  lastDays,
  localeSettings,
  perDay,
  readNumber,
  readToday,
  resolveGoal,
  suggestEntities,
  toForm,
  translate,
  unitFactor,
} from "../dist/life-dashboard-activity-card.js";
import { readFileSync } from "node:fs";
import { TIME_ZONE, hostileString, rows, scenes, week } from "./fixtures.mjs";

const NOW = Date.UTC(2026, 10, 20, 12, 0);
const hassOf = (scene, extra = {}) => ({
  states: scene.states,
  config: { time_zone: TIME_ZONE },
  locale: { language: "en-GB" },
  ...extra,
});
const state = (value, unit) => ({ state: String(value), attributes: { unit_of_measurement: unit } });

/** What loadHistory would hand the card for a scene with its own statistics. */
function historyOf(scene, map) {
  const all = scene.statistics(NOW);
  return Object.fromEntries(
    Object.entries(map).map(([metric, [id, factor, fields]]) => [metric, perDay(all[id], factor, TIME_ZONE, fields)]),
  );
}

test("readNumber takes numbers and numeric strings only", () => {
  assert.equal(readNumber(12), 12);
  assert.equal(readNumber("7842"), 7842);
  assert.equal(readNumber(" 0.5 "), 0.5);
  for (const bad of ["unavailable", "unknown", "", "  ", null, undefined, NaN, Infinity, {}, [], true]) {
    assert.equal(readNumber(bad), null, String(bad));
  }
});

test("unitFactor brings energy to kcal and exercise to minutes", () => {
  assert.equal(unitFactor("exercise", "h"), 60);
  assert.equal(unitFactor("exercise", "min"), 1);
  assert.equal(unitFactor("exercise", "s"), 1 / 60);
  assert.equal(unitFactor("energy", "kcal"), 1);
  assert.ok(Math.abs(unitFactor("energy", "kJ") * 4.184 - 1) < 1e-9);
  assert.equal(unitFactor("steps", "steps"), 1);
  assert.equal(unitFactor("energy", "bananas"), 1);
  assert.equal(unitFactor("exercise", "constructor"), 1);
  assert.equal(unitFactor("nothing", "h"), 1);
});

test("readToday reads the state, in the card's unit", () => {
  const hass = { states: { "sensor.a": state(7842, "steps"), "sensor.h": state(0.5, "h"), "sensor.u": state("unavailable"), "sensor.n": state(-4) } };
  assert.deepEqual(readToday(hass, "steps", "sensor.a"), { value: 7842, status: "ok" });
  assert.deepEqual(readToday(hass, "exercise", "sensor.h"), { value: 30, status: "ok" });
  assert.deepEqual(readToday(hass, "steps", "sensor.u"), { value: null, status: "unavailable" });
  assert.deepEqual(readToday(hass, "steps", "sensor.n"), { value: null, status: "unavailable" });
  assert.deepEqual(readToday(hass, "steps", "sensor.gone"), { value: null, status: "missing" });
  assert.deepEqual(readToday(undefined, "steps", "sensor.a"), { value: null, status: "missing" });
});

test("resolveGoal takes a number, a helper, or the default", () => {
  const hass = { states: { "input_number.goal": state(8000, "steps"), "input_number.hours": state(0.75, "h"), "input_number.off": state("unavailable"), "input_number.zero": state(0) } };
  assert.equal(resolveGoal(hass, "steps", 12000), 12000);
  assert.equal(resolveGoal(hass, "steps", "9000"), 9000);
  assert.equal(resolveGoal(hass, "steps", "input_number.goal"), 8000);
  assert.equal(resolveGoal(hass, "exercise", "input_number.hours"), 45);
  for (const bad of [undefined, null, "", 0, -5, "soon", "input_number.off", "input_number.zero", "input_number.gone", {}, hostileString]) {
    assert.equal(resolveGoal(hass, "steps", bad), METRICS.steps.goal, String(bad));
  }
  assert.equal(resolveGoal(undefined, "energy", "input_number.goal"), METRICS.energy.goal);
});

test("dayKey and lastDays follow the time zone", () => {
  const lateEvening = Date.UTC(2026, 10, 19, 23, 30);
  assert.equal(dayKey(lateEvening, "Europe/Amsterdam"), "2026-11-20");
  assert.equal(dayKey(lateEvening, "America/New_York"), "2026-11-19");
  assert.equal(dayKey(lateEvening, "Not/AZone").length, 10);
  assert.deepEqual(lastDays(lateEvening, 3, "Europe/Amsterdam"), ["2026-11-18", "2026-11-19", "2026-11-20"]);
  const march = lastDays(Date.UTC(2026, 2, 30, 12), 3, "Europe/Amsterdam");
  assert.deepEqual(march, ["2026-03-28", "2026-03-29", "2026-03-30"], "across the change to summer time");
  assert.equal(lastDays(NOW, HISTORY_DAYS, TIME_ZONE).length, HISTORY_DAYS);
});

test("perDay puts each row on its own date and skips what is malformed", () => {
  const midnight = Date.UTC(2026, 10, 18, 23, 0);
  const days = perDay(
    [
      { start: midnight, change: 9000 },
      { start: new Date(midnight + 86400000).toISOString(), change: 400, state: 10400 },
      { start: midnight + 2 * 86400000, max: 31, mean: 12 },
      { start: "never", change: 5 },
      { start: midnight + 3 * 86400000, change: -3 },
      { start: midnight + 4 * 86400000, change: "12" },
      { start: midnight + 5 * 86400000, change: null, state: null },
      null,
      7,
    ],
    1,
    "Europe/Amsterdam",
  );
  assert.deepEqual([...days], [["2026-11-19", 9000], ["2026-11-20", 10400], ["2026-11-21", 31]]);
  assert.deepEqual([...perDay(undefined, 1)], []);
  assert.deepEqual([...perDay("rows", 1)], []);
  assert.deepEqual([...perDay([{ start: midnight, change: 0.5 }], 60, "Europe/Amsterdam")], [["2026-11-19", 30]]);
  // The integration's statistics: only the change counts, whatever else a row has.
  assert.deepEqual([...perDay([{ start: midnight, change: 600, state: 99999 }], 1, "Europe/Amsterdam", ["change"])], [["2026-11-19", 600]]);
});

test("countStreak counts back from today and forgives a day in progress", () => {
  assert.equal(countStreak([]), 0);
  assert.equal(countStreak([false]), 0);
  assert.equal(countStreak([true]), 1);
  assert.equal(countStreak([true, true, false]), 2);
  assert.equal(countStreak([true, true, true]), 3);
  assert.equal(countStreak([true, false, true, true, false]), 2);
  assert.equal(countStreak([true, false, false]), 0);
  assert.equal(countStreak([false, true, true, false, true]), 1);
});

test("buildModel: three goals of one phone", () => {
  const scene = scenes.app;
  const history = {
    steps: perDay(rows([...week.steps.slice(0, 6)], NOW), 1, TIME_ZONE),
    energy: perDay(rows([...week.energy.slice(0, 6)], NOW), 1, TIME_ZONE),
    exercise: perDay(rows([...week.exercise.slice(0, 6)], NOW, { factor: 1 / 60 }), 60, TIME_ZONE),
  };
  const model = buildModel(scene.config, hassOf(scene), history, NOW);
  assert.deepEqual(model.metrics.map((metric) => metric.key), ORDER);
  assert.equal(model.today, "2026-11-20");
  assert.deepEqual(model.week, ["2026-11-14", "2026-11-15", "2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"]);
  const [steps, energy, exercise] = model.metrics;
  assert.equal(steps.value, 7842);
  assert.equal(steps.goal, 10000);
  assert.equal(steps.met, false);
  assert.ok(Math.abs(steps.fraction - 0.7842) < 1e-9);
  assert.deepEqual(steps.week.map((day) => day.value), week.steps);
  assert.deepEqual(steps.week.map((day) => day.met), [false, true, true, true, true, true, false]);
  assert.equal(steps.streak, 5, "yesterday and the four days before it; today is still running");
  assert.equal(energy.goal, 600);
  assert.equal(energy.streak, 2);
  assert.deepEqual(exercise.week.map((day) => day.value), week.exercise);
  assert.equal(exercise.goal, 30);
  assert.equal(exercise.streak, 4);
  assert.equal(model.everyStreak, 2, "the two days on which all three were reached");
  assert.equal(model.limit, HISTORY_DAYS);
  assert.ok(steps.hasHistory);
  assert.equal("days" in steps, false);
});

test("buildModel: goals from helpers, a sensor in hours, and every goal", () => {
  const scene = scenes.reached;
  const [steps, energy, exercise] = ORDER.map((key) => scene.config[key]);
  const history = historyOf(scene, { steps: [steps, 1], energy: [energy, 1], exercise: [exercise, 1] });
  const model = buildModel(scene.config, hassOf(scene), history, NOW);
  assert.deepEqual(model.metrics.map((metric) => metric.goal), [8000, 500, 30]);
  assert.deepEqual(model.metrics.map((metric) => metric.met), [true, true, true]);
  assert.deepEqual(model.metrics.map((metric) => metric.fraction), [1, 1, 1]);
  assert.equal(model.metrics[2].value, 48);
  assert.deepEqual(model.metrics.map((metric) => metric.streak), [4, 4, 4]);
  assert.equal(model.everyStreak, 4);
});

test("buildModel: today counts as soon as its goal is reached", () => {
  const hass = { states: { "sensor.s": state(10000, "steps") }, config: { time_zone: TIME_ZONE } };
  const history = { steps: perDay(rows([12000, 3000, 11000, 10000], NOW), 1, TIME_ZONE) };
  assert.equal(buildModel({ steps: "sensor.s" }, hass, history, NOW).metrics[0].streak, 3);
  hass.states["sensor.s"] = state(9999, "steps");
  assert.equal(buildModel({ steps: "sensor.s" }, hass, history, NOW).metrics[0].streak, 2);
});

test("buildModel: a gap in the days ends the streak", () => {
  const hass = { states: { "sensor.s": state(100, "steps") }, config: { time_zone: TIME_ZONE } };
  const days = rows([12000, 12000, 12000, 12000], NOW);
  days.splice(2, 1);
  const model = buildModel({ steps: "sensor.s" }, hass, { steps: perDay(days, 1, TIME_ZONE) }, NOW);
  assert.equal(model.metrics[0].streak, 1);
  assert.deepEqual(model.metrics[0].week.slice(-5).map((day) => day.value), [12000, 12000, null, 12000, 100]);
});

test("buildModel: missing, unavailable and unconfigured sensors", () => {
  const scene = scenes.broken;
  const model = buildModel(scene.config, hassOf(scene), {}, NOW);
  assert.deepEqual(model.metrics.map((metric) => metric.status), ["ok", "unavailable", "missing"]);
  assert.deepEqual(model.metrics.map((metric) => metric.value), [4310, null, null]);
  assert.deepEqual(model.metrics.map((metric) => metric.fraction), [0.431, 0, 0]);
  assert.equal(model.metrics[0].hasHistory, false);
  assert.equal(model.everyStreak, 0);
  for (const config of [{}, { steps: "" }, { steps: "  " }, { steps: 5 }, null, undefined]) {
    const empty = buildModel(config, hassOf(scene), {}, NOW);
    assert.deepEqual(empty.metrics, []);
    assert.equal(empty.everyStreak, 0);
  }
  assert.deepEqual(buildModel({ energy: scene.config.energy }, undefined, undefined, NOW).metrics[0].status, "missing");
});

test("buildModel: today falls back on the statistics when the sensor is away", () => {
  const scene = scenes.broken;
  const history = { energy: new Map([["2026-11-20", 222]]) };
  const model = buildModel(scene.config, hassOf(scene), history, NOW);
  assert.equal(model.metrics[1].value, null, "the ring shows only what the sensor says");
  assert.equal(model.metrics[1].week[6].value, 222);
});

test("suggestEntities finds the three sensors by name", () => {
  const hass = { states: Object.fromEntries(["sensor.x_steps_today", "sensor.x_active_calories_today", "sensor.x_exercise_today", "sensor.x_total_calories_today", "light.steps"].map((id) => [id, {}])) };
  assert.deepEqual(suggestEntities(hass), { steps: "sensor.x_steps_today", energy: "sensor.x_active_calories_today", exercise: "sensor.x_exercise_today" });
  assert.deepEqual(suggestEntities({ states: { "sensor.watch_steps": {}, "sensor.weight": {} } }), { steps: "sensor.watch_steps" });
  assert.deepEqual(suggestEntities({ states: {} }), {});
  assert.deepEqual(suggestEntities(undefined), {});
  assert.deepEqual(suggestEntities(hass, ["sensor.other_daily_steps", 4, null]), { steps: "sensor.other_daily_steps" });
});

test("toForm and fromForm keep a goal as a number or an entity", () => {
  const config = { type: "custom:life-dashboard-activity-card", steps: "sensor.s", steps_goal: 12000, energy: "sensor.e", energy_goal: "input_number.kcal" };
  const form = toForm(config);
  assert.equal(form.steps_goal, 12000);
  assert.equal(form.steps_goal_entity, undefined);
  assert.equal(form.energy_goal, undefined);
  assert.equal(form.energy_goal_entity, "input_number.kcal");
  assert.equal(form.streak, "selected");
  assert.deepEqual(fromForm(form), config);
  assert.deepEqual(fromForm({ ...form, steps_goal_entity: "input_number.steps" }).steps_goal, "input_number.steps");
  assert.deepEqual(fromForm({ ...form, energy_goal_entity: "", energy_goal: 450 }).energy_goal, 450);
  assert.equal("steps_goal" in fromForm({ ...form, steps_goal: undefined }), false);
  assert.equal("steps_goal" in fromForm({ ...form, steps_goal: 0 }), false);
  assert.equal(fromForm({ ...form, streak: "all" }).streak, "all");
  assert.deepEqual(fromForm({ steps: "sensor.s", title: "", energy: null, exercise: undefined, streak: "selected" }), { steps: "sensor.s" });
  assert.equal(toForm({ steps_goal: "9000" }).steps_goal, 9000);
});

test("formatting follows the language", () => {
  assert.equal(formatNumber(7842, "en"), "7,842");
  assert.equal(formatNumber(7842.6, "de"), "7.843");
  assert.equal(formatAmount("steps", 10000, "en"), "10,000");
  assert.equal(formatAmount("energy", 600, "en"), "600 kcal");
  assert.equal(formatAmount("exercise", 30, "en"), "30 min");
  assert.equal(formatFull("steps", 11450, "en"), "11,450 steps");
  assert.equal(formatFull("steps", 11450, "nl"), "11.450 stappen");
  assert.equal(formatFull("energy", 412, "nl"), "412 kcal");
  assert.equal(formatStreak(1, "en"), "1 day in a row");
  assert.equal(formatStreak(5, "en"), "5 days in a row");
  assert.equal(formatStreak(1, "nl"), "1 dag op rij");
  assert.equal(formatStreak(12, "de"), "12 Tage in Folge");
  assert.equal(formatStreak(366, "en", true), "366+ days in a row");
});

test("localeSettings survives a language Intl does not know", () => {
  assert.equal(localeSettings({ locale: { language: "nl" } }).language, "nl");
  assert.equal(localeSettings({ language: "de" }).language, "de");
  assert.equal(localeSettings({ locale: { language: "not a language" } }).language, "en");
  assert.equal(localeSettings(undefined).language, "en");
});

test("every language has every string, with the same placeholders", () => {
  assert.deepEqual(LANGUAGES, ["en", "nl", "de", "es", "fr", "it", "pt", "ja", "zh", "hi", "ar"]);
  const source = readFileSync(new URL("../dist/life-dashboard-activity-card.js", import.meta.url), "utf8");
  const block = source.slice(source.indexOf("const STRINGS = {"), source.indexOf("export const LANGUAGES"));
  const keys = [...block.slice(0, block.indexOf("\n  nl: {")).matchAll(/^ {4}(\w+): /gm)].map((match) => match[1]);
  assert.ok(keys.length > 25);
  const holes = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join();
  for (const language of LANGUAGES) {
    for (const key of keys) {
      const text = translate(language, key);
      const raw = translate(language, key, new Proxy({}, { get: (_, name) => `{${String(name)}}` }));
      assert.ok(text.length > 0, `${language}.${key}`);
      if (language !== "en") {
        assert.equal(holes(raw), holes(translate("en", key, new Proxy({}, { get: (_, name) => `{${String(name)}}` }))), `${language}.${key}`);
      }
    }
    const section = block.slice(block.indexOf(`\n  ${language}: {`));
    const own = [...section.slice(0, section.indexOf("\n  },")).matchAll(/^ {4}(\w+): /gm)].map((match) => match[1]);
    assert.deepEqual(own, keys, language);
  }
  assert.equal(translate("pt-BR", "today"), "Hoje");
  assert.equal(translate("xx", "today"), "Today");
  assert.equal(translate("en", "nope"), "nope");
  assert.equal(translate(undefined, "toGo", { value: "5" }), "5 to go");
});

test("no dashes that read as machine-written, anywhere in the card", () => {
  const source = readFileSync(new URL("../dist/life-dashboard-activity-card.js", import.meta.url), "utf8");
  assert.equal(source.includes(String.fromCharCode(0x2013)) || source.includes(String.fromCharCode(0x2014)), false);
});

test("the version is semver and matches package.json", () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.version, VERSION);
});
