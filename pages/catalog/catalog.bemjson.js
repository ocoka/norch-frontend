(
{block:"page",
    styles:[
      {elem:'css',url:"/nm/angular-material/angular-material.css"},
      {elem:'css',url:"catalog.css"}
    ],
     scripts:[
       {elem:"js",url:"/nm/angular/angular.js"},
       {elem:"js",url:"/nm/angular-animate/angular-animate.js"},
       {elem:"js",url:"/nm/angular-aria/angular-aria.js"},
       {elem:"js",url:"/nm/angular-material/angular-material.js"},
       {elem:"js",url:"catalog.js"}
       ],
     content:[
       {block:"layout",
       attrs:{layout:"row","layout-align":"space-around center"},
       content:[{block:"product-card"}]}
     ]}
)