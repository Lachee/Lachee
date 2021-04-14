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
    const content = project.html;
    const window = createWindow(content, project.id);
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