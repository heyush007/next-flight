const utils = {
    isValidUsername: function(username) {
        return username && username.length > 0;
    },

    hideElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = "none";
        }
    },

    showElement: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = "block";
        }
    },

    updateText: function(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    },

    handleError: function(error, defaultMessage) {
        console.error(error);
        alert(defaultMessage || "An unexpected error occurred.");
    }
};
