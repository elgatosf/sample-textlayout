/// <reference path="libs/js/stream-deck.js" />
/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/utils.js" />

/**
 * This example shows how to create a custom layout with a list of text-labels for Stream Deck.
 * In it's manifest it sets the relative path to the custom layout file (layouts/customlayout.json)
 */

// Action Cache
const MACTIONS = {};
const MAXNUMLINES = 5;
const UPDATE_INTERVAL = 5000;
// Utilities
const cycle = (idx, min, max) => (idx > max ? min : idx < min ? max : idx);
const randomDate = () => {
    const start = new Date(2020, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString([], dateOptions);
};
const debounce = (func, wait = 100) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
};
const dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "long",
};

// Action Events
const sampleTextlayoutAction = new Action('com.elgato.sample-textlayout.action');

sampleTextlayoutAction.onWillAppear(({context, payload}) => {
    // console.log('will appear', context, payload);
    MACTIONS[context] = new SampleAction(context, payload);
});

sampleTextlayoutAction.onWillDisappear(({context}) => {
    // console.log('will disappear', context);
    MACTIONS[context].interval && clearInterval(MACTIONS[context].interval);
    delete MACTIONS[context];
});


sampleTextlayoutAction.onDialPress(({context, payload}) => {
    // console.log('dial was pressed', context, payload);
    if(payload.pressed === false) {

    }
});

sampleTextlayoutAction.onDialRotate(({context, payload}) => {
    // console.log('dial was rotated', context, payload.ticks);
    if(payload.hasOwnProperty('ticks')) {
        MACTIONS[context].dialRotate(payload.ticks);
    }
});

sampleTextlayoutAction.onTouchTap(({context, payload}) => {
    // console.log('touchpanel was tapped', context, payload);
    if(payload.hold === false) {
        MACTIONS[context].touchTap();
    }
});

class SampleAction {
    constructor (context, payload) {
        this.context = context;
        this.interval = null;
        this.manualValue = -1;
        this.isInteracting = false;
        this.debouncedClearInteraction = debounce(this.clearRotation.bind(this), 500);
        this.init();
        this.update();
    }

    init() {
        const updateFn = this.update;
        this.interval = setInterval(() => {
            this.update();
        }, UPDATE_INTERVAL);
    }

    clearRotation() {
        this.isInteracting = false;
    }

    dialRotate(ticks, inTitle = 'Dial rotating') {
        this.isInteracting = true;
        this.manualValue = cycle(this.manualValue + ticks, 0, 100);
        const payload = {
            customtext0: `${inTitle} : ${this.manualValue}`
        };
        $SD.setFeedback(this.context, payload);
        this.debouncedClearInteraction();
    }

    touchTap() {
        this.manualValue = Math.floor(Math.random() * 100);
        this.dialRotate(0, 'TouchTap');
    }

    update() {
        if(this.isInteracting) return;
        const payload = {};
        [0,1,2,3,4].forEach((i) => {
            payload[`customtext${i}`] = randomDate();
        });
        $SD.setFeedback(this.context, payload);
    }
};
