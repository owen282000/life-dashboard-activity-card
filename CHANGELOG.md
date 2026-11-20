# Changelog

All notable changes to this card are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- First version: one to three daily goals as rings (steps, active energy and exercise), each against a goal that is a number or an `input_number` helper
- The last seven days as bars against the goal line, with a dot per goal under each day; a ring puts its goal in the chart
- A streak of days in a row, from Home Assistant's long-term statistics, for the goal in the chart or for every goal at once
- Works with any sensor that holds today's total; with the Life Dashboard integration the days come from its own statistics, so the week and the streak are there from the first sync
- Hover, touch and keyboard readout per day, with a text alternative for screen readers
- Visual editor in the card picker, built on Home Assistant's own form
- English, Arabic, Chinese, Dutch, French, German, Hindi, Italian, Japanese, Portuguese and Spanish, following the Home Assistant profile

[Unreleased]: https://github.com/owen282000/life-dashboard-activity-card/commits/main
