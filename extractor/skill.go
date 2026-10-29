package main

import (
	"encoding/xml"
	"fmt"
	"log"
	"path/filepath"
	"strings"
)

const (
	heroSkillFile = "hero_skill_list.xml"
	heroSkillJs   = "hero_skills.js"
)

type SkillFile struct {
	XMLName xml.Name `xml:"skills"`
	Skills  []Skill  `xml:"skill"`
}

type Skill struct {
	ID    int    `xml:"id"`
	Class string `xml:"classe"`
	Name  string `xml:"name"`
	Code  string `xml:"text"`
	Image string `xml:"image"`
}

func loadSkills() []Skill {
	skillFile := SkillFile{}
	err := extractXML(filepath.Join(*mapsDir, heroSkillFile), &skillFile)
	if err != nil {
		log.Fatal(err)
	}
	return skillFile.Skills
}

func extractSkills() {
	// write JS file
	sb := strings.Builder{}
	sb.WriteString("const heroSkills = {\n")
	for _, skill := range loadSkills() {
		sb.WriteString("\t")
		sb.WriteString(fmt.Sprintf("\"%s\": \"%s\",\n", strings.ToLower(skill.Name), skill.Image))
	}
	sb.WriteString("};\n")

	if err := writeJSFile(filepath.Join(*docsDir, heroSkillJs), sb.String()); err != nil {
		log.Fatal(err)
	}
}
