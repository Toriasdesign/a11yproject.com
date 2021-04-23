/* jshint esversion: 5 */

/** Used to check whether a given Element could match
 * by a DOM selector.
 * @see processChecklistClick
 */
 if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector;
}

// Copy email address ----------------------------------------------------------
function getEmailOnly(element) {
	var emailRegex = /^(?:mailto:?)([a-zA-Z0-9_\-.]+@[a-zA-Z0-9-]+\.[a-zA-Z\-.]{2,})(?:\?subject\=.*)?$/;
	return emailRegex.exec(element.getAttribute("href"))[1];
}

function getEmailElements() {
	return document.querySelectorAll("[data-mailto]");
}

function generateCopyEmailButton(element) {
	var email = getEmailOnly(element);
	var newEl = document.createElement("button");
	newEl.className = "c-copy-email-button";
	newEl.setAttribute("data-copy-email", true);
	newEl.setAttribute("type", "button");
	newEl.addEventListener("click", function(e) {
		navigator.clipboard.writeText(email).then(function () {
			console.log('successfully copied: "' + email + '"');
		}).catch(function (error) {
			console.error('failed to copy ' + email);
		});
	});
	newEl.innerText = "Copy";
	element.after(newEl);
}

function processEmailHrefs() {
	var emailElements = getEmailElements();
	emailElements.forEach(generateCopyEmailButton);
}

if (navigator && navigator.clipboard && navigator.permissions) {
	navigator.permissions.query({
		name: 'clipboard-write'
	}).then(function (permissionStatus) {
		// Will be 'granted', 'denied' or 'prompt':
		if (permissionStatus.state === "granted") {
			processEmailHrefs();
		}

		// Listen for changes to the permission state
		permissionStatus.onchange = function () {
			if (permissionStatus.state === "granted") {
				processEmailHrefs();
			}
		};
	});
}

// When someone navigates directly to a checklist item using its "Share Link"
// like a11yproject.com/checklist/#validate-your-html, the item with the
// matching id attribute will be scrolled into view. Then, if JS is enabled,
// this code will open its associated <details> element.
function openLinkedCheckListItem(itemId) {
	var checklistItem = document.querySelector(
		"[data-checklist-item-id=" + itemId + "]"
	);

	if (checklistItem) {
		checklistItem.setAttribute("open", true);
	}
}
// Store checklist status ---------------------------------------------------
function storeChecklistItem(checkboxId) {
	localStorage.setItem(checkboxId, 'checked');
}

function removeChecklistItem(item) {
	localStorage.removeItem(item);
}

function processChecklistClick(checkboxSelector) {
	document.addEventListener("change", function (event) {
		var target = event.target;

		if (!target.matches(checkboxSelector)) {
			return;
		}

		if (target.checked) {
			storeChecklistItem(target.id);
		} else {
			removeChecklistItem(target.id);
		}
	});
}

function populateChecklistFromLocalStorage(checkboxSelector) {
	var items = document.querySelectorAll(checkboxSelector);
	var length = items.length;
	for (var i = 0; i < length; ++i) {
		var checkboxElement = items[i];
		checkboxElement.checked = localStorage[checkboxElement.id] === 'checked';
	}
}

function processChecklist() {
	var checkboxSelector = '.c-checklist__checkbox input[type="checkbox"]';

	populateChecklistFromLocalStorage(checkboxSelector);
	processChecklistClick(checkboxSelector);
}

if (location.pathname === '/checklist/') {
	var linkedCheckListItemId = window.location.hash.substr(1);
	openLinkedCheckListItem(linkedCheckListItemId);
	processChecklist();
}

