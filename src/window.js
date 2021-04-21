import { Draggable } from '@shopify/draggable';
import $ from "cash-dom";
import './window.scss';

let globalWindowIndex = 0;


/** Makes a new window 
 * options:
 *  x, y        - position
 *  style       - the style
 *  id          - the id to give to the window
 *  closeable   - If the window should have a close button
 *  preOpen     - The window should start opened 
 *  delay       - The delay in ms before the window opens. Set to -1 to keep it closed.
*/
export function createWindow(content, options = { }) {
    function randomWID() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    //Setup the defaults
    options = Object.assign({
        id:         randomWID(),    //ID of the window  
        title:      '',             //Title to display in the heading
        x:          false,          //Position of the window
        y:          false,          //Position of the window
        z:          false,          //Depth of the window
        style:      '',             //Style of the window
        closeable:  true,           //Is the window closable?
        preOpen:    false,          //Was the window instantly opened?
        delay:      10,             //Delay before opening the window
        singleton:  true,           //Attempts to reuse the window
    }, options);

    //prepare the style
    if (options.x != null && options.x !== false) options.style += `left: ${options.x}px;`; 
    if (options.y != null && options.y !== false) options.style += `top: ${options.y}px;`; 

    //Check if existing window exists
    if (options.singleton) {
        const existingWindow = document.querySelector(`.window#${options.id}`);
        if (existingWindow && existingWindow.open && existingWindow.focus) {
            existingWindow.open().focus();
            return existingWindow;
        }
    }

    //prepare the container
    const container     = document.querySelector('.retro-gradient .main-content');
    const closeClass   = options.preOpen ? '' : 'closed'; 
    const closeBTN     = options.closeable || options.closeable === undefined ? 
                            '<div class="window-button window-close" onclick="this.parentElement.parentElement.close()"></div>' : 
                            '';

    const template  = `
<div class="window ${closeClass}" onmousedown="this.focus()">
    <div class="window-heading drag-handle">
        ${closeBTN}
        <div class="window-button window-maximise" onclick="this.parentElement.parentElement.open()"></div>
        <div class="window-button window-minimise" onclick="this.parentElement.parentElement.hide()"></div>
    </div>
    <div class="window-content"></div>
</div>
    `;
    
    //Create the element
    const guid = randomWID();
    const $window = $(template);
    $window.attr('data-wid', guid);
    if (options.id) $window.attr('id', options.id);
    if (options.style) $window.attr('style', options.style);
    $window.find('.window-content').append(content);
    $(container).append($window);

    //Get the element and make it draggable
    const window = $(`[data-wid="${guid}"]`).get(0);
    makeDraggable(window); // Bugged
    
    //Fix the depth
    if (options.z) window.dragRoot.style.zIndex = options.z + globalWindowIndex;
    
    /** Brings a window to focus */
    window.focus = function() {
        window.dragRoot.style.zIndex = globalWindowIndex++;
        return window;
    }

    /** Hides a window and destroys it */
    window.close = function() { 
        window.hide();
        setTimeout(() => window.dragRoot.remove(), 1000);
        return window;
    }

    /** Hides a window */
    window.hide = function() {
        window.classList.add('closed');
        return window;
    }

    /** Opens a window */
    window.open = function() {
        window.classList.remove('closed');
        return window;
    }

    //Add events
    //$(window).on('mousedown', () => window.focus());
    //$(window).find('.window-close').on('click', () => window.close());
    //$(window).find('.window-minimise').on('click', () => window.hide());

    //Focus the window
    if (options.z === undefined)
        window.focus();

    if (options.preOpen) {
        window.open();
    } else {
        const delay = options.delay ?? 10;
        if (delay >= 0) {
            setTimeout(() => {
                window.open();
            }, delay);
        }
    }
    return window;
}


/** Makes the element draggable. The element must contain a .drag-handle */
export function makeDraggable(element) {
    console.log('make draggable', element);
    const $drag = $('<div class="draggable"><div class="skewable"></div></div>');
    $drag.appendTo(element.parentElement);
    $drag.find('.skewable').append(element);
    $drag.attr('data-id', element.id || '');

    if (element.style) {
        $drag.css('top', element.style.top || 0);
        $drag.css('left', element.style.left || 0);
    
        element.style.top = null;
        element.style.left = null;    
    }
    
    $drag.find('.drag-handle').on('mousedown', (e) => {
        beginDragging(element.dragRoot, [ e.clientX, e.clientY ]);
    });

    return element.dragRoot = $drag.get(0);
}

// ========= Drag Update Handling
let draggedElement = null;
let lastTimestamp = 0;

