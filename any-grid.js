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
    gutter: false,
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
    this.emitEvent( 'resize', [ this ] );
    this.layout();
    this.emitEvent( 'resized', [ this ] );
};

AnyGrid.prototype._setUp = function() {
    this.getSize();

    this.containerWidth = Math.round(this.size.outerWidth);

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

    this.verticalPadding = this.options.gutter ? this.options.gutter : (this.items.length ? getSize(this.items[0].element).paddingTop : 0);

    var measureContainerWidth = this.containerWidth;

    if (this.options.adjustGutter && (this.items.length || this.options.gutter)) {
        var padding = this.options.gutter ? this.options.gutter : getSize(this.items[0].element).paddingLeft;
        this.element.parentNode.style.marginLeft = (padding * -1) + 'px';
        measureContainerWidth = this.containerWidth + (padding * 2);
    }

    this.columnWidth = (measureContainerWidth / this.perRow);

    this.cols = Math.floor( measureContainerWidth / this.columnWidth );
    this.cols = Math.max( this.cols, 1 );

    this.columns = [];
    this.rows = {};
    for (var i = 0; i < this.cols; i++) {
        this.columns[i] = 0;
    }

    this.maxHeight = 0;
    this.itemIndex = 0;
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

AnyGrid.prototype._resetLayout = function() {
    this._setUp();
};

AnyGrid.prototype._getItemLayoutPosition = function( item ) {
    item.element.style.width = this.columnWidth + 'px';
    item.getSize();

    var column = this.itemIndex % this.cols;

    var x = column * this.columnWidth;
    var y = this.columns[column];

    var itemHeight = (this.options.itemHeight ? this.options.itemHeight : item.size.height);

    this.rowsCount = (this.items.length / this.cols);
    var row = Math.floor( this.itemIndex / this.cols ) + 1;

    if (this.options.stacked) { // need the row for removeVerticalGutters
        column = Math.floor(this.itemIndex / this.rowsCount);
        row = Math.abs((column * this.rowsCount) - this.itemIndex) + 1;
    }

    if (this.options.removeVerticalGutters) {
        if (row === 1 && item.size.paddingTop) {
            itemHeight = itemHeight - this.verticalPadding
        }
        if (row === this.rowsCount && item.size.paddingBottom) {
            itemHeight = itemHeight - this.verticalPadding
        }
    }

    if (this.options.masonry) {
        if (this.options.orderMasonry) {
            this.columns[column] = this.columns[column] + itemHeight;
            this.maxHeight = Math.max(this.maxHeight, this.columns[column]);
        } else {
            var minimumY = Math.min.apply( Math, this.columns );
            var shortColIndex = this.columns.indexOf( minimumY );
            var x = this.columnWidth * shortColIndex;
            var y = minimumY;
            this.columns[ shortColIndex ] = minimumY + itemHeight;
            this.maxHeight = Math.max.apply( Math, this.columns );
        }
    } else if (this.options.stacked) {
        x = column * this.columnWidth;
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
        row: row,
        x: x,
        y: y
    };
};

/**
 * iterate over array and position each item
 * Reason being - separating this logic prevents 'layout invalidation'
 * thx @paul_irish
 * @param {Array} queue
 */
AnyGrid.prototype._processLayoutQueue = function( queue ) {
  for ( var i=0, len = queue.length; i < len; i++ ) {
    var obj = queue[i];
    this._positionItem( obj.item, obj.x, obj.y, obj.isInstant, obj.row );
  }
};

AnyGrid.prototype._positionItem = function( item, x, y, isInstant, row ) {
    if ( isInstant ) {
        // if not transition, just set CSS
        item.goTo( x, y );
    } else {
        item.moveTo( x, y, (this.options.stacked ? true : false));
    }
    if (this.options.removeVerticalGutters) {
        item.element.style.padding = this.verticalPadding + 'px';
        if (row === 1) {
            item.element.style.paddingTop = '0';
        }
        if (row === this.rowsCount) {
            item.element.style.paddingBottom = '0';
        }
    }
};

AnyGrid.prototype._postLayout = function() {
    this.resizeItems();
    this.resizeContainer();
};

AnyGrid.prototype.resizeItems = function() {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].element.style.width = this.columnWidth + 'px';
    }
};

AnyGrid.prototype._getContainerSize = function() {
    return {
        height: this.maxHeight
    };
};

return AnyGrid;

}));