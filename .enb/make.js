var techs=require("enb-bem-techs"),
    provide = require('enb/techs/file-provider');
var bh_html=require('enb-bh/techs/bemjson-to-html');
var enb_bh=require('enb-bh/techs/bh-commonjs');
var borschik=require('enb-borschik/techs/borschik');
var js=require("enb/techs/js");
var stylus=require('enb-stylus/techs/css-stylus');
var ymodules=require('enb-modules/techs/prepend-modules');
var enbCtrl=require('../enb_ctrl.js');
/**
 * @param {ProjectConfig} config
 */
module.exports = function(config) {
  config.nodes("pages/catalog",

      function(nodeConfig)
      {
          nodeConfig.addTechs([
            [techs.levels,{"levels":[{path:"library",check:true}]}],
            [provide, { target: '?.bemjson.js' }],
            [techs.bemjsonToBemdecl],
            [techs.deps],
            [techs.files],
            [enb_bh,{jsCls:false,jsAttrName:"onclick",jsAttrScheme:"js"}],
            [bh_html],
            [js,{target:"?.pre.js"}],
            [ymodules,{source:"?.pre.js"}],
            [borschik, {
                sourceTarget: '?.js',
                destTarget: '_?.js'}],
            [stylus]
          ]);
          nodeConfig.addTargets(["_?.js", "?.css","?.html"]);
      }
  );

    config.nodes("pages/links/*",

        function(nodeConfig)
        {
            nodeConfig.addTechs([
                [techs.levels,{"levels":[{path:"library",check:true}]}],
                [provide, { target: '?.json' }],
                [enbCtrl,{fn:prodCard}],
                [techs.bemjsonToBemdecl],
                [techs.deps],
                [techs.files],
                [enb_bh,{jsCls:false,jsAttrName:"onclick",jsAttrScheme:"js"}],
                [bh_html]
            ]);
            nodeConfig.addTarget("?.html");
        }
    );

    config.node("pages/links",function(nodeConfig){
      nodeConfig.addTechs([
          [techs.levels,{"levels":[{path:"library",check:true}]}],
          [provide, { target: '?.bemdecl.js' }],
          [techs.deps],
          [techs.files],
          [enb_bh,{jsCls:false,jsAttrName:"onclick",jsAttrScheme:"js"}],
          [bh_html],
          [js,{target:"?.pre.js"}],
          [ymodules,{source:"?.pre.js"}],
          [borschik, {
              sourceTarget: '?.js',
              destTarget: '_?.js'}],
          [stylus]
        ]);

    nodeConfig.addTargets(["_?.js", "?.css"]);
  });
}

function prodCard(json){
  var predlozPlur=require('../library/base/base')(['предложение','предложения','предложений']);

  var bjson={block:"page",
      styles:[
          {elem:"css",url:"http://fonts.googleapis.com/css?family=Neucha&subset=latin,cyrillic"},
          {elem:"css",url:"../links.css"}
       ],
       scripts:[ {elem:"js",url:"../links.js"}],
       content:[]};
  if (json.value!=null){
    for (i in json.value){
      if (json.value[i]["image_detail"]!=null && json.value[i]['count']>0){
        bjson.content.push({
          block:"-promo",
          info:json.value[i]["text_detail"],
          media:"http://www.yatto.ru/upload/"+json.value[i]["image_detail"]["path"],
          link:{splitLength:2,deg:30,sizeKo:15,content:json.value[i]['count']+" "+predlozPlur.get(json.value[i]['count']),href:"/cat/"}
        });
      };

    }
  }

  return bjson;
}
