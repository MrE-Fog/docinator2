# Docinator

Welcome to Docinator! Docinator extracts documentation in the form of PlantUML diagrams, Swagger specs, markdowns, and more to build a beautiful documentation website without any modifications to your repository. Docinator "just works" - install it, run it, that's it.

Learn to use Docinator by reading the [user documentation](docs/) or simply run `docinator --help` command.

<!-- TODO 
## User Guide

Docinator is published as an NPM/yarn package using the Gitlab NPM package
registry.

To install and use:

1. Make sure you've already [configured your local NPM/yarn to pull scoped packages
from the Gitlab package
registry](https://docs.gitlab.com/ee/user/packages/npm_registry/#authenticating-with-a-personal-access-token)

2. Then (assuming you've followed the above instructions to configure a package
scope named `@tmobile` mapped to the Gitlab NPM registry):

    ```bash
    npm install -g @tmobile/docinator
    ```
-->

## Developer Guide

Any editor will do, but effort has been put into getting
[VSCode](https://code.visualstudio.com/) configured _just right_ so please use
that unless you have a strong preference for another editor.

### System Requirements

You'll need Java 8 or above for the PlantUML integration.

### Project Initialization and First Run

The following will download the code, install dependencies, and serve the Docinator documentation:

```bash
git clone --recurse-submodules git@github.com:tmobile/docinator.git
cd docinator
npm i
ts-node src/cli.ts serve
```

### Run the CLI

```bash
npm run build && npm link
docinator --help
```

Docinator will now be available on the command line.

To avoid having to re-link between changes, use ts-node:

```bash
ts-node src/cli.ts --help
```

### Build with Docker

```bash
docker build -t docinator .
```

### Run with Docker

To build a Docinator site:

```bash
docker run -v "$(pwd):/data" -ti docinator build
```

To serve a Docinator site:

```bash
docker run -v "$(pwd):/data" -p 1313:1313 -ti docinator serve
```

> Note about using `$(pwd)` on Docker for Windows using GitBash and WSL-based engine: The `$(pwd)` value will pass the _Windows_ path to the _Linux_ host where it is invalid. Instead, try running directly from a WSL terminal
>
> ---
>
> Note about WSL: WSL may not allow port access on `1313` by default. Use `sudo ufw allow 1313` to allow access to port `1313`. You can disallow this later with `sudo ufw deny 1313`.

Heads up: changes to the Hugo template need a rebuild of the Docker image...

## Acknowledgements

* [Hugo](https://gohugo.io/) and [Hugo Theme Learn](https://themes.gohugo.io/hugo-theme-learn/) are used to generate static websites.
* [PlantUML](https://github.com/plantuml/plantuml) is used to generate PlantUML diagrams; this repository includes a binary distribution of PlantUML.
* [Swagger UI](https://swagger.io/tools/swagger-ui/) is used to visualize swagger files.
* Additional libraries and frameworks used are listed in the [package.json](package.json) file of this repository.
