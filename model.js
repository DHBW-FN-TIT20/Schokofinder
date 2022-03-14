/**
 * Model for Schokofinder
 */

/*
 * JSON array for chocolate entries
 * 
 * format as follows:
 *   [
 *     {
 *       "name": "Milka Mmmax Toffee Ganznuss",                               -> String
 *       "typ": "milch",                                                      -> String
 *       "geschmack": "suß",                                                  -> String
 *       "preis": "billig",                                                   -> String
 *       "ort": "deutschland",                                                -> String
 *       "hersteller": "milka",                                               -> String
 *       "inhalt": ["karamel"],                                               -> Array (of strings)
 *       "url": "https://www.milka.de/produkte/milka-mmmax-toffee-ganznuss"   -> String
 *     },
 *   ]
 */
let chocolate = require("./src/schokolade.json");

function compareChocolateBase(criteria, chocolate) {
    /**
     * compares the base critera (type, taste, price) given to the chocolate entry
     * @param {array} criteria - contains type, taste, price, and filling
     * @param {object} chocolate - the chocolate entry
     * @returns {int} the amount of criteria that match
     */
    let i, matches = 0;
    //iterate through all criteria
    for (i = 0; i < criteria.length; i++) {
        //if the criteria is neutral then any result matches
        if (criteria[i] == "neutral") {
            matches++;
        } else {
            //iterate through each element of the chocolate object
            for (let key in chocolate) {
                //if the attribute is not the url or name
                if (!(["url", "name", "inhalt"].includes(key))) {
                    //if we find the criterion in the attribute 
                    if (chocolate[key].search(criteria[i]) >= 0) {
                        //we count this as a match and stop searching
                        matches++;
                        break;
                    }
                }
            }
        }
    }
    return matches;
}

function compareChocolateFilling(filling, chocolate) {
    /**
     * compares the filling(s) to the given chocolate entry
     * @param {array} filling - a list of valid fillings
     * @param {object} chocolate = the chocolate entry
     * @returns {bool} true if the filling is in the chocolate, otherwise false
     */
    let i, match = false;
  
    //match for filling type
    for (i = 0; i < filling.length; i++) {
        if (chocolate.inhalt.includes(filling[i])) {
            //the chocolate entry has said filling, stop searching
            match = true;
            break;
        }
    }
  
    return match;
}

module.exports = {
    findChocolate: (typ, geschmack, preis, inhalt) => {
        /**
         * searches through chocolate entries to find a suitable match according to the criteria
         * @param {string} typ - the type of chocolate ("hell", "dunkel", "milch")
         * @param {string} geschmack - the preferred taste ("bitter", "suß", "neutral")
         * @param {string} preis - target price range ("teuer", "billig", "neutral")
         * @param {array} inhalt - a list of chocolate fills
         * @returns {array} an array of best matching chocolate objects
         */
      
        //the number of criteria that have to match
        let i, requiredMatches = 4;
        let matchFound = false;
        let matches = [];
        
        //continue until we find a suitable chocolate
        while (!matchFound) {
            //loop through the entries
            for (i = 0; i < chocolate.length; i++) {
                let entry = chocolate[i];
                //find how well the given chocolate entry matches the criteria
                let matchConfidence = compareChocolateBase([typ, geschmack, preis], entry);
                if (compareChocolateFilling(inhalt, entry)) {
//                    console.log(`matched ${ inhalt } with ${ entry.inhalt }`);
                    matchConfidence++;
                } else {
//                    console.log(`did not match ${ inhalt } with ${ entry.inhalt }`);
                    //prevent matching chocolate with filling 
                    matchConfidence = 0;
                }
                
                //check if the chocolate matches well enough
                if (matchConfidence >= requiredMatches) {
                    //push the given chocolate and stop searching
                    matches.push(entry);
                    matchFound = true;
                    //we don't break here because there could be more possible matches
                }
            }
            //decrement amount of required matches and try again
            // > 1 prevents the 0 pass from happening, where every chocolate would get matched
            if (requiredMatches <= 0) {
                //break out of loop, as no suitable chocolate exists
                break;
            } else {
                requiredMatches = (matchFound) ? requiredMatches : requiredMatches - 1;
            }
        }
      
        console.log(`Found ${ matches.length } results with an overlap of ${ requiredMatches }`);
        return matches;
    },
    returnAllEntries: () => {
        /**
         * returns all entries in schokolade.json
         * @returns {array} an array of chocolate objects 
         */
        return chocolate;
    }
}