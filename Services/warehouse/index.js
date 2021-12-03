// Constantes 
const {LANG, TYPES} = require('../../constantes/typesByCategory');
const { LANG_MAP } = require('../../constantes/languages');
const {MAX} = require('../../constantes/pagination');

// Lib
const axios = require("axios");

// Environment
const dotenv = require('dotenv');
dotenv.config();

//Utils
const return_success = require('../../Utils/returnSuccess');
const custom_errors = require('../../Errors/CustomsErrors');

const axiosOptions = {
      headers: {
            'Authorization': process.env.CARD_WAREHOUSE_TOKEN
      }
};

async function CardsDatasToMap(page, size, lang, lang_id, types){
      try{
            let firstMap = new Map();
            let secondMap = new Map();
            let firstToMerge = new Map();
            let mergedMaps = new Map();
            let pageMax = 0;
            
            //create a map by type as key and value as object containing objects with id and nb_max_per_deck

            for(let type of types){
                  //get total of cards for each type
                  firstMap.set(type, []);
                  let url = `${process.env.CARD_WAREHOUSE}cards/all/${lang}?types=[${type}]&page=${page}&card_count=1`;
                  let response = await axios.get(url, axiosOptions);
                  
                  if(response.status >= 200 && response.status < 400 && response.statusText === 'OK'){

                        // calculate the maximum of page
                        pageMax = Math.ceil(response.data[0] / size);
                        if(pageMax === 0){
                              return;
                        }

                        //Iterate over each page of each type
                        for(let currentPage = 1; currentPage <= pageMax; currentPage++){
                              let url = `${process.env.CARD_WAREHOUSE}cards/all/${lang}?types=[${type}]&page=${currentPage}&card_count=${size}`;
                              let responseByType = await axios.get(url, axiosOptions);
                              if(responseByType.status >= 200 && responseByType.status < 400 && responseByType.statusText === 'OK'){
                                    responseByType.data[1].map(elmt => {
                                          let newObj = firstMap.get(type);
                                          newObj = [...newObj, {id: elmt.id, nb_max_per_deck: elmt.nb_max_per_deck}];
                                          firstMap.set(type, newObj);
                                    })
                              }
                        }

                  }
            }
            
            //reverse type id and card id
            for(const [key, value] of firstMap.entries()){
                  value.map(elmt => {
                        firstToMerge.set(elmt.id, {type_id: key, nb_max_per_deck: elmt.nb_max_per_deck});
                  }) 
            }
            
            //create map with all dats from multiple ids route
            for(const [key, value] of firstMap.entries()){
                  let ids = value.map(elmt => elmt.id);      
                  const url = `${process.env.CARD_WAREHOUSE}cards/${lang}/multiple?a=[${ids.join()}]`;
                  const {status, statusText, data} = await axios.get(url, axiosOptions);
                  if(status >= 200 && status < 400 && statusText === 'OK'){
                        data.map(elmt => {
                              secondMap.set(elmt.id, {})
                              let newValue = secondMap.get(elmt.id);
                              newValue.card_name = elmt.name;
                              newValue.image_path = elmt.image_path;
                              newValue.lang_id = lang_id;
                              newValue.lang_name = lang;
                              newValue.type_id = key;
                              newValue.type_name = elmt.type;
                              newValue.extension_id = elmt.extension_id;
                              newValue.extension_name = elmt.extension_name;
                              newValue.kingdom_id = elmt.kingdom_id;
                              newValue.kingdom_name = elmt.kingdom_name;
                              newValue.raritie_id = elmt.rarity_id;
                              newValue.raritie_name = elmt.rarity_name;
                              newValue.capacities = elmt.capacities;
                              newValue.classes = elmt.classes;
                              newValue.ec_cost = elmt.heavenly_energy; 
                              return secondMap.set(elmt.id, newValue);
                        }) 
                  }
                  
            }
            
            // merge maps
            for(const [key, value] of firstToMerge.entries()){
                  mergedMaps.set(key, {...secondMap.get(key), ...firstToMerge.get(key)})
            }
            
            return {
                  code: 200,
                  message: mergedMaps
            }
      }catch(error){
            console.log("[getCardsListPerType][wharehouse][index.js] : ", error)
            return error;
      }
}

async function getCardsListPerId(page, size, lang, types){
      try{
            let typeMap = new Map();
            let idMap = new Map();
            let pageMax = 0;
            
            for(let type of types){

                  //get total of cards for each type
                  typeMap.set(type, []);
                  let url = `${process.env.CARD_WAREHOUSE}cards/all/${lang}?types=[${type}]&page=${page}&card_count=1`;
                  let response = await axios.get(url, axiosOptions);
                  if(response.status >= 200 && response.status < 400 && response.statusText === 'OK'){

                        // calculate the maximum of page
                        pageMax = Math.ceil(response.data[0] / size);
                        if(pageMax === 0){
                              return;
                        }

                        //Iterate over each page of each type
                        for(let currentPage = 1; currentPage <= pageMax; currentPage++){
                              let url = `${process.env.CARD_WAREHOUSE}cards/all/${lang}?types=[${type}]&page=${currentPage}&card_count=${size}`;
                              let responseByType = await axios.get(url, axiosOptions);
                              if(responseByType.status >= 200 && responseByType.status < 400 && responseByType.statusText === 'OK'){
                                    responseByType.data[1].map(elmt => {
                                          let newObj = typeMap.get(type);
                                          newObj = [...newObj, {id: elmt.id, nb_max_per_deck: elmt.nb_max_per_deck}];
                                          typeMap.set(type, newObj);
                                    })
                              }
                        }

                  }
            }
            
            for(const [key, value] of typeMap.entries()){
                  value.map(elmt => idMap.set(elmt.id, {type_id: key, nb_max_per_deck: elmt.nb_max_per_deck}))
            }

            return idMap;
      }catch(error){
            console.log("[getCardsListPerType][wharehouse][index.js] : ", error)
      }
}


