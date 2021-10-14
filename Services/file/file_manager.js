const fs = require("fs");

const copyFile = async function(filename,buffer) {
    try{
        await fs.writeFile(filename, buffer, (err) => {
            if(err) throw err;
            console.log('file saved');
        })
    }catch(e){
        return e;
    }
} 

module.exports = {
    copyFile
}