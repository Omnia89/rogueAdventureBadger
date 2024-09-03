package main

import (
	"encoding/xml"
	"io"
	"os"
)

func extractXML(filePath string, v interface{}) error {
	// open file
	xmlFile, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer xmlFile.Close()

	xmlContent, err := io.ReadAll(xmlFile)

	err = xml.Unmarshal(xmlContent, v)
	return err
}

func writeJSFile(filePath string, content string) error {
	// open file
	err := os.WriteFile(filePath, []byte(content), 0666)
	if err != nil {
		return err
	}
	return nil
}
