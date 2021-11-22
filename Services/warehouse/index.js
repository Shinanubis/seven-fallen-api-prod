const {LANG, TYPES} = require('../../constantes/typesByCategory');
const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

const axiosOptions = {
      headers: {
            'Authorization': process.env.CARD_WAREHOUSE_TOKEN
      }
};

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
            let datas = [];
            let newArr = [];

            for(let lang of LANG){
                  let {status, statusText, data} = await axios.get(`${process.env.CARD_WAREHOUSE}cards/all/${lang}?types=[${TYPES.join()}]`, axiosOptions);
                  console.log(data)
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

async function getCardsByType(uri){
      let response = await axios.get(process.env.CARD_WAREHOUSE + uri, axiosOptions);
      return response;
}

module.exports = {
      getCardsByType,
      getTypesList,
      getRaritiesList,
      getKingdomsList,
      getExtensionsList,
      getCardsList
};