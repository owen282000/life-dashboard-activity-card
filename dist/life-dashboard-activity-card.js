// Daily activity goals as rings, with the last seven days and a streak, for Home
// Assistant dashboards. A single ES module with no dependencies and no build step.
// The pure data functions are exported so test/data.test.mjs can run them under Node.

export const VERSION = "0.1.0";

const CARD_TAG = "life-dashboard-activity-card";
const EDITOR_TAG = "life-dashboard-activity-card-editor";
const PLATFORM = "life_dashboard";

const DAY = 86400000;
const STATS_TTL = 5 * 60000;
const WEEK_DAYS = 7;
/** How far back the streak can look: a year and today. */
export const HISTORY_DAYS = 366;

/**
 * The three goals. `sensor` and `statistic` are the Life Dashboard integration's keys: the
 * sensor's unique id ends in the first, its daily long-term statistic in the second.
 */
export const METRICS = {
  steps: { goal: 10000, sensor: "steps_today", statistic: "steps" },
  energy: { goal: 500, sensor: "active_calories_today", statistic: "active_calories" },
  exercise: { goal: 30, sensor: "exercise_today", statistic: "exercise_minutes" },
};
export const ORDER = ["steps", "energy", "exercise"];

// Energy is shown in kcal and exercise in minutes, whatever unit the sensor has.
const UNIT_FACTORS = {
  steps: {},
  energy: { kcal: 1, Cal: 1, cal: 0.001, kJ: 1 / 4.184, J: 1 / 4184, Wh: 0.860421, kWh: 860.421 },
  exercise: { min: 1, h: 60, s: 1 / 60, d: 1440, ms: 1 / 60000 },
};

const SUGGESTED = {
  steps: ["_steps_today", "_daily_steps", "_steps"],
  energy: ["_active_calories_today", "_active_calories", "_active_energy", "_active_energy_burned"],
  exercise: ["_exercise_today", "_exercise_minutes", "_exercise_time", "_active_minutes"],
};

