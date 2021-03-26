
import '@fortawesome/fontawesome-pro/scss/fontawesome.scss';
import '@fortawesome/fontawesome-pro/scss/brands.scss';
import '@fortawesome/fontawesome-pro/scss/regular.scss';
import './index.scss';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling
import 'tippy.js/animations/scale.css';

tippy.setDefaultProps({    
    appendTo: 'parent',
    inertia: true,
    animation: 'scale',
});