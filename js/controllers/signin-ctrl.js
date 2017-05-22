app.controller('SigninCtrl', function($http, $state, WEBSERVICE) {

    var signin = this;

    signin.user = {};
    signin.pswd = {};
    signin.check = {};

    signin.addUser = function() {
        var test = true;
        for(var i in signin.check) {
            if(signin.check[i] === false) {
                console.log(i);
                test = false;
                break;
            }
        }

        if(test) {
            if(!signin.user.roles) {
                signin.user.roles = ["citizen"];
            }
            signin.loadIcon = true;
            $http({
                method: 'POST',
                url: WEBSERVICE.apiUrl + 'users',
                data: signin.user
            }).then(function() {
                signin.loadIcon = false;
                signin.message = "Votre inscription s'est exécutée avec succès";
            }).catch(function(error) {
                signin.loadIcon = false;
                signin.error = "Impossible de vous inscrire. Error:" + error;
            })
        } else {
            signin.error = "Tous les champs obligatoires ne sont pas remplis correctement.";
        } 
    }

    signin.checkLastname = function(lastname) {
        signin.check.lastname = (lastname.length >= 2 && lastname.length <= 25 ? true : false);
    }

    signin.checkFirstname = function(firstname) {
        signin.check.firstname = (firstname.length >= 2 && firstname.length <= 25 ? true : false);
    }

    /*signin.checkEmail = function(email) {
        var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        signin.check.email = re.test(email);
    }*/

    signin.checkPhone = function(phone) {
        phone = phone.replace(/\s/g, '');
        var re = /^(([+41][0-9]{11})|([0-9]{10}))$/i;
        if(re.test(phone)) {
            signin.check.email = true;
            var l = phone.length; console.log(l);
            signin.user.phone = (l == 12 
                                ? [phone.slice(0,l-9),phone.slice(l-9,l-7),phone.slice(l-7,l-4),phone.slice(l-4,l-2),phone.slice(l-2,l)].join(' ')
                                : [phone.slice(0,l-7),phone.slice(l-7,l-4),phone.slice(l-4,l-2),phone.slice(l-2,l)].join(' '));
        } else {
            signin.check.email = false;
        }
    }

    signin.checkName = function(username) {
        var re = /^[a-z0-9\-]{2,25}$/i;
        signin.check.username = re.test(username);
    }

    signin.checkPswd = function(pswd1, pswd2) {
        signin.check.pswd1 = (pswd1.length >= 4 ? true : false);
        signin.check.pswd2 = (pswd1 == pswd2 ? true : false);
    }

    signin.cancel = function() {
        signin.user = {};
        signin.pswd = {};
        signin.check = {};
        signin.loadIcon = false;
    }


});