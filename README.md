<p align="center">
  <img src="https://raw.githubusercontent.com/owen282000/life-dashboard-activity-card/main/docs/readme-icon.png" alt="Life Dashboard icon" width="128" height="128">
</p>

<h1 align="center">Life Dashboard Activity Card</h1>

<p align="center">
  <b>Your daily activity goals on your Home Assistant dashboard.</b><br>
  Steps, active energy and exercise as rings, the last seven days against the goal, and how many days in a row you made it.
</p>

<p align="center">
  <a href="https://my.home-assistant.io/redirect/hacs_repository/?owner=owen282000&repository=life-dashboard-activity-card&category=plugin"><img src="https://img.shields.io/badge/Marketplace-Custom%20repository-41BDF5" alt="Add it to the Home Assistant Marketplace as a custom repository"></a>
  <a href="https://github.com/owen282000/life-dashboard-activity-card/releases/latest"><img src="https://img.shields.io/github/v/release/owen282000/life-dashboard-activity-card?label=Release&color=30b77e" alt="Latest release"></a>
  <a href="https://www.home-assistant.io/"><img src="https://img.shields.io/badge/Home%20Assistant-2026.3%2B-41BDF5" alt="Home Assistant 2026.3 or newer"></a>
  <a href="https://github.com/owen282000/life-dashboard-activity-card/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT license"></a>
</p>

<p align="center">
  <a href="https://github.com/owen282000/life-dashboard-activity-card#install"><b>Install</b></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/owen282000/life-dashboard-activity-card#configure">Configure</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/owen282000/life-dashboard-activity-card#works-with-any-sensor">Any&nbsp;sensor</a>
  &nbsp;·&nbsp;
  <a href="https://owen282000.com/life-dashboard/">Website</a>
</p>

<p align="center">
  <sub>Life Dashboard: <a href="https://github.com/owen282000/life-dashboard-companion-app">Android app</a> &nbsp;·&nbsp; <a href="https://github.com/owen282000/life-dashboard-companion-app-ios">iPhone app</a> &nbsp;·&nbsp; <a href="https://github.com/owen282000/life-dashboard-ha">Home Assistant integration</a> &nbsp;·&nbsp; <a href="https://github.com/owen282000/life-dashboard-stack">Grafana stack</a> &nbsp;·&nbsp; <a href="https://github.com/owen282000/life-dashboard-sleep-card">Sleep card</a> &nbsp;·&nbsp; <a href="https://github.com/owen282000/life-dashboard-screen-time-card">Screen time cards</a> &nbsp;·&nbsp; <b>Activity card</b></sub>
</p>

<p align="center">
  <picture>
    <source media="(max-width: 600px)" srcset="https://raw.githubusercontent.com/owen282000/life-dashboard-activity-card/main/docs/readme-hero-phone.png">
    <img src="https://raw.githubusercontent.com/owen282000/life-dashboard-activity-card/main/docs/readme-hero.png" alt="The card twice on a dark theme. On the left with three sensors of one phone: rings for 7,842 of 10,000 steps, 412 of 600 kcal active energy and 26 of 30 minutes of exercise, each with what is left to go, a pill that says 5 days in a row, and seven bars against a dashed goal line with a dot per goal under each day. On the right with one steps sensor: a single larger ring and the same week" width="900">
  </picture>
  <br><sub>Sample data from a made-up phone. Left: three sensors. Right: one steps sensor</sub>
</p>

