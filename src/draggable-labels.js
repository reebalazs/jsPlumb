
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
      drag: function(evt) {
        var pos =  jsPlumb.getUIPosition(arguments, jsPlumb.getZoom());
        var canvas = connection.canvas;
        var offsetLeft = parseInt(canvas.style.left),
          offsetTop = parseInt(canvas.style.top);
        var closest = getLabelPosition(connection, pos.left - offsetLeft, pos.top - offsetTop);
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