async function getList(type, name){
      try {
            let url = `${process.env.CARD_WAREHOUSE}${type}/all/FR`;
            if(name){
                  url += `?name=${name}`;
            };

            let response = await axios.get(url, axiosOptions);
            if(response.status === 200 && response.statusText === 'OK'){
                  return return_success(response.data);
            }

      } catch (error) {
            if(error.response){
                  console.log("[Warehouse Service][getKingdomsList]" , error.response)
                  throw custom_errors(error.response.status);
            }
            console.log("[Warehouse Service][getKingdomsList]" , error)
            throw custom_errors(error);
      }
}


async function getCardsList(){
      try {
            let lang_id = 0;
            let datas = new Map();
            let mapTypeById = new Map();
            
            let ids = [];
            let newArr = [];
            let pageMax = 0;

            for(let lang of LANG){
                  lang_id = LANG_MAP[lang];

                  //get the counter of total cards in order to calculate the number of page
                  let test = await CardsDatasToMap(1, MAX, lang, lang_id, TYPES);
                  if(test.code === 200){
                        return test;
                  }else{
                        throw new Error({
                              response: {
                                    status,
                                    statusText
                              }
                        })
                  }
                  
            }

            return {
                  code: 200,
                  message: datas
            };   
      } catch (error) {
            console.log(error)
            const {status, statusText} = error.response;
            return {
                  code: status,
                  message: statusText
            }
      }
}

async function getCardsByType(type){
      try {
            let responseCounter = await axios.get(`${process.env.CARD_WAREHOUSE}cards/all/FR?types=[${type}]&page=1&card_count=1`, axiosOptions);
            let counter = 0;

            //get counter cards
            if(responseCounter.status === 200 && responseCounter.statusText === 'OK'){
                  counter = responseCounter.data[0];
            }else{
                 throw {
                       code: responseCards.response.status,
                       message: responseCards.response.statusText
                 } 
            }
            
            //redo the same 
            let responseCards = await axios.get(`${process.env.CARD_WAREHOUSE}cards/all/FR?types=[${type}]&page=1&card_count=${counter}`, axiosOptions);
            if(responseCards.status === 200 && responseCards.statusText === 'OK'){
                  let cardsMap = new Map();
                  responseCards.data[1].map(elmt => cardsMap.set(Number(elmt.id), {image_path: elmt.image_path, max:elmt.nb_max_per_deck}))
                  let responseThree = await axios.get(`${process.env.CARD_WAREHOUSE}cards/FR/multiple?a=[${Array.from(cardsMap.keys()).join()}]`, axiosOptions);
                  if(responseThree.status === 200 && responseThree.statusText === 'OK'){
                        responseThree.data.map(elmt => cardsMap.set(elmt.id, {...cardsMap.get(elmt.id), ec_cost: elmt.heavenly_energy}))
                        return {
                              code: 200,
                              message: cardsMap
                        }
                  }else{
                        throw {
                              code: responseThree.response.status,
                              message: responseThree.response.statusText
                        }
                  }

            }else{
                 throw {
                       code: responseCards.response.status,
                       message: responseCards.response.statusText
                 } 
            }

      } catch (error) {
            throw error
      }
}

async function getCardsBy(options){
      try {
            let url = new URL(`${process.env.CARD_WAREHOUSE}cards/all/FR`);

            if(options.page){
                  url.searchParams.append('page', options.page);
            }

            if(options.card_count){
                  url.searchParams.append('card_count', options.card_count);
            }

            if(options.types){
                  url.searchParams.append('types', `[${options.types}]`);
            }

            if(options.kingdoms){
                  url.searchParams.append('kingdoms', `[${options.kingdoms}]`);
            }

            if(options.rarities){
                  url.searchParams.append('rarities', `[${options.rarities}]`);
            }

            if(options.classes){
                  url.searchParams.append('classes', `[${options.classes}]`);
            }

            if(options.extensions){
                  url.searchParams.append('extensions', `[${options.extensions}]`)
            }

            if(options.capacities){
                  url.searchParams.append('capacities', `[${options.capacities}]`);
            }

            if(options.name){
                  url.searchParams.append('name', options.name)
            }

            let responseCards = await axios.get(`${url.toString()}`, axiosOptions);

            if(responseCards.status === 200 && responseCards.statusText === 'OK'){
                  return return_success(responseCards.data);
            }
            
            throw {
                  code: responseCards.repsonse.status,
                  message: responseCards.repsonse.statusText
            };

      } catch (error) {
            console.log("[Warehouse Service][getCardsBy] : ", error)
            throw error;
      }
}

module.exports = {
      getCardsBy,
      getList,
      getCardsList,
      getCardsByType
};