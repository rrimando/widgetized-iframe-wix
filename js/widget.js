console.log('Loaded Widget JS')

$(document).ready(function () {
    var control = $('.door-control'),
        authToken = false,
        authUrl = false,
        authValidUrl = false,
        apiUrl = false,
        headers = {
            'Authentication': authToken
        },
        getAjax = function (url) {
            if (authToken) {
                // Headers contain the authentication
                return $.ajax({ url: url, dataType: 'json', headers: headers });
            } else {
                console.log('You are not authenticated yet');
            }
        },
        getToken = function () {
            if (authUrl) {
                getAjax(authUrl);
            } else {
                return true // In test mode
            }
        },
        checkAuthStatus = function () {
            if (authValidUrl) {
                var authValid = getAjax(authValidUrl);
                if (authValid == false) {
                    authenticate();
                }
            } else {
                return true // In test mode
            }
        },
        authenticate = function () {
            token = getToken();
        },
        openDoor = function (door_id, html_element) {
            console.log(`Opening with ID:${door_id}`);

            /* HTML Manipulation Here */
            $(html_element).text('Open').removeClass('bg-danger').addClass('bg-success');
            $(html_element).attr('data-status', 'open');

            if (apiUrl) {
                /* Actual API Call To Close and Open Doors */
                return getAjax(apiUrl, { 'door_id': door_id });
            } else {
                return true; // In test mode
            }
        },
        closeDoor = function (door_id, html_element) {
            console.log(`Closing with ID:${door_id}`);

            /* HTML Manipulation Here */
            $(html_element).text('Close').removeClass('bg-danger').addClass('bg-danger');
            $(html_element).attr('data-status', 'closed');

            if (apiUrl) {
                /* Actual API Call To Close and Open Doors */
                return getAjax(apiUrl, { 'door_id': door_id });
            } else {
                return true; // In test mode
            }
        };


    /* Authenticate */
    authenticate();

    /* Check Authentication Periodically (5 Secs) */
    setTimeout(checkAuthStatus(), 5000);

    /* Bind Controls */
    control.on('click', function () {

        console.log('Door control click');

        // Check door status
        var element = $(this),
            status = element.attr('data-status'),
            door_id = element.attr('data-door-id');


        if (status == 'closed') {
            openDoor(door_id, element);
        } else {
            closeDoor(door_id, element);
        }

    });

});

