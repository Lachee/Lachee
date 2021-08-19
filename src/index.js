
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

import {createWindow } from './window.js';
import { closeProjectWindows, createProjectWindows, openProjectWindowFromName } from './projects.js';
import { createVideoFeed } from './videofeed';

// Prepare a list of enviroment variables
const ENVIROMENT_VARIABLES = process.env || {};

/** list of windows currently opened that are not project windows */
const _aboutWindows = {};

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
    document.querySelectorAll('.no-js').forEach((element, key) => element.style.display = 'none');
    createProjectWindows();
    createAboutWindows();
    createVideoFeed();
    createTooltip('[title]');
    navigateHash();
    loadEnviros();
}); 

// When the hash changes, try to find the window and open it
window.addEventListener('hashchange', () => navigateHash());
// When a window closes, try to reset the hash
window.addEventListener('window:closed', (event) => clearHash(event.target.id));
window.addEventListener('window:hidden', (event) => clearHash(event.target.id));
window.addEventListener('window:opened', (event) => loadEnviros());

function loadEnviros() {
    // Enable things if we have enviro
    $('[\\@env]').each((i, elm) => {
        const variable = elm.getAttribute('@env');
        if (!variable) return;

        const value = ENVIROMENT_VARIABLES[variable];
        if (!value) return;
        
        //console.log('ENVIRO', elm, variable, value);
        elm.style.display = 'inherit';

        const attribute = elm.getAttribute('@attr');
        if (!attribute) return;
        
        if (attribute == '@') {
            elm.innerText = value;
        } else {
            elm.setAttribute(attribute, value);
        }
    });

    // Hide things if we have enviro
    $('[\\@\\!env]').each((i, elm) => {
        const variable = elm.getAttribute('@!env');
        if (!variable) return;

        const value = ENVIROMENT_VARIABLES[variable];
        if (!value) return;
        
        elm.style.display = 'none';
    });
}

/** clears the hash if the id matches */
function clearHash(id) {
    const hash = decodeURI(window.location.hash).substr(1);
    if (id == hash) {
        window.location.hash = '';
    }
}

/** navigates to the hash window */
function navigateHash() {
    // Find the window that we should open
    const hash = decodeURI(window.location.hash).substr(1);
    if (!openProjectWindowFromName(hash)) {

        // Find the about me window
        const aboutWindow = _aboutWindows[hash] ?? null;
        if (aboutWindow != null) {

            // Close every other window
            closeProjectWindows();
//            for(let otherWindow of Object.values(_aboutWindows)) {
//                if (otherWindow.id != hash && (otherWindow.parentWindow||0) != hash)
//                    otherWindow.hide();
//            }

            // Open the window
            aboutWindow.open();
            aboutWindow.focus();
        }
    }
}

function createAboutWindows() {
    // Make all the windows dragables
    const pendingChildren = [];
    $('template.window').each((i, e) => {

        // Create the window
        console.log('window', e, e.content, e.id, e.style, e.getAttribute('window-class'));
        _aboutWindows[e.id] = createWindow(e.content, {
            id:             e.id,
            title:          e.title || undefined,
            style:          e.style,
            closeable:      false,
            minimizable:    true,
            minimizeClass:  'window-close',
            preOpen:        false,
            preHide:        true,
            contentClass:   e.getAttribute('window-class'),
            x: parseInt(e.getAttribute('x'), 10) ?? undefined,
            y: parseInt(e.getAttribute('y'), 10) ?? undefined,            
        });

        // Push this window to the list of windows that need their parents set
        if (e.getAttribute('parent-id') != null) {
            pendingChildren.push({ 
                element: e, 
                window: _aboutWindows[e.id],
                parentId: e.getAttribute('parent-id') 
            });
        }
    });

    // Set the parent windows
    for(let pending of pendingChildren) {
        const parentWindow = _aboutWindows[pending.parentId];
        if (parentWindow == null) {
            console.warn('cannot link window because parent is null', pending);
            continue;
        }
        pending.window.setParentWindow(parentWindow);
    }

    _aboutWindows['about'].open();
    _aboutWindows['about'].focus();

}