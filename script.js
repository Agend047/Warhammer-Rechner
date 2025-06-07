/**
 * @param {String} ident Just a Number to be able to differ between multiple Weapon Profiles. 
 * Every field has the same name, except for that Ident Number at the end.
 */

function checkFields(ident) {
    if (
        document.getElementById('inAttack' + ident).value == '' ||
        document.getElementById('inHitRoll' + ident).value == '' ||
        document.getElementById('inStrength' + ident).value == '' ||
        document.getElementById('inTough' + ident).value == '' ||
        document.getElementById('inAP' + ident).value == '' ||
        document.getElementById('inSV' + ident).value == '' ||
        document.getElementById('inWoundChar' + ident).value == ''
    ) {
        alert('Bitte fülle alle Felder aus!')
    } else {
        if (
            document.getElementById('inAttack' + ident).value < 0 ||
            document.getElementById('inHitRoll' + ident).value < 0 ||
            document.getElementById('inStrength' + ident).value < 0 ||
            document.getElementById('inTough' + ident).value < 0 ||
            document.getElementById('inSV' + ident).value < 0 ||
            document.getElementById('inWoundChar' + ident).value < 0
        ) {
            alert('Mit positiven Werten kommen realistischere Ergebnisse.')
        }
        if (document.getElementById('inAttack' + ident).value < 0) { document.getElementById('inAttack' + ident).value = 1 };
        calculate(ident);
    }
}

/**
 * Main Calculate function
 * @param {Number} ident We have multiple plattforms for the calculations. 
 * To always use the correct numbers for the questioned Calculation, we use a Number identificator.
 */
function calculate(ident) {
    let lethalHits = document.getElementById('lethalHitsCheck' + ident).checked;
    let devastatingWounds = document.getElementById('devastatingWoundsCheck' + ident).checked;
    // let sustainedHitsX = document.getElementById('sustainedHitsNumber' + ident);

    let hits = Number(getHittingAttacks(ident));
    let additionalWounds = 0;


    if (lethalHits) {
        additionalWounds = hits * (1 / 6);
        hits = hits * (5 / 6);
    }

    let woundingAttacks = Number(getWounding(hits, ident) + additionalWounds);
    let mortalWounds = 0;

    if (devastatingWounds) {
        mortalWounds = (woundingAttacks * (1 / 6)).toFixed(2);
        woundingAttacks = woundingAttacks * (5 / 6);
    }

    let woundsAttacks = calculateDamage(woundingAttacks, ident, mortalWounds);


    finalWords(woundsAttacks, ident, mortalWounds);
}

/**
 * Errechnet die statistische Anzahl der Erfolge.
 * @param {Number} succRoll Dieser Wert muss erreicht werden, damit der Wurf als Erfolgreich gilt
 * @returns {Number} Errechnete Wahrscheinlichkeit eines Erfolgs
 */
function calculateSuccesses(succRoll) {
    let result = (7 - succRoll) / 6;
    return result
}

/**
 * Errechnet die Wahrscheinlichkeit eines Fehlschlages
 * @param {Number} succRoll Höhe des Erfolgswurfs
* @returns {Number} Errechnete Wahrscheinlichkeit eines Fehlschlages
 */
function calculateFailure(succRoll) {
    return (succRoll - 1) / 6
}

/**
 * Errechnet die Wahrscheinlichkeit eines Erfolges, wenn bei Misserfolg erneut gewürfelt werden darf!
 * @param {Number} succRoll  Höhe des Erfolgswurfes
 * @returns {Number} Wahrscheinlichkeit des Erfolges (Mit reroll!)
 */
function calculateSuccessWithRerolls(succRoll) {
    let successesChance = calculateSuccesses(succRoll);
    let failChance = calculateFailure(succRoll);
    return successesChance + failChance * successesChance;
}

/**
 * Errechnet die Wahrscheinliche Anzahl der Treffer, indem die Angriffe mit der Wahrscheinlichkeit des Erfolgs multipliziert werden
 * @param {String} ident Wichtig um das richtige Feld abzufragen
 * @returns {Number} Anzahl der Treffer
 */
