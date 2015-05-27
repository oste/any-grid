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
    }
});

AnyGrid.prototype._create = function() {
    var that = this;

    this.reloadItems();

    this.element.style.position = "relative";

    // bind resize method
    this.bindResize();

    imagesLoaded(this.element, function() {
        that.layout();
    });
};

AnyGrid.prototype._resetLayout = function() {
    var that = this;

    this.getSize();

    this.containerWidth = Math.floor(this.size.outerWidth);

    // can't have comparison in switch
    if (this.containerWidth >= 1400) {
        this.containerSize = 'xxl';
        this.perRow = this.options.perRow.xxl;
        //TODO: determine if this is needed
        // this.element.className = 'grid-size-xxl';
    }else if (this.containerWidth >= 1260) {
        this.containerSize = 'xl';
        this.perRow = this.options.perRow.xl;
        // this.element.className = 'grid-size-xl';
    }else if (this.containerWidth >= 1100) {
        this.containerSize = 'lg';
        this.perRow = this.options.perRow.lg;
        // this.element.className = 'grid-size-lg';
    }else if (this.containerWidth >= 850) {
        this.containerSize = 'md';
        this.perRow = this.options.perRow.md;
        // this.element.className = 'grid-size-md';
    }else if (this.containerWidth >= 600) {
        this.containerSize = 'sm';
        this.perRow = this.options.perRow.sm;
        // this.element.className = 'grid-size-sm';
    }else if (this.containerWidth >= 350) {
        this.containerSize = 'xs';
        this.perRow = this.options.perRow.xs;
        // this.element.className = 'grid-size-xs';
    }else {
        this.containerSize = 'xxs';
        this.perRow = this.options.perRow.xxs;
        // this.element.className = 'grid-size-xxs';
    }

    this.columnWidth = (this.containerWidth / this.perRow);

    var list = this.element.children;
    for (var i = 0; i < list.length; i++) {
        list[i].style.width = this.columnWidth + 'px';
    }

    this.cols = Math.floor( this.containerWidth / this.columnWidth );
    this.cols = Math.max( this.cols, 1 );

    this.columns = {};
    this.rows = {};
    for (var i = 0; i < this.cols; i++) {
        this.columns[i] = 0;
    };

    this.maxHeight = 0;
    this.itemIndex = 0;
};

AnyGrid.prototype._getItemLayoutPosition = function( item ) {
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