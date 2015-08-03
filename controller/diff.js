var DiffView = require('../view/diff');

var parent = null,
    view   = null;

var config = require('../config');

var diff = {
  colorFormat: function (diffText) {
    return diffText
      .replace(/(^\-\s[\S\s]+?$)/gm, "{red-fg}$1{/red-fg}")
      .replace(/(^\+\s[\S\s]+?$)/gm, "{green-fg}$1{/green-fg}")
      .replace(/(^@@\s[\S\s]+?@@)/gm, "{cyan-fg}$1{/cyan-fg}");
  },
  show: function () {
    var diffText = parent.git.diff(
      parent.prevFocused.name,
      parent.prevFocused.selected
    );

    view.textarea.setContent(diff.colorFormat(diffText));

    view.layout.show();
    view.textarea.focus();
    view.layout.parent.render();
  },

  hide: function (reload) {
    view.layout.hide();
    view.textarea.setContent("");
    parent.show(reload);
  },

  init: function (delegate) {
    parent = delegate;

    view = DiffView(parent.screen);

    view.textarea.key(config.keys.common.quit, function () {
        diff.hide();
    });

    view.textarea.key(config.keys.common.pageUp, function () {
      view.textarea.scroll(-view.textarea.height || -1);
      redraw();
    });

    view.textarea.key(config.keys.common.pageDown, function () {
      view.textarea.scroll(view.textarea.height || 1);
      redraw();
    });
  }
};

module.exports = diff;

