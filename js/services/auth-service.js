app.factory('AuthService', 
    function(store) {

    var service = {

        token: store.get('auth-token'),
        userId: store.get('user-id'),

        setToken: function(token) {
            service.token = token;
            store.set('auth-token', token);
        },
        
        unsetToken: function() {
            service.token = null;
            store.remove('auth-token');
        },

        setUserId: function(id) {
            service.userId = id;
            store.set('user-id', id);
        }
    };
    return service;
});