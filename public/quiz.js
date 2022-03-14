/**
* Javascript functionality for the chocolate quiz
*/

function resetQuiz() {
    /**
     * Resets the quiz page so that one can search again without reloading
     */
    
    //hide reset button and show search button
    document.getElementById("findChocolate").parentNode.classList.remove("d-none");
    document.getElementById("resetQuiz").parentNode.classList.add("d-none");
  
    //hide+clear results and show quiz
    document.getElementById("resultContainerParent").classList.add("d-none");
    document.getElementById("resultContainer").innerHTML = "";
    
    document.getElementById("quizContainer").classList.remove("d-none");
  
    //revert to two column
    document.getElementById("resultContainerParent").classList.add("results-one-column");
  
    //hide error message
    document.getElementById("errorMessage").classList.add("d-none");
}

function validateForm() {
    /**
     * Checks that all the radios in the form are filled
     * @returns {bool} true if the form is filled, otherwise false
     */
    let valid = false;
  
    let r1 = document.querySelector("input[name=sweetBitter]:checked");
    let r2 = document.querySelector("input[name=expensiveCheap]:checked");
    let r3 = document.querySelector("input[name=chocoType]:checked");
    let r4 = document.querySelector("input[name=chocoFill]:checked");
    
    if (!(r1 == null || r2 == null || r3 == null || r4 == null)) {
        //form is valid
        valid = true;
    }
    return valid;
}

function createResultDiv(result, id = "result") {
    /**
     * Creates a html element containing the chocolate entry information
     * @param {object} result - the chocolate entry
     * @param {string} id - a unique id for the parent container
     * @returns {Element} the html element containing the information
     */
  
    let parent = document.createElement("a");
    parent.setAttribute("id", id);
    parent.setAttribute("href", result.url);
    parent.classList.add("result", "cursor-pointer", "text-decoration-none", "text-s-primary", "mt-1");
  
    //create title with link to chocolate
    let title = document.createElement("h3");
    if (result.name.length <= 19) {
        title.classList.add("text-decoration-underline", "fw-lighter");
    } else {
        title.classList.add("text-decoration-underline", "fw-lighter", "mt-2");
    }
    title.innerText = result.name;
    parent.appendChild(title);
  
    //create p tags with chocolate attributes
    let attributes = {
        Hersteller: result.hersteller,
        Typ: result.typ,
        Geschmack: result.geschmack,
        Preis: result.preis,
        Ort: result.ort
    };
    for (let [key, value] of Object.entries(attributes)) {
        let p = document.createElement("p");
        p.classList.add("mb-1", "ms-3");
        p.innerText = `${ key }: ${ value[0].toUpperCase() + value.substr(1) }`;
        parent.appendChild(p);
    }
  
    //list chocolate contents
    let p = document.createElement("p");
    p.classList.add("mb-1", "ms-3");
    let outstr = ""
    for (let i = 0; i < result.inhalt.length; i++) {
        let ing = result.inhalt[i];
        if (i === 0) {
            outstr += ing[0].toUpperCase() + ing.substr(1);
        } else {
            outstr += ", " + ing[0].toUpperCase() + ing.substr(1);
        }
    }
    p.innerText = `Inhalte: ${ outstr }`;
    parent.appendChild(p);
  
    return parent;
}

async function findChocolate() {
    /**
     * Controller function to request chocolate result from server and display it
     */
  
    if (validateForm()) {
        //hide error message
        document.getElementById("errorMessage").classList.add("d-none");
      
        //show spinner and hide search button
        toggleSpinner(true, true);
        document.getElementById("findChocolate").parentNode.classList.add("d-none");
      
        let results = await sendQuizPOST();
        console.log(results);
        results = results.matches;

        let i, parent = document.getElementById("resultContainer");
        for (i = 0; i < results.length; i++) {
            parent.appendChild(createResultDiv(results[i], `result${ i }`))
        }

        //show results and display reset button
        document.getElementById("resultContainerParent").classList.remove("d-none");
        if (i == 1) {
            //center single results
            document.getElementById("resultContainerParent").classList.add("results-one-column");
        }
        document.getElementById("resetQuiz").parentNode.classList.remove("d-none");
        toggleSpinner(false);
      
    } else {
        //form is invlid, tell user
        document.getElementById("errorMessage").classList.remove("d-none");
    }

}

