
import '@fortawesome/fontawesome-pro/scss/fontawesome.scss';
import '@fortawesome/fontawesome-pro/scss/brands.scss';
import '@fortawesome/fontawesome-pro/scss/regular.scss';
import './index.scss';
import $ from "cash-dom";

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling
import 'tippy.js/animations/scale.css';

tippy.setDefaultProps({    
    appendTo: 'parent',
    inertia: true,
    animation: 'scale',
});

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

    /** Marks all the elements as hidden */
    function hideAll() {
        
        //Hide all other content
        console.log('Hiding All');

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

        //Enforce Hide all the items. This will clear the previous timeout too
        hideAll();

        //Calculate the duration its been and wait that long
        let duration =  preivewImageSwapDuration - (performance.now() - previewImageTimer);
        if (duration < 1) duration = 1; 
        
        console.log('Showing ', src, 'in', duration, 'ms');

        //Fade it in after some time.
        fadeTimeout = setTimeout(() => {
            //Display the element
            hideAll();
            $(elm).addClass('visible').removeClass('hidden');
            console.log('Element Visible', elm, src);
            return elm;
        }, duration);

        return fadeTimeout;
    }

    $rightColumn.on('mouseleave', (e) => { hideAll(); });
    $('.hover-box[data-image-src], .hover-box[data-video-src]').on('mouseenter', async (e) => {
        const $target = $(e.target);

        let imgSrc = $target.attr('data-image-src'); 
        if (!imgSrc) imgSrc = $target.closest('.hover-box').attr('data-image-src');

        let videoSrc = $target.attr('data-video-src'); 
        if (!videoSrc) videoSrc = $target.closest('.hover-box').attr('data-video-src');

        //Start the timer
        previewImageTimer = performance.now();

        const src       = imgSrc || videoSrc;
        const isVideo   = videoSrc != null;

        let element     = null;

        //Hide all the items and show only the one we may have
        if ((element = loadedImages[src]) == null) {

            // Create the element
            console.log('Creating Element',  imgSrc, videoSrc);
            const $element = isVideo ? $('<video loop autoplay muted>') : $('<img>');
            $element.attr("src", src).addClass(isVideo ? 'preview-video' : 'preview-image').addClass('loading');
            $element.prependTo($rightColumn);
            element = loadedImages[src] = $element.get(0);

            // The element finally loaded, so we will trigger the show
            $element.on('load loadstart', (e) => { 
                console.log('Element Loaded', src, e.target); 
                $element.removeClass('loading');
                show(src);
            }, { once: true });

        }  else {
            
            // We can trigger the show early
            console.log('Shown', loadedImages);
            show(src);
        }
        
        // Target left, so lets hide the content
        $target.on('mouseleave', async (e) => {  hideAll(); }, { once: true });
        e.preventDefault();
    });
}); 