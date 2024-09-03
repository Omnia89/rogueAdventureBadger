package main

import (
	"encoding/xml"
	"fmt"
	"log"
	"strings"
)

const (
	heroCardFile = "../asset-maps/hero_card_list.xml"
	heroCardJs   = "./hero_cards.js"
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

func extractCards() {
	cardFile := CardFile{}
	err := extractXML(heroCardFile, &cardFile)
	if err != nil {
		log.Fatal(err)
	}

	// write JS file
	sb := strings.Builder{}
	sb.WriteString("export const heroCards = {\n")
	for _, card := range cardFile.Cards {
		sb.WriteString("\t")
		sb.WriteString(fmt.Sprintf("\"%s\": \"%s\",\n", card.Name, card.Image))
	}
	sb.WriteString("};\n")

	writeJSFile(heroCardJs, sb.String())
}
