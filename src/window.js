import { Draggable } from '@shopify/draggable';
import $ from "cash-dom";
import './window.scss';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.no-js').forEach((element, key) => element.style.display = 'none');

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
        draggedElement.style.transform = `translate3d(${x}px,${y}px,0)`;
        
        //Apply the skew
        const skewElement = $(draggedElement).find('.skewable').get(0);
        if (skewElement != null) {
            //skewElement.style.transform = `translateY(-${h/2}px) skewX(${skew}rad) translateY(${h/2}px)`;
            //skewElement.style.transform = `skew(${skew}rad, 0)`;
             
            const h         = draggedElement.offsetHeight*2;
            const w         = 0;//draggedElement.offsetWidth/2;
            const skew      = -((Math.PI / 2) - Math.acos((de.position[0] - de.lastPosition[0]) / h));// * (180/Math.PI);
           
            let transformation = `translateX(${w/2}px) translateY(${h/2}px) `;
            transformation +=    `matrix3d( 1,  ${skew},       0,      0,
                                            0,        1,      0,      0,
                                            0,        0,      1,      0, 
                                            0,        0,      0,      1)`;
            transformation += `translateY(-${h/2}px) translateX(-${w/2}px)`;

            console.log(transformation);
            skewElement.style.transform = transformation;
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

    //On handle down, begin dragging the root element
    $('.draggable .drag-handle').on('mousedown', (e) => {
        const element = $(e.target).closest('.draggable').get(0);
        beginDragging(element, [ e.clientX, e.clientY ]);
    });
    
    //Update the drag events globally. This way it isn't an issue if the mouse leaves the element,
    // the window will still catch the events.
    $(window).on('mouseup', (e) => { endDragging(); });
    $(window).on('mousemove', (e) => { onDragging(e); });
});