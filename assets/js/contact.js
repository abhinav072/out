/* Contact form: opens the visitor's email app with the message filled in. */
(function () {
  "use strict";
  var form = document.getElementById("contact-form");
  if (!form) return;
  var note = document.getElementById("form-note");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var d = new FormData(form);
    var subject = (d.get("type") || "Enquiry") + " — " + d.get("name");
    var body = d.get("message") + "\n\n— " + d.get("name") + " (" + d.get("email") + ")";
    location.href = "mailto:" + form.dataset.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    note.textContent = "Your email app should open with the message ready. If it doesn’t, write to " + form.dataset.email + ".";
  });
})();
