FbTest = TestCase("FbTest");



FbTest.prototype.testTreeInsert = function() {
  var tree = new FB.data.Tree(FB.ui.calendar.Event.comparator);
  assertEquals(tree.getSize(), 0);
  var event = {
    id : 1,
    start:20,
    end:100
  };
  tree.insert(event);  
  assertEquals(tree.getSize(), 1);
  var event = {
    id : 2,
    start:20,
    end:100
  };
  tree.insert(event);  
  assertEquals(tree.getSize(), 2);
};

FbTest.prototype._createTreeTestData = function() {
  var tree = new FB.data.Tree(FB.ui.calendar.Event.comparator);
  for (var i=1; i <= 10; i++) {
    var event = {
      id : i,
      start : (10*i),
      end : (100+(10*i))
    };
    tree.insert(event);
  }
  return tree;
};

FbTest.prototype.testTreeMaximum = function() {
  var tree = this._createTreeTestData();
  var max = tree.maximum();
  assertEquals(10, max.data.id);
};

FbTest.prototype.testTreeMinimum = function() {
  var tree = this._createTreeTestData();
  var min = tree.minimum();
  assertEquals(1, min.data.id);
};

FbTest.prototype.testBlackHeight = function() {
  var tree = this._createTreeTestData();
  var blackHeight = tree.getBlackHeight();
  assertEquals(3, blackHeight);
};

FbTest.prototype.testTreeOrderedData = function() {
  var tree = this._createTreeTestData();
  var result = tree.getOrderedData();
  assertEquals(10, result.length);
  assertEquals(1, result[0].id);
  assertEquals(2, result[1].id);
  assertEquals(3, result[2].id);
  assertEquals(4, result[3].id);
  assertEquals(5, result[4].id);
  assertEquals(6, result[5].id);
  assertEquals(7, result[6].id);
  assertEquals(8, result[7].id);
  assertEquals(9, result[8].id);
  assertEquals(10, result[9].id);
};

FbTest.prototype.testTreeSearchInterval = function() {
  var tree = this._createTreeTestData();
  var result = tree.searchInterval({start:10,end:30});
  assertEquals(3, result.length);
  assertEquals(1, result[0].id);
  assertEquals(2, result[1].id);
  assertEquals(3, result[2].id);
};


FbTest.prototype.testTreeNode = function() {
  var node = new FB.data.Node({
    id : 1,
    start:20,
    end:100
  });

  assertTrue(node.isRed());
  assertFalse(node.isBlack());
};


FbTest.prototype.testTreeNodeColor = function() {
  var event = new FB.data.Node({
    id : 1,
    start:20,
    end:100
  });

  assertTrue(event.isRed());
  event.setColor(FB.data.Node.BLACK);
  assertTrue(event.isBlack());
};

FbTest.prototype.testTreeNodeParent = function() {
  var event = new FB.data.Node({
    id : 1,
    start:20,
    end:100
  });
  
  assertNull(event.getParent());
  
  var parent = new FB.data.Node({
    id : 2,
    start:20,
    end:100
  });
  
  event.setParent(parent);
  
  assertEquals(parent, event.getParent());
};

FbTest.prototype.testTreeNodeChildren = function() {
  var event = new FB.data.Node({
    id : 1,
    start:20,
    end:100
  });
  
  assertNull(event.getChild(FB.data.Node.LEFT));
  assertNull(event.getChild(FB.data.Node.RIGHT));
  
  var left = new FB.data.Node({
    id : 2,
    start:20,
    end:100
  });
  event.setChild(left, FB.data.Node.LEFT);
  assertEquals(left, event.getChild(FB.data.Node.LEFT));
  
  var right = new FB.data.Node({
    id : 3,
    start:20,
    end:100
  });
  event.setChild(left, FB.data.Node.RIGHT);
  assertEquals(left, event.getChild(FB.data.Node.RIGHT));
};


FbTest.prototype.testEvent = function() {
  var event = new FB.ui.calendar.Event({
    id : 1,
    start:20,
    end:100
  });

  assertEquals(1, event.id);
  assertEquals(20, event.start);
  assertEquals(100, event.end);
  assertEquals(80, event.duration);
};

FbTest.prototype.testEventRender = function() {
  var event = new FB.ui.calendar.Event({
    id : 1,
    start:20,
    end:100
  });

  var str = "<div id='1' class='event' style='top:20px; left:110px; width:100px; height:80px;'><div class='title'>Sample Item 1</div><div class='subTitle'>Sample Location</div><div></div></div>";
  assertEquals(str, event.render(100,1));
};


FbTest.prototype.testEventComparator = function() {
  var Event = FB.ui.calendar.Event;
  var event1 = new Event({
    id : 1,
    start:20,
    end:100
  });
  
  var event2 = new Event({
    id : 2,
    start:40,
    end:150
  });
  
  assertEquals(0,Event.comparator(event1, event2));
  assertEquals(1,Event.comparator(event2, event1));
};

FbTest.prototype.testEventColliding = function() {
  var Event = FB.ui.calendar.Event;
  var event1 = new Event({
    id : 1,
    start:20,
    end:100
  });
  
  var event2 = new Event({
    id : 2,
    start:40,
    end:150
  });
  
  var event3 = new Event({
    id : 2,
    start:160,
    end:300
  });

  assertTrue(Event.isColliding(event1, event2));
  assertFalse(Event.isColliding(event2, event3));
};


FbTest.prototype.testBrowserBorderBox = function() {
  var Browser = FB.Browser;
  var supportsBorderBox = Browser.BORDER_BOX;
  
  if (Browser.IE6 || Browser.IE7) {
    assertFalse(supportsBorderBox);
  } else {
    assertTrue(supportsBorderBox);  
  }
};


FbTest.prototype.testTimeFormat = function() {
  var Time = FB.util.Time;
  var testTime = Time.format(1);
  assertEquals({"hours":1,"suffix":"AM"},testTime);

  var testTime = Time.format(11);
  assertEquals({"hours":11,"suffix":"AM"},testTime);
  
  var testTime = Time.format(12);
  assertEquals({"hours":12,"suffix":"PM"},testTime);
  
  var testTime = Time.format(23);
  assertEquals({"hours":11,"suffix":"PM"},testTime);
  
  var testTime = Time.format(0);
  assertEquals({"hours":12,"suffix":"AM"},testTime);
};
