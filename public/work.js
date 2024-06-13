const principalContainer = document.querySelector ('#principal');
const rateContainer = document.querySelector ('#rate');
const yearsContainer = document.querySelector ('#years');
const frequencyContainer = document.querySelector ('#timesCompounded');
const amountContainer = document.querySelector ('#finalAmount');

let principal = 1000;
let rate = 5;
let years = 5;
let frequency = 2;
let finalAmount = null;

const valuesArray = [
    principalContainer,
    rateContainer,
    yearsContainer,
    frequencyContainer,
    amountContainer
];

const userDefined = {
    principal: false,
    rate: false,
    years: false,
    frequency: false,
    finalAmount: false
};

let suggestionTimeout;

valuesArray.forEach (element => {
    element.addEventListener ('input', e => {
        const value = parseFloat (e.target.value);
        switch (e.target.id) {
            case 'principal':
                principal = !isNaN  (value) ? value : 1000;
                userDefined.principal = true;
                element.style.backgroundColor = 'white';
                break;
            case 'rate':
                rate = !isNaN (value) ? value : 5;
                userDefined.rate = true;
                element.style.backgroundColor = 'white';
                break;
            case 'years':
                years = !isNaN (value) ? value : 5;
                userDefined.years = true;
                element.style.backgroundColor = 'white';
                break;
            case 'timesCompounded':
                frequency = !isNaN (value) ? value : 2;
                userDefined.frequency = true;
                element.style.backgroundColor = 'white';
                break;
            case 'finalAmount':
                finalAmount = !isNaN (value) ? value : null;
                userDefined.finalAmount = true;
                element.style.backgroundColor = 'white';
                break;
        }

        clearTimeout (suggestionTimeout);
        suggestionTimeout = setTimeout (() => {
            showSuggestions ();
            adjustValues ();
        }, 500);
    });

    element.addEventListener ('blur', () => {
        if (element.value.trim () === '') {
            const defaultValue = getDefaultForField (element.id);
            element.value = defaultValue;
            element.style.backgroundColor = 'lightgray';
            userDefined [element.id] = false;
            clearTimeout (suggestionTimeout);
            suggestionTimeout = setTimeout (() => {
                showSuggestions ();
                adjustValues ();
            }, 500);
        }
    });
});

function getDefaultForField (fieldId) {
    switch (fieldId) {
        case 'principal':
            return 1000;
        case 'rate':
            return 5;
        case 'years':
            return 5;
        case 'timesCompounded':
            return 2;
        case 'finalAmount':
            return '';
    }
}

function showSuggestions () {
    valuesArray.forEach (element => {
        if (element.value.trim () === '') {
            element.style.backgroundColor = 'lightgray';
            element.value = getDefaultForField (element.id);
            userDefined [element.id] = false;
        }
    });
}

function calculateCompoundInterest () {
    const amount = principal * Math.pow (1 + (rate / 100) / frequency, frequency * years);
    amountContainer.value = amount.toFixed (2);
    amountContainer.style.backgroundColor = 'lightgray';
}

