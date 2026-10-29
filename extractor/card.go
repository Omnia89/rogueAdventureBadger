package main

import (
	"encoding/xml"
	"fmt"
	"log"
	"path/filepath"
	"strings"
)

const (
	heroCardFile = "hero_card_list.xml"
	heroCardJs   = "hero_cards.js"
)

type CardFile struct {
	XMLName xml.Name `xml:"cards"`
	Cards   []Card   `xml:"card"`
}

type Card struct {
	ID    int    `xml:"id"`
	Name  string `xml:"name"`
	Code  string `xml:"text"`
	Image string `xml:"image"`
}

func loadCards() []Card {
	cardFile := CardFile{}
	err := extractXML(filepath.Join(*mapsDir, heroCardFile), &cardFile)
	if err != nil {
		log.Fatal(err)
	}
	return cardFile.Cards
}

func extractCards() {
	// write JS file
	sb := strings.Builder{}
	sb.WriteString("const heroCards = {\n")
	for _, card := range loadCards() {
		sb.WriteString("\t")
		// replace "*"" with "i"
		card.Name = strings.ReplaceAll(card.Name, "*", "i")
		sb.WriteString(fmt.Sprintf("\"%s\": \"%s\",\n", strings.ToLower(card.Name), card.Image))
	}
	sb.WriteString("};\n")

	if err := writeJSFile(filepath.Join(*docsDir, heroCardJs), sb.String()); err != nil {
		log.Fatal(err)
	}
}
