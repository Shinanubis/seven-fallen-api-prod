const {LANG, TYPES} = require('../../constantes/typesByCategory');
const { LANG_MAP } = require('../../constantes/languages');
const {MAX} = require('../../constantes/pagination');
const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

const axiosOptions = {
      headers: {
            'Authorization': process.env.CARD_WAREHOUSE_TOKEN
      }
};

async function getCardsListPerType(page, size, lang, types){
      try{
            let mapFromData = new Map();
            let pageMax = 0;
            
            for(let type of types){
                  mapFromData.set(type, []);
                  let url = `${process.env.CARD_WAREHOUSE}cards/all/${lang}?types=[${type}]&page=${page}&card_count=1`;
                  let response = await axios.get(url, axiosOptions);
                  if(response.status >= 200 && response.status < 400 && response.statusText === 'OK'){
                        pageMax = Math.ceil(response.data[0] / size);

                        if(pageMax === 0){
                              return;
                        }

                        for(let currentPage = 1; currentPage <= pageMax; currentPage++){
                              let url = `${process.env.CARD_WAREHOUSE}cards/all/${lang}?types=[${type}]&page=${page}&card_count=${size}`;
                              let responseByType = await axios.get(url, axiosOptions);
                              if(responseByType.status >= 200 && responseByType.status < 400 && responseByType.statusText === 'OK'){
                                    responseByType.data[1].map(elmt => {
                                          let newObj = mapFromData.get(type);
                                          newObj = [...newObj, elmt.id];
                                          mapFromData.set(type, newObj);
                                    })
                              }
                        }

                  }
            }
            return mapFromData;
      }catch(error){
            console.log("[getCardsListPerType][wharehouse][index.js] : ", error)
      }
}


async function getTypesList(){
      try {
            let datas = [];
            let newArr = [];

            for(let lang of LANG){
                  let {status, statusText, data} = await axios.get(process.env.CARD_WAREHOUSE + 'types/all/' + lang, axiosOptions);
                  if(status >= 200 && status < 400 && statusText === 'OK'){
                        for(let elmt of data){
                              elmt.lang = lang
                        }
                  }else{
                        throw new Error({
                              response: {
                                    status,
                                    statusText
                              }
                        })
                  }
                  datas =  [...datas, ...data];
            }
            return {
                  code: 200,
                  message: datas
            };   
      } catch (error) {
            const {status, statusText} = error.response;
            return {
                  code: status,
                  message: statusText
            }
      }
}

async function getRaritiesList(){
      try {
            let datas = [];
            let newArr = [];

            for(let lang of LANG){
                  let {status, statusText, data} = await axios.get(process.env.CARD_WAREHOUSE + 'rarities/all/' + lang, axiosOptions);
                  if(status >= 200 && status < 400 && statusText === 'OK'){
                        for(let elmt of data){
                              elmt.lang = lang
                        }
                  }else{
                        throw new Error({
                              response: {
                                    status,
                                    statusText
                              }
                        })
                  }
                  datas =  [...datas, ...data];
            }
            return {
                  code: 200,
                  message: datas
            };   
      } catch (error) {
            const {status, statusText} = error.response;
            return {
                  code: status,
                  message: statusText
            }
      }
}

async function getKingdomsList(){
      try {
            let datas = [];
            let newArr = [];

            for(let lang of LANG){
                  let {status, statusText, data} = await axios.get(process.env.CARD_WAREHOUSE + 'kingdoms/all/' + lang, axiosOptions);
                  if(status >= 200 && status < 400 && statusText === 'OK'){
                        for(let elmt of data){
                              elmt.lang = lang
                        }
                  }else{
                        throw new Error({
                              response: {
                                    status,
                                    statusText
                              }
                        })
                  }
                  datas =  [...datas, ...data];
            }
            return {
                  code: 200,
                  message: datas
            };   
      } catch (error) {
            const {status, statusText} = error.response;
            return {
                  code: status,
                  message: statusText
            }
      }
}

async function getExtensionsList(){
      try {
            let datas = [];
            let newArr = [];

            for(let lang of LANG){
                  let {status, statusText, data} = await axios.get(process.env.CARD_WAREHOUSE + 'extensions/all/' + lang, axiosOptions);
                  if(status >= 200 && status < 400 && statusText === 'OK'){
                        for(let elmt of data){
                              elmt.lang = lang
                        }
                  }else{
                        throw new Error({
                              response: {
                                    status,
                                    statusText
                              }
                        })
                  }
                  datas =  [...datas, ...data];
            }
            return {
                  code: 200,
                  message: datas
            };   
      } catch (error) {
            const {status, statusText} = error.response;
            return {
                  code: status,
                  message: statusText
            }
      }
}

async function getCardsList(){
      try {
            let lang_id = 0;
            let datas = new Map();
            let mapIdByType = new Map();
            let ids = [];
            let newArr = [];
            let pageMax = 0;

            for(let lang of LANG){
                  lang_id = LANG_MAP[lang];

                  //get the counter of total cards in order to calculate the number of page
                  let {
                        status, 
                        statusText, 
                        data
                  } = await axios.get(`\n
                        ${process.env.CARD_WAREHOUSE}cards/all/${lang}?\n
                        types=[${TYPES.join()}]&page=1&card_count=1`, axiosOptions
                  );

                  if(status >= 200 && status < 400 && statusText === 'OK'){
                        pageMax = Math.ceil(data[0] / MAX);
                        if(pageMax === 0){
                              return;
                        }

                        mapIdByType = await getCardsListPerType(1, MAX, lang, TYPES);

                        for(let currentPage = 1; currentPage <= pageMax; currentPage++){
                              
                              //get the nb_max_per_deck
                              let responseOne = await axios.get(`\n
                                    ${process.env.CARD_WAREHOUSE}cards/all/${lang}?\n
                                    types=[${TYPES.join()}]&page=${currentPage}&card_count=${MAX}`, axiosOptions
                              );

                              //get the datas from the multiple route
                              if(responseOne.status >= 200 && responseOne.status < 400 && responseOne.statusText === 'OK'){
                                    responseOne.data[1].map(elmt => datas.set(Number(elmt.id), {nb_max_per_deck: elmt.nb_max_per_deck}));
                                    ids = Array.from(datas.keys());
                                    let responseTwo = await axios.get(`${process.env.CARD_WAREHOUSE}cards/${lang}/multiple?a=[${ids.join()}]`, axiosOptions);
                  
                                    if(responseTwo.status >= 200 && responseTwo.status < 400 && responseTwo.statusText === 'OK'){
                                          responseTwo.data.map(elmt => {
                                                let newValue = datas.get(elmt.id);
                                                newValue.type_name = elmt.type;
                                                newValue.card_name = elmt.name;
                                                newValue.image_path = elmt.image_path;
                                                newValue.lang_id = lang_id;
                                                newValue.extension_id = elmt.extension_id;
                                                newValue.extension_name = elmt.extension_name;
                                                newValue.kingdom_id = elmt.kingdom_id;
                                                newValue.kingdom_name = elmt.kingdom_name;
                                                newValue.raritie_id = elmt.raritie_id;
                                                newValue.raritie_name = elmt.raritie_name;
                                                newValue.capacities = elmt.capacities;
                                                newValue.classes = elmt.classes;
                                                newValue.ec_cost = elmt.heavenly_energy; 
                                                return datas.set(elmt.id, newValue);
                                          })              
                                    }
                              }
                        }
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

module.exports = {
      getTypesList,
      getRaritiesList,
      getKingdomsList,
      getExtensionsList,
      getCardsList
};