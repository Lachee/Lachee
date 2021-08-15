import marked from 'marked';
import $ from "cash-dom";
import { createWindow } from './window.js';
import { createTooltip } from './index.js';

// List of projects
const files = (ctx => {
    let keys = ctx.keys();
    let values = keys.map(ctx);
    return keys.reduce((o, k, i) => { o[k] = values[i]; return o; }, {});
})(require.context('./projects', true, /\.ya?ml$/));

// List of actively opened windows
let openedWindows = [];
const WINDOW_LAYOUT = {
    main:   [ 136, 85 ],
    images: [ 650, 85 ],
    videos: [ 650, 480 ]
}

/** Closes all existing windows */
function closeWindows() {
    for(let window of openedWindows) {
        window.close();
    }
    openedWindows = [];
}

/** Creates the windows for the project because the button was click */
function openWindow(project) {
    function createLink(link) {
        console.log(link);
        const icon = link.icon || 'fab fa-' + link.type;
        const type = link.type || link.title.toLowerCase();
        return `
<div class="hover-box">
    <a class="button popout social-${type}" href="${link.url}" target="_blank" title="Visit ${link.title}">
        <i class="${icon}"></i>
        ${link.title}
    </a>
</div>
`;
    }

    function createRole(role) {
        return `<span class="role">${role}</span>`;
    }

    const movement = 100;
    const latency = 250;
    let [ x, y ] = WINDOW_LAYOUT.main;

    const id = project.name
                        .replaceAll(/[^A-Za-z]/gmi, '_')
                        .toLowerCase();
    const content   = project.html;
    const links     = project.links.map((e, i) => createLink(e)).join('');
    const roles     = project.roles.map((e, i) => createRole(e)).join('');
    const template  = `<div class="roles">${roles}</div><div class="content">${content}</div><div class="footer links">${links}</div>`;
    const windows = [
        createWindow(template, {
            id:         id,
            title:      project.name,
            x:          x,
            y:          y,
            singleton:  false,
            contentClass: 'window-column'
        })
    ];

    
    // Add the images
    [ x, y ] = WINDOW_LAYOUT.images;
    for (const i in project.images) {
        const image = project.images[i];
        const window = createWindow(`<img src="${image.src}" >`, {
            id:         `${id}-img-${i}`,
            title:      image.title || '',
            x:          x,
            y:          y,
            delay:      latency * windows.length,
            singleton:  false,  
        });
        windows.push(window);
        x += movement; y += movement;
    }

    // Add the videos
    [ x, y ] = WINDOW_LAYOUT.videos;
    for (const i in project.videos) {
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
            singleton:  false,
        });
        windows.push(window);
        x += movement; y += movement;
    }

    //Fix the focus order
    for (let i = windows.length - 1; i >= 0; i--) {
        windows[i].focus();
    }

    //Return the windows
    createTooltip('[title]');
    return windows;
}

/** Creates and adds a button to the project panel for the given project */
function createButton(project) {
    const $hover = $(`<div>`);
    $hover.addClass('hover-box');
    if (project.background) {
        const ext = project.background.substr(project.background.lastIndexOf('.'));
        $hover.attr(ext == '.mp4' ? 'data-video-src' : 'data-image-src', project.background);
        $hover.attr('data-add-class', project['background-class']);
    }

    const $a = $('<a>');
    $a.addClass('button').addClass('popout').text(project.name).attr('href', '#');
    $a.prependTo($hover);
    $a.on('click', () => { 
        closeWindows();
        openedWindows = openWindow(project); 
    });
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