const STRINGS = {
  en: {
    title: "Activity",
    steps: "Steps",
    energy: "Active energy",
    exercise: "Exercise",
    ofGoal: "of {goal}",
    toGo: "{value} to go",
    reached: "Goal reached",
    stepsValue: "{n} steps",
    lastDays: "Last {n} days",
    today: "Today",
    streakOne: "{n} day in a row",
    streakOther: "{n} days in a row",
    streakAll: "every goal",
    metDays: "Goal reached on {met} of {n} days",
    ringsLabel: "Today's goals",
    dayOf: "Day {n} of {total}",
    plotHint: "Use the left and right arrow keys to step through the days",
    tableDay: "Day",
    noValue: "No data",
    unavailable: "Unavailable",
    missing: "Not found",
    pickTitle: "Choose a sensor",
    pickBody: "Pick a steps sensor in the card's editor. Active energy and exercise are optional.",
    noHistory: "Earlier days show up once Home Assistant has daily statistics for this sensor.",
    editorTitle: "Title",
    editorSteps: "Steps sensor",
    editorEnergy: "Active energy sensor",
    editorExercise: "Exercise sensor",
    editorGoal: "Daily goal",
    editorGoalEntity: "Or a helper that holds the goal",
    editorStreak: "The streak counts",
    streakSelected: "The goal shown in the chart",
    streakEvery: "Days with every goal reached",
  },
  nl: {
    title: "Activiteit",
    steps: "Stappen",
    energy: "Actieve energie",
    exercise: "Training",
    ofGoal: "van {goal}",
    toGo: "nog {value}",
    reached: "Doel gehaald",
    stepsValue: "{n} stappen",
    lastDays: "Laatste {n} dagen",
    today: "Vandaag",
    streakOne: "{n} dag op rij",
    streakOther: "{n} dagen op rij",
    streakAll: "elk doel",
    metDays: "Doel gehaald op {met} van {n} dagen",
    ringsLabel: "De doelen van vandaag",
    dayOf: "Dag {n} van {total}",
    plotHint: "Gebruik de pijltjestoetsen links en rechts om door de dagen te lopen",
    tableDay: "Dag",
    noValue: "Geen gegevens",
    unavailable: "Niet beschikbaar",
    missing: "Niet gevonden",
    pickTitle: "Kies een sensor",
    pickBody: "Kies een stappensensor in de editor van de kaart. Actieve energie en training zijn optioneel.",
    noHistory: "Eerdere dagen verschijnen zodra Home Assistant dagstatistieken van deze sensor heeft.",
    editorTitle: "Titel",
    editorSteps: "Stappensensor",
    editorEnergy: "Sensor voor actieve energie",
    editorExercise: "Trainingssensor",
    editorGoal: "Dagdoel",
    editorGoalEntity: "Of een helper met het doel",
    editorStreak: "De reeks telt",
    streakSelected: "Het doel dat in de grafiek staat",
    streakEvery: "Dagen waarop elk doel gehaald is",
  },
  de: {
    title: "Aktivität",
    steps: "Schritte",
    energy: "Aktive Energie",
    exercise: "Training",
    ofGoal: "von {goal}",
    toGo: "noch {value}",
    reached: "Ziel erreicht",
    stepsValue: "{n} Schritte",
    lastDays: "Letzte {n} Tage",
    today: "Heute",
    streakOne: "{n} Tag in Folge",
    streakOther: "{n} Tage in Folge",
    streakAll: "jedes Ziel",
    metDays: "Ziel an {met} von {n} Tagen erreicht",
    ringsLabel: "Die Ziele von heute",
    dayOf: "Tag {n} von {total}",
    plotHint: "Mit den Pfeiltasten links und rechts durch die Tage gehen",
    tableDay: "Tag",
    noValue: "Keine Daten",
    unavailable: "Nicht verfügbar",
    missing: "Nicht gefunden",
    pickTitle: "Sensor wählen",
    pickBody: "Wähle im Editor der Karte einen Schrittsensor. Aktive Energie und Training sind optional.",
    noHistory: "Frühere Tage erscheinen, sobald Home Assistant Tagesstatistiken für diesen Sensor hat.",
    editorTitle: "Titel",
    editorSteps: "Schrittsensor",
    editorEnergy: "Sensor für aktive Energie",
    editorExercise: "Trainingssensor",
    editorGoal: "Tagesziel",
    editorGoalEntity: "Oder ein Helfer mit dem Ziel",
    editorStreak: "Die Serie zählt",
    streakSelected: "Das Ziel im Diagramm",
    streakEvery: "Tage, an denen jedes Ziel erreicht wurde",
  },
  es: {
    title: "Actividad",
    steps: "Pasos",
    energy: "Energía activa",
    exercise: "Ejercicio",
    ofGoal: "de {goal}",
    toGo: "faltan {value}",
    reached: "Objetivo cumplido",
    stepsValue: "{n} pasos",
    lastDays: "Últimos {n} días",
    today: "Hoy",
    streakOne: "{n} día seguido",
    streakOther: "{n} días seguidos",
    streakAll: "todos los objetivos",
    metDays: "Objetivo cumplido {met} de {n} días",
    ringsLabel: "Los objetivos de hoy",
    dayOf: "Día {n} de {total}",
    plotHint: "Usa las flechas izquierda y derecha para recorrer los días",
    tableDay: "Día",
    noValue: "Sin datos",
    unavailable: "No disponible",
    missing: "No encontrado",
    pickTitle: "Elige un sensor",
    pickBody: "Elige un sensor de pasos en el editor de la tarjeta. La energía activa y el ejercicio son opcionales.",
    noHistory: "Los días anteriores aparecen cuando Home Assistant tenga estadísticas diarias de este sensor.",
    editorTitle: "Título",
    editorSteps: "Sensor de pasos",
    editorEnergy: "Sensor de energía activa",
    editorExercise: "Sensor de ejercicio",
    editorGoal: "Objetivo diario",
    editorGoalEntity: "O un ayudante con el objetivo",
    editorStreak: "La racha cuenta",
    streakSelected: "El objetivo que muestra el gráfico",
    streakEvery: "Días con todos los objetivos cumplidos",
  },
  fr: {
    title: "Activité",
    steps: "Pas",
    energy: "Énergie active",
    exercise: "Exercice",
    ofGoal: "sur {goal}",
    toGo: "encore {value}",
    reached: "Objectif atteint",
    stepsValue: "{n} pas",
    lastDays: "{n} derniers jours",
    today: "Aujourd'hui",
    streakOne: "{n} jour d'affilée",
    streakOther: "{n} jours d'affilée",
    streakAll: "tous les objectifs",
    metDays: "Objectif atteint {met} jours sur {n}",
    ringsLabel: "Les objectifs du jour",
    dayOf: "Jour {n} sur {total}",
    plotHint: "Utilisez les flèches gauche et droite pour parcourir les jours",
    tableDay: "Jour",
    noValue: "Aucune donnée",
    unavailable: "Indisponible",
    missing: "Introuvable",
    pickTitle: "Choisissez un capteur",
    pickBody: "Choisissez un capteur de pas dans l'éditeur de la carte. L'énergie active et l'exercice sont facultatifs.",
    noHistory: "Les jours précédents apparaissent dès que Home Assistant a des statistiques quotidiennes pour ce capteur.",
    editorTitle: "Titre",
    editorSteps: "Capteur de pas",
    editorEnergy: "Capteur d'énergie active",
    editorExercise: "Capteur d'exercice",
    editorGoal: "Objectif quotidien",
    editorGoalEntity: "Ou une entrée qui contient l'objectif",
    editorStreak: "La série compte",
    streakSelected: "L'objectif affiché dans le graphique",
    streakEvery: "Les jours où chaque objectif est atteint",
  },
  it: {
    title: "Attività",
    steps: "Passi",
    energy: "Energia attiva",
    exercise: "Esercizio",
    ofGoal: "di {goal}",
    toGo: "ancora {value}",
    reached: "Obiettivo raggiunto",
    stepsValue: "{n} passi",
    lastDays: "Ultimi {n} giorni",
    today: "Oggi",
    streakOne: "{n} giorno di fila",
    streakOther: "{n} giorni di fila",
    streakAll: "ogni obiettivo",
    metDays: "Obiettivo raggiunto {met} giorni su {n}",
    ringsLabel: "Gli obiettivi di oggi",
    dayOf: "Giorno {n} di {total}",
    plotHint: "Usa le frecce sinistra e destra per scorrere i giorni",
    tableDay: "Giorno",
    noValue: "Nessun dato",
    unavailable: "Non disponibile",
    missing: "Non trovato",
    pickTitle: "Scegli un sensore",
    pickBody: "Scegli un sensore dei passi nell'editor della scheda. Energia attiva ed esercizio sono facoltativi.",
    noHistory: "I giorni precedenti compaiono quando Home Assistant ha statistiche giornaliere per questo sensore.",
    editorTitle: "Titolo",
    editorSteps: "Sensore dei passi",
    editorEnergy: "Sensore dell'energia attiva",
    editorExercise: "Sensore dell'esercizio",
    editorGoal: "Obiettivo giornaliero",
    editorGoalEntity: "Oppure un aiutante con l'obiettivo",
    editorStreak: "La serie conta",
    streakSelected: "L'obiettivo mostrato nel grafico",
    streakEvery: "I giorni con ogni obiettivo raggiunto",
  },
  pt: {
    title: "Atividade",
    steps: "Passos",
    energy: "Energia ativa",
    exercise: "Exercício",
    ofGoal: "de {goal}",
    toGo: "faltam {value}",
    reached: "Meta atingida",
    stepsValue: "{n} passos",
    lastDays: "Últimos {n} dias",
    today: "Hoje",
    streakOne: "{n} dia seguido",
    streakOther: "{n} dias seguidos",
    streakAll: "todas as metas",
    metDays: "Meta atingida em {met} de {n} dias",
    ringsLabel: "As metas de hoje",
    dayOf: "Dia {n} de {total}",
    plotHint: "Use as setas esquerda e direita para percorrer os dias",
    tableDay: "Dia",
    noValue: "Sem dados",
    unavailable: "Indisponível",
    missing: "Não encontrado",
    pickTitle: "Escolha um sensor",
    pickBody: "Escolha um sensor de passos no editor do cartão. Energia ativa e exercício são opcionais.",
    noHistory: "Os dias anteriores aparecem quando o Home Assistant tiver estatísticas diárias deste sensor.",
    editorTitle: "Título",
    editorSteps: "Sensor de passos",
    editorEnergy: "Sensor de energia ativa",
    editorExercise: "Sensor de exercício",
    editorGoal: "Meta diária",
    editorGoalEntity: "Ou um auxiliar com a meta",
    editorStreak: "A sequência conta",
    streakSelected: "A meta mostrada no gráfico",
    streakEvery: "Dias com todas as metas atingidas",
  },
  ja: {
    title: "アクティビティ",
    steps: "歩数",
    energy: "アクティブエネルギー",
    exercise: "エクササイズ",
    ofGoal: "目標 {goal}",
    toGo: "あと {value}",
    reached: "目標達成",
    stepsValue: "{n} 歩",
    lastDays: "過去 {n} 日間",
    today: "今日",
    streakOne: "{n} 日連続",
    streakOther: "{n} 日連続",
    streakAll: "すべての目標",
    metDays: "{n} 日中 {met} 日で目標達成",
    ringsLabel: "今日の目標",
    dayOf: "{total} 日中 {n} 日目",
    plotHint: "左右の矢印キーで日を移動します",
    tableDay: "日",
    noValue: "データなし",
    unavailable: "利用不可",
    missing: "見つかりません",
    pickTitle: "センサーを選択",
    pickBody: "カードのエディターで歩数センサーを選んでください。アクティブエネルギーとエクササイズは任意です。",
    noHistory: "Home Assistant にこのセンサーの日別統計ができると、以前の日が表示されます。",
    editorTitle: "タイトル",
    editorSteps: "歩数センサー",
    editorEnergy: "アクティブエネルギーのセンサー",
    editorExercise: "エクササイズのセンサー",
    editorGoal: "1 日の目標",
    editorGoalEntity: "または目標を持つヘルパー",
    editorStreak: "連続記録の対象",
    streakSelected: "グラフに表示中の目標",
    streakEvery: "すべての目標を達成した日",
  },
  zh: {
    title: "活动",
    steps: "步数",
    energy: "活动能量",
    exercise: "锻炼",
    ofGoal: "目标 {goal}",
    toGo: "还差 {value}",
    reached: "已达标",
    stepsValue: "{n} 步",
    lastDays: "最近 {n} 天",
    today: "今天",
    streakOne: "连续 {n} 天",
    streakOther: "连续 {n} 天",
    streakAll: "所有目标",
    metDays: "{n} 天中有 {met} 天达标",
    ringsLabel: "今天的目标",
    dayOf: "第 {n} 天，共 {total} 天",
    plotHint: "使用左右方向键逐天查看",
    tableDay: "日期",
    noValue: "无数据",
    unavailable: "不可用",
    missing: "未找到",
    pickTitle: "选择传感器",
    pickBody: "在卡片编辑器中选择步数传感器。活动能量和锻炼为可选项。",
    noHistory: "Home Assistant 有了该传感器的每日统计后，会显示之前的日子。",
    editorTitle: "标题",
    editorSteps: "步数传感器",
    editorEnergy: "活动能量传感器",
    editorExercise: "锻炼传感器",
    editorGoal: "每日目标",
    editorGoalEntity: "或保存目标的辅助元素",
    editorStreak: "连续天数的依据",
    streakSelected: "图表中显示的目标",
    streakEvery: "所有目标都达标的日子",
  },
  hi: {
    title: "गतिविधि",
    steps: "कदम",
    energy: "सक्रिय ऊर्जा",
    exercise: "व्यायाम",
    ofGoal: "{goal} में से",
    toGo: "{value} बाकी",
    reached: "लक्ष्य पूरा",
    stepsValue: "{n} कदम",
    lastDays: "पिछले {n} दिन",
    today: "आज",
    streakOne: "लगातार {n} दिन",
    streakOther: "लगातार {n} दिन",
    streakAll: "हर लक्ष्य",
    metDays: "{n} में से {met} दिन लक्ष्य पूरा",
    ringsLabel: "आज के लक्ष्य",
    dayOf: "{total} में से दिन {n}",
    plotHint: "दिनों के बीच जाने के लिए बाएँ और दाएँ तीर कुंजियों का उपयोग करें",
    tableDay: "दिन",
    noValue: "कोई डेटा नहीं",
    unavailable: "उपलब्ध नहीं",
    missing: "नहीं मिला",
    pickTitle: "एक सेंसर चुनें",
    pickBody: "कार्ड के एडिटर में कदमों का सेंसर चुनें। सक्रिय ऊर्जा और व्यायाम वैकल्पिक हैं।",
    noHistory: "जब Home Assistant के पास इस सेंसर के दैनिक आँकड़े होंगे, तब पिछले दिन दिखेंगे।",
    editorTitle: "शीर्षक",
    editorSteps: "कदमों का सेंसर",
    editorEnergy: "सक्रिय ऊर्जा का सेंसर",
    editorExercise: "व्यायाम का सेंसर",
    editorGoal: "दैनिक लक्ष्य",
    editorGoalEntity: "या लक्ष्य वाला हेल्पर",
    editorStreak: "लगातार दिनों की गिनती",
    streakSelected: "चार्ट में दिख रहा लक्ष्य",
    streakEvery: "वे दिन जब हर लक्ष्य पूरा हुआ",
  },
  ar: {
    title: "النشاط",
    steps: "الخطوات",
    energy: "الطاقة النشطة",
    exercise: "التمرين",
    ofGoal: "من {goal}",
    toGo: "باقي {value}",
    reached: "تحقق الهدف",
    stepsValue: "{n} خطوة",
    lastDays: "آخر {n} أيام",
    today: "اليوم",
    streakOne: "{n} يوم على التوالي",
    streakOther: "{n} أيام على التوالي",
    streakAll: "كل الأهداف",
    metDays: "تحقق الهدف في {met} من {n} أيام",
    ringsLabel: "أهداف اليوم",
    dayOf: "اليوم {n} من {total}",
    plotHint: "استخدم مفتاحي السهمين الأيمن والأيسر للتنقل بين الأيام",
    tableDay: "اليوم",
    noValue: "لا توجد بيانات",
    unavailable: "غير متاح",
    missing: "غير موجود",
    pickTitle: "اختر مستشعرا",
    pickBody: "اختر مستشعر الخطوات في محرر البطاقة. الطاقة النشطة والتمرين اختياريان.",
    noHistory: "تظهر الأيام السابقة عندما تتوفر في Home Assistant إحصاءات يومية لهذا المستشعر.",
    editorTitle: "العنوان",
    editorSteps: "مستشعر الخطوات",
    editorEnergy: "مستشعر الطاقة النشطة",
    editorExercise: "مستشعر التمرين",
    editorGoal: "الهدف اليومي",
    editorGoalEntity: "أو عنصر مساعد يحمل الهدف",
    editorStreak: "ما تحسبه السلسلة",
    streakSelected: "الهدف المعروض في الرسم",
    streakEvery: "الأيام التي تحقق فيها كل هدف",
  },
};

