module.exports = function CustomsErrors(e) {
    console.log(e)
    switch (e.code) {
        case '22P02':
            return {
                code: 403,
                message: "Forbidden"
            };
        case '42703':
            return {
                code: 403,
                message: "Forbidden"
            };
        case '23505':
            return {
                code: 409,
                message: `${e.field} already exists`
            };

        case '02000':
            return {
                code: 404,
                message: "Not Found"
            };
        default:
            return {
                code: 500,
                message: "Internal Error"
            };
    }
}