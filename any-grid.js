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
    }
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

    var containerWidth = Math.floor(this.size.outerWidth);

    if (containerWidth >= 1500) {
        this.perRow = this.options.perRow.xxl;
        this.breakPoint = 'xxl';
    }else if (containerWidth >= 1250) {
        this.perRow = this.options.perRow.xl;
        this.breakPoint = 'xl';
    }else if (containerWidth >= 1000) {
        this.perRow = this.options.perRow.lg;
        this.breakPoint = 'lg';
    }else if (containerWidth >= 750) {
        this.perRow = this.options.perRow.md;
        this.breakPoint = 'md';
    }else if (containerWidth >= 500) {
        this.perRow = this.options.perRow.sm;
        this.breakPoint = 'sm';
    }else if (containerWidth >= 250) {
        this.perRow = this.options.perRow.xs;
        this.breakPoint = 'xs';
    }else {
        this.perRow = this.options.perRow.xxs;
        this.breakPoint = 'xxs';
    }

    if (!this.perRow) { // try to just set it to what was passed
        this.perRow = parseInt(this.options.perRow);
    }

    this.containerWidth = containerWidth;

    if (this.options.adjust_gutter && this.items.length) {
        this.itemPadding = getSize(this.items[0].element).paddingLeft;
        this.element.parentNode.style.marginLeft = (this.itemPadding * -1) + 'px';
        this.containerWidth = containerWidth + (this.itemPadding * 2);
    }

    this.columnWidth = (this.containerWidth / this.perRow);

    this.cols = Math.floor( this.containerWidth / this.columnWidth );
    this.cols = Math.max( this.cols, 1 );

    this.columns = {};
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

    this.bindResize();

    this._setUp();
};

AnyGrid.prototype._resetLayout = function() {
    this._setUp();
};

AnyGrid.prototype._getItemLayoutPosition = function( item ) {
    item.getSize();

    var column = this.itemIndex % this.cols;

    var x = column * this.columnWidth;
    var y = this.columns[column];

    var itemHeight = (this.options.itemHeight ? this.options.itemHeight : item.size.height);

    if (this.options.masonry) {
        this.columns[column] = this.columns[column] + itemHeight;
        this.maxHeight = Math.max(this.maxHeight, this.columns[column]);
    } else if (this.options.stacked) {
        var rows = (this.items.length / this.cols);
        column = Math.floor(this.itemIndex / rows);
        var row = (Math.floor((this.itemIndex + 1) / (column + 1)) - 1);

        x = column * this.columnWidth;
        y = this.columns[column];

        this.columns[column] = this.columns[column] + itemHeight;

        this.maxHeight = Math.max(this.maxHeight, this.columns[column]);
    } else {
        var row = Math.floor( this.itemIndex / this.cols );
        var firstColumn = (row > 0);

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