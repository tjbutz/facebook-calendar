/**
 * A Facebook puzzle solution.
 * 
 * Author: Tino Butz
 */

/**
 * @namespace The top level Facebook namespace.
 */
var FB = FB || {};

/**
 * @namespace The ui namespace. Contains all ui related classes.
 */
FB.ui = FB.ui || {};

/**
 * @namespace The calendar widget namespace. Contains all calendar related classes.
 */
FB.ui.calendar = FB.calendar || {};

/**
 * @namespace The data namespace. Contains all data related classes.
 */
FB.data = FB.data || {};

/**
 * @namespace The util namespace. Contains all util related classes.
 */
FB.util = FB.util || {};

(function() {

  /** @exports Node as FB.data.Node */
  var Node = 
    /**
     * The node class represents a node in an interval tree (based on red / black tree).
     * @constructor
     * @param {Object} data The data to store in the node. All properties of the interval interface have to be implemented (id / start / end).
     */
    FB.data.Node = function(data) {
      this.data = data;
      this._left = null;
      this._right = null;
      this._parent = null;
      this._max = null;
      // New nodes are always red
      this._color = Node.RED;
  };
  
  
  /** 
   * Constant indicating that the node is black 
   * @constant
   */
  Node.BLACK = false;
  
  /** 
   * Constant indicating that the node is red 
   * @constant
   */
  Node.RED = true;
  
  /** 
   * Constant to determine the left child of a node 
   * @constant
   */
  Node.LEFT = 0;
  
  /** 
   * Constant to determine the right child of a node 
   * @constant
   */
  Node.RIGHT = 1;
  
  /**
   * Checks if a node is red colored. Red is the default color of a new
   * node.
   *
   * @returns {Boolean} True if the node is red colored.
   */
  Node.prototype.isRed = function() {
    return this._color === Node.RED;
  };
  
  
  /**
   * Checks if a node is black colored.
   *
   * @returns {Boolean} True if the node is black colored.
   */
  Node.prototype.isBlack = function() {
    return this._color === Node.BLACK;
  };
  
  
  /**
   * Sets the color of a node.
   *
   * @param {Boolean} color Node.BLACK | Node.RED
   */
  Node.prototype.setColor = function(color) {
    return this._color = color;
  };
  
  
  /**
   * Returns the parent node of this node.
   *
   * @returns {FB.data.Node} The parent node. Returns 'null' if the node has no parent.
   */
  Node.prototype.getParent = function() {
    return this._parent;
  };


  /**
   * Sets the parent node of this node.
   *
   * @param {FB.data.Node} parent The parent node. Returns 'null' if the node has no parent.
   */
  Node.prototype.setParent = function(parent) {
    this._parent = parent;
  };  
  

  /**
   * Returns the maximum right value of all child nodes intervals. Is used as
   * an indicator to abort search in in a certain branch of the tree.
   *
   * @returns {Integer} The maximum right value of all child nodes intervals.
   */
  Node.prototype.getMax = function() {
    return this._max;
  };


  /**
   * Sets the maximum right value of all child nodes intervals. Is used as
   * an indicator to abort search in in a certain branch of the tree.
   *
   * @param {Integer} max The maximum right value of all child nodes intervals.
   */
  Node.prototype.setMax = function(max) {
    this._max = max;
  };   
  
  /**
   * Returns the grandfather node of this node.
   *
   * @returns {FB.data.Node} The grandfather node. Returns 'null' if the node has no grandfather.
   */
  Node.prototype.getGrandfather = function() {
    if (this.getParent() != null) {
      return this.getParent().getParent();	
    } 
    return null;
  };
  
  
  /**
   * Returns the child node of this node depending on the direction.
   *
   * @param {Integer} direction Node.LEFT or Node.RIGHT.
   * @returns {FB.data.Node} The child node. Returns 'null' if the node has no child.
   */	
  Node.prototype.getChild = function(direction) {
    return direction ? this._right : this._left;	
  };
  
  
  /**
   * Sets the child node of this node depending on the direction.
   *
   * @param {FB.data.Node} node The node that should be set as a child.
   * @param {Integer} direction Node.LEFT or Node.RIGHT.
   */	
  Node.prototype.setChild = function(node, direction) {
    this[direction ? "_right" : "_left"] = node;
  };
  
  
  /** @exports Tree as FB.data.Tree */
  var Tree = 
    /**
     * The tree class represents an interval tree based on a red / black tree.
     * An interval tree is the optimal data structore for events. Insert
     * is O(lg n) and (as the tree is balanced) search for a node can be achieved
     * in O(lg n) time as well. See Cormen, introduction to Algorithms, Interval Trees
     * for more information.
     *
     * @constructor
     * @param {Object} comparator The comperator delegate. The delgate gets called whenever a node is added and two nodes have to be compared.
     *                            Returns 0 when the start time of the first event is less than the start time of the second event. 1 for the opposite case.
     */
    FB.data.Tree = function(comparator) {
    this._root = null;
    this._comparator = comparator;
    this._size = 0;
  };


  /**
   * Returns the number of nodes that the tree contains.
   *
   * @return {Integer} The number of nodes.
   */
  Tree.prototype.getSize = function() {
    return this._size;
  };


  /**
   * Inserts a node into the tree.
   * 
   * @param {Object} data The data assoicated with the new node.  All methods of the interval interface have to be implemented (id / start / end).
   */  
  Tree.prototype.insert = function(data) {
    
    var node = this._insertNode(data);
  
    // Set the maximum for the interval tree
    node.setMax(this._getMax(node));
    
    while (node != this._root && node.getParent().isRed()) {
      var direction = Node.LEFT;
      if (node.getParent() == node.getGrandfather().getChild(Node.LEFT)) {
        direction = Node.RIGHT;
      }
      var node = this._checkViolation(node, direction);
    }
  
    // Root is always black
    this._root.setColor(Node.BLACK);	
  };
  
  
  /**
   * Checks for violations of the constraints of a red / black tree.
   * Left / Right rotates a node, when a constraint is violated.
   * 
   * @param {FB.data.Node} node The node to check the violation for.
   * @param {Integer} direction Node.LEFT or Node.RIGHT.
   * @returns {FB.data.Node} The right node after the check.
   */
  Tree.prototype._checkViolation = function(node, direction) {
      // Check violations
      var uncle = node.getGrandfather().getChild(direction);
      if (uncle && uncle.isRed()) {
        node.getParent().setColor(Node.BLACK);
        uncle.setColor(Node.BLACK);
        node.getGrandfather().setColor(Node.RED);
        node = node.getGrandfather();
      } else {
        if (node == node.getParent().getChild(direction)) {
          node = node.getParent();
          if (direction === Node.RIGHT) {
            this._leftRotate(node);
          } else {
            this._rightRotate(node);        
          }
        }
        node.getParent().setColor(Node.BLACK);
        node.getGrandfather().setColor(Node.RED);
        if (direction === Node.RIGHT) {
          this._rightRotate(node.getGrandfather());
        } else {
          this._leftRotate(node.getGrandfather());        
        }
      }
      return node;
  };
  
  
  /**
   * Returns the maximum of the interval of the node or its children. Used for optimization
   * for the interval search. Sub trees that does not match the maximum and the
   * searched interval can be skiped.
   *
   * @param {FB.data.Node} node The node to get the max for.
   * @returns {Integer} The maximum of the interval or its children.
   */
  Tree.prototype._getMax = function(node) {
    var left = node.getChild(Node.LEFT);
    var right = node.getChild(Node.RIGHT);
    return Math.max(node.data.end, Math.max(left != null ? left.getMax() : 0, right != null ? right.getMax() : 0));
  };
  
  
  /**
   * Left rotates a node. Used to keep the balance of the red / black tree.
   *
   * @param {FB.data.Node} node The node to rotate.
   */
  Tree.prototype._leftRotate = function(node) {
    this._rotate(node, Node.LEFT);
  };


  /**
   * Right rotates a node. Used to keep the balance of the red / black tree.
   *
   * @param {FB.data.Node} node The node to rotate.
   */
  Tree.prototype._rightRotate = function(node) {
    this._rotate(node, Node.RIGHT);
  };


  /**
   * Rotates a node to a certain direction. Used to keep the balance of the red / black tree.
   *
   * @param {FB.data.Node} node The node to rotate.
   * @param {Integer} direction Node.LEFT or Node.RIGHT.
   */ 
  Tree.prototype._rotate = function(node, direction) {
  
    var otherDirection = (direction === Node.RIGHT ? Node.LEFT : Node.RIGHT);
  
    var child = node.getChild(otherDirection);
    if (child === null) throw new Error("Child is null");
    
    node.setChild(child.getChild(direction), otherDirection);
    if (child.getChild(direction) != null) { 
      child.getChild(direction).setParent(node);
    }
    child.setParent(node.getParent());
    if (node.getParent() === null) {
      this._root = child;	
    } else {
      if (node == node.getParent().getChild(direction)) {
        node.getParent().setChild(child, direction);
      } else {
        node.getParent().setChild(child, otherDirection);
      }
    }
    child.setChild(node, direction);
    node.setParent(child);
    
    // Update the max
    child.setMax(this._getMax(child));
    node.setMax(this._getMax(node));	
  };
  
  
  /**
   * Inserts a node to the tree and stores the given data.
   *
   * @param {Object} data The data assoicated with the new node.
   * @returns {FB.data.Node} The added node.
   */
  Tree.prototype._insertNode = function(data) {
    
    var newNode = new Node(data); // z
  
    var parent = null; // y
    var node = this._root; // x
    while (node != null) {
      parent = node;
      node = node.getChild(this._comparator(newNode.data, node.data));
    }
    
    newNode.setParent(parent);
  
    if (parent === null) {
      this._root = newNode;
    } else {
        parent.setChild(newNode, this._comparator(newNode.data, parent.data));			
    }
    
    this._size++;
    
    return newNode;
  };
  

  /**
   * Returns the node that represents the minimum interval. When no node is passed as an argument,
   * search begins from root. As the tree is balanced, finding the minimum can be done by following
   * always the left child until the last node is found.
   *
   * @param {FB.data.Node} [node] The node to start the search from.
   * @returns {FB.data.Node} The node that represents the minimum interval.
   */
  Tree.prototype.minimum = function(node) {
    node = node || this._root;
    while (node.getChild(Node.LEFT) != null) {
      node = node.getChild(Node.LEFT);
    }
    return node;
  };


  /**
   * Returns the node that represents the maximum interval. When no node is passed as an argument,
   * search begins from root. As the tree is balanced, finding the maximum can be done by following
   * always the right child until the last node is found.
   *
   * @param {FB.data.Node} [node] The node to start the search from.
   * @returns {FB.data.Node} The node that represents the maximum interval.
   */
  Tree.prototype.maximum = function(node) {
    node = node || this._root;
    while (node.getChild(Node.RIGHT) != null) {
      node = node.getChild(Node.RIGHT);
    }
    return node;
  };
  
    
  /**
   * Returns the successor node. When no node is passed as an argument,
   * search begins from root.
   *
   * @param {FB.data.Node} [node] The node to start the search from.
   * @returns {FB.data.Node} The successor node.
   */
  Tree.prototype.successor = function(node) {
    if (node.getChild(Node.RIGHT) != null) {
      return this.minimum(node.getChild(Node.RIGHT));	
    }
    var parent = node.getParent();
    while (parent && node == parent.getChild(Node.RIGHT)) {
      var node = parent;
      parent = parent.getParent();	
    }
    return parent;
  };
 

  /**
   * Returns the predecessor node. When no node is passed as an argument,
   * search begins from root.
   *
   * @param {FB.data.Node} [node] The node to start the search from.
   * @returns {FB.data.Node} The predecessor node.
   */
  Tree.prototype.predecessor = function(node) {
    if (node.getChild(Node.LEFT) != null) {
      return this.maximum(node.getChild(Node.LEFT));	
    }
    var parent = node.getParent();
    while (parent && node == parent.getChild(Node.LEFT)) {
      var node = parent;
      parent = parent.getParent();	
    }
    return parent;
  };


  /**
   * Returns the orderd data of the tree. When no node is passed as an argument,
   * search begins from root.
   *
   * @param {FB.data.Node} [node] The node to start the search from.
   * @returns {Object[]} The orderd data.
   */
  Tree.prototype.getOrderedData = function(node) {
    node = node || this._root;
    node = this.minimum();
    var data = [];
    while (node != null) {
      data.push(node.data);
      node = this.successor(node);
    }
    return data;
  }; 


  /**
   * Returns the orderd nodes of the tree. When no node is passed as an argument,
   * search begins from root.
   *
   * @param {FB.data.Node} [node] The node to start the search from.
   * @returns {FB.data.Node[]} The orderd nodes.
   */  
  Tree.prototype.getOrdered = function(node) {
    node = node || this._root;
    node = this.minimum();
    var nodes = [];
    while (node != null) {
      nodes.push(node);
      node = this.successor(node);
    }
    return nodes;
  }; 


  /**
   * Returns the revered orderd data of the tree. When no node is passed as an argument,
   * search begins from root.
   *
   * @param {FB.data.Node} [node] The node to start the search from.
   * @returns {Object[]} The orderd data.
   */  
  Tree.prototype.getReverseOrderedData = function(node) {
    node = node || this._root;
    node = this.maximum();
    var nodes = [];
    while (node != null) {
      nodes.push(node.data);
      node = this.predecessor(node);
    }
    return nodes;
  };
  
  
  /**
   * Returns all intervals which collide with the given interval.
   * 
   * @param {Object} interval The interval to search for in the tree.  All methods of the interval interface have to be implemented (id / start / end).
   * @param {FB.data.Node} [node] The node to start the search from.
   * @param {Object[]} The colliding intervals.
   */
  Tree.prototype.searchInterval = function(interval, node) {
       node = node || this._root;
       result = [];
  
       var left = node.getChild(Node.LEFT);
       if (left != null && left.getMax() >= interval.start) {
         result = result.concat(this.searchInterval(interval, left));
       }
       
       if (Event.isColliding(node.data, interval)) {
         result.push(node.data);
       }
       
       var right = node.getChild(Node.RIGHT);
       if (right != null && node.data.start <= interval.end) {
         result = result.concat(this.searchInterval(interval, right));
       }
       
       return result;
  };
  

  /**
   * Returns the black height of the tree. Usefull for debugging.
   * When no node instance is passed as an argument, the root of the tree
   * is used to calculate the black height.
   *
   * @param {FB.data.Node} [node] Optional node to start from.
   * @returns {Integer} The black height of the tree.
   */ 
  Tree.prototype.getBlackHeight = function(node) {
    node = node || this._root;
    var height = 0;
    while (node != null) {
      node = node.getChild(0);
      if (node === null || node.isBlack()) { // nil is always black	
        height++;
      }
    }
    return height;
  };
  
  
  /**
   * Prints usefull information of the tree for debugging reasons on the console.
   */
  Tree.prototype.debug = function () {
    if (console && console.log) {
      console.log("Size", this.getSize());
      console.log("Black height", this.getBlackHeight());
      console.log("Maximum", this.maximum());
      console.log("Minimum", this.minimum());
      console.log("Ordered", this.getOrderedData());
      console.log("Reversed Ordered", this.getReverseOrderedData());
    }
  };
  
  
  /**
   * Converts the tree to a valid Dot string. This string can be used to 
   * display the tree in a Dot viewer. Usefull for debugging.
   *
   * @returns {String} The Dot string.
   */
  Tree.prototype.toDot = function() {
    var nodes = this.getOrdered();
    var dot = [];
    dot.push("digraph G {");
  
    for(var i = 0, j = nodes.length; i < j; i++) {
      var node = nodes[i];
      var color = node.isRed() ? "red" : "black";
      var font =  "white";
      dot.push(node.data.id + ' [label="' + node.data.id + ': [' + node.data.start + ',' +  node.data.end + '] (Max: ' + node.getMax() + ')",fontcolor=' + font + ',fillcolor=' + color + ',style=filled];');
      if (node.getParent()) {
        dot.push(node.getParent().data.id + " -> " + node.data.id+ ";");
      }
    }
  
    dot.push("}");
    return dot.join("\n");	
  };
  
  
  /** @exports Time as FB.util.Time */
  var Time = 
    /**
     * Time util class. Collection of time related methods.
     *
     * @constructor
     */
    FB.util.Time = function() {};
  
  /**
   * Returns a localized string of the given hours.
   *
   * @param {Integer} hours The hours to format.
   * @returns {String} The formated localized string.
   */
  Time.format = function(hours) {
    var suffix = "AM";
  
    if (hours >= 12) {
      suffix = "PM";
      hours = hours - 12;
    }

    if (hours == 0) {
      hours = 12;
    }

    return {
      hours : hours,
      suffix : suffix
    };
  };
  
  
  /** @exports Browser as FB.Browser */
  var Browser = 
    /**
     * Browser util class. Provides helper methods for better browser detection.
     *
     * @constructor
     */
    FB.Browser = function() {};
  
  /**
   * Constant that indicates whether the browser is a IE6.
   */
  Browser.IE6 = /msie|MSIE 6/.test(navigator.userAgent);


  /**
   * Constant that indicates whether the browser is a IE7.
   */
  Browser.IE7 = /msie|MSIE 7/.test(navigator.userAgent);


  /**
   * Constant that indicates whether the browser supports border box.
   * This check might be replaced later by a feature detection (e.g., to ignore all
   * browser that only say they are IE7 but support border box)
   */
  Browser.BORDER_BOX = (!Browser.IE6 && !Browser.IE7);
  

  /** @exports Element as FB.Element */
  var Element = 
    /**
     * Element util class. Provides helper methods for DOM Elements.
     *
     * @constructor
     */
    FB.Element = function() {}; 

  /**
   * Returns the border width of a given element and the "Left", "Right", "Top", "Bottom" direction.
   *
   * @param {Element} element The element to retrieve the border width from.
   * @param {String} direction One of the following directions: "Left", "Right", "Top", "Bottom"
   * @returns {Integer} The border width in pixels.
   */
  Element.getBorderWidth = function(element, direction) {
    if (element.currentStyle["border" + direction + "Style"] == "none")
      return 0;
    var n = parseInt(element.currentStyle["border" + direction + "Width"]);
    return n || 0;
  };
  

  /**
   * Returns the left border width of a given element.
   *
   * @param {Element} element The element to retrieve the border width from.
   * @returns {Integer} The border width in pixels.
   */  
  Element.getBorderLeftWidth = function(element) {
    return Element.getBorderWidth(element,"Left");
  };


  /**
   * Returns the right border width of a given element.
   *
   * @param {Element} element The element to retrieve the border width from.
   * @returns {Integer} The border width in pixels.
   */  
  Element.getBorderRightWidth = function(element) {
    return Element.getBorderWidth(element,"Right");
  };


  /**
   * Returns the top border width of a given element.
   *
   * @param {Element} element The element to retrieve the border width from.
   * @returns {Integer} The border width in pixels.
   */  
  Element.getBorderTopWidth = function(element) {
    return Element.getBorderWidth(element,"Top");
  };


  /**
   * Returns the bottom border width of a given element.
   *
   * @param {Element} element The element to retrieve the border width from.
   * @returns {Integer} The border width in pixels.
   */  
  Element.getBorderBottomWidth = function(element) {
    return Element.getBorderWidth(element,"Bottom");
  };
  

  /**
   * Returns the padding of a given element and the "Left", "Right", "Top", "Bottom" direction.
   *
   * @param {Element} element The element to retrieve the padding from.
   * @param {String} direction One of the following directions: "Left", "Right", "Top", "Bottom"
   * @returns {Integer} The padding in pixels.
   */
  Element.getPadding = function(element,direction) {
    var n = parseInt(element.currentStyle["padding" + direction]);
    return n || 0;
  }
  
  
  /**
   * Returns the left padding of a given element.
   *
   * @param {Element} element The element to retrieve the padding from.
   * @returns {Integer} The border width in pixels.
   */  
  Element.getPaddingLeft = function(element) {
    return Element.getPadding(element,"Left");
  }


  /**
   * Returns the right padding of a given element.
   *
   * @param {Element} element The element to retrieve the padding from.
   * @returns {Integer} The border width in pixels.
   */
  Element.getPaddingRight = function(element) {
    return Element.getPadding(element,"Right");
  }


  /**
   * Returns the top padding of a given element.
   *
   * @param {Element} element The element to retrieve the padding from.
   * @returns {Integer} The border width in pixels.
   */
  Element.getPaddingTop = function(element) { 
    return Element.getPadding(element,"Top");
  }
  
  
  /**
   * Returns the bottom padding of a given element.
   *
   * @param {Element} element The element to retrieve the padding from.
   * @returns {Integer} The border width in pixels.
   */
  Element.getPaddingBottom = function(element) {
    return Element.getPadding(element,"Bottom");
  }


  /**
   * Returns the inset of a certain elemennt with a given class.
   * 
   * @param {String} className The class name that should be set on the element to test.
   * @returns {Object} The inset of the element.
   * {
   *   borderLeft : {Integer},
   *   borderRight : {Integer},
   *   borderTop : {Integer},
   *   borderBottom : {Integer},
   *   paddingLeft : {Integer},
   *   paddingRight : {Integer},
   *   paddingTop : {Integer},
   *   paddingBottom : {Integer}
   * }
   */
  Element.getInset = function(className) {
    // we need to add the element to the body,otherwise element.currentStyle is null
    var element = document.createElement("div");
    element.className="event";
  	document.body.appendChild(element);
    var inset = {
      borderLeft : Element.getBorderLeftWidth(element),
      borderRight : Element.getBorderRightWidth(element),
      borderTop : Element.getBorderTopWidth(element),
      borderBottom : Element.getBorderBottomWidth(element),
      paddingLeft : Element.getPaddingLeft(element),
      paddingRight : Element.getPaddingRight(element),
      paddingTop : Element.getPaddingTop(element),
      paddingBottom : Element.getPaddingBottom(element) 
    };
    document.body.removeChild(element);
    return inset;
  };


  /** @exports Calendar as FB.ui.calendar.Calendar */
  var Calendar = 
    /**
     * The calendar widget. Renders events for a certain time. Colliding
     * events are rendered corrosponding to the number of colliding event
     * and the width of the calendar event container.
     *
     * @constructor
     * @param {String} id The id of the calendar dom element
     * @param {Object[]} [events] The events to show in the calendar.
     * @param {Object} [options] Custom options. Will be merged with the default options.
     */
    FB.ui.calendar.Calendar = function(id, events, options) {
    this._events = null;
    this._renderedEvents = {};
    this._tree = null;
  
    this._options = Calendar.mergeOptions(options);
    
    if (events != null) {
      this.setEvents(events);
    }
 
    this._element = document.getElementById(id);
    this._timelineElement = document.createElement("div");
    this._timelineElement.className = this._options.timelineCssClass;
    this._element.appendChild(this._timelineElement);
    this._eventsElement = document.createElement("div");
    this._eventsElement.className = this._options.eventsCssClass;
    this._element.appendChild(this._eventsElement);
    
    this._drawTimeline();
  };
  
  
  /**
   * Returns the default options of the calendar widget. Used to merge
   * with the custom options.
   *
   * @returns {Object} The default options.
   * {
   *   timelineCssClass : "timeline",
   *   eventsCssClass : "events",
   *   height : 720,
   *   width : 600,
   *   from : 9,
   *   to : 21
   * }
   */
  Calendar.getDefaultOptions = function() {
    return {
      timelineCssClass : "timeline",
      eventsCssClass : "events",
      height : 720,
      width : 600,
      from : 9,
      to : 21
    };
  };
  
  
  /**
   * This method is used to merge the custom options with the default
   * options of the widget.
   *
   * @param {Object} options The options to merge with the default options.
   * @returns {Object} The merged options.
   */
  Calendar.mergeOptions = function(options) {
    var mergedOptions = Calendar.getDefaultOptions();
    if (options != null) {
      for (var key in options) {
        mergedOptions[key] = options[key];
      }
    }
    return mergedOptions;
  };
  
  
  /**
   * Use this method to dispose the object.
   */
  Calendar.prototype.dispose = function() {
    this._element = this._eventsElement = this._timelineElement = null;
  };

  
  /**
   * Draws the timeline of the calendar.
   */
  Calendar.prototype._drawTimeline = function() {
    var from = this._options.from;
    var to = this._options.to;
    var range = (to-from) * 2;
    var height = Math.floor(this._options.height / range);
  
    var html = [];
    
    for (var i = from; i <= to; i++) {
      var time = Time.format(i);
      
      html.push("<div style='height:" + height + "px;'><span>" + time.hours  + ":00 </span><span class='subTitle'>" + time.suffix + "</span></div>");
      
      if (i < to) {
        html.push("<div style='height:" + height + "px;'><span class='subTitle'>" + time.hours  + ":30</span></div>");
      }
    }
  
    this._timelineElement.innerHTML = html.join("");
  };
  
  
  /**
   * Lays out events for a single day.
   *
   * @param {Object[]} events An array of event objects. Each event object consists of a start time, end 
   * Time (measured in minutes) from 9am, as well as a unique id. The 
   * Start and end time of each event will be [0, 720]. The start time will 
   * Be less than the end time.  The array is not sorted. 
   * @returns {FB.ui.calendar.Event[]}  An array of event objects that has the width, the left and top positions set, 
   * In addition to start time, end time, and id.
   */
  Calendar.prototype.layOutDay = function(events) {
    var events = this.setEvents(events);
    this.render();
    return events;
  };
  
  
  /**
   * Sets the events that should be shown in the event container of the
   * calendar.
   *
   * @param {Object[]} events The events to show in the calendar.
   * @returns {FB.ui.calendar.Event[]}  An array of event objects that has the width, the left and top positions set, 
   * In addition to start time, end time, and id.
   */
  Calendar.prototype.setEvents = function(events) {
    var tree = this._tree = new Tree(Event.comparator);
      
    var length = events.length;
  
    for (var i=0; i < length; i++) {
      var event = new Event(events[i]);
      tree.insert(event);
    }
  
    this._events = tree.getOrderedData();    
    return this._events;
  };
  
  
  /**
   * Clears the calendar. Removes all events from the calendar canvas.
   */
  Calendar.prototype.clear = function() {
    this._eventsElement.innerHTML = "";
    this._renderedEvents = {};
  };
  
  
  /**
   * Checks whether a certain event is rendered or not.
   *
   * @param {FB.ui.calendar.Event} event The event to check.
   * @returns {Boolean} True when rendered.
   */
  Calendar.prototype.isRendered = function(event) {
    return this._renderedEvents[event.id] === true;
  };
  
  
  /**
   * Sets the rendered state of the event.
   * 
   * @param {FB.ui.calendar.Event} event The event that should be marked as rendered.
   */
  Calendar.prototype._setIsRendered = function(event) {
    this._renderedEvents[event.id] = true;
  };
  
  
  /**
   * Returns all colliding events for a certain event.
   *
   * @param {FB.ui.calendar.Event} event The event to check collisons for.
   * returns {FB.ui.calendar.Event[]} The collding events for the given event. 
   */
  Calendar.prototype.getCollisions = function(event) {
    return this._tree.searchInterval(event);
  };
  
  
  /**
   * Renders the calendar. All set events will be rendered in the calendar container.
   */
  Calendar.prototype.render = function() {
    var events = this._events;
    if (events === null) throw new Error("No events set");
      
    this.clear();
  
    var html = this._render(events);
    this._eventsElement.innerHTML = html.join("");
  };
  
  
  /**
   * Protected render method. Used internally to render all events in a recursion.
   * 
   * @param {FB.ui.calendar.Event[]} events The events to render in this roundtrip.
   * @param {Object[]} binsByRef The bins containing all collding events.
   */
  Calendar.prototype._render = function(events, binsByRef) {
    var html = [];
  
    var length = events.length;
    for (var i=0; i < length ; i++)
    {
      var event = events[i];
      var bins = binsByRef || [];
      if (!this.isRendered(event))
      {
        this._setIsRendered(event);
        this._addToBin(event, bins);
  
        var collisions = this.getCollisions(event);
        if (collisions) {
          html = html.concat(this._render(collisions, bins));    
        }
  
        html = html.concat(this._renderEvents(bins));
        }
    }
    return html;
  };
  
  
  /**
   * Renders the events.
   *
   * @param {Object[]} bins The bins containing all collding events.
   */
  Calendar.prototype._renderEvents = function(bins) {
    var html = [];
    for (var level = 0; level < bins.length; level++) {
      var bin = bins[level];
      var events = bin.events;
      for (var i = 0; i < events.length; i++) {
        var width = this._options.width / (bins.length);
        html.push(events[i].render(width, level));
      }
    }
    return html;	
  };


  /**
   * Adds an event to the first free bin. When the start time is greater or 
   * equal the maximum of the bin, the event is added. A bin is representing
   * a time slot and has a maximum, which equals the end time of the last
   * added event.
   *
   * @param {FB.ui.calendar.Event[]} event The event to add to a bin.
   * @param {Object[]} bins All existing bins.
   */
  Calendar.prototype._addToBin = function(event, bins) {
    var length = bins.length;
    
    var added = false;
    for (var i=0; i < length; i++)
    {
      var bin = bins[i];
      if (event.start >= bin.max) {
        bin.max = event.end;
        bin.events.push(event);
        added = true;
        break;
      }
    }
    if (!added) {
      bins.push({
        max : event.end,
        events : [event]
      });
    }
  };
  
  
  
  
  /** @exports Event as FB.ui.calendar.Event */
  var Event = 
    /**
     * The Event widget. Provides a render method for the event.
     *
     * @constructor
     * @param event The event object to wrap.
     * @param event.id The unique id of the event.
     * @param event.start The start time of the event.
     * @param event.end The end time of the event.
     */
    FB.ui.calendar.Event = function(event) {
      
      /**
       * The unique identifier of the event.
       * @type Integer
       */
      this.id = event.id;
      
      /**
       * The start time of the event.
       * @type Integer
       */
      this.start = event.start;
      
      /**
       * The end time of the event.
       * @type Integer
       */
      this.end = event.end;
      
      /**
       * The top coordinate of the event.
       * @type Integer
       */

      this.top = null;

      /**
       * The left coordinate of the event.
       * @type Integer
       */
      this.left = null;

      /**
       * The width of the event.
       * @type Integer
       */
      this.width = null;

      /**
       * The height of the event.
       * @type Integer
       */
      this.height = null;

      /**
       * The duration of the event.
       * @type Integer
       */
      this.duration = this.end - this.start;
  };
  
  
  /**
   * Stores the element inset, so that it does not have to be calculated all the time.
   */
  Event._elementInset = null;
  
  /**
   * Returns the event element inset.
   * @returns {Object} The event element inset.
   * {
   *   borderLeft : {Integer},
   *   borderRight : {Integer},
   *   borderTop : {Integer},
   *   borderBottom : {Integer},
   *   paddingLeft : {Integer},
   *   paddingRight : {Integer},
   *   paddingTop : {Integer},
   *   paddingBottom : {Integer}
   * }
   */
  Event.getElementInset = function() {
    var inset = Event._elementInset;
    if (inset == null) {
      inset= Element.getInset("event");
  	}
  	return inset;
  };
  
  
  /**
   * Compares if the start time of the first event is less than the
   * start time of the second event.
   *
   * @param {FB.ui.calendar.Event} event1 The first event to compare.
   * @param {FB.ui.calendar.Event} event2 The second event to compare.
   * @returns {Integer} 0 when the start time of the first event is less than the start time of the second event. 1 for the opposite case.
   */
  Event.comparator = function(event1, event2) {
    return (event1.start < event2.start) ? 0 : 1;
  };
   
  
  /**
   * Checks whether two events are colliding or not.
   *
   * @param {FB.ui.calendar.Event} event1 The first event to compare.
   * @param {FB.ui.calendar.Event} event2 The second event to compare.
   * @returns {Boolean} True when the events collide. False when not.
   */
  Event.isColliding = function(event1, event2) {
    if (event1.start <= event2.end && event1.end >= event2.start) {
      return true;
      }
    return false;
  };
  
  

  /**
   * Returns the real element width. Considers if the browser supports border box.
   *
   * @param {Integer} width The calculated width of the event.
   * @returns {Integer} The real element width, which takes the element border and padding into account,
   *                    when the browser does not support border box.
   */
  Event.prototype._getElementWidth = function(width) {
    if (!Browser.BORDER_BOX) {
      var inset = Event.getElementInset();
  
      width -= inset.borderLeft + inset.borderRight;
      width -= inset.paddingLeft + inset.paddingRight;
    }
    return width;
  };
  

  /**
   * Returns the real element height. Considers if the browser supports border box.
   *
   * @param {Integer} width The calculated height of the event.
   * @returns {Integer} The real element height, which takes the element border and padding into account,
   *                    when the browser does not support border box.
   */
  Event.prototype._getElementHeight = function(height) {
    if (!Browser.BORDER_BOX) {
      var inset = Event.getElementInset();

      height -= inset.borderTop + inset.borderBottom;
      height -= inset.paddingTop + inset.paddingBottom;
    }
    return height;
  }; 


  /**
   * Returns a HTML representation of the event.
   *
   * @returns {String} The HTML representation of the event.
   */  
  Event.prototype.render = function(width, level) {
    this.width = this._getElementWidth(width);
    this.height = this._getElementHeight(this.duration);
    this.left = ((level * width) + 10);
    this.top = this.start;
    return "<div id='"+ this.id +"' class='event' style='top:" + this.top + "px; left:" + this.left + "px; width:" + this.width + "px; height:" + this.height + "px;'><div class='title'>Sample Item " + this.id +  "</div><div class='subTitle'>Sample Location</div><div></div></div>";
  };

})();