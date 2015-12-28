module.exports=function(bh){
    bh.match("media",function(ctx,json){
      ctx.tag("img");
      ctx.mod("wait","load");
      ctx.js({"src":json["src"]});
    });
  };