function getHittingAttacks(ident) {
    let attacks = Number(document.getElementById('inAttack' + ident).value);
    let hitRoll = Number(document.getElementById('inHitRoll' + ident).value);
    let hitRollReroll = document.getElementById('hitRollReroll' + ident);
    let hitRollFracture;

    if (!hitRollReroll.checked) {
        hitRollFracture = Number(calculateSuccesses(hitRoll));
    } else if (hitRollReroll.checked) {
        hitRollFracture = Number(calculateSuccessWithRerolls(hitRoll));
    }

    return attacks * hitRollFracture
}

function getWounding(hits, ident) {
    let strength = Number(document.getElementById('inStrength' + ident).value);
    let toughness = Number(document.getElementById('inTough' + ident).value);
    let wundRollReroll = document.getElementById('woundReroll' + ident);

    let woundRoll = Number(getWoundRoll(strength, toughness));
    let woundFactor;

    if (!wundRollReroll.checked) {
        woundFactor = Number(calculateSuccesses(woundRoll));
    } else if (wundRollReroll.checked) {
        woundFactor = Number(calculateSuccessWithRerolls(woundRoll));
    }

    console.log(woundFactor);

    return hits * woundFactor;
}

function getWoundRoll(strength, toughness) {
    if (strength == toughness) {
        return 4;
    } else if (strength > toughness) {
        if (strength >= (toughness * 2)) {
            return 2;
        } else {
            return 3;
        }
    } else if (strength < toughness) {
        if ((strength * 2) <= toughness) {
            return 6;
        } else {
            return 5;
        };
    };
};

/**
 * 
 * @param {Number} woundingAttacks 
 * @param {String} ident Identifier Number, can be empty
 * @param {Number} mortalWounds amount of Mortal Wounds
 * @returns {Array}
 */
function calculateDamage(woundingAttacks, ident) {
    let armourPenetration = getAP(ident)
    let saveUnit = Number(document.getElementById('inSV' + ident).value)
    let woundCharachteristic = Number(document.getElementById('inWoundChar' + ident).value)

    let realSV = saveUnit + armourPenetration
    if (realSV > 6) {
        return [((woundingAttacks) * woundCharachteristic).toFixed(2), woundingAttacks.toFixed(2)]
    } else {

        let damageDealingAttacks = Number((woundingAttacks * (1 - calculateSuccesses(realSV))).toFixed(2));
        let damageDealt = ((damageDealingAttacks) * woundCharachteristic).toFixed(2)

        return [damageDealt, damageDealingAttacks]
    }
}

function getAP(ident) {
    let armourPenetration = Number(document.getElementById('inAP' + ident).value)
    if (armourPenetration < 0) {
        armourPenetration = armourPenetration * (-1)
    }
    return armourPenetration
}

function finalWords(woundsAttacks, ident, mortalWounds) {

    if (typeof (woundsAttacks) == "string") { woundsAttacks = woundsAttacks.split(",") };

    let woundText = Number(Number(woundsAttacks[0]) + Number(mortalWounds)).toFixed(2) + ' Wunden,  ';
    let attacksText = 'in ' + woundsAttacks[1] + ' Angriffen.';
    let mortalWoundsText = "";
    if (woundsAttacks[0] == 1) {
        woundText = '1 Wunde am Ziel,  '
    }
    if (woundsAttacks[1] == 1) {
        attacksText = 'mit einem Angriff.'
    }
    if (mortalWounds) {
        mortalWoundsText = ' Davon sind ' + mortalWounds + " tödliche Wunden."
    }

    document.getElementById('resultTag' + ident).innerHTML = 'Der Angriff verursacht statistisch ' + woundText + attacksText + mortalWoundsText;
}

function reset(ident) {
    document.getElementById('inAttack' + ident).value = '';
    document.getElementById('inHitRoll' + ident).value = '';
    document.getElementById('inStrength' + ident).value = '';
    document.getElementById('inTough' + ident).value = '';
    document.getElementById('inAP' + ident).value = '';
    document.getElementById('inSV' + ident).value = '';
    document.getElementById('inWoundChar' + ident).value = '';
}