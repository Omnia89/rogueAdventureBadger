# Update workflow for a new game version:
#   make unpack APK=~/Downloads/rogue-adventure.apk   (or unpack it yourself into ./apk)
#   make update
#   make changes      -> review what's new
#   make serve        -> test the page on http://localhost:8000

APK_DIR   ?= apk
MAPS_DIR  := asset-maps
DOCS_DIR  := docs
MAPS      := hero_card_list.xml hero_skill_list.xml enemy_card_list.xml
PORT      ?= 8000

APP_VERSION  = $(shell grep -oP 'id="app-version">\K[^<]+' $(DOCS_DIR)/index.html)
GAME_VERSION = $(shell grep -oP 'id="game-version">\K[^<]+' $(DOCS_DIR)/index.html)

EXTRACTOR := cd extractor && go run . -apk $(abspath $(APK_DIR)) -maps $(abspath $(MAPS_DIR)) -docs $(abspath $(DOCS_DIR))

.DEFAULT_GOAL := help
.PHONY: help unpack update maps js images check changes unused prune serve reminder

help: ## Show this help
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

unpack: ## Unpack APK=<file.apk> into $(APK_DIR) (replaces its content)
	@test -n "$(APK)" || { echo "Usage: make unpack APK=path/to/game.apk"; exit 1; }
	rm -rf $(APK_DIR)
	unzip -q -o "$(APK)" -d $(APK_DIR)
	@echo "Unpacked $(APK) into $(APK_DIR)"

update: maps js images reminder ## Full update from $(APK_DIR): maps + js + images

reminder: ## Show the manual steps left after an update
	@printf '\n\033[1;33m!!! MANUAL STEPS LEFT !!!\033[0m\n'
	@printf '  1. Update subclassMap in $(DOCS_DIR)/index.js (read the subclass names on the phone)\n'
	@printf '  2. Bump the badger version  in $(DOCS_DIR)/index.html (id="app-version",  now \033[1m$(APP_VERSION)\033[0m)\n'
	@printf '  3. Bump the game version    in $(DOCS_DIR)/index.html (id="game-version", now \033[1m$(GAME_VERSION)\033[0m)\n'
	@printf '  4. Add a changelog entry in README.md\n\n'

maps: ## Copy the XML asset maps from the APK into $(MAPS_DIR)
	@test -d $(APK_DIR)/assets || { echo "$(APK_DIR)/assets not found: unpack the APK first"; exit 1; }
	@for f in $(MAPS); do cp -v $(APK_DIR)/assets/$$f $(MAPS_DIR)/$$f; done

js: ## Regenerate docs/hero_cards.js and docs/hero_skills.js from the maps
	$(EXTRACTOR) js

images: ## Copy the referenced images from the APK into docs/assets
	$(EXTRACTOR) images

check: ## Dry run of 'images': show new/updated/missing images without copying
	$(EXTRACTOR) -dry-run images

changes: ## Show cards and skills added/removed since the last commit
	@git --no-pager diff --stat -- $(MAPS_DIR) $(DOCS_DIR)/hero_cards.js $(DOCS_DIR)/hero_skills.js
	@echo "--- cards / skills (+ added, - removed) ---"
	@git --no-pager diff -U0 -- $(DOCS_DIR)/hero_cards.js $(DOCS_DIR)/hero_skills.js | grep -E '^[+-]\s' || echo "no changes"
	@echo "--- new images ---"
	@git status --porcelain -- $(DOCS_DIR)/assets | grep '^??' | wc -l

unused: ## List files in docs/assets not referenced by the page
	$(EXTRACTOR) -dry-run prune

prune: ## Delete files in docs/assets not referenced by the page
	$(EXTRACTOR) prune

serve: ## Serve the page locally on http://localhost:$(PORT)
	python3 -m http.server -d $(DOCS_DIR) $(PORT)
