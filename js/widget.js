console.log('Loaded Widget JS')

$(document).ready(function () {
    var iframe_url = window.location.href,
        url = new URL(iframe_url);
    doorID = url.searchParams.get("id");
    control = $('.door-control'),
        apiProtocol = 'http',
        apiServer = 'localhost:8080',
        apiEndPoint = 'api',
        apiUrl = `${apiProtocol}://${apiServer}/${apiEndPoint}`,
        authUrl = `${apiUrl}/v1/authorization/tokens`,
        doorApiUri = `${apiUrl}/v1/doors/`,
        ioBoardsApiUri = `${apiUrl}/v1/ioboards/5/inputs`, /* Board ID is Hardcoded */
        /* AUTHENTICATION DATA */
        username = '',
        password = '',
        grant_type = '',
        client_id = '',
        authToken = '',
        refreshToken = '',
        getAjax = function (url, type, data) {
            // Headers contain the authentication
            $.ajax({
                url: url, data, type: type, dataType: 'json', beforeSend: function (xhr) {
                    if (authToken) {
                        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
                    }
                },
                success: function (data) {
                    var json = $.parseJSON(data);
                    return json;
                },
                error: function (data) {
                    var json = $.parseJSON(data);
                    alert(json.error);
                }
            })
        },
        getToken = function () {
            var data = {
                'username': username,
                'password': password,
                'grant_type': grant_type,
                'client_id': client_id,
            }
            if (authUrl) {
                var response = getAjax(authUrl, 'POST', data);
                authToken = response['access_token'];
                refreshToken = response['refresh_token']
            } else {
                return true // In test mode if url is false
            }
        },
        refreshToken = function () {
            var data = {
                'refresh_token': refreshToken,
                'grant_type': 'refresh_token'
            }

            if (authValidUrl) {
                var authValid = getAjax(authUrl, 'POST', data);
                if (authValid == false) {
                    authenticate();
                }
            } else {
                return true // In test mode if url is false
            }
        },
        authenticate = function () {
            token = getToken();
        },
        checkDoorStatus = function (board_id, html_element) {
            console.log(`Checking IO Statis ID:${board_id}`);

            var data = {
                'inputID': '17',
            }

            if (ioBoardsApiUri) {
                /* Actual API Call to check board status */
                var response = getAjax(ioBoardsApiUri, 'GET', data);
                if (response['isPressed']) {
                    /* Indicate that the door is open */
                    $(html_element).text('Open').removeClass('bg-danger').addClass('bg-success');
                    $(html_element).attr('data-status', 'open');
                } else {
                    /* Indicate that the door is closed */
                    $(html_element).text('Close').removeClass('bg-danger').addClass('bg-danger');
                    $(html_element).attr('data-status', 'closed');
                }
            } else {
                return true; // In test mode if url is false
            }
        },
        openDoor = function (door_id, html_element) {
            console.log(`Opening with ID:${door_id}`);

            /* HTML Manipulation Here */
            $(html_element).text('Open').removeClass('bg-danger').addClass('bg-success');
            $(html_element).attr('data-status', 'open');

            var data = {
                'id': door_id
            }

            if (doorApiUri) {
                /* Actual API Call To Close and Open Doors */
                return getAjax(doorApiUri, 'GET', data);
            } else {
                return true; // In test mode if url is false
            }
        },
        closeDoor = function (door_id, html_element) {
            console.log(`Closing with ID:${door_id}`);

            /* HTML Manipulation Here */
            $(html_element).text('Close').removeClass('bg-danger').addClass('bg-danger');
            $(html_element).attr('data-status', 'closed');

            var data = {
                'id': door_id
            }

            if (doorApiUri) {
                /* Actual API Call To Close and Open Doors */
                return getAjax(doorApiUri, 'GET', data);
            } else {
                return true; // In test mode
            }
        };

    /* Set the door id on control */
    control.attr('data-door-id', doorID);

    /* Authenticate */
    authenticate();

    /* Check Authentication Periodically (30 Secs) */
    setTimeout(refreshToken(), 30000);

    /* Check Board IO Status Periodically (1 Secs) */
    setTimeout(checkDoorStatus(), 1000);

    /* Bind Controls */
    control.on('click', function () {

        console.log('Door control click');

        // Check door status
        var element = $(this),
            status = element.attr('data-status'),
            door_id = element.attr('data-door-id'); // alernatively doorID

        if (status == 'closed') {
            openDoor(door_id, element);
        } else {
            closeDoor(door_id, element);
        }

    });

});

