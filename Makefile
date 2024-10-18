FOLDER=../Rogue\ Adventure/res

extract-from-apk:
	cp ${FOLDER}/drawable-mdpi-v4/* docs/assets;
	cp ${FOLDER}/drawable-nodpi-v4/* docs/assets;
	cd extractor && go run .;
	cp extractor/hero_cards.js docs/hero_cards.js;
	cp extractor/hero_skills.js docs/hero_skills.js;
