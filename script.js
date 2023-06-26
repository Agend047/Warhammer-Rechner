

function checkFields() {
    if (
        document.getElementById('inAttack').value == '' ||
        document.getElementById('inHitRoll').value == '' ||
        document.getElementById('inStrength').value == '' ||
        document.getElementById('inTough').value == '' ||
        document.getElementById('inAP').value == '' ||
        document.getElementById('inSV').value == '' ||
        document.getElementById('inWoundChar').value == ''
    ) {
        alert('Bitte fülle alle Felder aus!')
    } else {
        if (
            document.getElementById('inAttack').value < 0 ||
            document.getElementById('inHitRoll').value < 0 ||
            document.getElementById('inStrength').value < 0 ||
            document.getElementById('inTough').value < 0 ||
            document.getElementById('inSV').value < 0 ||
            document.getElementById('inWoundChar').value < 0
        ) {
            alert('Mit positiven Werten kommen realistischere Ergebnisse.')
        }
        calculate()
    }
}

function calculate() {
    let bornSoldiers = document.getElementById('bornSoldiersCheck')
    let hits = Number(getHittingAttacks());
    let additionalWounds = 0;

    if (bornSoldiers.checked) {
        additionalWounds = hits * (1 / 6);
        hits = hits * (5 / 6);
    }

    let woundingAttacks = Number(getWounding(hits) + additionalWounds);
    let woundsAttacks = getWounds(woundingAttacks);


    finalWords(woundsAttacks)
}

function inputToFracture(x) {
    let result = (7 - x) / 6;
    return result
}

function getHittingAttacks() {
    let attacks = Number(document.getElementById('inAttack').value);
    let hitRoll = Number(document.getElementById('inHitRoll').value);
    let hitRollFracture = Number(inputToFracture(hitRoll));

    return attacks * hitRollFracture
}

function getWounding(hits) {
    let strength = Number(document.getElementById('inStrength').value);
    let toughness = Number(document.getElementById('inTough').value);
    let woundRoll = Number(getWoundRoll(strength, toughness));
    let woundFactor = Number(inputToFracture(woundRoll));
    console.log(woundFactor)
    return hits * woundFactor
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

function getWounds(woundingAttacks) {
    let armourPenetration = getAP()
    let saveUnit = Number(document.getElementById('inSV').value)
    let woundCharachteristic = Number(document.getElementById('inWoundChar').value)

    let realSV = saveUnit + armourPenetration
    if (realSV > 6) {
        return [(woundingAttacks * woundCharachteristic).toFixed(2), woundingAttacks.toFixed(2)]
    } else {

        let damageDealingAttacks = (woundingAttacks * (1 - inputToFracture(realSV))).toFixed(2)
        let damageDealt = (damageDealingAttacks * woundCharachteristic).toFixed(2)

        return [damageDealt, damageDealingAttacks]
    }
}

function getAP() {
    let armourPenetration = Number(document.getElementById('inAP').value)
    if (armourPenetration < 0) {
        armourPenetration = armourPenetration * (-1)
    }
    return armourPenetration
}

function finalWords(woundsAttacks) {
    let woundText = woundsAttacks[0] + ' Wunden,  ';
    let attacksText = 'in ' + woundsAttacks[1] + ' Angriffen.';
    if (woundsAttacks[0] == 1) {
        woundText = '1 Wunde am Ziel,  '
    }
    if (woundsAttacks[1] == 1) {
        attacksText = 'mit einem Angriff.'
    }

    document.getElementById('resultTag').innerHTML = 'Der Angriff verursacht statistisch ' + woundText + attacksText
}

function reset() {
    document.getElementById('inAttack').value = '';
    document.getElementById('inHitRoll').value = '';
    document.getElementById('inStrength').value = '';
    document.getElementById('inTough').value = '';
    document.getElementById('inAP').value = '';
    document.getElementById('inSV').value = '';
    document.getElementById('inWoundChar').value = '';
}