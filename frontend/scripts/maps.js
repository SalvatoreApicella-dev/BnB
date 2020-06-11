var map;

function initMap() {
    map = new google.maps.Map($('#map')[0], { zoom: 12 });
}

function geocodeApartments() {
    let address;
    let geocoder = new google.maps.Geocoder();

    address = $("#search-location").text();

    geocoder.geocode( {address: address}, function(results, status) {
        map.setCenter(results[0].geometry.location);
    });

    $(".apartment-preview").each(function(index, element) {
        let marker;
        geocoder.geocode( {address: $(element).find(".apartment-fulladdress")[0].innerText}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          if(marker)
            marker.setMap(null);
          marker = new google.maps.Marker({
              animation: google.maps.Animation.DROP,
              icon: "/images/marker.png",
              map: map,
              position: results[0].geometry.location,
              label: {
                fontWeight: 'bold',
                text: $(element).find(".apartment-price")[0].innerText,
              } 
          });
        }
      }); 
    });
}

$(document).ready(function() {

    
});