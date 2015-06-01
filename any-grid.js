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
        xxs: 3,
        xs: 4,
        sm: 5,
        md: 5,
        lg: 5,
        xl: 6,
        xxl: 7
    },
    isLayoutInstant: true,
    hiddenStyle: {
        opacity: 0
    },
    visibleStyle: {
        opacity: 1
    }
});

AnyGrid.prototype._setUp = function() {
    this.getSize();

    this.containerWidth = Math.floor(this.size.outerWidth);

    if (this.containerWidth >= 1400) {
        this.perRow = this.options.perRow.xxl;
    }else if (this.containerWidth >= 1260) {
        this.perRow = this.options.perRow.xl;
    }else if (this.containerWidth >= 1100) {
        this.perRow = this.options.perRow.lg;
    }else if (this.containerWidth >= 850) {
        this.perRow = this.options.perRow.md;
    }else if (this.containerWidth >= 600) {
        this.perRow = this.options.perRow.sm;
    }else if (this.containerWidth >= 350) {
        this.perRow = this.options.perRow.xs;
    }else {
        this.perRow = this.options.perRow.xxs;
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
    item.getSize();

    item.element.style.width = this.columnWidth + 'px';

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