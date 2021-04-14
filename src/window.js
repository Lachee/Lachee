import { Draggable } from '@shopify/draggable';
import $ from "cash-dom";
import './window.scss';

let globalWindowIndex = 0;

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

/** Makes a new window */
export function createWindow(content, id = null, style = null, closeable = true) {
    function randomWID() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    const container = document.querySelector('.retro-gradient .main-content');
    const close = closeable ? '<div class="window-button window-close"></div>' : '';
    const template = `
<div class="window">
    <div class="window-heading drag-handle">
        ${close}
        <div class="window-button window-maximise"></div>
        <div class="window-button window-minimise"></div>
    </div>
    <div class="window-content"></div>
</div>
    `;
    
    const guid = randomWID();
    const $window = $(template);
    $window.attr('id', id);
    $window.attr('data-wid', guid);
    $window.attr('style', style);
    $window.find('.window-content').append(content);
    $(container).append($window);

    //Find the elm
    const window = $(`[data-wid="${guid}"]`).get(0);
    makeDraggable(window); // Bugged
    

    //Add functionality
    window.focus = function() {
        window.dragRoot.style.zIndex = globalWindowIndex++;
    }
    window.close = function() { 
        window.style.display = 'none';
    }
    window.open = function() {
        window.style.display = null;
    }

    //Add events
    $(window).on('mousedown', () => {
        window.focus();
    });
    $(window).find('.window-close').on('click', () => {
        window.close();
    });
    
    window.focus();
    return window;
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
    console.log(draggedElement.offsetHeight);
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
        createWindow(e.content, e.id, e.style, false);
       // makeDraggable(e);
    });

    //Update the drag events globally. This way it isn't an issue if the mouse leaves the element,
    // the window will still catch the events.
    $(window).on('mouseup', (e) => { endDragging(); });
    $(window).on('mousemove', (e) => { onDragging(e); });
});