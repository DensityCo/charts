
# First, ensure that `CHART` or `chart` has been set to tell us which chart to build.
ifndef CHART
$(error Please define CHART - options are $(shell ls charts/))
endif

CHART_PATH = charts/$(CHART)
CHART_PATH_DIST = $(CHART_PATH)/dist
CHART_SOURCE_FILES = $(shell ls $(CHART_PATH)/*.js)

BABEL = ./node_modules/.bin/babel
NODE_SASS = ./node_modules/.bin/node-sass

.PHONY: build
build: $(foreach i,$(CHART_SOURCE_FILES),$(CHART_PATH_DIST)/$(notdir $i)) charts/dist/index.js $(CHART_PATH_DIST)/styles.css

.PHONY: publish
publish: clean build
	cd $(CHART_PATH) && npm publish --access public

.PHONY: clean
clean:
	rm -rf $(CHART_PATH_DIST)
	rm -rf charts/dist

$(CHART_PATH_DIST):
	mkdir -p $(CHART_PATH_DIST)

# To make each transpiled file, compile the source file with the same name
# ie, charts/$CHART/index.js => charts/$CHART/dist/index.js
$(CHART_PATH_DIST)/%.js: $(CHART_PATH_DIST)
	$(BABEL) $(CHART_PATH)/$(@F) \
		--ignore=node_modules,$(CHART_PATH_DIST) \
		--presets=babel-preset-es2015,babel-preset-react \
		--plugins=babel-plugin-transform-object-rest-spread \
		| sed -n '/styles.scss/!p' \
		> $@

# To make each stylesheet, compile to css.
# ie, charts/$CHART/styles.scss => charts/$CHART/dist/{_styles.scss,styles.css}
$(CHART_PATH_DIST)/styles.css: $(CHART_PATH_DIST)
	cp $(CHART_PATH)/styles.scss $(CHART_PATH_DIST)/_styles.scss
	cp $(CHART_PATH)/styles.scss $(CHART_PATH_DIST)/_sass.scss
	$(NODE_SASS) $(CHART_PATH)/styles.scss > $@


# There's a special rule for charts/index.js, sorry :/
# ie, charts/index.js => charts/dist/index.js
charts/dist/%.js: charts/dist
	$(BABEL) charts/$(@F) \
		--ignore=node_modules,charts/dist \
		--presets=babel-preset-es2015,babel-preset-react \
		--plugins=babel-plugin-transform-object-rest-spread \
		> $@

charts/dist:
	mkdir -p charts/dist
