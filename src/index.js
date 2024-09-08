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

// TODO: remove
scoreInput.value = exampleScore;

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

    const key = groupes[1].trim();
    var value = groupes[2].trim();

    if (key !== "USER") {
        value = value.toLowerCase();
    }

    return {
        key,
        value
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

const checkImageExists = (url, callback) => {
    const img = new Image();
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
    img.src = url;
}

const getImageSrc = (element, imgName) => {
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

const titleCase = (str) => {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getGroupedArray = (array) => {
    let index = 0;
    const arrayCounter = array.reduce((acc, element) => {
        if (!acc[element]) {
            acc[element] = {
                index,
                count: 1
            };
        } else {
            acc[element].count++;
        }
        index++;
        return acc;
    }, {});
    return res = Object.entries(arrayCounter).map(([element, { index, count }]) => {
        return {
            name: element,
            index,
            count
        };
    }).sort((a, b) => a.index - b.index);
};

const formatResult = (result) => {

    // get class 
    const heroClass = result["CLASS"];
    const heroClassImg = document.createElement('img');
    getImageSrc(heroClassImg, `choose_${heroClass}`);
    heroClassImg.classList.add('shield');
    outputField.insertAdjacentElement('beforeend', heroClassImg);

    // class bonuses container
    const classBonuses = document.createElement('div');
    classBonuses.classList.add('bonus');
    outputField.insertAdjacentElement('beforeend', classBonuses);

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
        classBonuses.insertAdjacentElement('beforeend', classBonusImg);
    }
    
    // skills container
    const skillsContainer = document.createElement('div');
    skillsContainer.classList.add('skills');
    outputField.insertAdjacentElement('beforeend', skillsContainer);

    // skills
    const skills = result["SKILLS"];
    const skillsArray = skills.split('-').map(skill => skill.trim());
    getGroupedArray(skillsArray).forEach(skill => {
        const skillContainer = document.createElement('div');
        skillContainer.classList.add('skill');
        skillsContainer.insertAdjacentElement('beforeend', skillContainer);

        const skillImg = document.createElement('img');
        skillContainer.insertAdjacentElement('beforeend', skillImg);
        const imgName = heroSkills[skill.name];
        getImageSrc(skillImg, imgName);

        if (skill.count > 1) {
            const skillText = document.createElement('span');
            skillText.classList.add('counter');
            skillText.textContent = `x ${skill.count}`;
            skillContainer.insertAdjacentElement('beforeend', skillText);
        }

    });

    // cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.classList.add('cards');
    outputField.insertAdjacentElement('beforeend', cardsContainer);

    // deck
    const deck = result["DECK"];
    const deckArray = deck.split('-').map(card => card.trim());
    getGroupedArray(deckArray).forEach(card => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('card');
        cardsContainer.insertAdjacentElement('beforeend', imgContainer);

        const cardImg = document.createElement('img');
        imgContainer.insertAdjacentElement('beforeend', cardImg);
        const imgName = heroCards[card.name];
        getImageSrc(cardImg, imgName);

        if (card.count > 1) {
            const cardText = document.createElement('span');
            cardText.classList.add('counter');
            cardText.textContent = `x ${card.count}`;
            imgContainer.insertAdjacentElement('beforeend', cardText);
        }
    });
    
    // score container
    const scoreContainer = document.createElement('div');
    scoreContainer.classList.add('score');
    outputField.insertAdjacentElement('beforeend', scoreContainer);

    // user - date and time
    const user = result["USER"];
    const time = result["TIME"];
    const dateTime = result["DATE TIME"];
    const dateTimeUserText = document.createElement('span');
    dateTimeUserText.textContent = ` at ${dateTime} in ${time}`;
    const userText = document.createElement('span');
    userText.textContent = user;
    userText.classList.add('user');
    dateTimeUserText.insertAdjacentElement('afterbegin', userText);
    scoreContainer.insertAdjacentElement('beforeend', dateTimeUserText);

    // mode and score
    const mode = result["GAME MODE"];
    const difficulty = result["DIFFICULTY"];
    const score = result["TOTAL SCORE"];
    const modeText = document.createElement('div');
    modeText.textContent = `${titleCase(mode)} - ${titleCase(difficulty)} - Score: ${score}`;
    scoreContainer.insertAdjacentElement('beforeend', modeText);

    // enemies
    const enemiesContainer = document.createElement('div');
    enemiesContainer.classList.add('horizontal-stats');
    scoreContainer.insertAdjacentElement('beforeend', enemiesContainer);

    // normal
    const normalEnemies = document.createElement('div');
    normalEnemies.classList.add('single-stat');
    const normalEnemiesImg = document.createElement('img');
    getImageSrc(normalEnemiesImg, 'map_normal');
    normalEnemies.textContent = result["NORMAL ENEMIES KILLED"];
    normalEnemies.insertAdjacentElement('afterbegin', normalEnemiesImg);
    enemiesContainer.insertAdjacentElement('beforeend', normalEnemies);
    
    // elite
    const eliteEnemies = document.createElement('div');
    eliteEnemies.classList.add('single-stat');
    const eliteEnemiesImg = document.createElement('img');
    getImageSrc(eliteEnemiesImg, 'map_elite');
    eliteEnemies.textContent = result["ELITE KILLED"];
    eliteEnemies.insertAdjacentElement('afterbegin', eliteEnemiesImg);
    enemiesContainer.insertAdjacentElement('beforeend', eliteEnemies);

    // boss
    const bossEnemies = document.createElement('div');
    bossEnemies.classList.add('single-stat');
    const bossEnemiesImg = document.createElement('img');
    getImageSrc(bossEnemiesImg, 'map_boss');
    bossEnemies.textContent = result["BOSS KILLED"];
    bossEnemies.insertAdjacentElement('afterbegin', bossEnemiesImg);
    enemiesContainer.insertAdjacentElement('beforeend', bossEnemies);

    // floors - chest opened - gold - gems
    const gainContainer = document.createElement('div');
    gainContainer.classList.add('horizontal-stats');
    scoreContainer.insertAdjacentElement('beforeend', gainContainer);

    // floors
    const floors = document.createElement('div');
    floors.classList.add('single-stat');
    const floorsImg = document.createElement('img');
    getImageSrc(floorsImg, 'map_tower_end');
    floors.textContent = result["FLOORS CLIMBED"];
    floors.insertAdjacentElement('afterbegin', floorsImg);
    gainContainer.insertAdjacentElement('beforeend', floors);

    // chest opened
    const chest = document.createElement('div');
    chest.classList.add('single-stat');
    const chestImg = document.createElement('img');
    getImageSrc(chestImg, 'map_treasure');
    chest.textContent = result["CHEST OPENED"];
    chest.insertAdjacentElement('afterbegin', chestImg);
    gainContainer.insertAdjacentElement('beforeend', chest);

    // gold
    const gold = document.createElement('div');
    gold.classList.add('single-stat');
    const goldImg = document.createElement('img');
    getImageSrc(goldImg, 'coin_icon');
    gold.textContent = result["GOLD EARNED"];
    gold.insertAdjacentElement('afterbegin', goldImg);
    gainContainer.insertAdjacentElement('beforeend', gold);

    // gems
    const gems = document.createElement('div');
    gems.classList.add('single-stat');
    const gemsImg = document.createElement('img');
    getImageSrc(gemsImg, 'gem_icon');
    gems.textContent = result["GEMS EARNED"];
    gems.insertAdjacentElement('afterbegin', gemsImg);
    gainContainer.insertAdjacentElement('beforeend', gems);

    // cards played - highest damage - damage taken
    const doneContainer = document.createElement('div');
    doneContainer.classList.add('horizontal-stats');
    scoreContainer.insertAdjacentElement('beforeend', doneContainer);

    // cards played
    const cardsPlayed = document.createElement('div');
    cardsPlayed.classList.add('single-stat');
    const cardsPlayedImg = document.createElement('img');
    getImageSrc(cardsPlayedImg, 'tab_card_icon_small');
    cardsPlayed.textContent = result["CARDS PLAYED"];
    cardsPlayed.insertAdjacentElement('afterbegin', cardsPlayedImg);
    doneContainer.insertAdjacentElement('beforeend', cardsPlayed);
    
    // highest damage
    const highestDamage = document.createElement('div');
    highestDamage.classList.add('single-stat');
    const highestDamageImg = document.createElement('img');
    getImageSrc(highestDamageImg, 'old_skill_paladin');
    highestDamage.textContent = result["HIGHEST DAMAGE"];
    highestDamage.insertAdjacentElement('afterbegin', highestDamageImg);
    doneContainer.insertAdjacentElement('beforeend', highestDamage);

    // damage taken
    const damageTaken = document.createElement('div');
    damageTaken.classList.add('single-stat');
    const damageTakenImg = document.createElement('img');
    getImageSrc(damageTakenImg, 'slash');
    damageTaken.textContent = result["DAMAGE TAKEN"];
    damageTaken.insertAdjacentElement('afterbegin', damageTakenImg);
    doneContainer.insertAdjacentElement('beforeend', damageTaken);

    // game version, small upper right of scoreContainer
    const gameVersion = result["GAME VERSION"];
    const gameVersionText = document.createElement('span');
    gameVersionText.textContent = `v${gameVersion}`;
    gameVersionText.classList.add('game-version');
    scoreContainer.insertAdjacentElement('beforeend', gameVersionText);

    // NTH: recuperare gli sfondi presenti

    //< GAME VERSION > in alto a dx in piccolo
    //< VERIFICATION CODE > non credo di mostrarlo

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