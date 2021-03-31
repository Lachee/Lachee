import $ from "cash-dom";

const items = (ctx => {
    let keys = ctx.keys();
    let values = keys.map(ctx);
    return keys.reduce((o, k, i) => { o[k] = values[i]; return o; }, {});
})(require.context('./projects', true, /\.ya?ml$/));
console.log('Game Items', items);


document.addEventListener('DOMContentLoaded', function() {

    // <div class="hover-box" data-image-src="images/partycrashers.gif"><a href="#games" class="button popout">Party Crashers</a></div>
    // <div class="hover-box" data-video-src="https://i.lu.je/2021/RHKmFcrZfI.mp4"><a href="#games" class="button popout">Electronic Super Joy</a></div>
    for(let filename in items) {
        const item = items[filename];
        console.log('item', filename, item);
        const $hover = $(`<div>`);
        $hover.addClass('hover-box');
        
        if (item.background) {
            const ext = item.background.substr(item.background.lastIndexOf('.'));
            console.log(ext); 
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
        console.log($hover, $a);
    }                
});