# rogueAdventureBadger
A tool to generate a cool badge for Rogue Adventure game


## Updating to a new game version

```sh
make unpack APK=path/to/game.apk   # or unzip the APK yourself into ./apk
make check                         # optional: preview new/updated/missing images
make update                        # copy XML maps, regenerate JS, copy referenced images
make changes                       # review added/removed cards and skills
make serve                         # test on http://localhost:8000
```

Then, by hand:
- update `subclassMap` in `docs/index.js` with the subclass names read in the game
- bump the badger version (`app-version`) and the compatible game version (`game-version`) in `docs/index.html`,
  and add a changelog entry below

Only the images referenced by the page (cards, skills, class images, page icons and backgrounds)
are copied into `docs/assets`. `make unused` lists the files no longer referenced, `make prune` deletes them.

## Changelogs

### v1.2.0

- Updated to game version 4.1.5 (miner and samurai update)
- Added instructions and a legend of the badge to the page
- Only the images referenced by the page are copied from the APK (see `make help`)

### v1.1.0

- Changed most images to webp
- Updated to game version 3.7 (monk update)