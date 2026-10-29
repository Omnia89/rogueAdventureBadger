package main

import (
	"bytes"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

const assetsFolder = "assets"

// extensions the web page looks for, in the same priority order used by getImageSrc in index.js
var webExtensions = []string{".webp", ".png", ".jpg"}

// APK drawable folders, best first. Folders not listed here are scanned last.
var drawablePriority = []string{"drawable-nodpi-v4", "drawable-mdpi-v4", "drawable-hdpi-v4", "drawable"}

// image names referenced directly by the web page (e.g. getImageSrc(img, 'coin_icon'), assets/x.webp, value="x.webp")
var pageImageRegexps = []*regexp.Regexp{
	regexp.MustCompile(`getImageSrc\(\w+,\s*['"]([\w-]+)['"]\)`),
	regexp.MustCompile(`assets/([\w-]+)\.(?:webp|png|jpe?g)`),
	regexp.MustCompile(`value="([\w-]+)\.(?:webp|png|jpe?g)"`),
}

type apkImage struct {
	path    string
	ext     string // normalized web extension
	dirRank int
	extRank int
}

// webExtension maps an APK file extension to the one used in docs/assets ("" if not a usable image).
func webExtension(ext string) string {
	switch strings.ToLower(ext) {
	case ".webp":
		return ".webp"
	case ".png":
		return ".png"
	case ".jpg", ".jpeg":
		return ".jpg"
	}
	return ""
}

func rankOf(list []string, value string) int {
	for i, v := range list {
		if v == value {
			return i
		}
	}
	return len(list)
}

// indexApkImages returns the best APK image for every lowercased name found in res/drawable*.
func indexApkImages() map[string]apkImage {
	dirs, err := filepath.Glob(filepath.Join(*apkDir, "res", "drawable*"))
	if err != nil || len(dirs) == 0 {
		log.Fatalf("No drawable folders found in %s/res: did you unpack the APK?", *apkDir)
	}

	images := make(map[string]apkImage)
	for _, dir := range dirs {
		dirRank := rankOf(drawablePriority, filepath.Base(dir))
		entries, err := os.ReadDir(dir)
		if err != nil {
			log.Fatal(err)
		}
		for _, entry := range entries {
			ext := filepath.Ext(entry.Name())
			webExt := webExtension(ext)
			if entry.IsDir() || webExt == "" {
				continue
			}
			name := strings.ToLower(strings.TrimSuffix(entry.Name(), ext))
			candidate := apkImage{
				path:    filepath.Join(dir, entry.Name()),
				ext:     webExt,
				dirRank: dirRank,
				extRank: rankOf(webExtensions, webExt),
			}
			current, found := images[name]
			if !found || candidate.dirRank < current.dirRank ||
				(candidate.dirRank == current.dirRank && candidate.extRank < current.extRank) {
				images[name] = candidate
			}
		}
	}
	return images
}

// referencedImages returns every image name the web page can ask for.
func referencedImages(apkImages map[string]apkImage) map[string]bool {
	names := make(map[string]bool)
	add := func(name string) {
		if name = strings.TrimSpace(name); name != "" {
			names[name] = true
		}
	}

	for _, card := range loadCards() {
		add(card.Image)
	}

	classes := make(map[string]bool)
	for _, skill := range loadSkills() {
		add(skill.Image)
		if skill.Class != "" {
			classes[strings.ToLower(skill.Class)] = true
		}
	}

	// class images built in index.js: choose_<class>, skill_<class>_upgrade, badge_skill_<class>_<n>
	for class := range classes {
		// skip pseudo-classes like "neutral" or "evoked": only playable classes have a choose_<class> image
		if _, playable := apkImages["choose_"+class]; !playable {
			continue
		}
		add("choose_" + class)
		add("skill_" + class + "_upgrade")
		for name := range apkImages {
			if strings.HasPrefix(name, "badge_skill_"+class+"_") {
				add(name)
			}
		}
	}

	for _, page := range []string{"index.html", "index.js", "style.css"} {
		content, err := os.ReadFile(filepath.Join(*docsDir, page))
		if err != nil {
			log.Fatal(err)
		}
		for _, re := range pageImageRegexps {
			for _, match := range re.FindAllStringSubmatch(string(content), -1) {
				add(match[1])
			}
		}
	}
	return names
}

func sortedKeys(m map[string]bool) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func printList(title string, list []string) {
	if len(list) == 0 {
		return
	}
	fmt.Printf("%s (%d):\n", title, len(list))
	for _, item := range list {
		fmt.Printf("  %s\n", item)
	}
}

// syncImages copies every referenced image from the APK into docs/assets,
// removing other formats of the same image so the page doesn't load a stale one.
func syncImages() {
	apkImages := indexApkImages()
	targetFolder := filepath.Join(*docsDir, assetsFolder)

	var added, updated, removed, missing []string
	unchanged := 0

	for _, name := range sortedKeys(referencedImages(apkImages)) {
		source, found := apkImages[strings.ToLower(name)]
		if !found {
			missing = append(missing, name)
			continue
		}

		target := filepath.Join(targetFolder, name+source.ext)
		newContent, err := os.ReadFile(source.path)
		if err != nil {
			log.Fatal(err)
		}
		oldContent, err := os.ReadFile(target)
		switch {
		case err != nil:
			added = append(added, name+source.ext)
		case !bytes.Equal(oldContent, newContent):
			updated = append(updated, name+source.ext)
		default:
			unchanged++
		}
		if !*dryRun && (err != nil || !bytes.Equal(oldContent, newContent)) {
			if err := os.WriteFile(target, newContent, 0644); err != nil {
				log.Fatal(err)
			}
		}

		for _, ext := range webExtensions {
			stale := filepath.Join(targetFolder, name+ext)
			if ext == source.ext {
				continue
			}
			if _, err := os.Stat(stale); err == nil {
				removed = append(removed, name+ext)
				if !*dryRun {
					os.Remove(stale)
				}
			}
		}
	}

	if *dryRun {
		fmt.Println("[dry run] no file changed")
	}
	printList("New images", added)
	printList("Updated images", updated)
	printList("Removed stale formats", removed)
	printList("Referenced but MISSING in the APK", missing)
	fmt.Printf("Images: %d new, %d updated, %d unchanged, %d stale removed, %d missing\n",
		len(added), len(updated), unchanged, len(removed), len(missing))
}

// pruneImages removes from docs/assets every file the web page never references.
func pruneImages() {
	referenced := referencedImages(indexApkImages())
	targetFolder := filepath.Join(*docsDir, assetsFolder)

	entries, err := os.ReadDir(targetFolder)
	if err != nil {
		log.Fatal(err)
	}

	var unused []string
	for _, entry := range entries {
		name := strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name()))
		if entry.IsDir() || referenced[name] {
			continue
		}
		unused = append(unused, entry.Name())
		if !*dryRun {
			if err := os.Remove(filepath.Join(targetFolder, entry.Name())); err != nil {
				log.Fatal(err)
			}
		}
	}

	if *dryRun {
		printList("Unused files (dry run, not removed)", unused)
	} else {
		printList("Removed unused files", unused)
	}
}
