const GenderEnum = {
    MALE : 'male',
    FEMALE : 'female'
}

Array.prototype.mean = function(propName) {
    let sum = 0;

    for (i = 0; i < this.length; i++) {
        sum += this[i][propName];
    }

    return sum/this.length;
};

Array.prototype.variance = function(propName, mean) {
    let sum = this.reduce(function(total, person) {
        return total + Math.pow(person[propName] - mean, 2);
    }, 0)

    return sum / (this.length - 1);
};

let dataset = [];

let mathData = {
    probFemale : 0,
    probMale : 0,
    meanFemaleHeight: 0,
    meanFemaleWeight: 0,
    meanFemaleFootSize: 0,
    meanMaleHeight: 0,
    meanMaleWeight: 0,
    meanMaleFootSize: 0,
    varFemaleHeight: 0,
    varFemaleWeight: 0,
    varFemaleFootSize: 0,
    varMaleHeight: 0,
    varMaleWeight: 0,
    varMaleFootSize: 0,
};

function Person(gender, heightCm, weightKg, footSizeCm) {
    this.gender   = gender;
    this.heightCm = heightCm;
    this.weightKg = weightKg;
    this.footSizeCm = footSizeCm;
}

function initialize()
{
    dataset = [
        new Person(GenderEnum.MALE, 169, 82, 28),
        new Person(GenderEnum.MALE, 170, 86, 26),
        new Person(GenderEnum.MALE, 160, 77, 30),
        new Person(GenderEnum.MALE, 175, 70, 27),
        new Person(GenderEnum.MALE, 180, 75, 30),
        new Person(GenderEnum.FEMALE, 154, 48, 20),
        new Person(GenderEnum.FEMALE, 165, 50, 20),
        new Person(GenderEnum.FEMALE, 170, 58, 18),
        new Person(GenderEnum.FEMALE, 168, 61, 23),
        new Person(GenderEnum.FEMALE, 172, 65, 23),
    ];

    calculateProbabilityData();

    document.getElementById('classification-form').onsubmit = onFormSubmit;
}

function calculateProbabilityData()
{
    let females = dataset.filter(person => person.gender == GenderEnum.FEMALE);
    let males = dataset.filter(person => person.gender == GenderEnum.MALE);

    //general probability
    mathData.probFemale = females.length/dataset.length;
    mathData.probMale = males.length/dataset.length;

    //arithmetic mean per property
    mathData.meanFemaleHeight = females.mean('heightCm');
    mathData.meanFemaleWeight = females.mean('weightKg');
    mathData.meanFemaleFootSize = females.mean('footSizeCm');

    mathData.meanMaleHeight = males.mean('heightCm');
    mathData.meanMaleWeight = males.mean('weightKg');
    mathData.meanMaleFootSize = males.mean('footSizeCm');

    //variance per property
    mathData.varFemaleHeight = females.variance('heightCm', mathData.meanFemaleHeight);
    mathData.varFemaleWeight = females.variance('weightKg', mathData.meanFemaleWeight);
    mathData.varFemaleFootSize = females.variance('footSizeCm', mathData.meanFemaleFootSize);

    mathData.varMaleHeight = males.variance('heightCm', mathData.meanMaleHeight);
    mathData.varMaleWeight = males.variance('weightKg', mathData.meanMaleWeight);
    mathData.varMaleFootSize = males.variance('footSizeCm', mathData.meanMaleFootSize);

    console.log(mathData);
}

function probabilityDensity(x, mean, variance)
{
    let firstPart = (1/(Math.sqrt(2 * Math.PI * variance)));
    let secondPart = Math.pow(Math.E, - (Math.pow(x - mean, 2) / (2 * variance)));

    return firstPart * secondPart;
}

function renderDataset(dataset)
{
    let datasetTable = document.getElementById('dataset-table');
    while (datasetTable.childElementCount > 1) {
      datasetTable.removeChild(datasetTable.lastChild);
   }

    for(var i = 0; i < dataset.length; i++)
    {
        let tr = document.createElement('tr');

        for (prop in dataset[i])
        {
            let td = document.createElement('td');
            td.textContent = dataset[i][prop];
            tr.appendChild(td);
        }

        datasetTable.appendChild(tr);
    }
}

