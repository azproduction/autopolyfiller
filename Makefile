BIN = ./node_modules/.bin
MOCHA = $(BIN)/mocha
ISTANBUL = $(BIN)/istanbul
JSHINT = $(BIN)/jshint
JSCS = $(BIN)/jscs
COVERALLS = $(BIN)/coveralls

.PHONY: test
test:
	$(MOCHA) -u bdd -R spec

.PHONY: validate
validate: lint test

.PHONY: clean
clean:
	-rm -rf lib-cov
	-rm -rf html-report

.PHONY: lib-cov
lib-cov: clean
	$(ISTANBUL) instrument --complete-copy --output lib-cov --no-compact --variable global.__coverage__ lib

.PHONY: coverage
coverage: lib-cov
	AUTOPOLIFILLER_COVERAGE=1 $(MOCHA) --reporter mocha-istanbul
	@echo
	@echo Open html-report/index.html file in your browser

.PHONY: coveralls
coveralls: lib-cov
	@AUTOPOLIFILLER_COVERAGE=1 ISTANBUL_REPORTERS=lcovonly $(MOCHA) --reporter mocha-istanbul
	@cat lcov.info | $(COVERALLS)
	@rm -rf lib-cov lcov.info

.PHONY: travis
travis: validate coveralls

.PHONY: lint
lint:
	$(JSHINT) .
	$(JSCS) .

.PHONY: browserify
browserify:
	./node_modules/.bin/browserify example_assets/index.js | sed 's/fs.readdirSync/fs.readdirSync \&\& fs.readdirSync/' > ./example_assets/index.browserify.js
