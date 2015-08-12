'use strict';

module.exports = function (config) {
    return {
        "layout": {
            "hidden": true,
            "top": "center",
            "left": "center",
            "width": "100%",
            "height": "100%"
        },
        "list": {
            "top": "top",
            "left": "left",
            "data": null,
            "border": "line",
            "align": "left",
            "tags": true,
            "width": "100%",
            "height": "100%-3",
            "mouse": true,
            "vi": true,
            "keys": true,
            "style": {
                "border": {
                    "fg": "white"
                },
                "selected": {
                    "bg": "blue"
                }
            }
        },
        "confirm": {
            "border": "line",
            "height": "shrink",
            "width": "half",
            "top": "center",
            "left": "center",
            "keys": true,
            "vi": true
        },
        "menubar": {
            "align": "center",
            "bottom": 0,
            "width": "100%",
            "height": 3,
            "mouse": true,
            "border": "line",
            "vi": true,
            "keys": true,
            "style": {
                "prefix": {
                    "fg": "white"
                },
                "item": {
                    "fg": "cyan"
                },
                "selected": {
                    "fg": "cyan"
                }
            },
            "commands": {
                "RESET COMMIT": {
                    "keys": config.keys.main.reset
                },
                "CANCEL": {
                    "keys": config.keys.common.quit
                },
                "PAGE DOWN": {
                    "keys": config.keys.common.pageDown
                },
                "PAGE UP": {
                    "keys": config.keys.common.pageUp
                }
            }
        }
    };
};
