const parseButton = document.getElementById('parse');
const scoreInput = document.getElementById('score');
const outputField = document.getElementById('result');

parseButton.addEventListener('click', () => {
    const rawScore = scoreInput.value;
    const result = parseScore(rawScore);
    console.log(result);
    // outputField.innerHTML = JSON.stringify(result, null, 2);
    formatResult(result);
});

const parseScore = (score) => {
    if (score.startsWith('```md\n')) {
        score = score.replace('```md\n', '');
    }

    if (score.endsWith('```')) {
        score = score.replace('```', '');
    }

    const rows = score.split('\n');
    const resultObj = {};
    rows.forEach(row => {
        if (!row.startsWith('<')) {
            return;
        }
        const parsedRow = parseRow(row);
        resultObj[parsedRow.key] = parsedRow.value;
    });
    return resultObj;
};

const parseRow = (row) => {
    const groupes = /^<(.*)>\s*(.*)$/.exec(row);

    if (!groupes) {
        return {
            key: "",
            value: ""
        };
    }

    return {
        key: groupes[1].trim(),
        value: groupes[2].trim().toLowerCase()
    };
};

const subclassMap = {
    "assassin": ["scout", "shadow trick", "poison mark", "stunning grenades"],
    "barbarian": ["berserker shout", "barbaric strength", "blood frenzy", "half orc leader"],
    "cultist": ["boiling blood", "fire corruption", "blood shield", "angels and demons"],
    "druid": ["enraged beast", "poisonous thorns", "permanence", "mighty morph"],
    "engineer": ["workforce", "perfect alloy", "nuke activation", "optimized work"],
    "necromancer": ["pain absorpion", "hellfire", "second wind", "piranha infestation"],
    "paladin": ["healthy", "holy armor", "healing doom", "sword of damocles"],
    "pirate": ["absolute greed", "prepared", "no mercy", "cursed ship"],
    "ranger": ["sharp arrows", "poisonous arrows", "powered shot", "debilitating arrows"],
    "runemaster": ["enchanted runes", "rune mastery", "upgraded runes", "double knowledge"],
    "shaman": ["fire starter", "fiery impact", "sinful flame", "green fire"],
    "warden": ["sentient roots", "forest protector", "healing roots", "eternal entanglement"],
    "warrior": ["defensive stance", "trained troops", "shield charge", "dueling expert"],
    "wizard": ["electric mana", "supercharged", "tri-sphere", "toxic energization"]
};

const getHeroSubclassImageName = (heroClass, subclass) => {
    const subArray = subclassMap[heroClass] || [];
    const subIndex = subArray.indexOf(subclass);
    
    if (subIndex === -1) {
        return "";
    }
    return `badge_skill_${heroClass}_${subIndex + 1}`;
}

function checkImageExists(url, callback) {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = url;
}

function getImageSrc(element, imgName) {
    const pngPath = `assets/${imgName}.png`;
    const jpgPath = `assets/${imgName}.jpg`;

    checkImageExists(pngPath, (exists) => {
        if (exists) {
            element.src = pngPath;
        } else {
            checkImageExists(jpgPath, (exists) => {
                if (exists) {
                    element.src = jpgPath;
                } else {
                    console.error(`Image not found: ${imgName}`);
                }
            });
        }
    });
}

const formatResult = (result) => {

    // get class 
    const heroClass = result["CLASS"];
    const heroClassImg = document.createElement('img');
    getImageSrc(heroClassImg, `choose_${heroClass}`);
    heroClassImg.classList.add('shield');
    outputField.insertAdjacentElement('beforeend', heroClassImg);

    // put hr
    // outputField.insertAdjacentHTML('beforeend', '<hr>');

    // class bonuses container
    const classBonuses = document.createElement('div');
    classBonuses.classList.add('bonus');

    // get class base skill
    const classIcon = heroSkills[heroClass];
    if (classIcon) {
        const classImg = document.createElement('img');
        getImageSrc(classImg, classIcon);
        classBonuses.insertAdjacentElement('beforeend', classImg);
    }

    // get class upgrade skill
    const classUpgrade = result["CLASS UPGRADE"];
    if (classUpgrade == "yes") {
        const classUpgradeImg = document.createElement('img');
        getImageSrc(classUpgradeImg, `skill_${heroClass}_upgrade`);
        classBonuses.insertAdjacentElement('beforeend', classUpgradeImg);
    }

    // get class bonus skill
    const classBonus = result["CLASS BONUS"];
    if (classBonus) {
        const classBonusImg = document.createElement('img');
        getImageSrc(classBonusImg, getHeroSubclassImageName(heroClass, classBonus));
        console.info(classBonusImg);
        classBonuses.insertAdjacentElement('beforeend', classBonusImg);
    }

    outputField.insertAdjacentElement('beforeend', classBonuses);

    // put hr
    // outputField.insertAdjacentHTML('beforeend', '<hr>');
    
    // skills container
    const skillsContainer = document.createElement('div');
    skillsContainer.classList.add('skills');

    // skills
    const skills = result["SKILLS"];
    const skillsArray = skills.split('-').map(skill => skill.trim());
    skillsArray.forEach(skill => {
        const imgName = heroSkills[skill];
        const skillImg = document.createElement('img');
        getImageSrc(skillImg, imgName);
        skillsContainer.insertAdjacentElement('beforeend', skillImg);
    });
    outputField.insertAdjacentElement('beforeend', skillsContainer);

    // put hr
    // outputField.insertAdjacentHTML('beforeend', '<hr>');

    // cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.classList.add('cards');

    // deck
    const deck = result["DECK"];
    const deckArray = deck.split('-').map(card => card.trim());
    deckArray.forEach(card => {
        const imgName = heroCards[card];
        const cardImg = document.createElement('img');
        getImageSrc(cardImg, imgName);
        cardsContainer.insertAdjacentElement('beforeend', cardImg);
    });
    outputField.insertAdjacentElement('beforeend', cardsContainer);

    // NTH: recuperare gli sfondi presenti

    // TODO: game mode (testo)
    // TODO: difficulty (testo)
    // TODO: score (da scrivere)

    // Potenziali sfondi
    // text_desert_background.jpg
    // text_dragonland_background.jpg
    // text_forest_background.jpg
    // text_lostworld_background.jpg
    // text_mountain_background.jpg
    // text_reignofdead_background.jpg
    // text_steam_background.jpg
    // text_swamp_background.jpg
    // text_void_background.jpg
    // text_volcano_background.jpg
    // text_water2_background.jpg
    // text_water_background.jpg
    // tournament_back_off.jpg 
    // tournament_back_on.jpg 
    // tournament_close.png 
    // tournament_image.png 
    // tournament_open.png
    
};