function toggleSpinner(state, hidequiz = false) {
    /**
     * Displays or hides the spinner, optionally also hiding the quiz
     * @param {bool} state - whether to turn the spinner on (true) or off (false)
     * @param {bool} hidequiz - 
     */
    let spinner = document.getElementById("spinner");
  
    if (state) {
        //show spinner
        spinner.classList.remove("d-none");
        spinner.classList.add("d-flex");
    } else {
        //hide spinner
        spinner.classList.remove("d-flex");
        spinner.classList.add("d-none");
    }
  
    if (hidequiz) {
        document.getElementById("quizContainer").classList.add("d-none");
    }
}

async function sendQuizPOST() {
    const url = "/quiz";
    let criteria = getQuizResult();
  
    //ask the server to find us some fitting chocolate
    let promise = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(criteria),
        redirect: "follow"
    });
    
    if (promise.ok) {
        let json = await promise.json();
        return json;
    } else {
        console.error(`Bad Fetch Response: ${ promise.status }`)
        return false;
    }
}

function getQuizResult() {
    /**
     * gathers the quiz answers in form of a json object
     * @returns {object} the quiz answers
     */
    let form = {
        geschmack: getSweetBitter(),
        preis: getExpensiveCheap(),
        typ: getChocoType(),
        inhaltHaben: getChocoFill(),
        inhalt: getChocoContents()
    }
    if (!form.inhaltHaben) {
        form.inhalt = ["none"];
    }
    return form;
}

function getSweetBitter() {
    /**
     * finds the active radio of the "sweetBitter" radio name
     * @returns {string} the name of the active radio
     */
    let resultElem = document.querySelector("input[name=sweetBitter]:checked");
    let result = "";
    switch (resultElem.id) {
        case "sweetBitterSweet": 
            result="suß"; 
            break;
        case "sweetBitterNeutral": 
            result="neutral"; 
            break;
        case "sweetBitterSweet": 
            result="bitter"; 
            break;
        default: result = "neutral";
    }
    return result;
}

function getExpensiveCheap() {
    /**
     * finds the active radio of the "expensiveCheap" radio name
     * @returns {string} the name of the active radio
     */
    let resultElem = document.querySelector("input[name=expensiveCheap]:checked");
    let result = "";
    switch (resultElem.id) {
        case "expensiveCheapExpensive": 
            result="teuer"; 
            break;
        case "expensiveCheapNeutral": 
            result="neutral"; 
            break;
        case "expensiveCheapCheap": 
            result="billig"; 
            break;
        default: result = "neutral";
    }
    return result;
}

function getChocoType() {
    /**
     * finds the active radio of the "chocoType" radio name
     * @returns {string} the name of the active radio
     */
    let resultElem = document.querySelector("input[name=chocoType]:checked");
    let result = "";
    switch (resultElem.id) {
        case "chocoTypeDark": 
            result="dunkel"; 
            break;
        case "chocoTypeMilk": 
            result="milch"; 
            break;
        case "chocoTypeWhite": 
            result="hell"; 
            break;
        default: result = "milch";
    }
    return result;
}

function getChocoFill() {
    /**
     * finds the active radio of the "chocoFill" radio name
     * @returns {bool} the state of the binary radio
     */
    let result, resultElem = document.querySelector("input[name=chocoFill]:checked");
    switch (resultElem.id) {
        case "withFill": 
            result=true; 
            break;
        case "withoutFill": 
            result=false; 
            break;
        default: result = false;
    }
    return result;
}

function getChocoContents() {
    /**
     * find the checked checkboxes of the chocolate content (cc) checkbox category
     * @returns {array} the names of the active checkboxes
     */
    let results = document.querySelectorAll("#cc input[type=checkbox]");
    let result = ["none"];
    
    results.forEach(e => {
        if (e.checked) {
            switch (e.id) {
                case "ccNuts":
                    result.push("nüsse");
                    break;
                case "ccCaramel":
                    result.push("karamell");
                    break;
                case "ccCookie":
                    result.push("kekse");
                    break;
                case "ccFruit":
                    result.push("früchte");
                    break;
            }
        }
    });
    
    //if at least one checkbox was selected
    if (result.length > 1) {
        //remove the first element ("none")
        result.shift();
    }
  
    return result;
}

function init() {
    /**
     * Sets up event handlers and other page specific routines
     */
    
    //create event listeners for hiding and showing chocolate content checkboxes
    document.getElementById('withFill').addEventListener('click', e => {
        document.getElementById('ccContainer').classList.remove("d-none");
    });
    document.getElementById('withoutFill').addEventListener('click', e => {
        document.getElementById('ccContainer').classList.add("d-none");
    });
    
}