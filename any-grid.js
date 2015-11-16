( function( window, factory ) {
  'use strict';
    // browser global
    window.AnyGrid = factory(
      window.Outlayer
    );

}( window, function factory( Outlayer) {
'use strict';

var AnyGrid = Outlayer.create( 'anyGrid', {
    masonry: true,
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
}

AnyGrid.prototype.getPerRow = function() {
    return this.perRow;
}

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

    this.containerWidth = Math.floor(this.size.outerWidth);

    if (this.containerWidth >= 1500) {
        this.perRow = this.options.perRow.xxl;
        this.breakPoint = 'xxl'
    }else if (this.containerWidth >= 1250) {
        this.perRow = this.options.perRow.xl;
        this.breakPoint = 'xl'
    }else if (this.containerWidth >= 1000) {
        this.perRow = this.options.perRow.lg;
        this.breakPoint = 'lg'
    }else if (this.containerWidth >= 750) {
        this.perRow = this.options.perRow.md;
        this.breakPoint = 'md'
    }else if (this.containerWidth >= 500) {
        this.perRow = this.options.perRow.sm;
        this.breakPoint = 'sm'
    }else if (this.containerWidth >= 250) {
        this.perRow = this.options.perRow.xs;
        this.breakPoint = 'xs'
    }else {
        this.perRow = this.options.perRow.xxs;
        this.breakPoint = 'xxs'
    }

    if (!this.perRow) { // try to just set it to what was passed
        this.perRow = parseInt(this.options.perRow);
    }

    this.columnWidth = (this.containerWidth / this.perRow);

    this.cols = Math.floor( this.containerWidth / this.columnWidth );
    this.cols = Math.max( this.cols, 1 );

    this.columns = {};
    this.rows = {};
    for (var i = 0; i < this.cols; i++) {
        this.columns[i] = 0;
    };

    this.maxHeight = 0;
    this.itemIndex = 0;
}

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
    item.element.style.width = this.columnWidth + 'px';

    item.getSize();

    var column = this.itemIndex % this.cols;

    var x = column * this.columnWidth;
    var y = this.columns[column];

    if (this.options.masonry) {
        this.columns[column] = this.columns[column] + item.size.height;
        this.maxHeight = Math.max(this.maxHeight, this.columns[column]);
    } else {
        var row = Math.floor( this.itemIndex / this.cols );
        var firstColumn = (row > 0);

        if (firstColumn) {
            this.columns[column] = this.rows[(row - 1)].maxHeight + item.size.height;
        } else {
            this.columns[column] = this.columns[column] + item.size.height;
        }

        this.rows[row] = this.rows[row] || {};
        if (!this.rows[row].maxHeight || (this.columns[column] > this.rows[row].maxHeight)) {
            this.rows[row].maxHeight = this.columns[column];
        }

        if (firstColumn) {
            y = this.rows[(row - 1)].maxHeight;
            this.maxHeight = Math.max(this.maxHeight, y + item.size.height);
        } else { // if it's the fist row y = 0 and maxHeight is just the height of the tallest item
            this.maxHeight = Math.max(this.maxHeight, item.size.height);
        }
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