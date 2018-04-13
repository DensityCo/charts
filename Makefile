SHELL := /bin/bash

BABEL = ./node_modules/.bin/babel
NODE_SASS = ./node_modules/.bin/node-sass

.PHONY: help
help:
	@echo "Density Charts Makefile"
	@echo
	@echo
	@echo "# Project-level targets"
	@printf "\t- make help\t\tshows this help page.\n"
	@printf "\t- make chart\truns ./make-chart, an interactive helper script to help generate new charts.\n"
	@printf "\t- make charts-list\treturns a list of all charts in the charts/ directory\n"
	@printf "\t- make clean\tremoves the built artifacts in the dist/ directory\n"
	@printf "\t- make build\tbuilds the main package's styles, and puts them into dist/\n"
	@printf "\t- make publish\tpublishes the main @density/ui package to npm\n"
	@echo
	@echo
	@echo "# Chart-level targets"
	@echo
	@echo "Note: each chart level target starts with the chart name. In the below, the"
	@echo "chart will be 'historical-counts' but this could very well be any chart in the charts/"
	@echo "directory."
	@echo
	@printf "\t- make historical-counts-clean\tremoves built artifacts within the charts/historical-counts/dist/ directory.\n"
	@printf "\t- make historical-counts-build\tbuilds the chart's javascript and styles, putting them into the charts/historical-counts/dist/ directory.\n"
	@printf "\t- make historical-counts-publish\tpublishes the @density/charts-historical-counts chart to the npm registry\n"
	@printf "\t- make historical-counts-version\tprints the chart's version (found in package.json)\n"
	@printf "\t- make historical-counts-patch\tbumps the chart's patch version\n"
	@printf "\t- make historical-counts-minor\tbumps the chart's minor version\n"
	@printf "\t- make historical-counts-major\tbumps the chart's major version\n"

.PHONY: chart
chart:
	./make-chart

.PHONY: clean
clean:
	rm -rf dist/
	rm -rf charts/*/dist/

.PHONY: build
build: dist/index.js

.PHONY: publish
publish: clean build
	npm publish --access public

# There's a special rule for charts/index.js, sorry :/
# ie, charts/index.js => dist/index.js
dist/%.js: dist
	$(BABEL) charts/$(@F) \
		--ignore=node_modules,charts/dist \
		--presets=babel-preset-es2015,babel-preset-react \
		--plugins=babel-plugin-transform-object-rest-spread \
		> $@

dist:
	mkdir -p dist/

.PHONY: version
version:
	@printf "Package version: " && jq -r '.version' package.json 

.PHONY: version-%
version-%:
	npm version $(*F)

.PHONY: major minor patch
patch: version-patch
major: version-patch
minor: version-patch

.PHONY: charts-list
charts-list:
	@find charts/ \
		-maxdepth 1 -mindepth 1 \
		-type d \
		! -name "template" ! -name "dist" \
		-exec basename '{}' ';'

# To make the main density-ui stylesheet, compile to css.
# @density/node-sass-json-importer is used to parse json files with variables inside. Learn more:
# https://github.com/DensityCo/node-sass-json-importer
# ie, `styles/main.scss` => `dist/styles.css`
dist/styles.css: dist/
	$(NODE_SASS) \
		--importer node_modules/@density/node-sass-json-importer/dist/node-sass-json-importer.js \
		styles/main.scss \
		> $@



define GEN_RULE
$(1)_CHART_PATH = charts/$(1)
$(1)_CHART_PATH_DIST = charts/$(1)/dist
$(1)_CHART_SOURCE_FILES = $(shell ls charts/$(1)/*.js)

# ie, charts/card/foo.js => charts/card/dist/foo.js
$(1)_CHART_SOURCE_FILES_DIST = $(foreach i,$(shell ls charts/$(1)/*.js),charts/$(1)/dist/$(notdir $i))

# SECONDEXPANSION expands twice, producing something like card_CHART_PATH_DIST in the below
# target (for example)
# More info: https://www.gnu.org/software/make/manual/html_node/Secondary-Expansion.html
.SECONDEXPANSION:
$1-clean:
	rm -rf $$($(1)_CHART_PATH_DIST)

.SECONDEXPANSION:
$1-build: $$($(1)_CHART_SOURCE_FILES_DIST) $$($(1)_CHART_PATH_DIST)/styles.css

.SECONDEXPANSION:
$1-publish: $1-clean $1-build
	pushd $$($(1)_CHART_PATH) > /dev/null && \
	npm publish --access public && \
	popd > /dev/null

# Create charts/card/dist if it doesn't exist
.SECONDEXPANSION:
$$($(1)_CHART_PATH_DIST):
	mkdir -p $$@

# In the below case, pushd and popd are build used to ensure that the user returns back to the
# directory that they started in.
.SECONDEXPANSION:
$1-version:
	@pushd $$($(1)_CHART_PATH) > /dev/null && \
	printf "Chart $(1) version: " && \
	jq -r '.version' package.json && \
	popd > /dev/null

.SECONDEXPANSION:
$1-version-%:
	@pushd $$($(1)_CHART_PATH) > /dev/null && \
	npm version $$(*F) && \
	popd > /dev/null

$1-major: $1-version-major
$1-minor: $1-version-minor
$1-patch: $1-version-patch

# To make each transpiled file, compile the source file with the same name
# ie, charts/card/index.js => charts/card/dist/index.js
.SECONDEXPANSION:
$$($(1)_CHART_PATH_DIST)/%.js: $$($(1)_CHART_PATH_DIST)
	$(BABEL) $$($(1)_CHART_PATH)/$$(@F) \
		--ignore=node_modules,$$($(1)_CHART_PATH_DIST) \
		--presets=babel-preset-es2015,babel-preset-react \
		--plugins=babel-plugin-transform-object-rest-spread \
		| sed -n '/styles.scss/!p' \
		| sed -n '/"use strict"/!p' \
		> $$@

# To make each stylesheet, compile to css.
# @density/node-sass-json-importer is used to parse json files with variables inside. Learn more:
# https://github.com/DensityCo/node-sass-json-importer
# ie, charts/card/styles.scss => charts/card/dist/{_sass.scss,styles.css}
.SECONDEXPANSION:
$$($(1)_CHART_PATH_DIST)/styles.css: $$($(1)_CHART_PATH_DIST)
	cat $$($(1)_CHART_PATH)/styles.scss \
		| sed -n '/@import.*\.json/!p' \
		> $$($(1)_CHART_PATH_DIST)/_sass.scss
	$(NODE_SASS) \
		--importer node_modules/@density/node-sass-json-importer/dist/node-sass-json-importer.js \
		$$($(1)_CHART_PATH)/styles.scss \
		> $$@

endef

$(foreach chart_name,$(shell find charts/ -type d -mindepth 1 -maxdepth 1 -exec basename '{}' ';'),$(eval $(call GEN_RULE,$(chart_name))))
