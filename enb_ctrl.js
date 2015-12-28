module.exports = require('enb/lib/build-flow').create()
    .name('enb-ctrl')
    .target('target', '?.bemjson.js')
    .defineRequiredOption('fn')
    .useSourceText('source','?.json')
    .builder(function(sourceText){
      return '('+JSON.stringify(this._fn(JSON.parse(sourceText)))+')';
    })
    .createTech();
