# Contributing

This project has a build process to transpile es2015 code down to es5 prior to release.
Feel free to use as much es2015 (and object spread) in your source as you'd like.

## Makefile
The build process for all the charts exists within this project's `Makefile`. To see a list of all
targets, run `make help`.

## Creating a new chart
```
$ make chart
./make-chart
Let's make a new chart.
Enter the name of your chart, in dash-case: foo-bar
Enter the name of your chart, in english (ie, `My chart`): Foo Bar
* Copying template to charts/foo-bar...
* Replacing placeholders with variations of foo-bar...
* Linking foo-bar story to stories folder...
Done!

You have a new chart in charts/foo-bar:
* charts/foo-bar/index.js contains your chart code.
* charts/foo-bar/styles.scss contains your chart styles.
* charts/foo-bar/story.js contains your react-storyboard story. Use it to present different states of your chart.

To install all of the dependencies for each chart:
=> npm run installall

To build the storybook and start a development server:
=> npm run storybook
```

## Previewing
This project uses react storybook to show examples. When any branch is pushed to the repo, circleci
will build a copy of the storybook and publish it to `https://densityco.github.io/charts/branchname`. Feel
free to use this auto-built storybook to help with code reviews.

## Publishing

_NOTE: Only density employees can publish packages. We'd love your contribution though - feel free
to submit a pull request!_

Even though all of our charts live in one repository, they all have separate packages on our private
npm registry. Each chart has the package name of `@density/chart-MY-CHART-NAME`. Once you have a new
change and want to publish it, it's pretty easy:

1. First, make sure you have an account on our public npm registry and are logged in. Talk to @ryan
   on slack if you need help getting set up.
2. Bump the version of the package (FOLLOW SEMVER!): `make my-chart-major` / `make my-chart-minor` / `make my-chart-patch`
3. `make my-chart-publish` will build the chart clean and publish the new version to the npm registry.
