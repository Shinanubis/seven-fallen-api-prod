module.exports = {
    regex_is_visible: /^(false|true){1,1}$/,
    regex_order: /^[A-Za-z_]+$/,
    regex_id: /^[1-9]{1}[0-9]{0,9}$/,
    regex_username: /^[a-zA-Z_\-#]{1}[a-zA-Z0-9_\-\s]{4,31}$/,
    regex_name:/^[a-zA-Z]{0,32}$/,
    regex_start_with: /^[a-zA-Z_\-#]{1}[a-zA-Z0-9_\-#]{0,31}$/,
    regex_gender: /^(M|F|other)$/,
    regex_email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    regex_cards: /([1-9]{1}[0-9]{0,4}:[1-9]{1}[0-9]{0,4},{0,1})+/,
    regex_qty: /^[1-9]{1}[0-9]{0,1}$/,
    regex_kingdoms: /^([1-7]{1,1},{0,1}){0,7}[^,]$/,
    regex_page: /^[1-9]{1}[0-9]{0,5}$/,
    regex_page_size: /^[1-9]{1}[0-9]{0,5}$/,
    regex_img: /^([A-Za-z]{3,16}(-[1-9]{1,8}){0,1}(\.jpg|\.svg){1,1}){1,1}$/,
    regex_deck_name: /^[A-Za-z0-9_\-#]{4}[A-Za-z0-9_\-#\s]{0,26}$/,
    regex_description : /^[A-Za-z0-9,;:!?_\-#\s]{0,255}$/
}