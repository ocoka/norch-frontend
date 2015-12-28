/**
*Returns property value on type
*@param {object} el
*@return {string}
*/
function getPropValue(el) {
  var val = null;
  if (el.type != null && el.value!=null) {

    switch (el.type) {
      case 'link':
          if(Array.isArray(el.value)){
            val=el.value.reduce(function(o,i){
              if (i!=null && i.id!=null) o.push(i.id);
              return o;
            }, []);
          }else{
            val = el.value['id'];
          }
        break;
      case 'directory':
        val = el.value['uf_xml_id'];
        break;
      default:
        val = el.value;
        break;
    }
    if (Array.isArray(val)) {
      val = val.filter(function(elt) {
        return elt != null
      });
      if (val.length < 1) {
        val = null;
      }
    }

  }
  return val;
}
/*
*To store already handled object's accord to file number
*/
var seen = new Map();
/*
*To store array of object's that ready for save
*/
var fileSet = [[]];
/*
*To store link elements and write it to a file
*/
var linkStorage={};
var rq = require('request');
var fs = require('fs');
var fh=require('farmhash');
var util=require('util');
/*
*Property ID that defines SKU-PRODUCT link
*/
var skuLinkID = 240;
/*
*Properties to exclude from final object
*/
var prop2Exclude = [225, 226, 227, 237, 243, 245, 271, 273, 274, 275, 303, 304, 312, 313];
/*
* sku's properties, their combination defines the price
*/
var skuProps = [277];
/*
* final object that goes to fileSet
*/
var outObj = {};
if (!fs.existsSync('./data_flat')) {
  fs.mkdirSync('./data_flat');
}
var dirs = fs.readdirSync('./data2');
dirs.sort();
dirs.forEach(function(dir) {
  try {
    var json = fs.readFileSync('./data2/' + dir + '/' + dir + '.json', 'utf8');
    var obj = JSON.parse(json);
    var allPropsIds=Object.keys(obj.props);
    //By now obj is a structure to handle
    if (
      obj &&
      obj.props!=null &&
      skuProps.every(function(el){
        return allPropsIds.indexOf(el.toString())>-1
        }) &&
      allPropsIds.indexOf(skuLinkID.toString())>-1
      ) {
      //If we pass that condition we can handle this object
      obj.sections = []; //All sections where the product was seen
      obj.group_text = "";
      obj.group_text_detail = "";
        for (var i in obj.props) {
          var el=obj.props[i];
          if (prop2Exclude.indexOf(el.id) > -1) {
            delete obj.props[i];//Remove unwanted properties
          }
          else
          {
            if (el.id == skuLinkID) { //It's group/product/parent object so grab props from him
              obj.id=el.value.id;//Final ID is a combination of parent ID and color value hash, see bellow
              obj.group_text = el.value.text;
              obj.group_text_detail = el.value.text_detail;
              if (el.value.sections != null) {
                obj.sections = el.value.sections.reduce(function(obj_s, el_s) {
                  //Reduction is a fastest method to make object a flat string and fill out array by that string's
                  obj_s.push(el_s.name);
                  return obj_s;
                }, []);//Begin from empty array, on each iteration add value to it
              }
              delete obj.props[i];
            }
            else
            {
              var val = getPropValue(el,skuLinkID,obj);
              var propName = 'prop_' + el['id'];
              if (val != null) {
                obj[propName] = val;
                if (el.type=='link'){
                  putLinks(el);
                  delete obj.props[i];
                }
              }
              else
              {
                delete obj.props[i];
              }
            }
          }
        }

      if (obj.prices != null) {
        obj.price = parseInt(obj.prices["3"]);
        obj.old_price = parseInt(obj.prices["4"]);
      }
      delete obj.prices;
      /*Make sku object
      {
        sku_prop1_id:value,
        sku_prop2_id:value,
        price:price
      }
      */
      var sku={};
      skuProps.forEach(function(sp){
        sku[sp]=obj['prop_'+sp];
        obj['prop_'+sp]=[obj['prop_'+sp]];
        delete obj.props[sp];
      });
      sku.price=obj.price;
      obj.sku=[sku];
      obj.id+="_"+fh.fingerprint32(obj.prop_276)//FINAL IDENTIFIER
      if (outObj == null || outObj.id!=obj.id){
        if (outObj==null){
          outObj=obj;
        }
        else
        {
          var fileSetCursor=fileSet.length-1;
          if (seen.has(obj.id)) {
            //Oops we already handle this groups of sku, it's orphans
            var fnum=seen.get(obj.id);
            console.log("== Already saw "+obj.id+" in file "+fnum+".json, now we work on "+fileSetCursor);
            if (fileSet[fnum].length<1){
              console.log("== Unfortunately file was flushed. Try to refill");
              fileSet[fnum]=JSON.parse(fs.readFileSync('./data_flat/' + fnum + '.json', "utf8"));
              console.log("== File loaded");
            }
            console.log("== Looking for object...");
            fileSet[fnum].forEach(function(el){
              if (el.id==obj.id){
                console.log("== Object found. Append new data.");
                skuProps.forEach(function(sp){
                  el['prop_'+sp].concat(obj['prop_'+sp]);
                });
                el.sku.concat(obj.sku);
              }
            });
          }
          else{
            seen.set(outObj.id,fileSetCursor);
            fileSet[fileSetCursor].push(outObj);
            outObj=obj;
            if (fileSet[fileSetCursor].length>50) {
              fs.writeFileSync('./data_flat/' + fileSetCursor + '.json', JSON.stringify(fileSet[fileSetCursor]), {
                encoding: 'utf8',
                flag: 'w'
              });
              fileSet[fileSetCursor] = [];
              fileSet.push([]);
            }
          }
        }
      }
      else
      {
        //Concatenate to existing product, diff only in sku
        skuProps.forEach(function(sp){
          outObj['prop_'+sp].concat(obj['prop_'+sp]);
        });
        outObj.sku.concat(obj.sku);
      }
    }
  } catch (e) {
    console.error(e.stack);
    console.log(util.inspect(obj,{depth:4,colors:true}));
    console.log(util.inspect(linkStorage,{depth:4,colors:true}));
    process.exit(1);
  }

});
fileSet.forEach(
  function(el,i){
    if (el.length>0){
      console.log("== Overwriting refilled data set for file "+i+".json");
      fs.writeFileSync('./data_flat/' + i + '.json', JSON.stringify(el), {
        encoding: 'utf8',
        flag: 'w'
      });
    }
  }
);
for (i in linkStorage){
  if (!fs.existsSync('./pages/links/'+i)) {
    fs.mkdirSync('./pages/links/'+i);
  }
  fs.writeFileSync('./pages/links/'+i+'/'+i+'.json', JSON.stringify(linkStorage[i]), {
    encoding: 'utf8',
    flag: 'w'
  });
}


function putLinks(ln){
  if (ln.type!="link") return false;
  if (Array.isArray(ln.value)) {
    ln.value = ln.value.filter(function(elt) {
      return elt != null
    });
    if (ln.value.length < 1) {
      ln.value=null;
    }
  }else{
    if (ln.value!=null) ln.value=[ln.value];
  }
  if (ln.value==null) return false;
  if (linkStorage[ln.id]==null){
    ln.value=ln.value.reduce(function(o,i){
      o[i['id']]=i;
      return o;
    },{});
    linkStorage[ln.id]=ln;
  }else{
    var link=linkStorage[ln.id];
    link.value=ln.value.reduce(function(o,i){
      if (o[i['id']]!=null){
        o[i['id']].count+=1;
      }else{
        i.count=1;
        o[i['id']]=i;
      }
      return o;
    },link.value);
  }

  return true;
}
