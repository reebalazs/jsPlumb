
;(function() {

  "use strict";

  function getLabelPosition(connection, x, y) {
    var segments = connection.connector.getSegments(),
      canvas = connection.connector.canvas,
      offsetX = x - canvas.offsetLeft,
      offsetY = y - canvas.offsetTop,
      closest,
      projectionWay,
      totalWay = 0;
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i],
        projection = segment.findClosestPointOnPath(offsetX, offsetY),
        segmentWay = segment.getLength();
      // Calculate projectionWay, as the distance that the label travels
      // within the full available length of the totalWay.
      if (closest === undefined || projection.d < closest.d) {
        closest = projection;
        projectionWay = totalWay + segmentWay * projection.l;
      }
      totalWay += segmentWay;
    }
    // calculate total percent
    closest.totalPercent = projectionWay / totalWay;
    // back to coordinates
    // XXX figure out how to do this
    closest.x = closest.x + canvas.offsetLeft;
    closest.y = closest.y + canvas.offsetTop;
    return closest;
  }

  function setupConnection(instance, connInfo) {
    var label = connInfo.connection.getOverlay('label');
    var elLabel = label.getElement();
    instance.draggable(elLabel, {
      drag: function(evt) {
        var pos =  jsPlumb.getUIPosition(arguments, jsPlumb.getZoom());
        var closest = getLabelPosition(connInfo.connection, pos.left, pos.top);
        elLabel.style.left = '' + (closest.x) + 'px';
        elLabel.style.top = '' + (closest.y) + 'px';
      },
      stop: function(evt) {
        // set the location
        var pos =  jsPlumb.getUIPosition(arguments, jsPlumb.getZoom());
        var closest = getLabelPosition(connInfo.connection, pos.left, pos.top);
        label.loc = closest.totalPercent;
        // Repaint the label
        label.component.repaint();
      }
    });
  }

  function makeLabelsDraggable(instance) {
    // suspend drawing and initialise.
    instance.doWhileSuspended(function() {
      // listen for new connections; initialise them the same way we initialise the connections at startup.
      instance.bind('connection', function(connInfo, originalEvent) { 
        setupConnection(instance, connInfo);
      });
    });
  }
  jsPlumb.makeLabelsDraggable = makeLabelsDraggable;

})();
