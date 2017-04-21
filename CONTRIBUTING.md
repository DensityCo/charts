# Contributing

This project has a build process to transpile es2015 code down to es5 prior to release.
Feel free to use as much es2015 (and object spread) in your source as you'd like.

## Creating a new chart
```
$ ./make-chart
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

To build the storyboard and start a development server:
=> npm run storyboard
```

## Publishing

Even though all of our charts live in one repository, they all have separate packages on our private
npm registry. Each chart has the package name of `@density/chart-MY-CHART-NAME`. Once you have a new
change and want to publish it, it's pretty easy:

1. First, make sure you have an account on our private npm registry and are logged in. Talk to @ryan
   on slack if you need to get set up.
2. Bump the version of the package (FOLLOW SEMVER!): `cd charts/my-chart && npm version [patch|minor|major]`
3. `make publish CHART=my-chart` will build the chart clean and publish the new version to the npm
   registry.

*NOTE*: One other thing is always built prior to publishing a package - `chart/index.js`. It
contains helpers like the function to convert a chart to a react component. It's build whenever
`make publish CHART=XXX` is run, or can be built seperately by running `make charts/dist/index.js`.
