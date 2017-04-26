( function( window, factory ) {
  'use strict';
    // browser global
    window.AnyGrid = factory(
      window.Outlayer
    );

}( window, function factory( Outlayer) {
'use strict';

var AnyGrid = Outlayer.create( 'anyGrid', {
    masonry: false,
    orderMasonry: true,
    stacked: false,
    perRow: {
        xxs: 1,
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
        xxl: 6
    },
    breakpoints: {
        xxs: 0,
        xs: 250,
        sm: 500,
        md: 750,
        lg: 1000,
        xl: 1250,
        xxl: 1500
    },
    isLayoutInstant: true,
    hiddenStyle: {
        opacity: 0
    },
    visibleStyle: {
        opacity: 1
    },
    adjustGutter: false,
    removeVerticalGutters: false,
    column_spans: false
});

AnyGrid.prototype.getGreaterLessThanBreakPoints = function() {
  var breakpoints = [];
  var index = 0;
  var indexed = false;
  for (var key in this.options.breakpoints) {
    if (this.options.breakpoints.hasOwnProperty(key)) {
      breakpoints.push(key);
      if (this.getBreakPoint() == key) {
        indexed = true;
      }
      if (!indexed) {
        index++;
      }
    }
  }

  return {
    gt: breakpoints.slice(0, index),
    lt: breakpoints.slice(index + 1)
  }
};

AnyGrid.prototype.getBreakPoint = function() {
    return this.breakPoint;
};

AnyGrid.prototype.getPerRow = function() {
    return this.perRow;
};

/**
 * turn elements into Outlayer.Items to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Outlayer Items
 */
AnyGrid.prototype._itemize = function( elems ) {

  var itemElems = this._filterFindItemElements( elems );
  var Item = this.constructor.Item;

  // create new Outlayer Items for collection
  var items = [];
  for ( var i=0, len = itemElems.length; i < len; i++ ) {
    var elem = itemElems[i];
    var item = new Item( elem, this );
    item.span = 1;
    for (var j = 0; j < this.options.column_spans.length; j++) {
      if (matchesSelector(elem, this.options.column_spans[j].selector)) {
        item.span = this.options.column_spans[j].spans;
        break;
      }
      // console.log(this.options.column_spans[i].selector);
    }
    // use columnSpans
    // if (elem.matches("#rev-slider .rev-content:nth-child(4)")) {
    //   // console.log('hinnnaaa', elem.matches("#rev-slider .rev-content:nth-child(4)"));
    //   // item.setSpaner(2);
    //   console.log(this.options.column_spans);
    //   item.span = 2;
    // } else {
    //   // item.setSpaner(1);
    //   item.span = 1;
    // }
    items.push( item );
  }

  return items;
};

AnyGrid.prototype.resize = function() {
    if ( !this.isResizeBound || !this.needsResizeLayout() ) {
        return;
    }
    // this._setUp();
    this._resetLayout();
    this.emitEvent( 'resize', [ this ] );
    // this.layout(6);
    // this.emitEvent( 'resized', [ this ] );
};

AnyGrid.prototype._resetLayout = function(check) {
    // console.log('reset', check);
    this.columns = {};
    this.rows = {};
    this.nextRow = 0;
    this.rowCounter = 0;
    this.nextColumn = 0;
    this.heights = {};
    this.maxHeight = 0;

    this.getSize();

    this.containerWidth = this.size.outerWidth;

    if (this.containerWidth >= this.options.breakpoints.xxl) {
        this.perRow = this.options.perRow.xxl;
        this.breakPoint = 'xxl';
    }else if (this.containerWidth >= this.options.breakpoints.xl) {
        this.perRow = this.options.perRow.xl;
        this.breakPoint = 'xl';
    }else if (this.containerWidth >= this.options.breakpoints.lg) {
        this.perRow = this.options.perRow.lg;
        this.breakPoint = 'lg';
    }else if (this.containerWidth >= this.options.breakpoints.md) {
        this.perRow = this.options.perRow.md;
        this.breakPoint = 'md';
    }else if (this.containerWidth >= this.options.breakpoints.sm) {
        this.perRow = this.options.perRow.sm;
        this.breakPoint = 'sm';
    }else if (this.containerWidth >= this.options.breakpoints.xs) {
        this.perRow = this.options.perRow.xs;
        this.breakPoint = 'xs';
    }else {
        this.perRow = this.options.perRow.xxs;
        this.breakPoint = 'xxs';
    }

    if (!this.perRow) { // try to just set it to what was passed
        this.perRow = parseInt(this.options.perRow);
    }

    this.rowCount = this.options.rows[this.breakPoint] ? this.options.rows[this.breakPoint] : this.options.rows;
};

AnyGrid.prototype._postLayout = function() {
  this.resizeContainer();
  this.emitEvent( 'postLayout', [ this ] );
};

AnyGrid.prototype._create = function() {
    this.reloadItems();

    this.element.style.position = "relative";

    if ( this.options.isResizeBound ) {
        this.bindResize();
    }

    this._resetLayout('create');
};

/**
 * layout a collection of item elements
 * @api public
 */
// AnyGrid.prototype.layoutItems = function( items, isInstant ) {
//   items = this._getItemsForLayout( items );
//   // console.log('layout');
//   // this.columns = {};
//   // this.rows = {};
//   // this.nextRow = 0;
//   // this.rowCounter = 0;
//   // this.nextColumn = 0;

//   // this.totalRows = Math.ceil(items.length / this.perRow);
//   // this.totalRows++;
//   // this.totalRows++;
//   // this.totalRows++;
//   // // var max = Math.max(this.perRow, this.totalRows); // TODO

//   // for (var i = 0; i < this.totalRows; i++) {
//   //     this.columns[i] = {
//   //       left: 0,
//   //     };

//   //     this.rows[i] = {
//   //       top: 0,
//   //       count: 0,
//   //       maxHeight: 0
//   //     };
//   // }

//   // console.log('do itaaaa', this.rows, this.columns);
//   this._layoutItems( items, isInstant );

//   this._postLayout();
// };

/**
 * get the items to be laid out
 * you may want to skip over some items
 * @param {Array} items
 * @returns {Array} items
 */
// AnyGrid.prototype._getItemsForLayout = function( items ) {
//   var layoutItems = [];

//   this.limit = 0;

//   for ( var i=0, len = items.length; i < len; i++ ) {
//     var item = items[i];
//     var span = item.setSpan((i+1), this.options.column_spans, this.perRow);
//     if ( !item.isIgnored ) {
//       layoutItems.push( item );
//     }
//   }
//   return layoutItems;
// };


AnyGrid.prototype.getComputedStyle = function (el, prop) {
    if (getComputedStyle !== 'undefined') {
        return getComputedStyle(el, null).getPropertyValue(prop);
    } else {
        return el.currentStyle[prop];
    }
};

AnyGrid.prototype._getItemLayoutPosition = function( item ) {
    // item.element.style.width = (this.containerWidth / this.columns.length) + 'px';

    var paddingTop = parseFloat(this.getComputedStyle(item.element, 'padding-top'));
    var paddingRight = parseFloat(revUtils.getComputedStyle(item.element, 'padding-right'));
    var paddingBottom = parseFloat(this.getComputedStyle(item.element, 'padding-bottom'));
    var paddingLeft = parseFloat(this.getComputedStyle(item.element, 'padding-left'));

    //promote child padding $$$
    var child = item.element.children[0];
    var childPaddingTop = parseFloat(this.getComputedStyle(child, 'padding-top'));
    var childPaddingRight = parseFloat(revUtils.getComputedStyle(child, 'padding-right'));
    var childPaddingBottom = parseFloat(this.getComputedStyle(child, 'padding-bottom'));
    var childPaddingLeft = parseFloat(this.getComputedStyle(child, 'padding-left'));

    item.element.style.paddingTop = paddingTop + childPaddingTop + 'px';
    item.element.style.paddingRight = paddingRight + childPaddingRight + 'px';
    item.element.style.paddingBottom = paddingBottom + childPaddingBottom + 'px';
    item.element.style.paddingLeft = paddingLeft + childPaddingLeft + 'px';

    child.style.padding = '0';

    var paddingLeft = parseInt(this.getComputedStyle(item.element, 'padding-left'));
    var paddingRight = parseInt(this.getComputedStyle(item.element, 'padding-right'));

    var width = ((this.containerWidth / this.perRow) + ((paddingLeft + paddingRight) / this.perRow)) * item.span;

    item.element.style.width = width + 'px';

    if (this.options.adjustGutter) {
      this.element.parentNode.style.marginLeft = (paddingLeft * -1) + 'px';
    }

    var row = this.nextRow;

    var column = this.nextColumn;

    item.row = row;
    item.column = column;

    if (!this.rows[row]) {
      this.rows[row] = {
          top: 0,
          count: 0,
          maxHeight: 0
      };
    }

    if (!this.rows[column]) {
      this.rows[column] = {
          top: 0,
          count: 0,
          maxHeight: 0
      };
    }

    if (!this.columns[row]) {
      this.columns[row] = {
        left: 0
      };
    }

    if (!this.heights[row]) {
      this.heights[row] = {};
    }

    if (!this.heights[row][column]) {
      this.heights[row][column] = {
        height: 0
      };
    }

    if (!this.rows[row].perRow) {
      this.rows[row].perRow = this.perRow;
    }

    if (item.span > 1) {
      this.rows[row].perRow = ((this.rows[row].perRow - item.span) * 2) + 1;
      this.rows[row].spans = { //TODO
        leftReset: width,
        span: item.span
      };
    }

    this.rowCounter++;

    if (this.rowCounter == this.rows[row].perRow) {
        this.rowCounter = 0;
        this.nextRow++;
    }

    this.rows[row].count++;

    this.nextColumn += item.span;

    // if the row count matches perRow reset to 0
    if (this.rows[row].count == this.rows[row].perRow) {
        this.nextColumn = 0;
    }

    if (this.nextStacked) {
      item.stacked = true;
    }

    // if the nextColumn is >= perRow or next is stacked use the same row
    if (this.nextColumn >= this.perRow || this.nextStacked) {
        this.nextColumn = this.rows[row].spans.span;
        this.rows[row].spans.span = this.rows[row].spans.span + item.span;

        if (this.rows[row].count >= this.rows[row].perRow) {
          this.nextStacked = false;
          this.nextColumn = 0;
        } else {
          this.nextStacked = true;
        }
    } else {
      this.nextStacked = false;
    }

    if (this.options.removeVerticalGutters && !this.nextStacked && (row + 1) == this.rowCount) {
      item.element.style.setProperty('padding-bottom', '0', 'important');
    }

    if (this.options.removeVerticalGutters && row === 0 && item.stacked !== true) {
      item.element.style.setProperty('padding-top', '0', 'important');
    }

    item.getSize();

    var x = this.columns[row].left;

    var y = this.rows[column].top; // set the top to the row column top

    // prepare for next time
    if (this.heights[row][column].height > 0) {
       this.heights[row][column].height = this.heights[row][column].height + item.size.height;
    } else {
      this.heights[row][column].height = item.size.height;
    }

    this.rows[column].top = this.rows[column].top + item.size.height;

    // increae top for all row columns
    for (var i = 1; i < item.span; i++) {
      if (!this.rows[column + i]) {
        this.rows[column + i] = {
            top: 0,
            count: 0,
            maxHeight: 0
        };
      }
      this.rows[column + i].top = this.rows[column + i].top + item.size.height;
    }

    // if not in the first column, same column and not stacked
    if (this.nextColumn === 0 || (this.nextColumn != column && !this.nextStacked)) {
      // increase the left
      this.columns[row].left = this.columns[row].left + width;
      // all done for this row? make sure things are maxed out
      if ((column + 1) == this.perRow) {
        var max = 0;
        for (var key in this.rows) { // get max
          if (this.rows.hasOwnProperty(key) && this.rows[key].top > max) {
            max = this.rows[key].top;
          }
        }

        for (var key in this.rows) {
          if (this.rows.hasOwnProperty(key)) {
            this.rows[key].top = max;
          }
        }
      }
    } else {
      if (!this.columns[row].leftReset) {
        this.columns[row].leftReset = this.rows[row].spans.leftReset;
      } else {
        this.columns[row].leftReset = this.columns[row].leftReset + width;
      }
      this.columns[row].left = this.columns[row].leftReset;
    }

    // maxHeight
    this.maxHeight = Math.max(this.maxHeight, this.rows[column].top);

    // if last item in the row calculate heights
    if (this.rows[row].count == this.rows[row].perRow) {
      var maxHeight = 0;
      for (var key in this.heights[row]) { // get max
        if (this.heights[row].hasOwnProperty(key) && this.heights[row][key].height > maxHeight) {
          maxHeight = this.heights[row][key].height;
        }
      }
      this.heights[row].maxHeight = maxHeight;
    }

    this.rows[row].maxHeight = this.maxHeight;

    return {
      x: x,
      y: y
    };
};

AnyGrid.prototype._getContainerSize = function() {
    return {
        height: this.maxHeight
    };
};

return AnyGrid;

}));