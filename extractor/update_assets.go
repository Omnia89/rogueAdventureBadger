package main

import (
	"fmt"
	"io/ioutil"
	"os/exec"
	"path/filepath"
	"strings"
)

const targetFolder = "../docs/assets"

type Asset struct {
	Name     string
	WebpPath string
	PngPath  string
	JpgPath  string
}

func escapeSpaces(str string) string {
	return strings.ReplaceAll(str, " ", "\\ ")
}

func updateAssets() {

	// check for "duplicates" by name.
	// Priority:
	//  - webp
	//  - png
	//  - jpg
	filenamesMap := make(map[string]Asset)

	// get all files in targetFolder
	files, err := ioutil.ReadDir(targetFolder)
	if err != nil {
		fmt.Printf("Error while removing duplicate assets: %v\n", err)
		return
	}

	for _, file := range files {
		completeFilename := file.Name()
		ext := filepath.Ext(completeFilename)
		filename := completeFilename[:len(completeFilename)-len(ext)] // remove extension
		asset := filenamesMap[filename]

		switch ext {
		case ".webp":
			asset.WebpPath = completeFilename
		case ".png":
			asset.PngPath = completeFilename
		case ".jpg":
			asset.JpgPath = completeFilename
		default:
			fmt.Printf("Unknown file type: %s\n", completeFilename)
			continue
		}

		filenamesMap[filename] = asset
	}

	removeFunc := func(name string) {
		cmd := exec.Command("rm", fmt.Sprintf("%s/%s", targetFolder, name))
		cmd.Dir = "."
		cmd.Run()
	}

	// remove all files duplicates file
	for _, asset := range filenamesMap {
		if asset.WebpPath != "" {
			if asset.PngPath != "" {
				removeFunc(asset.PngPath)
			}
			if asset.JpgPath != "" {
				removeFunc(asset.JpgPath)
			}
		} else if asset.PngPath != "" {
			if asset.JpgPath != "" {
				removeFunc(asset.JpgPath)
			}
		}
	}
}
