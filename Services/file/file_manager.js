const fs = require("fs");

const copyFile = async function(filename,buffer) {
    try{
        let splittedPath = filename.split('/');
        let beginning = splittedPath.pop().split('-');
        beginning.pop();
        let newFileName = splittedPath.join('/');
        let newBeginning = beginning.join('-');
        await fs.readdir(newFileName, function(err, files){
            if(err) throw {message: "Unable to scan directory " + err};
            files.forEach(function(file){
                if(file.startsWith(newBeginning)){
                    fs.unlink(newFileName + "/" + file, function(err){
                        if(err) throw err;
                        console.log(`${filename} deleted`)
                    })
                }
            })
        })
        await fs.writeFile(filename, buffer, (err) => {
            if(err) throw err;
            console.log('file saved');
        })

    }catch(e){
        console.log(e)
        return e;
    }
} 

module.exports = {
    copyFile
}