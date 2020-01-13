(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=[];
    v=['initialize','identify','updateOptions','pageLoad'];for(w=0,x=v.length;w<x;++w)(function(m){
        o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
        y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
        z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');

        // Call this whenever information about your visitors becomes available
        // Please use Strings, Numbers, or Bools for value types.
        window.console.log(typeof(Meteor) != "undefined")
        if(typeof(Meteor) != "undefined"){
            pendo.initialize({
                visitor: {
                    id:              Meteor.userId(),  // Required if user is logged in
                    email:           Meteor.user().emails[0].address,  // Optional
                    roles:           JSON.stringify(Meteor.user().roles), // Optional
                    username:		 Meteor.user().username,
		    full_name:       Meteor.user().name,
		    tags:            [Meteor.user().roles, Meteor.user().settings.preferences.sidebarSortby]
                    // You can add any additional visitor level key-values here,
                    // as long as it's not one of the above reserved names.
                }
            });
        }
})('ecb0e9b8-105a-45ed-704c-6993b9813824');
