generate-js-file:
	cd extractor && go run .;
	cp extractor/hero_cards.js docs/hero_cards.js;
	cp extractor/hero_skills.js docs/hero_skills.js;
