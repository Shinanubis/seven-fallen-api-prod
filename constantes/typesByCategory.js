const EDEN = [1,2,3,11];
const HOLYBOOK = [4, 5, 6, 9, 12];
const REGISTER = [8];
const TYPES = [...EDEN, ...HOLYBOOK, ...REGISTER]
const LANG = ['FR', 'EN'];
const TYPE_LIST = ['kingdoms', 'extensions', 'rarities', 'types'];
const TYPE_LIST_NAME_REQUIRE = ['capacities', 'name', 'classes'];

module.exports = {
    EDEN,
    REGISTER,
    HOLYBOOK,
    TYPES,
    LANG,
    TYPE_LIST,
    TYPE_LIST_NAME_REQUIRE
}