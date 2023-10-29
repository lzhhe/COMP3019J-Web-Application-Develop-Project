document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("resetData");
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
});