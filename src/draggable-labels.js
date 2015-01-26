
;(function() {

  "use strict";

  function getLabelPosition(connection, x, y) {
    var segments = connection.connector.getSegments(),
      closest,
      projectionWay,
      totalWay = 0;
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      var projection = segment.findClosestPointOnPath(x, y, i, connection.connector.bounds);
      var segmentWay = segment.getLength();
      // Calculate projectionWay, as the distance that the label travels
      // within the full available length of the totalWay.
      if (closest === undefined || projection.d < closest.d) {
        closest = projection;
        projectionWay = totalWay + segmentWay * projection.l;
      }
      totalWay += segmentWay;
    }
    // calculate total percentage of the label's new position
    closest.totalPercent = projectionWay / totalWay;
    return closest;
  }

  function setupConnection(instance, params) {
    var connection = params.connection;
    var label = connection.getOverlay('label');
    var elLabel = label.getElement();
    instance.draggable(elLabel, {
      drag: function() {
        var pos =  jsPlumb.getUIPosition(arguments, jsPlumb.getZoom());
        // Instead of the canvas of the connection, the top left bound of the
        // two endpoint coordinates must be considered.
        var oe1 = jsPlumb.getElementObject(connection.endpoints[0].canvas);
        var o1 = jsPlumbAdapter.getOffset(oe1, instance);
        var oe2 = jsPlumb.getElementObject(connection.endpoints[1].canvas);
        var o2 = jsPlumbAdapter.getOffset(oe2, instance);
        // In addition, offset if with the label's midpoint, because we want
        // to grab the middle of the label instead of the top left corner.
        var labelWidth = label.canvas.offsetWidth;
        var labelHeight = label.canvas.offsetHeight;
        var o = {
          left: Math.min(o1.left, o2.left) + labelWidth / 2,
          top: Math.min(o1.top, o2.top) + labelHeight / 2
        };
        // Find the closest point on the segment.
        var closest = getLabelPosition(connection, pos.left - o.left, pos.top - o.top);
        // Store the label's position, and repaint it.
        label.loc = closest.totalPercent;
        if (!instance.isSuspendDrawing()) {
          label.component.repaint();
        }
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
