# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [2.1.1](https://github.com/MagicMirrorModules/MMM-SystemTemperature/compare/v2.1.0...v2.1.1) (2026-10-11)

### Fixed

* **alerts:** trigger commands once per alert ([578d067](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/578d06710a6572d521919075c970de5956351b33))
* **config:** validate temperature interval and unit ([390b442](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/390b4426e7708cfda66cc406b715a3b443e03a64))
* **sensor:** report unavailable temperature ([454909e](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/454909eac5bc17b36d2e48ad215248b0bc50def4))

### Chores

* add CHANGELOG.md to prettier ignore list ([1fcd47a](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/1fcd47a72b8f01b95e0cfec5b3d1ccdf3663d126))
* update dependencies ([9337903](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/93379032f0790f259869f068f6a6fb8e34fe12fa))

### Continuous Integration

* add automated testing workflow ([ec3b8a1](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/ec3b8a109c079bbe15be40d975f0a948f84fe894))

## [2.1.0](https://github.com/MagicMirrorModules/MMM-SystemTemperature/compare/v2.0.1...v2.1.0) (2026-09-12)

### Added

* add demo script ([2c9ddb1](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/2c9ddb1b08e6d43128b9ad7970078db29480ee1a))

### Fixed

* **helper:** prevent overlapping temperature reads ([8c1ca08](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/8c1ca083984d0797a45bbd63aff9f48987ebb83a))
* **sensor:** reject zero CPU readings ([9304abf](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/9304abfdb277877fd1a23aafecfccc2c87842c78))

### Performance Improvements

* avoid unnecessary command timers ([5cfbf75](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/5cfbf75baef5236a3fb4dc90ec91ffd4472b294c))
* **helper:** fetch initial temperature immediately ([8fd86fe](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/8fd86fe557d6fc9a05e8a6395e6c211a6498a35a))

### Documentation

* add prettier-ignore comment for code block in README.md ([5577140](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/5577140f24df5536b75388490829ce2f0453d3d4))

### Chores

* add release automation ([e11902a](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/e11902a8f524715767e004d923008503253b396d))
* update dependencies ([c866426](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/c866426a37829462f5048a0f02f7db4dfb88e38a))
* update repository URL in package.json ([25aad0e](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/25aad0e1eaefd877e5eb4d4d6e757a34b6233712))

### Code Refactoring

* build temperature display with DOM APIs ([d246a84](https://github.com/MagicMirrorModules/MMM-SystemTemperature/commit/d246a84fafbc8216289bbe849a3604732939dc30))
## [2.0.1](https://github.com/KristjanESPERANTO/MMM-SystemTemperature/compare/v2.0.0...v2.0.1) - 2025-09-10

- chore: update devDependencies
- docs: add Code of Conduct and contributing guidelines to README.md
- docs: improve module description in README.md

## [2.0.0](https://github.com/KristjanESPERANTO/MMM-SystemTemperature/compare/v1.0.0...v2.0.0) - First Release from Kristjan ESPERANTO - 2025-08-31

### Added

- chore: add ESLint and prettier setup
- docs: add CHANGELOG.md
- docs: add screenshot

### Changed

- chore: rename module to `MMM-SystemTemperature`
- refactor: use `systeminformation` library instead of external commands - with that we are **platform-independent**.
- refactor: replace lodash with custom JavaScript throttle
- refactor: cleaner, more maintainable codebase with async/await
- docs: updated and formatted README

## [1.0.0](https://github.com/KristjanESPERANTO/MMM-SystemTemperature/releases/tag/v1.0.0) - Last Release from MichMich - 2023-10-31

- Basic temperature monitoring for Raspberry Pi
- Warning and critical temperature alerts
- Shutdown capability via MMM-Remote-Control
- Celsius, Fahrenheit, and Kelvin support
- Basic lodash-based throttling
