jsPlumb.ready(function() {

	var instance = jsPlumb.getInstance({
		// default drag options
		DragOptions : { cursor: 'pointer', zIndex:2000 },
		// the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
		// case it returns the 'labelText' member that we set on each connection in the 'init' method below.
		ConnectionOverlays : [
			[ "Arrow", { location:1 } ],
			[ "Label", { 
				location:0.1,
				id:"label",
				cssClass:"aLabel"
			}]
		],
		Container:"flowchart-demo"
	});

	// this is the paint style for the connecting lines..
	var connectorPaintStyle = {
		lineWidth:4,
		strokeStyle:"#61B7CF",
		joinstyle:"round",
		outlineColor:"white",
		outlineWidth:2
	},
	// .. and this is the hover style. 
	connectorHoverStyle = {
		lineWidth:4,
		strokeStyle:"#216477",
		outlineWidth:2,
		outlineColor:"white"
	},
	endpointHoverStyle = {
		fillStyle:"#216477",
		strokeStyle:"#216477"
	},
	// the definition of source endpoints (the small blue ones)
	sourceEndpoint = {
		endpoint:"Dot",
		paintStyle:{ 
			strokeStyle:"#7AB02C",
			fillStyle:"transparent",
			radius:7,
			lineWidth:3 
		},				
		isSource:true,
		connector:[ "Flowchart", { stub:[40, 60], gap:10, cornerRadius:5, alwaysRespectStubs:true } ],								                
		connectorStyle:connectorPaintStyle,
		hoverPaintStyle:endpointHoverStyle,
		connectorHoverStyle:connectorHoverStyle,
        dragOptions:{},
        overlays:[
        	[ "Label", { 
            	location:[0.5, 1.5], 
            	label:"Drag",
            	cssClass:"endpointSourceLabel" 
            } ]
        ]
	},		
	// the definition of target endpoints (will appear when the user drags a connection) 
	targetEndpoint = {
		endpoint:"Dot",					
		paintStyle:{ fillStyle:"#7AB02C",radius:11 },
		hoverPaintStyle:endpointHoverStyle,
		maxConnections:-1,
		dropOptions:{ hoverClass:"hover", activeClass:"active" },
		isTarget:true,			
        overlays:[
        	[ "Label", { location:[0.5, -0.5], label:"Drop", cssClass:"endpointTargetLabel" } ]
        ]
	},			
	init = function(connection) {			
		connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
		connection.bind("editCompleted", function(o) {
			if (typeof console != "undefined")
				console.log("connection edited. path is now ", o.path);
		});
	};			

	var _addEndpoints = function(toId, sourceAnchors, targetAnchors) {
			for (var i = 0; i < sourceAnchors.length; i++) {
				var sourceUUID = toId + sourceAnchors[i];
				instance.addEndpoint("flowchart" + toId, sourceEndpoint, { anchor:sourceAnchors[i], uuid:sourceUUID });						
			}
			for (var j = 0; j < targetAnchors.length; j++) {
				var targetUUID = toId + targetAnchors[j];
				instance.addEndpoint("flowchart" + toId, targetEndpoint, { anchor:targetAnchors[j], uuid:targetUUID });						
			}
		};

// XXX BEGIN

/*
	function getAbs(pos) {
		return Math.sqrt(Math.pow(pos[0], 2) + Math.pow(pos[1], 2));
	}

	function findOrthogonalProjection(start, end, pathOffset, pos) {
		var isValid = false;
		// as all start/end points are relative to the path offset,
		// we also handle our point in this coordinate system.
		rPos = [
			pos[0] - pathOffset[0],
			pos[1] - pathOffset[1]
		];
		if (start[0] == end[0] && start[1] == end[1]) {
			start[0] -= 0.00001;
		}
		var percent = ((rPos[0] - start[0]) * (end[0] - start[0])) + ((rPos[1] - start[1]) * (end[1] - start[1]));
		var percentDenom = Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2);
		percent /= percentDenom;
		var projectVector = [
			percent * (end[0] - start[0]),
			percent * (end[1] - start[1])
		];
		// limitation to snap to the two endpoints, if the closest point is not in start..end range.
		if (percent < 0) {
			percent = 0;
			projectVector = [0, 0];
		} else if (percent > 1) {
			percent = 1;
			projectVector = [end[0] - start[0], end[1] - start[1]];
		}
		// back to pathOffset coordinates
		var projectPos = [
			start[0] + projectVector[0] + pathOffset[0],
			start[1] + projectVector[1] + pathOffset[1]
		];
		return {
			// the tangent point, which is the closest point of the start-end section to the point
			pos: projectPos,
			// the size of the start-end section
			size: Math.sqrt(percentDenom),
			// Distance between the point and its tangent.
			distance: getAbs([projectPos[0] - pos[0], projectPos[1] - pos[1]]),
			// The distance from start to the projection point, 0 <= ... <= (end - start)
			// XXX find better name?
			vector: getAbs(projectVector)
		};
	}
	function getLabelPosition0(connection, pos) {
		var pathElems = connection.connector.getPath();
		var canvas = connection.connector.canvas;
		// The path offset is relative from the first start point.
		var pathLength = pathElems.length;
		//var firstStart = pathLength > 0 ? pathElems[pathLength - 1].start : [0, 0];
		//var pathOffset = [canvas.offsetLeft + firstStart[0], canvas.offsetTop + firstStart[1]];
		var pathOffset = [canvas.offsetLeft, canvas.offsetTop]; 
		var closest;
		var totalVector;
		var totalSize = 0;
		for (var i = 0; i < pathLength; i++) {
			var pathElem = pathElems[i];
			// for the end element, do not use end, but rather the start of the next path elem.
			// I am not sure what causes this inconsistency, may be a bug in jsplumb?
			var end;
			if (i + 1 < pathLength ) {
				end = pathElems[i + 1].start;
			} else {
				// ... expect, use the end for the last element.
				end = pathElem.end;
			}
			var proj = findOrthogonalProjection(pathElem.start, end, pathOffset, pos);
			if (closest === undefined || proj.distance < closest.distance) {
				closest = proj;
				totalVector = totalSize + proj.vector; 
			}
			totalSize += proj.size;
		}
		// calculate total percent
		closest.totalPercent = totalVector / totalSize;
		return closest;
	}
*/

	function getLabelPosition(connection, x, y) {
		var segments = connection.connector.getSegments(),
			canvas = connection.connector.canvas,
			offset = [x - canvas.offsetLeft, y - canvas.offsetTop],
			// offset = [x, y],
			closest,
			projectionWay,
			totalWay = 0;
		for (var i = 0; i < segments.length; i++) {
			var segment = segments[i],
				projection = segment.findClosestPointOnPath.apply(null, offset),
				segmentWay = segment.getLength();
			if (closest === undefined || projection.d < closest.d) {
				closest = projection;
				projectionWay = totalWay + segmentWay * projection.l;
			}
			totalWay += segmentWay;
		}
		// calculate total percent
		console.log('closest', totalWay, projectionWay);

		closest.totalPercent = projectionWay / totalWay;
		// back to coordinates
		// XXX figure out how to do this
		closest.x = closest.x + canvas.offsetLeft;
		closest.y = closest.y + canvas.offsetTop;
		return closest;
	}

	function setupConnection(connInfo) {
		window.connInfo = connInfo;
		var label = connInfo.connection.getOverlay('label');
		var elLabel = label.getElement();
		instance.draggable(elLabel, {
			drag: function(params) {
				// constrain the label to move on the path
				// XXX figure out how to get the offset properly, regardless if vanilla or jQuery flavor
				//var closest = getLabelPosition(connInfo.connection, params.offsetX, params.offsetY);
				var closest = getLabelPosition(connInfo.connection, params.pos[0], params.pos[1]);
				elLabel.style.left = '' + (closest.x) + 'px';
				elLabel.style.top = '' + (closest.y) + 'px';
			},
			stop: function(params) {
				// set the location
				var closest = getLabelPosition(connInfo.connection, params.pos[0], params.pos[1]);
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
			instance.bind("connection", function(connInfo, originalEvent) { 
				setupConnection(connInfo);
			});
		});
	}

// XXX END

	// set up draggable labels
	makeLabelsDraggable(instance);

	// suspend drawing and initialise.
	instance.doWhileSuspended(function() {

		_addEndpoints("Window4", ["TopCenter", "BottomCenter"], ["LeftMiddle", "RightMiddle"]);			
		_addEndpoints("Window2", ["LeftMiddle", "BottomCenter"], ["TopCenter", "RightMiddle"]);
		_addEndpoints("Window3", ["RightMiddle", "BottomCenter"], ["LeftMiddle", "TopCenter"]);
		_addEndpoints("Window1", ["LeftMiddle", "RightMiddle"], ["TopCenter", "BottomCenter"]);
					
		// listen for new connections; initialise them the same way we initialise the connections at startup.
		instance.bind("connection", function(connInfo, originalEvent) { 
			init(connInfo.connection);
		});			
					
		// make all the window divs draggable						
		instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), {
			grid: [20, 20]
		});
		// THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector 
		// method, or document.querySelectorAll:
		//jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });
        
		// connect a few up
		instance.connect({uuids:["Window2BottomCenter", "Window3TopCenter"], editable:true});
		instance.connect({uuids:["Window2LeftMiddle", "Window4LeftMiddle"], editable:true});
		instance.connect({uuids:["Window4TopCenter", "Window4RightMiddle"], editable:true});
		instance.connect({uuids:["Window3RightMiddle", "Window2RightMiddle"], editable:true});
		instance.connect({uuids:["Window4BottomCenter", "Window1TopCenter"], editable:true});
		instance.connect({uuids:["Window3BottomCenter", "Window1BottomCenter"], editable:true});
		//
        
		//
		// listen for clicks on connections, and offer to delete connections on click.
		//
		//instance.bind("click", function(conn, originalEvent) {
		//	if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
		//		jsPlumb.detach(conn); 
		//});	
		
		instance.bind("connectionDrag", function(connection) {
			console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
		});		
		
		instance.bind("connectionDragStop", function(connection) {
			console.log("connection " + connection.id + " was dragged");
		});

		instance.bind("connectionMoved", function(params) {
			console.log("connection " + params.connection.id + " was moved");
		});
	});

	jsPlumb.fire("jsPlumbDemoLoaded", instance);
	
});