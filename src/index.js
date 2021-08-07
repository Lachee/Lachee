
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
import './projects.js';

async function wait(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), duration);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const preivewImageSwapDuration  = 0.5 * 1000;
    let previewImageTimer           = 0;
    const $rightColumn              = $('.column-right');
    const loadedImages              = { 'example': $rightColumn.get(0) };
    let fadeTimeout                 = null;
    let currentSrc                  = null;

    /** Marks all the elements as hidden */
    function hideAll() {
        
        //Hide all other content
        //console.log('Hiding All');
        currentSrc = null;

        // Clear existing timeouts
        if (fadeTimeout != null) {
            window.clearTimeout(fadeTimeout);
            fadeTimeout = null;
        }

        // Hide everything
        for(const key in loadedImages) {
            $(loadedImages[key]).removeClass('visible').addClass('hidden');
        }
    }

    /** Shows a element, otherwise returns false. */
    function show(src) {
        // Ensure the element exists
        const elm = loadedImages[src];
        if (!elm) return false;

        //Make sure we are not going to the same src
        if (currentSrc == src) return false;

        //Enforce Hide all the items. This will clear the previous timeout too
        hideAll();

        //Calculate the duration its been and wait that long
        const removalDelay = 100;
        let duration =  preivewImageSwapDuration - (performance.now() - previewImageTimer) - removalDelay;
        if (duration < 1) duration = 1; 
        
        console.log('Showing ', src, 'in', duration, 'ms');
        currentSrc = src;

        //Fade it in after some time.
        fadeTimeout = setTimeout(() => {
            //Display the element
            $(elm).removeClass('hidden');
            //document.requestAnimationFrame();
            setTimeout(() => {
                //console.log('Element Visible', elm, src);
                $(elm).addClass('visible');
            }, removalDelay);
        }, duration);

        return fadeTimeout;
    }

    // Hide everything
    $rightColumn.on('mouseleave', (e) => { hideAll(); });
    if (!window.isMobile()) {
        $('.hover-box[data-image-src], .hover-box[data-video-src]').each((i, e) => {
            const $target = $(e);

            let imgSrc = $target.attr('data-image-src'); 
            if (!imgSrc) imgSrc = $target.closest('.hover-box').attr('data-image-src');
    
            let videoSrc = $target.attr('data-video-src'); 
            if (!videoSrc) videoSrc = $target.closest('.hover-box').attr('data-video-src');
            
            createVideoElement(imgSrc || videoSrc, videoSrc != null, false);
        });
    }

    // Logic for the button's to show the video/gif
    $('.hover-box[data-image-src], .hover-box[data-video-src]').on('mouseover', async (e) => {
        //Find the hover box
        let $target = $(e.target);
        if (!$target.hasClass('.hover-box')) 
            $target = $target.closest('.hover-box');
        
        //Get the sources
        const imgSrc = $target.attr('data-image-src'); 
        const videoSrc = $target.attr('data-video-src'); 
        
        //Start the timer
        previewImageTimer = performance.now();

        const src       = imgSrc || videoSrc;
        const isVideo   = videoSrc != null;

        let element     = null;

        //Hide all the items and show only the one we may have
        if ((element = loadedImages[src]) == null) {
            // Create the element
            return createVideoElement(src, isVideo, true);
        }  else {
            
            // We can trigger the show early
            //console.log('Shown', loadedImages);
            show(src);
        }
        
        // Target left, so lets hide the content
        $target.on('mouseleave', async (e) => {  hideAll(); }, { once: true });
        e.preventDefault();
    });

    /** CReate the video element if it doesn't exist */
    function createVideoElement(src, isVideo, showAfterLoad = false) {
        if (loadedImages[src] != null) 
            return loadedImages[src];

        console.log('Loading video',  src, isVideo, showAfterLoad);

        // Create the element
        const $element = isVideo ? $('<video loop autoplay muted>') : $('<img>');
        $element.attr("src", src).addClass(isVideo ? 'preview-video' : 'preview-image').addClass('loading');
        $element.prependTo($rightColumn);
        
        // The element finally loaded, so we will trigger the show
        $element.on('load loadstart', (e) => { 
            console.log('Loaded video', src, e.target, showAfterLoad); 
            $element.removeClass('loading');
            if (showAfterLoad) show(src);
        }, { once: true });
        
        // Return the element
        return loadedImages[src] = $element.get(0);
    }

    // Setup the tooltips
    $('[title]').each((i, elm) => {
        const title = elm.getAttribute('title');
        elm.setAttribute('data-tippy-content', title);
        elm.setAttribute('aria', title);
        elm.removeAttribute('title');
    });
    tippy('[data-tippy-content]', {
        //content: (reference) => reference.getAttribute('title'),
    });
}); 