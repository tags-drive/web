# Tags Drive (Web)

This repository contains web part of **Tags Drive**. Core part can be found [here](https://github.com/tags-drive/core)

##

- [Project layout](#project-layout)
- [Development](#development)
  - [Commands](#commands)
  - [Backend](#backend)

## Project layout

- `public` – HTML templates and static files
- `src/global` – global classes, Vue components, styles and etc.
- `src/index` – index page
- `src/login` – login page
- `src/mobile` – mobile version

## Development

### Commands

- `npm run build` – build for production
- `npm run serve` – run local version with auto rebuild on code change
- `npm run lint` – lint code

### Backend

You can bring up a local version of backend of **Tags Drive** to develop and test frontend (you need **Docker**)

1. Clone [tags-drive/core](https://github.com/tags-drive/core) with `git clone https://github.com/tags-drive/core.git`. You can add `--single-branch` and `--depth 1` args to clone only last commit
2. CD to `core` folder
3. Run `python scripts\docker\run_docker.py`. You can change behavior of the script. Just use `-h` arg to learn all available options
