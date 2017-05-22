app.controller('HelpCtrl', ['HelpService', function(HelpService) {
    help = this;

    help.closeModal = function() {
        HelpService.modalInstance.close();
    }
}])