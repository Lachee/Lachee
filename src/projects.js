import marked from 'marked';
import $ from "cash-dom";
import { createWindow } from './window.js';

const files = (ctx => {
    let keys = ctx.keys();
    let values = keys.map(ctx);
    return keys.reduce((o, k, i) => { o[k] = values[i]; return o; }, {});
})(require.context('./projects', true, /\.ya?ml$/));

/** Creates the windows for the project because the button was click */
function openWindow(project) {

    const movement = 100;
    const latency = 250;
    let x = 0, y = 0;

    const id = project.name.replaceAll(' ', '_').toLowerCase();
    const content = project.html;
    const windows = [
        createWindow(content, {
            id:         id,
            x:          x,
            y:          y,
            singleton:  true,
        })
    ];

    // Add the images
    for (const i in project.images) {
        x += movement; y += movement;
        const image = project.images[i];
        const window = createWindow(`<img src="${image.src}" >`, {
            id:         `${id}-img-${i}`,
            title:      image.title || '',
            x:          x,
            y:          y,
            delay:      latency * windows.length,
            singleton:  true,  
        });
        windows.push(window);
    }

    // Add the videos
    for (const i in project.videos) {
        x += movement; y += movement;

        //Get the video and make sure it has a youtube id.
        // IT can have a `src` instead, but we dont want to use those (yet)
        const video = project.videos[i];
        if (!video.youtube) continue;

        const window = createWindow(`<iframe class='youtube video' width='560' height='315' src='https://www.youtube.com/embed/${video.youtube}' frameborder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>`, {
            id:         `${id}-vid-${i}`,
            title:      video.title || '',
            x:          x,
            y:          y,
            delay:      latency * windows.length,
            singleton:  true,
        });
        windows.push(window);
    }

    //Fix the focus order
    for (let i = windows.length - 1; i >= 0; i--) {
        windows[i].focus();
    }

    //Return the windows
    return windows;
}

/** Creates and adds a button to the project panel for the given project */
function createButton(project) {
    const $hover = $(`<div>`);
    $hover.addClass('hover-box');
    if (project.background) {
        const ext = project.background.substr(project.background.lastIndexOf('.'));
        $hover.attr(ext == '.mp4' ? 'data-video-src' : 'data-image-src', project.background);
    }

    const $a = $('<a>');
    $a.addClass('button').addClass('popout').text(project.name).attr('href', '#');
    $a.prependTo($hover);
    $a.on('click', () => { openWindow(project); });
    $hover.appendTo('.link-projects');
    return $hover;
}

document.addEventListener('DOMContentLoaded', function() {
    $('#link-projects-stub').remove();
    
    // <div class="hover-box" data-image-src="images/partycrashers.gif"><a href="#games" class="button popout">Party Crashers</a></div>
    // <div class="hover-box" data-video-src="https://i.lu.je/2021/RHKmFcrZfI.mp4"><a href="#games" class="button popout">Electronic Super Joy</a></div>
    const items = Object.values(files).sort((a, b) => (a.position === undefined ? 100 : a.position) - (b.position === undefined ? 100 : b.position));
    for(let filename in items) {

        //Preprocess teh data
        const item = items[filename];
        item.html = marked(item.description || ''); 
        console.log(item.name, item);
        createButton(item);
    }                
});