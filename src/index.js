
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
    const $previewImage             = $('.preview-image');
    const $previewVideo             = $('.preview-video');
    const loadedImages              = [];
    const $rightColumn              = $('.column-right');

    $rightColumn.on('mouseleave', (e) => { $previewImage.removeClass('visible'); });
    $('.hover-box[data-image-src], .hover-box[data-video-src]').on('mouseover', async (e) => {
        const $target = $(e.target);

        let imgSrc = $target.attr('data-image-src'); 
        if (!imgSrc) imgSrc = $target.closest('.hover-box').attr('data-image-src');

        let videoSrc = $target.attr('data-video-src'); 
        if (!videoSrc) videoSrc = $target.closest('.hover-box').attr('data-video-src');

        // clear the visuals
        $previewImage.removeClass('visible');
        $previewVideo.removeClass('visible');

        // set the new image
        console.log('setting', $target, imgSrc || videoSrc);
        previewImageTimer = performance.now();

        if (videoSrc == null) {
            $previewImage.attr('src', imgSrc);
        } else {
            $previewVideo.attr('src', videoSrc);
        }

        // Swap the visuals out with a delay
        const swap = async () => { 
            console.log('swapping', imgSrc || videoSrc);
            const duration =  preivewImageSwapDuration - (performance.now() - previewImageTimer);
            if (duration > 0) await wait(duration);
            
            if (videoSrc == null) {
               $previewImage.addClass('visible');
               console.log('made visible image', imgSrc);
            } else {
                $previewVideo.addClass('visible');
                console.log('made visible video', videoSrc);
            }
        };

        if (loadedImages.indexOf(videoSrc || imgSrc) != false) {
            swap();
        } else {
            if (videoSrc == null) {
                $previewImage.once('load', async (e) => { 
                    console.log('loaded image', imgSrc);
                    loadedImages.push(imgSrc);
                    await swap();
                });
            } else {
                $previewVideo.once('load', async (e) => {
                    console.log('loaded video', videoSrc);
                    loadedImages.push(videoSrc);
                    await swap();
                });
            }
        }

        
        $target.on('mouseleave', async (e) => { 
            $previewImage.removeClass('visible');
            $previewVideo.removeClass('visible');
            $previewImage.attr('src', '');
            $previewVideo.attr('src', '');
        }, { once: true });
    });
}); 