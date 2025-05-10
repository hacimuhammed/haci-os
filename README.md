This is a [Next.js](https://nextjs.org) project template.

## Features

- Tailwind CSS
- bun
- Docker
- ESLint (with [antfu/eslint-config](https://github.com/antfu/eslint-config))

## Getting Started

Enable simple-git-hooks:

```bash
bunx simple-git-hooks
```

Disable telemetry:

```bash
bun --bun next telemetry disable
```

Lint app files:

```bash
bun --bun run lint
bun --bun run lint:fix
```

Lint all files (including config files .etc):

```bash
bun --bun run eslint
bun --bun run eslint:fix
```

Run the development server:

```bash
bun --bun run dev
```

Build the app:

```bash
bun --bun run build
```

Start the production server:

```bash
bun --bun run start
```

Build the Docker image and run:

```bash
docker build -t nextjs-docker .
docker run --rm -itd -p 3000:3000 nextjs-docker
```
