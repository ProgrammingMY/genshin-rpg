const variable = require('../variable.js');

module.exports = async function (traveller){
    var today = new Date;
    var last_used_resin_time = new Date(traveller.last_used_resin_time);
    var new_resin = Math.floor((today - last_used_resin_time) / (variable.RESIN_REFRESH_RATE));

    // update traveller data
    traveller.resin += new_resin;
    traveller.last_used_resin_time = new Date;

    // if overcapped
    if (traveller.resin > 300) traveller.resin = 300;

    return traveller;
}