export const LANGUAGES = Object.keys(STRINGS);

export function translate(language, key, values = {}) {
  const base = String(language || "en").split("-")[0].toLowerCase();
  const template = STRINGS[base]?.[key] ?? STRINGS.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}

// ---------------------------------------------------------------- data

/** A finite number from a state or an option; null for "unavailable", "" and the like. */
export function readNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** What one of the sensor's units is worth in the unit the card shows. */
export function unitFactor(metric, unit) {
  const factors = UNIT_FACTORS[metric] ?? {};
  return Object.hasOwn(factors, unit) ? factors[unit] : 1;
}

/** Today's value of a goal, from the sensor's state. */
export function readToday(hass, metric, entity) {
  const stateObj = hass?.states?.[entity];
  if (!stateObj) return { value: null, status: "missing" };
  const number = readNumber(stateObj.state);
  if (number === null || number < 0) return { value: null, status: "unavailable" };
  return {
    value: number * unitFactor(metric, stateObj.attributes?.unit_of_measurement),
    status: "ok",
  };
}

/**
 * The goal as a number: the option itself, or the state of the entity it names (an
 * `input_number`, a `number` or a sensor). Anything unusable falls back to the default.
 */
export function resolveGoal(hass, metric, raw) {
  const fallback = METRICS[metric].goal;
  const direct = readNumber(raw);
  if (direct !== null) return direct > 0 ? direct : fallback;
  if (typeof raw !== "string" || !raw.includes(".")) return fallback;
  const stateObj = hass?.states?.[raw.trim()];
  const number = readNumber(stateObj?.state);
  if (number === null || number <= 0) return fallback;
  return number * unitFactor(metric, stateObj.attributes?.unit_of_measurement);
}

