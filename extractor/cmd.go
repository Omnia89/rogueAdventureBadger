package main

import (
	"flag"
	"fmt"
	"os"
)

var (
	apkDir  = flag.String("apk", "../apk", "folder with the unpacked APK")
	mapsDir = flag.String("maps", "../asset-maps", "folder with the XML asset maps")
	docsDir = flag.String("docs", "../docs", "folder of the web page")
	dryRun  = flag.Bool("dry-run", false, "only report what would change, without touching files")
)

func main() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "usage: go run . [flags] [js|images|prune|all]\n\n")
		flag.PrintDefaults()
	}
	flag.Parse()

	command := flag.Arg(0)
	if command == "" {
		command = "all"
	}

	switch command {
	case "js":
		extractSkills()
		extractCards()
	case "images":
		syncImages()
	case "prune":
		pruneImages()
	case "all":
		extractSkills()
		extractCards()
		syncImages()
	default:
		flag.Usage()
		os.Exit(2)
	}
	fmt.Println("Done")
}
