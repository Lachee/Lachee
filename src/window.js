import { Draggable } from '@shopify/draggable';
import $ from "cash-dom";
import './window.scss';


document.addEventListener('DOMContentLoaded', () => {

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

        //Move the element to the desired location
        draggedElement.style.left = (de.positionStart[0] + diff[0]) + "px";
        draggedElement.style.top =  (de.positionStart[1] + diff[1]) + "px";

        //Visually skew the document so it looks like its dragging
        const h         = draggedElement.offsetHeight;
        const d         = (de.position[0] - de.lastPosition[0]);
        const skew      = -((Math.PI / 2) - Math.acos(d / h));// * (180/Math.PI);
        draggedElement.style.transform = `translateY(-${h/2}px) skewX(${skew}rad) translateY(${h/2}px)`;

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

        // Set the position
        draggedElement.dragging = {
            positionStart:  [ element.offsetLeft, element.offsetTop ],
            position:       [ element.offsetLeft, element.offsetTop ],
            clientStart:    position,
            client:         position,
        };
        
        // Listen to the events
        $(draggedElement).addClass('dragging');
        window.requestAnimationFrame(onUpdate);
    }

    /** Ends dragging the element */
    function endDragging() {
        if (!draggedElement) return;
        $(draggedElement).removeClass('dragging');
        draggedElement.style.transform = null;
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