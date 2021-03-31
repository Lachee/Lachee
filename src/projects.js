import marked from 'marked';
import $ from "cash-dom";

const files = (ctx => {
    let keys = ctx.keys();
    let values = keys.map(ctx);
    return keys.reduce((o, k, i) => { o[k] = values[i]; return o; }, {});
})(require.context('./projects', true, /\.ya?ml$/));

document.addEventListener('DOMContentLoaded', function() {

    // <div class="hover-box" data-image-src="images/partycrashers.gif"><a href="#games" class="button popout">Party Crashers</a></div>
    // <div class="hover-box" data-video-src="https://i.lu.je/2021/RHKmFcrZfI.mp4"><a href="#games" class="button popout">Electronic Super Joy</a></div>
    const items = Object.values(files).sort((a, b) => (a.position === undefined ? 100 : a.position) - (b.position === undefined ? 100 : b.position));
    for(let filename in items) {

        //Preprocess teh data
        const item = items[filename];
        item.html = marked(item.description || ''); 
        console.log(item.name, item);

        //Create the button
        const $hover = $(`<div>`);
        $hover.addClass('hover-box');
        if (item.background) {
            const ext = item.background.substr(item.background.lastIndexOf('.'));
            if (ext == '.mp4') {
                $hover.attr('data-video-src', item.video || '');
            } else {
                $hover.attr('data-image-src', item.image || '');
            }
        }
        const $a = $('<a>');
        $a.addClass('button').addClass('popout').text(item.name).attr('href', '#');
        $a.prependTo($hover);
        $hover.appendTo('.link-projects');

        //Create the window
        
    }                
});