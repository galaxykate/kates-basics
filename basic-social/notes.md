
Feb 10

morning - success!
Can load and store save data

Evening
todo evening, 

get MIDI working, 
get bubbles up again


fixed bugs on recording (the indexes were wrong)


---------
Feb 9

Steps along the way


--------
Feb 8 
Make it draggable along X

Keep a data-space curve and a view-space curve in sync


--------
Feb 7

Goal for Mon:
Playback along curve
Show N dimensional curve as individual curves, color gradient etc
For a curve, get a value at N


--------




# New attempt....


Ok, what if we have a timeline, plus
- slices: used to make datasets)
- players: increment and "playback" frames/states 
- viz: lil overlays for P5
- widgets: Vue viz
- editors/annotators: clip and annotate and save


--------
TODO
 show timeline
 scroll timeline
 show selected/active/inactive frames

save/load
local saves
Python/eel saves
validate save vs data


 tagmaker
 show tags
 click and drag tags to "paint"
 add new tags
 delete tags
create a slice
record slice

--------------------
Jan 24

Draggable objects
We often have world objects that have some draggable screen handle
we don't wanna modify the world object (unless dragged) because it may need handles in many windows
We want the handle to update when the object moves, or the screen moves
But we don't wanna recreate the handle many times


Curves should be very boring lists of points
but also we may want to subscribe to when a point is moved/added/

-------
Jan 17

Clip and save a recording under a new name


--------
Jan 10

adding tags and timestamp into the JSON save format
so now its
```[timestamp, (channeldata)["tag0|tag1|...]", [data]]]```

-------

Jan 6


Creating a timeline widget
I want to be able to draw the timeline in p5, but also have options to not be in p5?
I guess there's no reason for it to not have its own P5 thing

Jan 7
Checkpoints:
Create an array-of-arrays of saved history
play it back