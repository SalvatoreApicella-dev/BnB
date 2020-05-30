$(document).ready(function () {


    // Gestione del click sugli anchor 
    $("a").click(function() {

        let url = $(this).attr("href");

        if(url === undefined || url === null || url.startsWith("#"))
            return;

        else if(url == "signin") {
            $("#dialog").dialog();
            return;
        }
    });

    // Renderizza la preview dell'immagine profilo che si sta caricando
    $("#profileImage").change(function () {
        if (this.files && this.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $('#profilePicture').attr('src', e.target.result);
            }
            reader.readAsDataURL(this.files[0]);
        }
    });


    // Gestione alerts per il submit dei form
    $("#form-signin").submit(function(event) {

        $('#alertEmail').fadeOut();
        $('#alertPass').fadeOut();

        event.preventDefault(); 
        let form = $(this);

        $.ajax({
            type: $('input[name="_method"]').val(),
            url: form.attr('action'),
            data: form.serialize()
        }).done(function() {

            $('#alertSignInSuccess').fadeIn(2000).fadeOut(1000);
            setTimeout(() => { $('#signinModal').modal('hide'); }, 3000);
            setTimeout(() => { window.location.replace(window.location.pathname); }, 4000);

        }).fail(function(response) {

            if(response.responseJSON.message == "User not found")
                $('#alertEmail').fadeIn(1000);
            else if(response.responseJSON.message == "Password mismatch")
                $('#alertPass').fadeIn(1000);

        });
    });

    $("#repass").keyup(checkPasswordMatch);
});

$(window).on('load', function() {

    $(".guests-input").on('input', function() {

        let sum = 0;
        $(".guests-input").each(function() {
            sum += Number($(this).val());
        });

        if(sum == 0)
            $("#peopleDropdown").text("Aggiungi ospiti");
        else if(sum == 1)
            $("#peopleDropdown").text(`${sum} ospite`);
        else
            $("#peopleDropdown").text(`${sum} ospiti`);
    });

    // Validazione custom di Bootstrap
    $(".needs-validation").each(function() {

        let form = $(this);

        $(this).on('submit', function(event) {

            event.preventDefault();

            if (form[0].checkValidity() === false) 
                event.stopPropagation();
            else
            {
                $('#alertSignUpError').fadeOut();
 
                if(form[0].enctype == "multipart/form-data") {
                    var formData = new FormData($(this)[0]);

                    $.ajax({
                        url: form.attr('action'),
                        type: $('input[name="_method"]').val(),
                        data: formData,
                        cache: false,
                        contentType: false,
                        processData: false,
                        success: function(response) {
                            $('#alertSignUpSuccess').fadeIn(2000).fadeOut(1000);
                            setTimeout(() => { window.location.replace("/"); }, 3000)
                        },
                        error: function(response) {
                            $('#alertSignUpError').html(response.responseJSON.message);
                            $('#alertSignUpError').fadeIn(1000);
                        }
                    });
                }
                else {

                    $.ajax({
                        type: $('input[name="_method"]').val(),
                        url: form.attr('action'),
                        data: form.serialize(),
                        success: function() {
            
                            $('#alertSignUpSuccess').fadeIn(2000).fadeOut(1000);
                            setTimeout(() => { window.location.replace("/"); }, 3000);
                        },
                        error: function(response) {
            
                            $('#alertSignUpError').html(response.responseJSON.message);
                            $('#alertSignUpError').fadeIn(1000);
                
                        }
                    });
                }
            }
        
            form[0].classList.add('was-validated');
        });
    });

    /*
    ***
    *** Gestione delle query per l'autocompletamento
    ***
    */

    // Funzione che inietta un array in un HTMLElement
    function loadAutoComplete(data, HTMLElement) {        
        $(HTMLElement).autocomplete({ 
            maxResults: 10,
            source: function (request, response) {
            let matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex(request.term), "i" );
            let results = $.grep(data, function(item) { return matcher.test(item)});
            results = $.ui.autocomplete.filter(results, request.term);
            results = results.slice(0, this.options.maxResults);
            response($.grep(results, function(item){
                return matcher.test(item);
            }));
            }
        });
    }

    $("#country").ready(function() {
        $.getJSON("../data/countries.json", function(data) {
             // Utilizzo l'oggetto Set per ottenere un insieme di elementi distinti
            // La funziona map effettua la proiezione al campo che mi interessa
            // Lo ritrasformo in array per passarlo al controllo autocomplete
            let queryResult = Array.from(new Set(data.map(x => x.name)));
            queryResult.sort(); // Ordino l'array
            loadAutoComplete(queryResult, "#country"); // Richiamo la funzione che inietta il queryResult
        });
    });

    $("#province").ready(function() {
        $.getJSON("../data/comuni.json", function(data) {
           
            let queryResult = data.map(x => x.sigla);
            queryResult = Array.from(new Set(queryResult));
            queryResult.sort(); 
            loadAutoComplete(queryResult, "#province");
        });
    });

    $("#town").ready(function() {
        $.getJSON("../data/comuni.json", function(data) {
            let queryResult = Array.from(new Set(data.map(x => x.nome)));
            queryResult.sort();
            loadAutoComplete(queryResult, "#town");
        });
    });

    $("#location").ready(function() {
        $.getJSON("../data/comuni.json", function(data) {
            let queryResult = Array.from(new Set(data.map(x => x.nome)));
            queryResult.sort();
            loadAutoComplete(queryResult, "#location");
        });
    });

});

// Focus automatico sulla modale del signin
$(document).on('shown.bs.modal', function() {

    $(this).find('[autofocus]').focus();
});

// Funzione di validazione aggiuntiva per il match delle password
function checkPasswordMatch() {

    if ($("#password").val() != $("#repass").val())
        $("#repass")[0].setCustomValidity("Le password non coincidono.");
    else
        $("#repass")[0].setCustomValidity('');
}