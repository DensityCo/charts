# Density Charts
This repository contains all of our charts for displaying data. Many are written in D3, some in
react, and a few even with raw DOM apis!

## This uses React Storybook.
This project relies heavily on react storybook, which is a open source system for displaying react
components while in development. It supports hot reload and allows one to see all possible states of
a component while developing. Basically, it's awesome.

## Project Structure
```
.
├── charts                # All charts live inside the charts folder.
│   ├── drift-chart
│   │   ├── index.js      # All of our chart code.
│   │   ├── story.js      # A bunch of test cases for our chart, via react-storybook.
│   │   ├── styles.scss   # Styles for our chart.
│   │   └── package.json  # Each chart is is own package with its own dependencies.
│   │ 
│   └── index.js          # A few utility functions that make the package work.
├── make-chart            # A generator to make new charts.
├── package.json
└── stories               # All stories from all charts are symlinked into the root stories folder.
    └── drift-chart.js -> ../charts/drift-chart/story.js
```

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

## Publishing to our NPM Registry
Coming soon. But will probably look like:
```
$ make publish CHART=foo-bar
```
