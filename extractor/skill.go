package main

import (
	"encoding/xml"
	"fmt"
	"log"
	"strings"
)

const (
	heroSkillFile = "../asset-maps/hero_skill_list.xml"
	heroSkillJs   = "./hero_skills.js"
)

type SkillFile struct {
	XMLName xml.Name `xml:"skills"`
	Skills  []Skill  `xml:"skill"`
}

type Skill struct {
	ID    int    `xml:"id"`
	Name  string `xml:"name"`
	Code  string `xml:"text"`
	Image string `xml:"image"`
}

func extractSkills() {
	skillFile := SkillFile{}
	err := extractXML(heroSkillFile, &skillFile)
	if err != nil {
		log.Fatal(err)
	}

	// write JS file
	sb := strings.Builder{}
	sb.WriteString("export const heroSkills = {\n")
	for _, skill := range skillFile.Skills {
		sb.WriteString("\t")
		sb.WriteString(fmt.Sprintf("\"%s\": \"%s\",\n", skill.Name, skill.Image))
	}
	sb.WriteString("};\n")

	writeJSFile(heroSkillJs, sb.String())
}
