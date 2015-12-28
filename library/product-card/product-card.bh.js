module.exports = function(bh) {
bh.match('product-card', function(ctx, json) {
    ctx
        .tag('p')
        .attr("flex",true)
        .cls("md-whiteframe-z1");
      });
};
