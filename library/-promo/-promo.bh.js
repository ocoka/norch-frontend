var u=require('util');
module.exports = function(bh) {
    //bh.enableInfiniteLoopDetection(true);
    var it=1;
    bh.match('-promo__link', function(ctx, json) {

      it=it%4+1;
      json.splitLength=json.splitLength?json.splitLength:4;
      json.centerDeg=json.centerDeg?json.centerDeg:0;
      json.sizeKo=json.sizeKo?json.sizeKo:10;
      json.deg=json.deg?json.deg:20;
      ctx.mod("color",it.toString());
      ctx.tag('a');
      ctx.attr('href',json.href);
      var len=(json.content.length/json.splitLength)|0;
      var parts=[];
      var center=len%2>0?len/2+1|0:len/2+0.5;
      var oneDeg=json.deg/len;

      do{
        var offset=0;
        var curDeg=0;
        var cnt=null;
        if (parts.length==(len-1)){
          cnt=json.content.slice(parts.length*json.splitLength,json.content.length);
        }else{
          cnt=json.content.slice(parts.length*json.splitLength,parts.length*json.splitLength+json.splitLength);
        }
        if ((parts.length+1)==center){
          curDeg=json.centerDeg;
        }
        else{
          curDeg=(oneDeg*((parts.length+1)-center))|0;
          offset=
            Math.sin(
              Math.abs(curDeg%90)/180*Math.PI
              )*json.sizeKo;
        }

        cnt=cnt.replace(' ','&nbsp;');
        parts.push({elem:'link-c',tag:"span",attrs:{style:'display:inline-block;position:relative;transform:rotate('+curDeg+'deg)'},content:cnt,'offset':offset});
      }while(len>parts.length)
      var preoffset=0;
      for(var i=center;i<parts.length;i++){
        var t=i|0;
        parts[t].attrs.style+=";top:"+(parts[t].offset+preoffset*2)+"px";
        parts[Math.ceil(2*center-2-i)|0].attrs.style+=";top:"+(parts[t].offset+preoffset*2)+"px";
        preoffset+=parts[t].offset;

      }
      ctx.content(parts,true);

});

    bh.match('-promo',function(ctx,json){

      var rst=[];

      if (json.media){
        if (json.info){
          rst.push({elem:"wrap",content:[
            {block:"media",mix:{block:"-promo",elem:"media"},src:json.media},
            {elem:"info",content:json.info}
          ]});
        }else{
          rst.push({elem:"wrap",content:[
            {block:"media",mix:{block:"-promo",elem:"media"},src:json.media}
          ]});
        }
      }else{
        if (json.info){
          rst.push({elem:"info",content:json.info});
        }
      }

      if (json.link){
        rst.push(u._extend({elem:"link"},json.link));
      }
      ctx.content(
        {elem:"glob-wrap",content:rst}
        );
    });
};
