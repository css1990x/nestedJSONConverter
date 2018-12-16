/*
    In consideration of both time limitations and legibility, I have implemented the following constrations:  
    1. The convertJsonObject function does not support directly nested arrays of more than one dimension, because maintaining a coherent
    identification and naming convention was cumbersome. If you would like, I'm happy to discuss the thinking behind this limitation.
    2. Whenever the convertJson function is called, if the third argument (isInArray) is true, then one of the following two conditions must 
    be met: either the first argument must be an object with an id property, or the fourth argument(id) must not be null. 
    3. Because of the second constraint, if a primitive is passed in as the first argument to the convertJson function, and the third argument(isInArray)
    is true, then as long as the fourt argument(id) is not null, the convertJson function will take the 
    4. Every element within an array must be of the same type. Given the purpose of the assignment, this constraint seemed like a good way to prevent bugs.

    The convertJson inner function accepts the following six arguments: 
    1. JsonObj: The object, or primitive being 
    2. parent: The name of the field on the flattened JSON object to which the return value of convertJson should either be appended (if value of said field is an array), 
    or set (if value of said field is not an array).
    3. isInArray: specifies whether the parent field on flattened JSON object is or should be an array. Since objects within Arrays
    may themselves contain properties which need to be flattened, we must keep track of whether the first argument passed into convertJson is itself the descendant
    of an array.
    4. id: id of the object
    5. index: index within an Array (only used for arrays nested within objects which are themselves nested). 
    
*/
const convertJsonObject = function(toBeChangedJson){
    const flattenedJson = {};
    const nestedArrayError = 'Error: directly nested arrays are not supported, and all elements within an array must be of same type. Please check your JSON'
    const convertJson = function(JsonObj, parent, isInArray=false, id=null, index=null){
        let flattenedJsonValue = {}; 
        let nextConvertJsonCalls = []; 
        let valid; 
        let nextParentTitle
        if (!isInArray){
            for (let key in JsonObj){
                if (typeof JsonObj[key] !== 'object'){
                    flattenedJsonValue[key] = JsonObj[key]; 
                } else if (!Array.isArray(JsonObj[key])) {
                    nextParentTitle = `${parent}_${key}`; 
                    nextConvertJsonCalls.push([JsonObj[key], nextParentTitle, false]);
                } else {
                    nextParentTitle = `${parent}_${key}`;
                    nextConvertJsonCalls.push([JsonObj[key], nextParentTitle, true]); 
                }
            }
            flattenedJson[parent] = flattenedJsonValue;
            for (let i = 0; i < nextConvertJsonCalls.length; i++){
                let title = nextConvertJsonCalls[i][1];
                let value = nextConvertJsonCalls[i][0];
                let isArrayChild = nextConvertJsonCalls[i][2]
                if (!isArrayChild) {
                    convertJson(value, title, false);
                } else {
                    valid = validateArray(value); 
                    if (!valid){
                        throw new Error(nestedArrayError); 
                        return; 
                    }
                    value.forEach((val) => {
                        convertJson(val, title, true);
                    })
                }
            }
        } else {
           id = JsonObj['id'] || id; 
           if (!flattenedJson[parent]){
               flattenedJson[parent] = [];
           }
           if (typeof JsonObj !== 'object'){
               if (id === null){
                 throw new Error('Error: if passing primitives to an array, please make sure an id property exists on an ancestor'); 
                 return;
               }
               let val = JsonObj
               flattenedJson[parent].push({'id': id, 'value': val}); 
               return; 
           }
           flattenedJsonValue['id'] = id;
           // hacky workaround to deal w/ falsiness of 0 in JS (see line 81 for more context)
           if (index){
               flattenedJsonValue['_index'] = index - 1; 
           }
           for (let key in JsonObj){
               if (typeof JsonObj[key] !== 'object'){
                   flattenedJsonValue[key] = JsonObj[key]; 
               } else {
                nextParentTitle = `${parent}_${key}`;
                let value = JsonObj[key]; 
                   if (!Array.isArray(JsonObj[key])){
                       nextConvertJsonCalls.push([value, nextParentTitle, false]); 
                   } else {
                        nextConvertJsonCalls.push([value, nextParentTitle, true]);
                   }
               }
           }
           flattenedJson[parent].push(flattenedJsonValue);
           for (let i = 0; i < nextConvertJsonCalls.length; i++){
               let value = nextConvertJsonCalls[i][0];
               let title = nextConvertJsonCalls[i][1];
               let isArray = nextConvertJsonCalls[i][2]; 
               if (!isArray){
                convertJson(value, title, true, id, index);
               } else {
                   valid = validateArray(value);
                   if (!valid){
                       throw new Error(nestedArrayError);
                   }
                   value.forEach((val, index) => {
                       convertJson(val, title, true, id, index + 1); 
                   })
               }
           }
        }
    };
    for (let key in toBeChangedJson){
        if (typeof toBeChangedJson[key] !== 'object'){
            flattenedJson[key] = toBeChangedJson[key]; 
        } else {
            if (!Array.isArray(toBeChangedJson[key])){
                convertJson(toBeChangedJson[key], key);
            } else {
                let value = toBeChangedJson[key]; 
                valid = validateArray(value);
                if (!valid){
                    throw new Error(nestedArrayError);
                    return; 
                } 
                value.forEach((val)=>{
                    convertJson(val, key, true)
                })
            }
        } 
    }
    return flattenedJson
}

