
import '@fortawesome/fontawesome-pro/scss/fontawesome.scss';
import '@fortawesome/fontawesome-pro/scss/brands.scss';
import '@fortawesome/fontawesome-pro/scss/regular.scss';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

import './scss/index.scss';
import $ from "cash-dom";
import './mobile.js';

// import tippy from 'tippy.js';
// import 'tippy.js/dist/tippy.css'; // optional for styling
// import 'tippy.js/animations/scale.css';

import './window.js';
import { createProjectWindows, openProjectWindowFromName } from './projects.js';
import { createVideoFeed } from './videofeed';

async function wait(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), duration);
    });
}

export function createTooltip(selector = '[title][^data-tippy-content]') {
    // Setup the tooltips
    $(selector).each((i, elm) => {
        const title = elm.getAttribute('title');
        elm.setAttribute('data-tippy-content', title);
        elm.setAttribute('aria', title);
        elm.removeAttribute('title');
    });
    tippy('[data-tippy-content]', {  });
}

document.addEventListener('DOMContentLoaded', () => {
    createProjectWindows();
    createAboutWindows();
    createVideoFeed();
    createTooltip('[title]');
    navigateHash();
}); 

window.addEventListener('hashchange', () => {
    navigateHash();
}, false);

function navigateHash() {

    // Find the window that we should open
    const hash = decodeURI(window.location.hash).replace('#', '');
    if (!openProjectWindowFromName(hash)) {
        // TODO: Find about windows
    }
}

function createAboutWindows() {

}