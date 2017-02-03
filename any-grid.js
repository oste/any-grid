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
    isLayoutInstant: true,
    hiddenStyle: {
        opacity: 0
    },
    visibleStyle: {
        opacity: 1
    },
    adjustGutter: false,
    removeVerticalGutters: false
});

AnyGrid.prototype.getBreakPoint = function() {
    return this.breakPoint;
};

AnyGrid.prototype.getPerRow = function() {
    return this.perRow;
};

AnyGrid.prototype.resize = function() {
    if ( !this.isResizeBound || !this.needsResizeLayout() ) {
        return;
    }
    this._setUp();
    this.emitEvent( 'resize', [ this ] );
    this.layout();
    this.emitEvent( 'resized', [ this ] );
};

AnyGrid.prototype._setUp = function() {
    this.getSize();

    this.containerWidth = this.size.outerWidth;

    if (this.containerWidth >= 1500) {
        this.perRow = this.options.perRow.xxl;
        this.breakPoint = 'xxl';
    }else if (this.containerWidth >= 1250) {
        this.perRow = this.options.perRow.xl;
        this.breakPoint = 'xl';
    }else if (this.containerWidth >= 1000) {
        this.perRow = this.options.perRow.lg;
        this.breakPoint = 'lg';
    }else if (this.containerWidth >= 750) {
        this.perRow = this.options.perRow.md;
        this.breakPoint = 'md';
    }else if (this.containerWidth >= 500) {
        this.perRow = this.options.perRow.sm;
        this.breakPoint = 'sm';
    }else if (this.containerWidth >= 250) {
        this.perRow = this.options.perRow.xs;
        this.breakPoint = 'xs';
    }else {
        this.perRow = this.options.perRow.xxs;
        this.breakPoint = 'xxs';
    }

    if (!this.perRow) { // try to just set it to what was passed
        this.perRow = parseInt(this.options.perRow);
    }
};

AnyGrid.prototype._create = function() {
    var that = this;

    this.reloadItems();

    this.element.style.position = "relative";

    if ( this.options.isResizeBound ) {
        this.bindResize();
    }

    this._setUp();
};

/**
 * layout a collection of item elements
 * @api public
 */
AnyGrid.prototype.layoutItems = function( items, isInstant ) {
  items = this._getItemsForLayout( items );

  this.columns = [];
  this.rows = {};
  for (var i = 0; i < this.perRow; i++) {
      this.columns[i] = 0;
  }

  this.maxHeight = 0;
  this.itemIndex = 0;

  this._layoutItems( items, isInstant );

  this._postLayout();
};

AnyGrid.prototype.getComputedStyle = function (el, prop) {
    if (getComputedStyle !== 'undefined') {
        return getComputedStyle(el, null).getPropertyValue(prop);
    } else {
        return el.currentStyle[prop];
    }
};

AnyGrid.prototype._getItemLayoutPosition = function( item ) {
    var padding = parseInt(this.getComputedStyle(item.element, 'padding-left'));

    var width = (this.containerWidth / this.columns.length) + ((padding * 2) / this.columns.length);

    item.element.style.width = width + 'px';

    var row = Math.floor( this.itemIndex / this.columns.length ) + 1;

    if (this.options.removeVerticalGutters) {
        if (row === 1) {
            item.element.style.setProperty('padding-top', '0', 'important');
        }
        if (row === this.rowsCount) {
            item.element.style.setProperty('padding-bottom', '0', 'important');
        }
    }

    if (this.options.adjustGutter) {
      this.element.parentNode.style.marginLeft = (padding * -1) + 'px';
    }

    item.getSize();

    var column = this.itemIndex % this.columns.length;

    var x = column * width;
    var y = this.columns[column];

    var itemHeight = (this.options.itemHeight ? this.options.itemHeight : item.size.height);

    this.rowsCount = (this.items.length / this.columns.length);

    if (this.options.stacked) { // need the row for removeVerticalGutters
        column = Math.floor(this.itemIndex / this.rowsCount);
        row = Math.abs((column * this.rowsCount) - this.itemIndex) + 1;
    }

    if (this.options.masonry) {
        if (this.options.orderMasonry) {
            this.columns[column] = this.columns[column] + itemHeight;
            this.maxHeight = Math.max(this.maxHeight, this.columns[column]);
        } else {
            var minimumY = Math.min.apply( Math, this.columns );
            var shortColIndex = this.columns.indexOf( minimumY );
            var x = width * shortColIndex;
            var y = minimumY;
            this.columns[ shortColIndex ] = minimumY + itemHeight;
            this.maxHeight = Math.max.apply( Math, this.columns );
        }
    } else if (this.options.stacked) {
        x = column * width;
        y = this.columns[column];

        this.columns[column] = this.columns[column] + itemHeight;

        this.maxHeight = Math.max(this.maxHeight, this.columns[column]);
    } else {
        var firstColumn = (row > 1);

        if (firstColumn) {
            this.columns[column] = this.rows[(row - 1)].maxHeight + itemHeight;
        } else {
            this.columns[column] = this.columns[column] + itemHeight;
        }

        if (firstColumn) {
            y = this.rows[(row - 1)].maxHeight;
            this.maxHeight = Math.max(this.maxHeight, y + itemHeight);
        } else { // if it's the fist row y = 0 and maxHeight is just the height of the tallest item
            this.maxHeight = Math.max(this.maxHeight, itemHeight);
        }
    }

    this.rows[row] = this.rows[row] || {};
    if (!this.rows[row].maxHeight || (this.columns[column] > this.rows[row].maxHeight)) {
        this.rows[row].maxHeight = this.columns[column];
    }
    if (!this.rows[row].height || (itemHeight > this.rows[row].height)) {
        this.rows[row].height = itemHeight;
    }

    this.itemIndex++;

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