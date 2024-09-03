generate-js-file:
	cd extractor && go run .;
	cp extractor/hero_cards.js src/hero_cards.js;
	cp extractor/hero_skills.js src/hero_skills.js;