const keyFormats = new Map();
/** The calendar date of an instant in a time zone, as YYYY-MM-DD. */
export function dayKey(instant, timeZone) {
  const zone = timeZone || "";
  if (!keyFormats.has(zone)) {
    let format;
    try {
      format = new Intl.DateTimeFormat("en-CA", {
        timeZone: timeZone || undefined,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      format = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
    }
    keyFormats.set(zone, format);
  }
  const parts = Object.fromEntries(
    keyFormats.get(zone).formatToParts(new Date(instant)).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function keyToUtc(key) {
  const [year, month, day] = key.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** The last `count` calendar dates up to today, oldest first. */
export function lastDays(now, count, timeZone) {
  const today = keyToUtc(dayKey(now, timeZone));
  const out = [];
  for (let back = count - 1; back >= 0; back -= 1) {
    out.push(new Date(today - back * DAY).toISOString().slice(0, 10));
  }
  return out;
}

/**
 * One value per day from the recorder's daily rows. A sensor that counts up through the day
 * has a sum, so its day is the change, or the state it ended on when it resets without the
 * recorder noticing; a measurement has a maximum. The largest of what a row has is the day.
 */
export function perDay(rows, factor, timeZone, fields = ["change", "state", "max"]) {
  const out = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const start = typeof row?.start === "number" ? row.start : Date.parse(row?.start);
    if (!Number.isFinite(start)) continue;
    let value = null;
    for (const field of fields) {
      const number = typeof row[field] === "number" ? row[field] : null;
      if (number !== null && Number.isFinite(number) && number >= 0 && (value === null || number > value)) {
        value = number;
      }
    }
    if (value === null) continue;
    // Noon of the period, so a day that starts at 23:00 UTC still lands on its own date.
    const key = dayKey(start + DAY / 2, timeZone);
    // Rounded, so 31 minutes kept as hours is 31 again and not a hair under a goal of 31.
    out.set(key, Math.round(((out.get(key) ?? 0) + value * factor) * 1e6) / 1e6);
  }
  return out;
}

/**
 * Days in a row up to today, from a list that ends with today. A day still in progress
 * does not break the streak: it counts once its goal is reached.
 */
export function countStreak(met) {
  const last = met.length - 1;
  let count = last >= 0 && met[last] ? 1 : 0;
  for (let index = last - 1; index >= 0; index -= 1) {
    if (!met[index]) break;
    count += 1;
  }
  return count;
}

/**
 * Everything the card draws: per configured goal today's value, the goal, the days and the
 * streak. `history` holds a Map of day to value per goal, from the statistics.
 */
export function buildModel(config, hass, history = {}, now = Date.now()) {
  const timeZone = hass?.config?.time_zone || undefined;
  const keys = lastDays(now, HISTORY_DAYS, timeZone);
  const todayIndex = keys.length - 1;
  const metrics = [];
  for (const key of ORDER) {
    const entity = typeof config?.[key] === "string" ? config[key].trim() : "";
    if (!entity) continue;
    const reading = readToday(hass, key, entity);
    const goal = resolveGoal(hass, key, config[`${key}_goal`]);
    const past = history?.[key] instanceof Map ? history[key] : new Map();
    const days = keys.map((day, index) => {
      const stored = past.has(day) ? past.get(day) : null;
      const value = index === todayIndex ? (reading.value ?? stored) : stored;
      return { day, value, met: value !== null && value >= goal };
    });
    const week = days.slice(-WEEK_DAYS);
    metrics.push({
      key,
      entity,
      status: reading.status,
      value: reading.value,
      goal,
      fraction: reading.value === null ? 0 : Math.min(1, reading.value / goal),
      met: reading.value !== null && reading.value >= goal,
      week,
      hasHistory: week.slice(0, -1).some((day) => day.value !== null),
      streak: countStreak(days.map((day) => day.met)),
      days,
    });
  }
  const every = keys.map(
    (_, index) => metrics.length > 0 && metrics.every((metric) => metric.days[index].met),
  );
  for (const metric of metrics) delete metric.days;
  return {
    metrics,
    week: keys.slice(-WEEK_DAYS),
    today: keys[todayIndex],
    limit: keys.length,
    everyStreak: countStreak(every),
  };
}

/** Sensors that look like the three goals, for the card picker's first config. */
export function suggestEntities(hass, entities) {
  const ids = Array.isArray(entities) && entities.length ? entities : Object.keys(hass?.states ?? {});
  const sensors = ids.filter((id) => typeof id === "string" && id.startsWith("sensor."));
  const out = {};
  for (const metric of ORDER) {
    for (const suffix of SUGGESTED[metric]) {
      const found = sensors.find((id) => id.endsWith(suffix));
      if (found) {
        out[metric] = found;
        break;
      }
    }
  }
  return out;
}

/** The config as the editor's form holds it: a goal is a number or an entity, in two fields. */
export function toForm(config) {
  const data = { ...config };
  for (const metric of ORDER) {
    const raw = data[`${metric}_goal`];
    delete data[`${metric}_goal`];
    delete data[`${metric}_goal_entity`];
    const number = readNumber(raw);
    if (number !== null) data[`${metric}_goal`] = number;
    else if (typeof raw === "string" && raw.includes(".")) data[`${metric}_goal_entity`] = raw;
  }
  if (!data.streak) data.streak = "selected";
  return data;
}

/** The form's values back as a config. An entity for the goal wins over the number. */
export function fromForm(data) {
  const config = { ...data };
  for (const metric of ORDER) {
    const entity = config[`${metric}_goal_entity`];
    const number = readNumber(config[`${metric}_goal`]);
    delete config[`${metric}_goal_entity`];
    delete config[`${metric}_goal`];
    if (typeof entity === "string" && entity) config[`${metric}_goal`] = entity;
    else if (number !== null && number > 0) config[`${metric}_goal`] = number;
  }
  for (const key of ["title", ...ORDER]) {
    if (config[key] === "" || config[key] === null || config[key] === undefined) delete config[key];
  }
  if (config.streak !== "all") delete config.streak;
  return config;
}

// ---------------------------------------------------------------- formatting

/** Resolves the Home Assistant locale into the language to format with. */
export function localeSettings(hass) {
  const language = hass?.locale?.language || hass?.language || "en";
  try {
    new Intl.NumberFormat(language);
    return { language };
  } catch {
    return { language: "en" };
  }
}

const numberFormats = new Map();
function numberFormat(language, options, name) {
  const key = `${language}|${name}`;
  if (!numberFormats.has(key)) numberFormats.set(key, new Intl.NumberFormat(language, options));
  return numberFormats.get(key);
}

export function formatNumber(value, language = "en") {
  return numberFormat(language, { maximumFractionDigits: 0 }, "plain").format(Math.round(value));
}

/** A value with its unit where it needs one: "600 kcal", "30 min", and steps as a bare number. */
export function formatAmount(metric, value, language = "en") {
  if (metric === "energy") return `${formatNumber(value, language)} kcal`;
  if (metric === "exercise") {
    return numberFormat(
      language,
      { style: "unit", unit: "minute", unitDisplay: "short", maximumFractionDigits: 0 },
      "minute",
    ).format(Math.round(value));
  }
  return formatNumber(value, language);
}

/** A value that stands on its own, so steps say what they are: "11,450 steps". */
export function formatFull(metric, value, language = "en") {
  if (metric === "steps") return translate(language, "stepsValue", { n: formatNumber(value, language) });
  return formatAmount(metric, value, language);
}

const pluralRules = new Map();
export function formatStreak(count, language = "en", capped = false) {
  if (!pluralRules.has(language)) pluralRules.set(language, new Intl.PluralRules(language));
  const key = pluralRules.get(language).select(count) === "one" ? "streakOne" : "streakOther";
  return translate(language, key, { n: `${formatNumber(count, language)}${capped ? "+" : ""}` });
}

function formatDay(key, language, long = false) {
  const options = long
    ? { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }
    : { weekday: "short", timeZone: "UTC" };
  return new Intl.DateTimeFormat(language, options).format(keyToUtc(key));
}

// ---------------------------------------------------------------- statistics

const statsCache = new Map();

/**
 * Where a sensor's days come from. The Life Dashboard integration keeps daily totals as
 * external statistics per phone; any other sensor uses its own statistics.
 */
async function statisticOf(hass, metric, entity) {
  try {
    const entry = await hass.callWS({ type: "config/entity_registry/get", entity_id: entity });
    const id = entry?.config_entry_id;
    if (entry?.platform === PLATFORM && id && entry.unique_id === `${id}_${METRICS[metric].sensor}`) {
      return { id: `${PLATFORM}:${id.toLowerCase()}_${METRICS[metric].statistic}`, external: true };
    }
  } catch {
    // Not in the registry, or no access to it: the sensor's own statistics it is.
  }
  return { id: entity, external: false };
}

/** A Map of day to value per goal, over the last year. */
async function loadHistory(hass, entities, timeZone) {
  const metrics = ORDER.filter((metric) => entities[metric]);
  const sources = await Promise.all(metrics.map((metric) => statisticOf(hass, metric, entities[metric])));
  const ids = [...new Set(sources.map((source) => source.id))];
  const start = new Date(Date.now() - (HISTORY_DAYS + 1) * DAY).toISOString();
  const [rows, meta] = await Promise.all([
    hass.callWS({
      type: "recorder/statistics_during_period",
      start_time: start,
      statistic_ids: ids,
      period: "day",
      types: ["change", "state", "max"],
    }),
    hass.callWS({ type: "recorder/get_statistics_metadata", statistic_ids: ids }).catch(() => []),
  ]);
  const out = {};
  metrics.forEach((metric, index) => {
    const { id, external } = sources[index];
    const stored = (Array.isArray(meta) ? meta : []).find((item) => item?.statistic_id === id);
    const unit =
      stored?.statistics_unit_of_measurement ??
      hass.states?.[entities[metric]]?.attributes?.unit_of_measurement;
    // The integration's statistics are sums of whole days, so only the change is the day.
    const fields = external ? ["change"] : undefined;
    out[metric] = perDay(rows?.[id], unitFactor(metric, unit), timeZone, fields);
  });
  return out;
}

// ---------------------------------------------------------------- DOM

// DOM is only ever built through these two helpers: values reach the page as
// text nodes and attribute values, never as markup.
function el(tag, attributes = {}, ...children) {
  return applyTo(document.createElement(tag), attributes, children);
}

function svg(tag, attributes = {}, ...children) {
  return applyTo(document.createElementNS("http://www.w3.org/2000/svg", tag), attributes, children);
}

function applyTo(node, attributes, children) {
  for (const [name, value] of Object.entries(attributes)) {
    if (value !== undefined && value !== null) node.setAttribute(name, String(value));
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

const RING_RADIUS = 42;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const STYLE = `
  :host {
    --_steps: var(--life-dashboard-activity-steps, var(--primary-color, #1e9665));
    --_energy: var(--life-dashboard-activity-energy, #d9781f);
    --_exercise: var(--life-dashboard-activity-exercise, #8a63d2);
    --_ink: var(--primary-text-color, #1c1c1c);
    --_muted: var(--secondary-text-color, #5f6368);
    --_hairline: var(--divider-color, rgba(127, 127, 127, 0.25));
    --_track: color-mix(in srgb, var(--_muted) 22%, transparent);
    display: block;
    height: 100%;
  }
  ha-card { height: 100%; box-sizing: border-box; }
  .root { container-type: inline-size; padding: 16px; color: var(--_ink); }
  .m-steps { --tone: var(--_steps); }
  .m-energy { --tone: var(--_energy); }
  .m-exercise { --tone: var(--_exercise); }
  .m-every { --tone: var(--_steps); }

  .head { display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 28px; }
  .lead { min-width: 0; }
  .title { font-size: 16px; line-height: 1.25; font-weight: 500; margin: 0; overflow-wrap: anywhere; }
  .sub { font-size: 12.5px; line-height: 1.3; color: var(--_muted); margin: 1px 0 0; overflow-wrap: anywhere; }
  .pill { flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
    border-radius: 999px; font-size: 12.5px; line-height: 1.4; font-weight: 500;
    font-variant-numeric: tabular-nums; white-space: nowrap;
    background: color-mix(in srgb, var(--tone) 16%, transparent); }
  .pill::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--tone); flex: none; }

  .rings { display: grid; grid-template-columns: repeat(var(--count), minmax(0, 1fr)); gap: 8px;
    margin-top: 14px; }
  .ring { display: block; min-width: 0; margin: 0; padding: 6px 2px 8px; border: 0; border-radius: 12px;
    background: none; color: inherit; font: inherit; text-align: center; }
  button.ring { cursor: pointer; -webkit-tap-highlight-color: transparent; }
  button.ring:hover { background: color-mix(in srgb, var(--_muted) 8%, transparent); }
  button.ring[aria-pressed="true"] { background: color-mix(in srgb, var(--tone) 10%, transparent); }
  button.ring:focus-visible, .plot:focus-visible { outline: 2px solid var(--primary-color, currentColor);
    outline-offset: 2px; }
  .gauge { position: relative; display: block; width: 100%; max-width: 112px; aspect-ratio: 1; margin: 0 auto; }
  .rings.one .gauge { max-width: 148px; }
  .gauge svg { display: block; width: 100%; height: 100%; transform: rotate(-90deg); }
  .gauge .rail { fill: none; stroke: var(--_track); stroke-width: 10; }
  .gauge .value { fill: none; stroke: var(--tone); stroke-width: 10; stroke-linecap: round; }
  .center { position: absolute; inset: 0; display: grid; place-content: center; gap: 1px; }
  .figure { font-size: 18px; line-height: 1.1; font-weight: 600; font-variant-numeric: tabular-nums; }
  .rings.one .figure { font-size: 24px; }
  .of { font-size: 11px; line-height: 1.2; color: var(--_muted); font-variant-numeric: tabular-nums; }
  .name { display: block; margin-top: 6px; font-size: 13px; line-height: 1.3; font-weight: 500;
    overflow-wrap: anywhere; }
  .left { display: block; font-size: 12px; line-height: 1.3; color: var(--_muted);
    font-variant-numeric: tabular-nums; }
  .left.done { color: var(--_ink); }
  .left.done::before { content: "\\2713\\00a0"; color: var(--tone); font-weight: 700; }

  .week-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px;
    margin-top: 14px; font-size: 12.5px; color: var(--_muted); }
  .week-head b { font-weight: 500; color: var(--_ink); }
  .week-head span:last-child { text-align: end; }
  .plot { position: relative; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px;
    height: 104px; margin-top: 20px; border-radius: 6px; outline: none; cursor: default;
    touch-action: pan-y; -webkit-tap-highlight-color: transparent; }
  .col { display: flex; align-items: flex-end; min-width: 0; border-radius: 6px; }
  .col.on { background: color-mix(in srgb, var(--_ink) 7%, transparent); }
  .bar { display: block; width: 100%; min-height: 3px; border-radius: 6px 6px 3px 3px; background: var(--_track); }
  .bar.has { background: color-mix(in srgb, var(--_muted) 55%, transparent); }
  .bar.met { background: var(--tone); }
  .bar.now { background: color-mix(in srgb, var(--tone) 45%, transparent); }
  .bar.now.met { background: var(--tone); }
  .goal { position: absolute; inset-inline: 0; height: 0; border-top: 1.5px dashed var(--_muted);
    opacity: 0.75; pointer-events: none; }
  .goal span { position: absolute; inset-inline-end: 0; bottom: 3px; padding: 2px 4px; border-radius: 4px;
    font-size: 11px; line-height: 1; color: var(--_muted); font-variant-numeric: tabular-nums;
    background: var(--ha-card-background, var(--card-background-color, #fff)); }
  .days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; margin-top: 6px;
    text-align: center; font-size: 11px; line-height: 1.3; color: var(--_muted); }
  .days .now { color: var(--_ink); font-weight: 600; }
  .days span { display: block; overflow: hidden; text-overflow: clip; white-space: nowrap; }
  .dots { display: flex; justify-content: center; gap: 3px; margin-top: 4px; }
  .dots i { box-sizing: border-box; width: 7px; height: 7px; border-radius: 50%;
    border: 1.5px solid var(--_track); }
  .dots i.met { border-color: var(--tone); background: var(--tone); }

  .tip { position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none; opacity: 0;
    transition: opacity 90ms linear; padding: 7px 10px; border-radius: 8px; white-space: nowrap;
    background: var(--card-background-color, #fff); color: var(--_ink);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.22), 0 0 0 1px var(--_hairline); font-size: 12px; }
  .tip.on { opacity: 1; }
  .tip-value { display: block; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .tip-line { display: block; color: var(--_muted); margin-top: 2px; }

  .note { margin: 10px 0 0; font-size: 12.5px; line-height: 1.4; color: var(--_muted); }
  .empty-figure { font-size: 19px; line-height: 1.25; font-weight: 500; margin-top: 10px; }
  .empty-body { margin: 2px 0 0; font-size: 13px; line-height: 1.4; color: var(--_muted); overflow-wrap: anywhere; }

  .visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip-path: inset(50%); border: 0; white-space: nowrap; }

  @container (max-width: 300px) {
    .rings { gap: 2px; }
    .figure { font-size: 15px; }
    .of { font-size: 10px; }
    .name { font-size: 12px; }
    .left { font-size: 11px; }
    .plot, .days { gap: 4px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .tip { transition: none; }
  }
  @media (forced-colors: active) {
    .gauge .value { stroke: CanvasText; }
    .gauge .rail { stroke: GrayText; }
    .bar, .dots i.met, .pill::before { background: CanvasText; forced-color-adjust: none; }
    .bar:not(.met) { background: GrayText; }
    button.ring[aria-pressed="true"] { outline: 2px solid Highlight; }
  }
`;

const Base = globalThis.HTMLElement ?? class {};

class LifeDashboardActivityCard extends Base {
  static getConfigElement() {
    return document.createElement(EDITOR_TAG);
  }

  static getStubConfig(hass, entities = []) {
    const found = suggestEntities(hass, entities);
    return Object.keys(found).length ? found : { steps: "" };
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(el("style", {}, STYLE));
    this._card = el("ha-card");
    this._root = el("div", { class: "root" });
    this._card.append(this._root);
    this.shadowRoot.append(this._card);
    this._renders = 0;
    this._model = null;
    this._history = {};
    this._active = -1;
  }

  disconnectedCallback() {
    clearTimeout(this._tipTimer);
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    for (const key of ORDER) {
      if (config[key] !== undefined && config[key] !== null && typeof config[key] !== "string") {
        throw new Error(`Set \`${key}\` to the entity id of a sensor`);
      }
    }
    this._config = { ...config };
    this._seen = undefined;
    this._loadKey = undefined;
    this._history = {};
    this._historyReady = false;
    if (this._hass) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) this._update();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 4 };
  }

  _entities() {
    const out = {};
    for (const key of ORDER) {
      const entity = typeof this._config[key] === "string" ? this._config[key].trim() : "";
      if (entity) out[key] = entity;
    }
    return out;
  }

  _update() {
    this._load();
    const fingerprint = this._fingerprint();
    if (fingerprint === this._seen) return;
    this._seen = fingerprint;
    this._render();
  }

  _fingerprint() {
    const hass = this._hass;
    const parts = [hass?.locale?.language, hass?.language, hass?.config?.time_zone];
    parts.push(dayKey(Date.now(), hass?.config?.time_zone));
    for (const key of ORDER) {
      for (const id of [this._config[key], this._config[`${key}_goal`]]) {
        if (typeof id !== "string") continue;
        const stateObj = hass?.states?.[id];
        parts.push(id, stateObj?.state, stateObj?.attributes?.unit_of_measurement);
      }
      const device = hass?.entities?.[this._config[key]]?.device_id;
      if (device) parts.push(hass?.devices?.[device]?.name_by_user, hass?.devices?.[device]?.name);
    }
    return JSON.stringify(parts);
  }

  /** Fetches the days once per set of sensors and per day, and again when the cache is stale. */
  _load() {
    const hass = this._hass;
    const entities = this._entities();
    const ids = Object.entries(entities);
    if (!ids.length || typeof hass?.callWS !== "function") return;
    const timeZone = hass.config?.time_zone || undefined;
    const key = JSON.stringify([ids, dayKey(Date.now(), timeZone)]);
    const held = statsCache.get(key);
    if (held && Date.now() - held.at < STATS_TTL) {
      if (this._loadKey !== key) {
        this._loadKey = key;
        held.promise.then((value) => this._loaded(key, value));
      }
      return;
    }
    if (this._loadKey === key && this._loading) return;
    this._loadKey = key;
    this._loading = true;
    const promise = loadHistory(hass, entities, timeZone).catch(() => ({}));
    statsCache.set(key, { at: Date.now(), promise });
    promise.then((value) => {
      this._loading = false;
      this._loaded(key, value);
    });
  }

  _loaded(key, value) {
    if (this._loadKey !== key) return;
    this._history = value;
    this._historyReady = true;
    if (this._hass && this._config) this._render();
  }

  _render() {
    this._renders += 1;
    clearTimeout(this._tipTimer);
    const focused = this.shadowRoot.activeElement?.dataset?.focus;
    this._active = -1;
    this._plot = null;

    const { language } = localeSettings(this._hass);
    const model = buildModel(this._config, this._hass, this._history);
    this._model = model;
    this._language = language;
    this._root.replaceChildren();

    if (!model.metrics.length) {
      this._root.append(
        this._head(language, null),
        el("div", { class: "empty-figure" }, translate(language, "pickTitle")),
        el("p", { class: "empty-body" }, translate(language, "pickBody")),
      );
      return;
    }

    if (!model.metrics.some((metric) => metric.key === this._selected)) {
      this._selected = model.metrics[0].key;
    }
    const selected = model.metrics.find((metric) => metric.key === this._selected);

    this._root.append(this._head(language, selected), this._rings(language), ...this._week(language, selected));
    if (focused) this.shadowRoot.querySelector(`[data-focus="${focused}"]`)?.focus();
  }

  _head(language, selected) {
    const title = typeof this._config.title === "string" && this._config.title
      ? this._config.title
      : translate(language, "title");
    const lead = el("div", { class: "lead" }, el("p", { class: "title" }, title));
    const device = selected ? this._deviceName(selected.entity) : null;
    if (device) lead.append(el("p", { class: "sub" }, device));
    const head = el("div", { class: "head" }, lead);
    if (!selected) return head;

    const every = this._config.streak === "all" && this._model.metrics.length > 1;
    const count = every ? this._model.everyStreak : selected.streak;
    if (count > 0) {
      const text = formatStreak(count, language, count >= this._model.limit);
      const name = every ? translate(language, "streakAll") : translate(language, selected.key);
      head.append(
        el(
          "span",
          { class: `pill m-${every ? "every" : selected.key}`, "aria-label": `${name}: ${text}` },
          every ? `${text}, ${name}` : text,
        ),
      );
    }
    return head;
  }

  _deviceName(entity) {
    const device = this._hass?.entities?.[entity]?.device_id;
    const record = device ? this._hass?.devices?.[device] : null;
    return record?.name_by_user || record?.name || null;
  }

  _status(language, metric) {
    if (metric.status === "missing") return translate(language, "missing");
    if (metric.status === "unavailable") return translate(language, "unavailable");
    if (metric.met) return translate(language, "reached");
    return translate(language, "toGo", {
      value: formatAmount(metric.key, Math.max(1, Math.ceil(metric.goal - metric.value)), language),
    });
  }

  _rings(language) {
    const { metrics } = this._model;
    const several = metrics.length > 1;
    const rings = el("div", {
      class: several ? "rings" : "rings one",
      style: `--count: ${metrics.length}`,
      role: "group",
      "aria-label": translate(language, "ringsLabel"),
    });
    for (const metric of metrics) {
      const name = translate(language, metric.key);
      const goal = translate(language, "ofGoal", { goal: formatAmount(metric.key, metric.goal, language) });
      const figure = metric.value === null ? "?" : formatNumber(metric.value, language);
      const status = this._status(language, metric);
      const label =
        metric.value === null
          ? `${name}: ${status}`
          : `${name}: ${formatNumber(metric.value, language)} ${goal}. ${status}`;
      const arc = svg(
        "svg",
        { viewBox: "0 0 100 100", "aria-hidden": "true", focusable: "false" },
        svg("circle", { class: "rail", cx: 50, cy: 50, r: RING_RADIUS }),
        metric.fraction > 0
          ? svg("circle", {
              class: "value",
              cx: 50,
              cy: 50,
              r: RING_RADIUS,
              "stroke-dasharray": `${(RING_LENGTH * metric.fraction).toFixed(2)} ${RING_LENGTH.toFixed(2)}`,
            })
          : null,
      );
      const body = [
        el(
          "span",
          { class: "gauge" },
          arc,
          el("span", { class: "center" }, el("span", { class: "figure" }, figure), el("span", { class: "of" }, goal)),
        ),
        el("span", { class: "name" }, name),
        el("span", { class: `left${metric.met ? " done" : ""}` }, status),
      ];
      let ring;
      if (several) {
        ring = el(
          "button",
          {
            class: `ring m-${metric.key}`,
            type: "button",
            "aria-pressed": metric.key === this._selected ? "true" : "false",
            "aria-label": label,
            "data-focus": `ring-${metric.key}`,
            "data-metric": metric.key,
          },
          ...body,
        );
        ring.addEventListener("click", () => {
          if (this._selected === metric.key) return;
          this._selected = metric.key;
          this._render();
        });
      } else {
        ring = el(
          "div",
          { class: `ring m-${metric.key}`, role: "img", "aria-label": label, "data-metric": metric.key },
          ...body,
        );
      }
      rings.append(ring);
    }
    return rings;
  }

  _dayText(language, metric, day) {
    const date = day.day === this._model.today ? translate(language, "today") : formatDay(day.day, language, true);
    if (day.value === null) return { date, value: translate(language, "noValue"), met: false };
    return { date, value: formatFull(metric.key, day.value, language), met: day.met };
  }

  _week(language, selected) {
    const { metrics, week, today } = this._model;
    const name = translate(language, selected.key);
    const known = selected.week.filter((day) => day.value !== null);
    const met = selected.week.filter((day) => day.met).length;
    const head = el(
      "div",
      { class: "week-head" },
      el("span", {}, el("b", {}, translate(language, "lastDays", { n: week.length })), metrics.length > 1 ? ` · ${name}` : null),
      known.length > 1 ? el("span", {}, translate(language, "metDays", { met, n: week.length })) : null,
    );

    const top = Math.max(selected.goal * 1.18, ...selected.week.map((day) => day.value ?? 0));
    const plot = el("div", {
      class: `plot m-${selected.key}`,
      tabindex: 0,
      role: "slider",
      "aria-label": `${translate(language, "lastDays", { n: week.length })}, ${name}. ${translate(language, "plotHint")}`,
      "aria-valuemin": 1,
      "aria-valuemax": week.length,
      "aria-valuenow": week.length,
      "data-focus": "plot",
    });
    this._cols = selected.week.map((day, index) => {
      const classes = ["bar"];
      if (day.value !== null) classes.push("has");
      if (day.met) classes.push("met");
      if (day.day === today) classes.push("now");
      const height = day.value === null ? 0 : Math.max(0, Math.min(100, (day.value / top) * 100));
      const col = el("div", { class: "col" }, el("i", { class: classes.join(" "), style: `height: ${height.toFixed(2)}%` }));
      col.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "touch") this._show(index);
      });
      col.addEventListener("click", () => {
        this._show(this._active === index && this._touched ? -1 : index);
        this._touched = true;
      });
      plot.append(col);
      return col;
    });
    plot.append(
      el(
        "div",
        { class: "goal", style: `bottom: ${((selected.goal / top) * 100).toFixed(2)}%`, "aria-hidden": "true" },
        el("span", {}, formatAmount(selected.key, selected.goal, language)),
      ),
    );
    this._tip = el("div", { class: "tip", "aria-hidden": "true" });
    plot.append(this._tip);
    plot.addEventListener("pointerleave", () => {
      this._touched = false;
      this._show(-1);
    });
    plot.addEventListener("focus", () => {
      if (this._active === -1 && plot.matches(":focus-visible")) this._show(week.length - 1);
    });
    plot.addEventListener("blur", () => this._show(-1));
    plot.addEventListener("keydown", (event) => this._key(event));
    this._plot = plot;
    this._selectedMetric = selected;

    const days = el("div", { class: "days", "aria-hidden": "true" });
    week.forEach((day, index) => {
      const cell = el(
        "div",
        { class: day === today ? "now" : "" },
        el("span", {}, formatDay(day, language)),
      );
      if (metrics.length > 1) {
        const dots = el("div", { class: "dots" });
        for (const metric of metrics) {
          dots.append(el("i", { class: `m-${metric.key}${metric.week[index].met ? " met" : ""}` }));
        }
        cell.append(dots);
      }
      days.append(cell);
    });

    const table = el(
      "table",
      { class: "visually-hidden" },
      el("caption", {}, translate(language, "lastDays", { n: week.length })),
      el(
        "tr",
        {},
        el("th", { scope: "col" }, translate(language, "tableDay")),
        ...metrics.map((metric) => el("th", { scope: "col" }, translate(language, metric.key))),
      ),
      ...week.map((_, index) =>
        el(
          "tr",
          {},
          el("th", { scope: "row" }, this._dayText(language, metrics[0], metrics[0].week[index]).date),
          ...metrics.map((metric) => {
            const text = this._dayText(language, metric, metric.week[index]);
            return el("td", {}, text.met ? `${text.value}, ${translate(language, "reached")}` : text.value);
          }),
        ),
      ),
    );

    const out = [head, plot, days, table];
    if (this._historyReady && !selected.hasHistory) {
      out.push(el("p", { class: "note" }, translate(language, "noHistory")));
    }
    return out;
  }

  _key(event) {
    const last = this._cols.length - 1;
    const rtl = getComputedStyle(this).direction === "rtl";
    const current = this._active === -1 ? last : this._active;
    let next;
    if (event.key === "ArrowLeft") next = current + (rtl ? 1 : -1);
    else if (event.key === "ArrowRight") next = current + (rtl ? -1 : 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else if (event.key === "Escape") {
      event.preventDefault();
      this._show(-1);
      return;
    } else return;
    event.preventDefault();
    this._show(Math.max(0, Math.min(last, next)));
  }

  _show(index) {
    const plot = this._plot;
    if (!plot) return;
    this._cols.forEach((col, at) => col.classList.toggle("on", at === index));
    this._active = index;
    if (index === -1) {
      this._tip.classList.remove("on");
      plot.removeAttribute("aria-valuetext");
      return;
    }
    const language = this._language;
    const metric = this._selectedMetric;
    const text = this._dayText(language, metric, metric.week[index]);
    const line = text.met ? `${text.date}, ${translate(language, "reached")}` : text.date;
    this._tip.replaceChildren(
      el("span", { class: "tip-value" }, text.value),
      el("span", { class: "tip-line" }, line),
    );
    this._tip.classList.add("on");
    const col = this._cols[index];
    const width = this._tip.offsetWidth;
    const left = Math.min(
      Math.max(0, col.offsetLeft + col.offsetWidth / 2 - width / 2),
      Math.max(0, plot.clientWidth - width),
    );
    // Above the plot, so the tooltip never covers the bars it describes.
    this._tip.style.left = `${Math.round(left)}px`;
    this._tip.style.top = `${-this._tip.offsetHeight - 4}px`;
    plot.setAttribute("aria-valuenow", index + 1);
    plot.setAttribute(
      "aria-valuetext",
      `${text.date}: ${text.value}${text.met ? `, ${translate(language, "reached")}` : ""}. ${translate(language, "dayOf", { n: index + 1, total: this._cols.length })}`,
    );
  }
}

class LifeDashboardActivityCardEditor extends Base {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  connectedCallback() {
    this._render();
  }

  get _language() {
    return localeSettings(this._hass).language;
  }

  _schema() {
    const language = this._language;
    const schema = [{ name: "title", selector: { text: {} } }];
    for (const metric of ORDER) {
      schema.push(
        { name: metric, selector: { entity: { domain: "sensor" } } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: `${metric}_goal`, selector: { number: { min: 1, step: 1, mode: "box" } } },
            {
              name: `${metric}_goal_entity`,
              selector: { entity: { domain: ["input_number", "number", "sensor"] } },
            },
          ],
        },
      );
    }
    schema.push({
      name: "streak",
      selector: {
        select: {
          mode: "dropdown",
          options: [
            { value: "selected", label: translate(language, "streakSelected") },
            { value: "all", label: translate(language, "streakEvery") },
          ],
        },
      },
    });
    return schema;
  }

  _label(name) {
    const language = this._language;
    const names = {
      title: "editorTitle",
      steps: "editorSteps",
      energy: "editorEnergy",
      exercise: "editorExercise",
      streak: "editorStreak",
    };
    if (names[name]) return translate(language, names[name]);
    const metric = ORDER.find((key) => name.startsWith(`${key}_goal`));
    if (!metric) return name;
    const field = translate(language, name.endsWith("_entity") ? "editorGoalEntity" : "editorGoal");
    return `${translate(language, metric)}: ${field}`;
  }

  _emit(config) {
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }),
    );
  }

  _render() {
    if (!this.shadowRoot || !this.isConnected) return;
    if (customElements.get("ha-form")) {
      if (!this._form) {
        this._form = document.createElement("ha-form");
        this._form.computeLabel = (item) => this._label(item.name);
        this._form.addEventListener("value-changed", (event) => {
          event.stopPropagation();
          this._emit(fromForm({ ...toForm(this._config), ...event.detail.value }));
        });
        this.shadowRoot.replaceChildren(this._form);
      }
      this._form.hass = this._hass;
      const schema = this._schema();
      const schemaKey = JSON.stringify(schema);
      if (schemaKey !== this._schemaKey) {
        this._schemaKey = schemaKey;
        this._form.schema = schema;
      }
      this._form.data = toForm(this._config);
      return;
    }
    if (this._waiting) return;
    this._waiting = true;
    customElements.whenDefined("ha-form").then(() => this._render());
    const field = (name) => {
      const input = el("input", { type: "text", "aria-label": this._label(name) });
      input.value = this._config[name] ?? "";
      input.addEventListener("change", () => {
        const data = toForm(this._config);
        const value = input.value.trim();
        if (name.endsWith("_goal")) {
          delete data[name];
          delete data[`${name}_entity`];
          data[readNumber(value) === null ? `${name}_entity` : name] = value;
        } else data[name] = value;
        this._emit(fromForm(data));
      });
      return el(
        "label",
        { style: "display:block;margin:8px 0;font:inherit" },
        this._label(name),
        el("br"),
        input,
      );
    };
    this.shadowRoot.replaceChildren(
      field("title"),
      ...ORDER.flatMap((metric) => [field(metric), field(`${metric}_goal`)]),
    );
  }
}

if (typeof customElements !== "undefined") {
  if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, LifeDashboardActivityCard);
  if (!customElements.get(EDITOR_TAG)) customElements.define(EDITOR_TAG, LifeDashboardActivityCardEditor);
}

if (typeof window !== "undefined") {
  window.customCards = window.customCards || [];
  if (!window.customCards.some((card) => card.type === CARD_TAG)) {
    window.customCards.push({
      type: CARD_TAG,
      name: "Life Dashboard Activity",
      description:
        "Daily goals for steps, active energy and exercise as rings, with the last seven days and your streak.",
      preview: true,
      documentationURL: "https://github.com/owen282000/life-dashboard-activity-card",
    });
  }
}
