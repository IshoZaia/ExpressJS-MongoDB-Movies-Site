// Wait for document to be ready
$(document).ready(function(){
    // Add listener for id
    $(".delete-movie").on("click", function(e){
        // Get id when button clicked
        $target = $(e.target);
        const id = $target.attr("data-id");
        // Send request to express with DELETE method
        $.ajax({
            type: "DELETE",
            url: "/movie/" + id,
            success: function(response){
                // Alert and redirect
                alert("Deleting Movie");
                window.location.href="/";
            },
            error: function(err){
                console.log(err);
            }
        })
    })
});