function validateArray(array){
    if (array.length === 0 || array.length === 1){
        return true; 
    }
    for (let i = 0; i < array.length - 1; i++){
        if (!checkTypeEquality(array[i], array[i + 1])){
            return false; 
        }
    }
    return true; 
}

function checkTypeEquality(valueA, valueB){
    return (!Array.isArray(valueA) && (!Array.isArray(valueB) && (typeof valueA === typeof valueB))) 

}


let myRestaurants = {
    "type": "restaurant",
    "restaurant": {
        "type": "italian",
        "buffet": false, 
        "address": {
            "street": "121 davis", 
            "zip": "02462", 
            "owner": {
                "name": "walter mathau",
                "age": 27,
                "height": "6'3"
            }
        }
    }
}

let restaurants = {
    "type": "restaurant",
    "restaurant": {
        "type": "italian",
        "buffet": false, 
        "address": {
            "street": "121 davis", 
            "zip": "02462", 
            "owner": {
                "name": "walter mathau",
                "age": 27,
                "height": "6'3"
            }
        }
    },
    "restaurants": [{
    "id": "58b868503c6f4d322fa8f552",
    "owners": ["rob", "phil"], 
    "address": {
    "building": "1007",
    "coord": "[-73.856077, 40.848447]",
    "street": "Morris Park Ave",
    "zipcode": "10462"
    },
    "borough": "Bronx",
    "cuisine": "Bakery",
    "grades": [{
        "date": "2014-03-03T00:00:00.000Z",
        "grade": "A",
        "score": {
        "x": 1,
        "y": 2
            }
        }, {
            "date": "2014-03-03T00:00:00.000Z",
            "grade": "A",
            "score": {
            "x": 1,
            "y": 2
            }
        }],
    "name": "Morris Park Bake Shop"
},
{
    "id": "foobarfoobarfoo",
    "owners": ["bill", "brian", "jim"],
    "address": {
    "building": "1007",
    "coord": "[-73.856077, 40.848447]",
    "street": "Morris Park Ave",
    "zipcode": "10462"
    },
    "borough": "Bronx",
    "cuisine": "Bakery",
    "grades": [{
        "date": "2014-03-03T00:00:00.000Z",
        "grade": "A",
        "score": {
        "x": 1,
        "y": 2
            }
        }],
    "name": "Morris Park Bake Shop"
}
]}

console.log(convertJsonObject(restaurants))
console.log(Array.isArray(restaurants.restaurants[0].grades));