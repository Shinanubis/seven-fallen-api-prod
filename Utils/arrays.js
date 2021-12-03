function includes_all(array1, array2){
    if(array1.length > array2.length){
        return array1.every(v => array2.includes(v));
    }

    return array2.every(v => array1.includes(v));
}

function includes_all_src(src, target){
    if(src.length === 0){
        return true;
    }
    return src.every(v => target.includes(v));
}

function differences(src, target){
    return target.filter(elmt => src.indexOf(elmt) === -1);
}

function includes_some(array1, array2){
    return array2.some(v => array1.includes(v));
}


module.exports = {
    differences,
    includes_all,
    includes_all_src,
    includes_some
}