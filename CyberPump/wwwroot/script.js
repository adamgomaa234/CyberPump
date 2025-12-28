$(document).ready(function () {

    // ==========================================
    // 1. INITIAL SETUP
    // ==========================================
    if ($('.card-container').length) {
        loadGyms();
    }

    // ==========================================
    // 2. CITY BUTTONS
    // ==========================================
    $('.cities').click(function () {
        // Visual Style
        $('.cities').css({ 'background-color': '', 'color': '' });
        $(this).css({ 'background-color': 'blue', 'color': 'white' });

        // Data Fetching
        var cityFilter = $(this).text();
        loadGyms(cityFilter);
    });

    // ==========================================
    // 3. FETCH & DISPLAY GYMS
    // ==========================================
    function loadGyms(cityFilter) {
        var $container = $('.card-container');

        // FIXED: Correct endpoint format
        var url = '/api/gym';
        if (cityFilter && cityFilter !== 'All') {
            url = '/api/gym/city/' + encodeURIComponent(cityFilter);
        }

        // jQuery AJAX call
        $.get(url, function (gyms) {

            // Clear container
            $container.empty();

            // Check if no gyms found
            if (gyms.length === 0) {
                $container.html('<p style="text-align:center; color:white; padding:40px;">No gyms found in this city.</p>');
                return;
            }

            // Loop through results
            $.each(gyms, function (index, gym) {

                // Create Features List
                var $ul = $('<ul>').addClass('features');
                if (gym.features) {
                    var features = gym.features.split(',');
                    $.each(features, function (i, f) {
                        $('<li>').text(f.trim()).appendTo($ul);
                    });
                }

                // Create the Card
                var $card = $('<div>').addClass('card').append(

                    // Image Wrapper
                    $('<div>').addClass('image-wrapper').append(
                        $('<img>').attr('src', gym.imageUrl).attr('alt', gym.name),
                        $('<div>').addClass('rating').text('⭐ ' + gym.rating)
                    ),

                    // Content Section
                    $('<div>').addClass('class-content').append(
                        $('<h3>').text(gym.name),
                        $('<p>').addClass('location').text('📍 ' + gym.location),
                        $('<p>').addClass('timings').text('🕒 ' + gym.timings),
                        $('<p>').addClass('description').text(gym.description),
                        $ul, // Features list

                        // Footer
                        $('<div>').addClass('card-footer').append(
                            $('<span>').addClass('price').text('$' + gym.price + ' / month'),
                            $('<button>').addClass('subscribe-btn').text('Subscribe')
                        )
                    )
                );

                // Add to page
                $container.append($card);
            });

        }).fail(function (xhr, status, error) {
            console.error("Error loading gyms:", error);
            $container.html('<p style="text-align:center; color:red; padding:40px;">Error loading gyms. Make sure the server is running!</p>');
        });
    }

    // ==========================================
    // 4. POPUP LOGIC (Event Delegation)
    // ==========================================
    $(document).on('click', '.subscribe-btn', function () {
        $('#payment').css('display', 'flex');
    });

    // Close buttons
    $('#paybtn').click(function () {
        alert('Purchase completed');
        $('#payment').hide();
        $('#card-num').val('');
        $('#cvv').val('');
    });

    $('#cancelbtn').click(function () {
        $('#payment').hide();
        $('#card-num').val('');
        $('#cvv').val('');
    });

});