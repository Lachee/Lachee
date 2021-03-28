import { Draggable } from '@shopify/draggable';
import $ from "cash-dom";
import './window.scss';


document.addEventListener('DOMContentLoaded', () => {

    let draggedElement = null;
    let lastTimestamp = 0;
    
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


        draggedElement.style.left = (de.positionStart[0] + diff[0]) + "px";
        draggedElement.style.top =  (de.positionStart[1] + diff[1]) + "px";

        let skew    = de.velocity[0] * -10;
        //if (Math.abs(skew) > 0.7) {
            let hoffset = (draggedElement.offsetHeight / 2);
            draggedElement.style.transform = `translateY(-${hoffset}px) skewX(${skew}deg) translateY(${hoffset}px)`;
        //}


        //Next frame
        window.requestAnimationFrame(onUpdate);
    }

    function onDragging(e) {
        if (draggedElement == null) return;

        e = e || window.event;
        e.preventDefault();
        window.requestAnimationFrame(onUpdate);
        
        const de = draggedElement.dragging;
        de.client = [ e.clientX, e.clientY ];
        
        //
        ////Calculate the difference
        //const diff = [
        //    e.clientX - de.clientStart[0],
        //    e.clientY - de.clientStart[1],
        //];
        //
        ////Apply the position
        //draggedElement.style.left = (de.positionStart[0] + diff[0]) + "px";
        //draggedElement.style.top =  (de.positionStart[1] + diff[1]) + "px";

        // set the element's new position:
        //draggedElement.style.top = (draggedElement.offsetTop - draggedElement.dragging.difference[1]) + "px";
        //draggedElement.style.left = (draggedElement.offsetLeft - draggedElement.dragging.difference[0]) + "px";
        //elmnt.style.transform = "skewX(" + pos1*180 + "deg)";
    };


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

    function endDragging() {
        if (!draggedElement) return;
        $(draggedElement).removeClass('dragging');
        draggedElement.style.transform = null;
        draggedElement = null;
    }

    $('.draggable .drag-handle').on('mousedown', (e) => {
        const element = $(e.target).closest('.draggable').get(0);
        beginDragging(element, [ e.clientX, e.clientY ]);
    });
    
    $(window).on('mouseup', (e) => { endDragging(); });
    $(window).on('mousemove', (e) => { onDragging(e); });
});