function adjustValues () {
    const allFieldsUserDefined = Object.values (userDefined).slice (0, 4).every (value => value);

    if (allFieldsUserDefined) {
        calculateCompoundInterest ();
        return;
    }

    if (finalAmount !== null && userDefined.finalAmount) {
        let bestMatch = { p: principal, r: rate, y: years, f: frequency };
        let smallestDifference = Infinity;

        for (let p = userDefined.principal ? principal : 100; p <= (userDefined.principal ? principal : 10000); p += 100) {
            for (let r = userDefined.rate ? rate : 1; r <= (userDefined.rate ? rate : 20); r += 0.1) {
                for (let y = userDefined.years ? years : 1; y <= (userDefined.years ? years : 30); y += 1) {     
                    for (let f = userDefined.frequency ? frequency : 1; f <= (userDefined.frequency ? frequency : 12); f++) {
                        const amount = (userDefined.principal ? principal : p) * Math.pow (1 + (userDefined.rate ? rate : r) / 100 / (userDefined.frequency ? frequency : f), (userDefined.frequency ? frequency : f) * (userDefined.years ? years : y));
                        const difference = Math.abs (amount - finalAmount);

                        if (difference < smallestDifference) {
                            smallestDifference = difference;
                            bestMatch = {
                                p: userDefined.principal ? principal : p,
                                r: userDefined.rate ? rate : r,
                                y: userDefined.years ? years : y,
                                f: userDefined.frequency ? frequency : f
                            };

                            if (smallestDifference < 0.01) {
                                updateFields (bestMatch);
                                return;
                            }
                        }
                    }
                }
            }
        }

        updateFields (bestMatch);
    } else {
        calculateCompoundInterest (); 
    }

    const userDefinedCount = Object.values (userDefined).filter (value => value).length;
    if (userDefinedCount === 4) {
        calculateMissingValue ();
    }
}

function updateFields (bestMatch) {
    if (!userDefined.principal) {
        principalContainer.value = bestMatch.p;
        principalContainer.style.backgroundColor = 'lightgray';
    }
    if (!userDefined.rate) {
        rateContainer.value = bestMatch.r.toFixed(1);
        rateContainer.style.backgroundColor = 'lightgray';
    }
    if (!userDefined.years) {
        yearsContainer.value = bestMatch.y;
        yearsContainer.style.backgroundColor = 'lightgray';
    }
    if (!userDefined.frequency) {
        frequencyContainer.value = bestMatch.f;
        frequencyContainer.style.backgroundColor = 'lightgray';
    }
    if (!userDefined.finalAmount) {
        amountContainer.value = finalAmount.toFixed(2);
        amountContainer.style.backgroundColor = 'lightgray';
    }

    if (userDefined.principal && userDefined.rate && userDefined.years && userDefined.frequency && !userDefined.finalAmount) {
        calculateCompoundInterest();
    }
}

function calculateMissingValue () {
    if (!userDefined.principal) {
        principal = finalAmount / Math.pow (1 + (rate / 100) / frequency, frequency * years);
        principalContainer.value = principal.toFixed (2);
        principalContainer.style.backgroundColor = 'lightgray';
    } 
    else if (!userDefined.rate) {
        rate = (Math.pow (finalAmount / principal, 1 / (frequency * years)) - 1) * frequency * 100;
        rateContainer.value = rate.toFixed (2);
        rateContainer.style.backgroundColor = 'lightgray';
    } 
    else if (!userDefined.years) {
        years = Math.log (finalAmount / principal) / (frequency * Math.log (1 + (rate / 100) / frequency));
        yearsContainer.value = years.toFixed (2);
        yearsContainer.style.backgroundColor = 'lightgray';
    } 
    else if (!userDefined.frequency) {
        frequency = Math.log (finalAmount / principal) / (years * Math.log (1 + (rate / 100) / frequency));
        frequencyContainer.value = frequency.toFixed (2);
        frequencyContainer.style.backgroundColor = 'lightgray';
    } 
    else if (!userDefined.finalAmount) {
        calculateCompoundInterest();
    }
}

valuesArray.forEach (element => {
    element.addEventListener('change', e => {
        filledAutomatically = true;
    });
});

amountContainer.addEventListener ('input', () => {
    clearTimeout(suggestionTimeout);
    suggestionTimeout = setTimeout (() => {
        updateFinalAmount ();
        showSuggestions (); 
        adjustValues ();
    }, 500);
    filledAutomatically = true;
});

document.addEventListener ('input', () => {
    clearTimeout (suggestionTimeout);
    suggestionTimeout = setTimeout (() => {
        showSuggestions ();
        adjustValues ();
    }, 500);
});

function updateFinalAmount () {
    const value = parseFloat (amountContainer.value);
    finalAmount = !isNaN (value) ? value : null;
    userDefined.finalAmount = true; 
    adjustValues (); 
}