function renderMathCalculations(mathData)
{
    let t = document.getElementById('math-table');
    while (t.childElementCount > 1) {
      t.removeChild(t.lastChild);
   }

   renderMathCalcRow(['male', 'height', mathData.meanMaleHeight, mathData.varMaleHeight]);
   renderMathCalcRow(['male', 'weight', mathData.meanMaleWeight, mathData.varMaleWeight]);
   renderMathCalcRow(['male', 'foot size', mathData.meanMaleFootSize, mathData.varMaleFootSize]);
   renderMathCalcRow(['female', 'height', mathData.meanFemaleHeight, mathData.varFemaleHeight]);
   renderMathCalcRow(['female', 'weight', mathData.meanFemaleWeight, mathData.varFemaleWeight]);
   renderMathCalcRow(['female', 'foot size', mathData.meanFemaleFootSize, mathData.varFemaleFootSize]);
}

function renderMathCalcRow(rowData)
{
    let t = document.getElementById('math-table');

    let tr = document.createElement('tr');

    rowData.forEach(function (value) {
        let td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
    });

    t.appendChild(tr);
}

function onFormSubmit(e)
{
    e.preventDefault();

    let res = document.getElementById("result");
    if (res.childNodes[0] !== undefined) {
        res.removeChild(res.childNodes[0]);
    }

    let person = new Person(
        undefined,
        e.target.querySelector('[name="height"]').value,
        e.target.querySelector('[name="weight"]').value,
        e.target.querySelector('[name="foot-size"]').value,
    )

    console.log(person);
    let gender = classifyPerson(person);
    res.appendChild(
        document.createTextNode("This person is " + (gender == GenderEnum.MALE ? "Male!" : "Female!"))
    );

    person.gender = gender;
    dataset.push(person);
    renderDataset(dataset);
    calculateProbabilityData();
    renderMathCalculations(mathData);
}

function classifyPerson(p)
{
    //formula for the probability of being Female
    //P(F|p.height, p.weight, p.footSize) = P(F)*P(p.height|F)*P(p.weight|F)*P(p.footSize|F)

    //we use the probability density function
    //P(p.height|F)
    let pHeightGivenF = probabilityDensity(p.heightCm, mathData.meanFemaleHeight, mathData.varFemaleHeight);
    //P(p.weight|F)
    let pWeightGivenF = probabilityDensity(p.weightKg, mathData.meanFemaleWeight, mathData.varFemaleWeight);
    //P(p.footSize|F)
    let pFootSizeGivenF = probabilityDensity(p.footSizeCm, mathData.meanFemaleFootSize, mathData.varFemaleFootSize);

    let pFemaleGivenAllThat = mathData.probFemale * pHeightGivenF * pWeightGivenF * pFootSizeGivenF;

    //P(M|p.height, p.weight, p.footSize) = P(M)*P(p.height|M)*P(p.weight|M)*P(p.footSize|M)
    //P(p.height|M)
    let pHeightGivenM = probabilityDensity(p.heightCm, mathData.meanMaleHeight, mathData.varMaleHeight);
    //P(p.weight|M)
    let pWeightGivenM = probabilityDensity(p.weightKg, mathData.meanMaleWeight, mathData.varMaleWeight);
    //P(p.footSize|M)
    let pFootSizeGivenM = probabilityDensity(p.footSizeCm, mathData.meanMaleFootSize, mathData.varMaleFootSize);

    let pMaleGivenAllThat = mathData.probMale * pHeightGivenM * pWeightGivenM * pFootSizeGivenM;

    console.log("Prob of Female : " + pFemaleGivenAllThat);
    console.log("Prob of Male : " + pMaleGivenAllThat);

    return (pMaleGivenAllThat > pFemaleGivenAllThat) ? GenderEnum.MALE : GenderEnum.FEMALE;
}

initialize();
renderDataset(dataset);
renderMathCalculations(mathData);
