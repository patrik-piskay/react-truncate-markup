# How to Contribute

We’d love to accept your contributions to this project. There are just a few small guidelines you need to follow.


## Project setup

1. Fork and clone the repo
2. `yarn` or `npm install` to install project's dependencies
3. `yarn start` to start the demo app to see what affect your changes have

## Testing and linting

We use [Puppeteer](https://github.com/GoogleChrome/puppeteer) for screenshot testing, and because of (font) rendering inconsistencies between platforms, [Docker](https://www.docker.com/community-edition) image is used to keep the testing environment consistent.

Once Docker is installed and running locally, run `yarn test` to make sure tests and linter are passing before committing your changes.

To add a new screenshot test scenario, create a new file in `__tests__/app/src/pages` and it will be automatically picked up in the next test run, creating a new screenshot snapshot in the process.

## Code reviews

All submissions, including submissions by project members, require review. We use GitHub pull requests for this purpose. See [GitHub Help](https://help.github.com/articles/about-pull-requests/) for more information on using pull requests.