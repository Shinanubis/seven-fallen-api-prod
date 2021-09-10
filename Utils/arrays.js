function includes_all(array1, array2){
    return array2.every(v => array1.includes(v));
}

function includes_some(array1, array2){
    return array2.some(v => array1.includes(v));
}


module.exports = {
    includes_all,
    includes_some
}