/** Animate the drag element. Idea here is that the elements will have some 'velocity' and will still move after the fact. */
function onUpdate(timestamp) {
    if (draggedElement == null) return;
    const de = draggedElement.dragging;

    //Calculate time delta
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    //Calculate the difference
    const diff = [
        de.client[0] - de.clientStart[0],
        de.client[1] - de.clientStart[1],
    ];

    //Move last position over
    de.lastPosition = de.position;

    //Calculate the position
    de.position = [ 
        de.positionStart[0] + diff[0],
        de.positionStart[1] + diff[1]
    ];

    //Calculate the velocity
    de.velocity = [
        (de.position[0] - de.lastPosition[0]) / delta,
        (de.position[1] - de.lastPosition[1]) / delta,
    ];

    //Visually skew the document so it looks like its dragging
    const [ x, y ]  = de.position;
    const positionTransformation = `translate3d(${x}px,${y}px,0)`;
    
    //Apply the skew
    const skewElement = $(draggedElement).find('.skewable').get(0);
         
    const h         = (draggedElement.offsetHeight || draggedElement.clientHeight) * 2;
    const w         = 0;//draggedElement.offsetWidth/2;
    const skew      = -((Math.PI / 2) - Math.acos((de.position[0] - de.lastPosition[0]) / h));// * (180/Math.PI);
    
    let skewTransformation = `translateX(${w/2}px) translateY(${h/2}px) `;
    skewTransformation +=    `matrix3d( 1,  ${skew},       0,      0,
                                    0,        1,      0,      0,
                                    0,        0,      1,      0, 
                                    0,        0,      0,      1)`;
    skewTransformation += `translateY(-${h/2}px) translateX(-${w/2}px)`;

    //Apply the transformatoin
    if (skewElement != null) {
        skewElement.style.transform = skewTransformation;
        draggedElement.style.transform = positionTransformation;
    } else {
        draggedElement.style.transform = positionTransformation + ' ' + skewTransformation;
    }

    //Next frame
    window.requestAnimationFrame(onUpdate);
}

/** Called when a drag happens */
function onDragging(e) {
    if (draggedElement == null) return;

    e = e || window.event;
    e.preventDefault();
    
    const de = draggedElement.dragging;
    de.client = [ e.clientX, e.clientY ];
};

/** Begins dragging the element. Position is the initial mouse position. */
function beginDragging(element, position) {
    draggedElement = element;
    //if (!$(element).find('.skewable').get(0)) {
    //    const $skewable = $('<div>').addClass('skewable');
    //    $skewable.append($(element).children());
    //    $skewable.appendTo($(element));
    //}

    // Set initial object that stores the data
    if (draggedElement.dragging == null){ 
        console.log('settin');
        draggedElement.dragging = {
            position:       [ 0, 0 ],
            clientStart:    position,
            client:         position
        };

        //if (draggedElement.style.left)
        //    draggedElement.dragging.position[0] = parseInt(draggedElement.style.left)/2;
//
        //if (draggedElement.style.top)
        //    draggedElement.dragging.position[1] = parseInt(draggedElement.style.top)/2;
    }

    // Update mouse position
    draggedElement.dragging.clientStart     = position;
    draggedElement.dragging.client          = position;
    draggedElement.dragging.positionStart   = draggedElement.dragging.position;

    const [ x, y ] = draggedElement.dragging.position;
    draggedElement.style.transform = `translate3d(${x}px,${y}px,0)`;
    
    // Listen to the events
    $(draggedElement).addClass('dragging');        
    window.requestAnimationFrame(onUpdate);
}

/** Ends dragging the element */
function endDragging() {
    if (!draggedElement) return;
    $(draggedElement).removeClass('dragging');
    
    //Move back to left top
    const [ x, y ] = draggedElement.dragging.position;
    draggedElement.style.transform = `translate3d(${x}px,${y}px,0)`;
    $(draggedElement).find('.skewable').css('transform', null);
    //draggedElement.style.top = `${y}px`;
    draggedElement = null;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.no-js').forEach((element, key) => element.style.display = 'none');
   
    // Make existing draggables as drag-able
    $('.draggable .drag-handle').on('mousedown', (e) => {
        const element = $(e.target).closest('.draggable').get(0);
        beginDragging(element, [ e.clientX, e.clientY ]);
    });

    // Make all the windows dragables
    $('template.window').each((i, e) => {
        console.log('window', e, e.content, e.id, e.style);
        createWindow(e.content, {
            id: e.id,
            style: e.style,
            closeable: false,
            preOpen: true,
        });
       // makeDraggable(e);
    });

    //Update the drag events globally. This way it isn't an issue if the mouse leaves the element,
    // the window will still catch the events.
    $(window).on('mouseup', (e) => { endDragging(); });
    $(window).on('mousemove', (e) => { onDragging(e); });
});