The card reads up to three sensors and draws today against a goal for each. The earlier days and the streak come from the long-term statistics Home Assistant already keeps. It works with any steps sensor you have, from Fitbit, Garmin, Withings or the official Companion app. With the [Life Dashboard app](https://github.com/owen282000/life-dashboard-companion-app) on your phone it fills all three rings by itself.

<a href="https://play.google.com/store/apps/details?id=com.owen282000.lifedashboard&referrer=utm_source%3Dgh-activity-readme%26utm_medium%3Dreadme"><img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" height="60" align="middle"></a> <a href="https://apps.apple.com/app/apple-store/id6824075761?pt=128699800&ct=gh-activity-readme&mt=8"><img src="https://raw.githubusercontent.com/owen282000/life-dashboard-activity-card/main/docs/badges/app-store.png" alt="Download on the App Store" height="40" align="middle"></a>

## What you get

- **Today as rings.** One, two or three of them: steps, active energy and exercise. Each shows the number, the goal, and how much is left or that the goal is reached.
- **The last seven days.** A bar per day against the goal as a dashed line, and how many of the seven days were on goal. Tap a ring to put its goal in the chart. With more than one ring, a dot per goal under each day shows which ones you reached.
- **Days in a row.** The streak of the goal in the chart, or of the days on which you reached every goal. A day that is still running does not break it: today counts once you get there.
- **Goals you can change.** A number in the card, or an `input_number` helper, so a button, an automation or a slider on your dashboard can move the goal.
- **Every day on demand.** Hover or tap a bar for its date and value. On a keyboard, focus the chart and use the arrow keys, Home and End. Screen readers get a table of the week.
- **Your locale and theme.** English, Arabic, Chinese, Dutch, French, German, Hindi, Italian, Japanese, Portuguese and Spanish, numbers in your language, and your theme's colors in light and dark.

<p align="center">
  <img src="https://raw.githubusercontent.com/owen282000/life-dashboard-activity-card/main/docs/readme-hero-light.png" alt="The same two cards on a light theme" width="900">
  <br><sub>Sample data, on a light theme</sub>
</p>

## Install

### Through the Home Assistant Marketplace

The card is not in the Marketplace's default list yet, so add it as a custom repository. In **Settings > Marketplace** (HACS before Home Assistant 2026.11), open the three dots, choose **Custom repositories**, and add `https://github.com/owen282000/life-dashboard-activity-card` as the type **Dashboard**. Then search for **Life Dashboard Activity Card** and download it. The button opens it in your Home Assistant straight away:

[![Open your Home Assistant instance and open this repository in the Marketplace](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=owen282000&repository=life-dashboard-activity-card&category=plugin)

On storage mode dashboards the resource is registered for you. If your dashboards are in YAML mode, add it yourself:

```yaml
lovelace:
  resources:
    - url: /hacsfiles/life-dashboard-activity-card/life-dashboard-activity-card.js
      type: module
```

### By hand

Copy `dist/life-dashboard-activity-card.js` into the `www` folder of your Home Assistant configuration and add it as a resource of the type JavaScript module with the URL `/local/life-dashboard-activity-card.js`.

## Configure

The card is in the card picker as **Life Dashboard Activity**, with a visual editor. Or in YAML, with one sensor:

```yaml
type: custom:life-dashboard-activity-card
steps: sensor.your_watch_steps
steps_goal: 10000
```

With all three, and a goal that comes from a helper:

```yaml
type: custom:life-dashboard-activity-card
steps: sensor.your_phone_steps_today
steps_goal: input_number.step_goal
energy: sensor.your_phone_active_calories_today
energy_goal: 600
exercise: sensor.your_phone_exercise_today
exercise_goal: 30
streak: all
```

| Option | Description |
| --- | --- |
| `steps` | A sensor with today's steps |
| `energy` | A sensor with today's active energy, in kcal or kJ |
| `exercise` | A sensor with today's exercise or active time, in minutes or hours |
| `steps_goal`, `energy_goal`, `exercise_goal` | The daily goal: a number, or the entity id of an `input_number`, a `number` or a sensor. Without one: 10,000 steps, 500 kcal and 30 minutes |
| `streak` | `all` counts the days on which every goal was reached. Left out, the streak is of the goal in the chart |
| `title` | Instead of "Activity" |

Give the card one, two or three of the sensors, in any combination. Every ring you leave out is simply not drawn.

## Works with any sensor

Nothing here needs the Life Dashboard app. Each ring wants a sensor whose state is today's total and starts at zero each day, which is what most integrations for watches and phones give you for steps.

- **Today** is the sensor's state. Energy in kJ and exercise in hours are converted.
- **The earlier days and the streak** come from the sensor's long-term statistics, so the sensor needs a state class (`total_increasing`, `total` or `measurement`). You can check in a statistics graph card: if the sensor is offered there, this card can read it.
- **A new sensor** has no statistics for the days before you added it. The chart then starts today, the card says so, and the week fills up day by day.
- **Active energy and exercise** work the same way when you have a sensor for them. Many sources only give steps, and then the card is one larger ring with the week under it.

The streak uses today's goal for every earlier day, so changing a goal changes the streak too. It looks back a year at most.

## Gets more with the Life Dashboard app

The [Life Dashboard app](https://github.com/owen282000/life-dashboard-companion-app) sends what Health Connect on Android or Apple Health on an iPhone has to its [Home Assistant integration](https://github.com/owen282000/life-dashboard-ha), whatever watch or app counted it. Pick the phone's **Steps today**, **Active calories today** and **Exercise today** sensors, and the card picker fills them in for you when it finds them.

- **All three rings.** Active energy and exercise minutes come along from Health Connect and Apple Health, so you need no separate sensor for them.
- **A week on the first day.** The integration keeps a total per day as its own long-term statistics, and **Send history** in the app sends the days from before you installed it. The chart and the streak are filled in from the start instead of beginning today.

The app is free and open source on GitHub and F-Droid for Android. The store versions cost a few euros once, if you would rather have updates handled for you: [Google Play](https://play.google.com/store/apps/details?id=com.owen282000.lifedashboard&referrer=utm_source%3Dgh-activity-readme%26utm_medium%3Dreadme) for the [Android app](https://github.com/owen282000/life-dashboard-companion-app) and the [App Store](https://apps.apple.com/app/apple-store/id6824075761?pt=128699800&ct=gh-activity-readme&mt=8) for the [iPhone app](https://github.com/owen282000/life-dashboard-companion-app-ios).

## Colors

| Variable | Default |
| --- | --- |
| `--life-dashboard-activity-steps` | the theme's `--primary-color` |
| `--life-dashboard-activity-energy` | `#d9781f` |
| `--life-dashboard-activity-exercise` | `#8a63d2` |

## Part of Life Dashboard

This card sits on top of Life Dashboard's projects, and you only install the parts you need. More at [owen282000.com/life-dashboard](https://owen282000.com/life-dashboard/).

| Project | What it does |
| --- | --- |
| [Android app](https://github.com/owen282000/life-dashboard-companion-app) | Health Connect and screen time from your phone |
| [iPhone app](https://github.com/owen282000/life-dashboard-companion-app-ios) | Apple Health from your iPhone |
| [Home Assistant integration](https://github.com/owen282000/life-dashboard-ha) | Sensors and all your history |
| [Grafana stack](https://github.com/owen282000/life-dashboard-stack) | Postgres and Grafana dashboards |
| [Sleep card](https://github.com/owen282000/life-dashboard-sleep-card) | One night, stage by stage |
| [Screen time cards](https://github.com/owen282000/life-dashboard-screen-time-card) | Today, the week and the family |
| **Activity card** | Daily goals, the week and your streak (this repository) |

## Privacy

The card only reads what Home Assistant already gives your browser: the sensors' state and, for the earlier days, the recorder's statistics. It makes no requests of its own, has no telemetry or analytics, and there's no server of mine in the path.

## Help and contributing

Bugs go to [issues](https://github.com/owen282000/life-dashboard-activity-card/issues) here. Questions go to the integration's [Discussions](https://github.com/owen282000/life-dashboard-ha/discussions). No GitHub account? Use the [feedback board](https://owen282000.com/life-dashboard/feedback/), which needs no account. Everything on it is public, so leave out health data, logs and webhook URLs.

Pull requests are welcome, see [CONTRIBUTING](https://github.com/owen282000/life-dashboard-activity-card/blob/main/CONTRIBUTING.md). The card is one JavaScript file with no dependencies and no build step. Security problems go through a [private advisory](https://github.com/owen282000/life-dashboard-activity-card/security/advisories/new).

## Support the project

Stars, shares and good bug reports all help. If you want to chip in for the evenings that go into it, there's [Ko-fi](https://ko-fi.com/owen282000). The card stays free and open source (MIT) either way.

MIT licensed. See [LICENSE](https://github.com/owen282000/life-dashboard-activity-card/blob/main/LICENSE).

<p align="center">
  <sub>Made by <a href="https://github.com/owen282000">Owen Vogelaar</a> for the self-hosting and quantified self crowd.</sub><br>
  <sub>Google Play and the Google Play logo are trademarks of Google LLC.</sub><br>
  <sub>Apple, the Apple logo and App Store are trademarks of Apple Inc.</sub>
</p>
