(function() {
    <%= result.contents %>
    if (typeof module !== 'undefined'  && module.exports) {
        module.exports = <%= result.title %>;
    } else if (typeof define == 'function' && define.amd) {
        define('<%= result.title %>', function() {
            return <%= result.title %>;
        })
    }
    this['<%= result.title %>'] = <%= result.title %>;
})()