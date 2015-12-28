modules.require("jquery",function($){
  function lazyLoad()
  {
    var data=this.onclick();
    if (data && data.media){
    $el=$(this);
    data=data.media;
    if (this.getClientRects()[0].top<(window.innerHeight+window.pageYOffset)){
      $el.prop("src",data["src"]).removeClass("media_wait_load");
    }else{
      return false;
    }
    }
  }
  $(window).on("scroll",function(){
    $(".media_wait_load").each(lazyLoad);
  });
  $(".media_wait_load").each(lazyLoad);
});
